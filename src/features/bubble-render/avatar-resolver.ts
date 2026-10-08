import type { AvatarRecord, AvatarRepository } from "./avatar-repository";
import type { BubbleAvatarRequest } from "./bubble-hydrator";
import { DEFAULT_MOOD_WORD_GROUPS, type MoodWordGroup } from "./constants";

/**
 * 头像 URL 解析：情绪差分优先，逐级回退到主头像，最后交给首字兜底。
 *
 * fallback 顺序（与原脚本一致）：
 *   L1 mood__outfit__act 精确
 *   L2 mood__outfit      （丢动作）
 *   L3 mood + act        （丢服装）
 *   L4 仅 mood
 *   L5 主头像
 *
 * 注意：情绪差分记录的 `alias` 是**纯名字**（不含 charId），`moodId` 才是
 * `情绪__服装__动作`。早期实现按 `名字__情绪__...` 去索引，和实际字段对不上，
 * 导致所有情绪差分永远 miss、全部掉到主头像。
 */

/**
 * 服装/动作的缺省值。
 *
 * 只用于「字段为空」时兜底，**不再用作取值范围的白名单**：
 * 取值范围必须由导入的数据决定。写死白名单时，数据里存在的
 * 非标准标签会被判为非法 → L1 精确级永远匹配不上 → 静默退到别的差分。
 */
const DEFAULT_OUTFIT = "outfit-casual";
const DEFAULT_ACT = "act-sfw";

const URL_CACHE_MAX = 300;

function normalizeName(name: string): string {
    return String(name ?? "").trim().toLowerCase();
}

/**
 * 服装：字段为空按日常处理，其余**原样使用**，由数据决定能不能匹配上。
 * 不设白名单——数据里有的标签就必须能命中。
 */
function normalizeOutfit(outfit: string | null): string {
    const value = String(outfit ?? "").trim();
    return value || DEFAULT_OUTFIT;
}

/**
 * 动作：只接受「数据里真实存在」的标签，其余一律回落 act-sfw。
 *
 * 动作不能像服装那样无条件透传：未知动作透传后 L1 会 miss，
 * 接着 L2（同情绪 + 同服装）会命中任意动作的记录——包括 NSFW 图。
 * 回落 act-sfw 才能保住「不猜 NSFW」的语义。
 */
function normalizeAct(act: string | null, knownActs: ReadonlySet<string>): string {
    const value = String(act ?? "").trim();
    if (!value) return DEFAULT_ACT;
    return knownActs.has(value) ? value : DEFAULT_ACT;
}

/**
 * 把情绪词归一成情绪 id。
 * 气泡上写的是中文词（如「心动」），库里存的是 id（如 mood-love），
 * 不归一会导致每一级都 miss。
 *
 * 词表来自**当前生效的配置**（用户可编辑、可随导入数据变化），
 * 不能写死内置默认表：否则用户改过词表或卡自带别的情绪词时，
 * 颜色按配置解析、头像却按内置表解析，两边对不上。
 */
function createMoodIdNormalizer(getGroups: () => MoodWordGroup[]) {
    return function normalizeMoodId(mood: string): string {
        const text = String(mood ?? "").trim();
        if (!text) return "";
        const groups = getGroups() ?? [];
        for (const group of groups) {
            if (group.id === text || group.label === text) return group.id;
        }
        for (const group of groups) {
            if (group.words.includes(text)) return group.id;
        }
        for (const group of groups) {
            if (text.includes(group.label)) return group.id;
        }
        // 表外词原样返回：它可能就是数据里的情绪 id（如 mood-happy）
        return text;
    };
}

function stableHash(text: string): number {
    const value = String(text ?? "");
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function moodSegments(record: AvatarRecord): string[] {
    return String(record.moodId ?? "").split("__");
}

export interface AvatarResolver {
    resolve(request: BubbleAvatarRequest): Promise<string | null>;
    resolveCached(request: BubbleAvatarRequest): string | null;
    clearCache(): void;
}

export interface AvatarResolverOptions {
    /**
     * 当前生效的情绪词表。运行时会传入配置仓里的词表
     * （用户可编辑、可随导入数据变化）；不传则退回内置默认表。
     */
    getMoodGroups?: () => MoodWordGroup[];
    /**
     * 情绪文本 → 情绪 id。
     *
     * 运行时会传入**与气泡上色共用的那个解析器**：同一个词两边必须落到同一个
     * 情绪组，否则会出现「颜色是平和、差分却是喜悦」这种对不上的情况
     * （同义词和兜底规则很容易让两套实现分叉）。
     */
    resolveMoodId?: (moodText: string) => string;
}

export function createAvatarResolver(
    repository: AvatarRepository,
    options: AvatarResolverOptions = {},
): AvatarResolver {
    const getMoodGroups = options.getMoodGroups ?? (() => DEFAULT_MOOD_WORD_GROUPS);
    // 传了共用解析器就以它为准；没传才用内置表自己解析
    const normalizeMoodId = options.resolveMoodId ?? createMoodIdNormalizer(getMoodGroups);

    const urlCache = new Map<string, string>();
    /** 名字 -> 该名字下的全部情绪差分记录 */
    const moodIndex = new Map<string, AvatarRecord[]>();
    /**
     * 数据里实际出现过的动作标签。
     * 用来判断「模型写的动作是不是这张卡真有差分」——而不是查写死的白名单。
     */
    const knownActs = new Set<string>();
    /**
     * 建索引的**共享 promise**。
     *
     * 这里必须是单飞（single-flight），不能只用一个 indexLoaded 布尔量提前 return：
     * 一屏气泡是**并发**解析的（hydrator 同一个 tick 里对每个气泡都发起 resolve），
     * 用布尔量的话只有第一个调用者会等索引加载，其余全部立刻拿到
     * 「还是空的索引」→ 谁都匹配不上 → 齐刷刷掉到 L5 主头像。
     * 症状就是「一条消息里只有第一个气泡是对的，其余都是默认头像」。
     */
    let indexPromise: Promise<void> | null = null;

    function ensureIndex(): Promise<void> {
        if (!indexPromise) {
            indexPromise = (async () => {
                try {
                    const records = await repository.listMoodAvatars();
                    for (const record of records) {
                        const alias = normalizeName(String(record.alias ?? ""));
                        if (!alias) continue;
                        const parts = moodSegments(record);
                        if (parts[2]) knownActs.add(parts[2]);
                        const bucket = moodIndex.get(alias);
                        if (bucket) bucket.push(record);
                        else moodIndex.set(alias, [record]);
                    }
                } catch {
                    /* 索引失败不阻断，走逐级查询 */
                }
            })();
        }
        return indexPromise;
    }

    /**
     * 缓存键。
     *
     * 注意这里用的是**原始动作**，不是归一后的动作：归一结果依赖
     * 「数据里有哪些动作」，而缓存键必须在建索引之前就能算出来
     * （resolveCached 是同步调用，不能等索引）。
     */
    function cacheKeyOf(request: BubbleAvatarRequest): string {
        const name = normalizeName(request.name);
        const mood = normalizeMoodId(request.mood);
        const outfit = normalizeOutfit(request.outfit);
        const act = String(request.act ?? "").trim() || DEFAULT_ACT;
        let firstKey = "";
        if (mood && outfit && act) firstKey = [name, mood, outfit, act].join("__");
        else if (mood && outfit) firstKey = [name, mood, outfit].join("__");
        else if (mood) firstKey = [name, mood].join("__");
        return (firstKey || name + "::main") + "::seed::" + stableHash(request.seed ?? "");
    }

    function cacheSet(key: string, url: string) {
        if (!urlCache.has(key)) {
            if (urlCache.size >= URL_CACHE_MAX) {
                const oldest = urlCache.keys().next().value;
                if (oldest !== undefined) {
                    const oldUrl = urlCache.get(oldest);
                    if (oldUrl && oldUrl.startsWith("blob:")) {
                        try {
                            URL.revokeObjectURL(oldUrl);
                        } catch {
                            /* ignore */
                        }
                    }
                    urlCache.delete(oldest);
                }
            }
        }
        urlCache.set(key, url);
    }

    function blobToUrl(blob: Blob | null | undefined): string | null {
        if (!blob) return null;
        try {
            return URL.createObjectURL(blob);
        } catch {
            return null;
        }
    }

    /**
     * 取一条差分记录的图片 URL。
     *
     * 原生后端的 listMoodAvatars() **故意不预取二进制**（1841 条全拉回来会爆内存），
     * 所以索引里挑中的记录通常没有 imageBlob，必须按需回查一次。
     * 早期实现直接读 record.imageBlob → 永远 null → 每级都落空、全部掉到 L5 主头像，
     * 表现就是「正文里情绪各不相同，头像却全都一样」。
     * IndexedDB 后端的列表自带二进制，所以这个 bug 只在原生后端暴露。
     */
    async function recordToUrl(record: AvatarRecord | null, fallbackName: string): Promise<string | null> {
        if (!record) return null;
        // IDB 后端：列表已带二进制，直接生成 URL
        if (record.imageBlob) return blobToUrl(record.imageBlob);

        const moodId = String(record.moodId ?? "");
        if (!moodId) return null;
        // 回查要用**记录里存的名字**（可能是原始大小写），不能用归一化后的名字
        const storedName = String(record.alias ?? record.name ?? fallbackName);
        try {
            const full = await repository.getMoodAvatar(storedName, moodId);
            return blobToUrl(full?.imageBlob);
        } catch {
            return null;
        }
    }

    function pick(records: AvatarRecord[], seed: string): AvatarRecord {
        if (records.length === 1) return records[0];
        return records[stableHash(seed) % records.length] ?? records[0];
    }

    /** 按 L1→L4 在候选池里挑一条记录 */
    function pickByMood(
        name: string,
        mood: string,
        outfit: string,
        act: string,
        seed: string,
    ): AvatarRecord | null {
        const bucket = moodIndex.get(name);
        if (!bucket || !bucket.length) return null;

        const exact = bucket.filter((record) => {
            const parts = moodSegments(record);
            return parts[0] === mood && parts[1] === outfit && parts[2] === act;
        });
        if (exact.length) return pick(exact, seed);

        const sameOutfit = bucket.filter((record) => {
            const parts = moodSegments(record);
            return parts[0] === mood && parts[1] === outfit;
        });
        if (sameOutfit.length) return pick(sameOutfit, seed);

        const sameAct = bucket.filter((record) => {
            const parts = moodSegments(record);
            return parts[0] === mood && parts.includes(act);
        });
        if (sameAct.length) return pick(sameAct, seed);

        const sameMood = bucket.filter((record) => moodSegments(record)[0] === mood);
        if (sameMood.length) return pick(sameMood, seed);

        return null;
    }

    return {
        async resolve(request) {
            const key = cacheKeyOf(request);
            const cached = urlCache.get(key);
            if (cached) return cached;

            const name = normalizeName(request.name);
            const mood = normalizeMoodId(request.mood);
            const outfit = normalizeOutfit(request.outfit);
            const seed = request.seed ?? key;

            if (mood) {
                // 先建索引：动作是否合法要按「数据里真实存在的标签」判断
                await ensureIndex();
                const act = normalizeAct(request.act, knownActs);
                const record = pickByMood(name, mood, outfit, act, seed);
                const url = await recordToUrl(record, name);
                if (url) {
                    cacheSet(key, url);
                    return url;
                }
            }

            // L5 主头像
            try {
                const main = await repository.getAvatar(name);
                const url = blobToUrl(main?.imageBlob);
                if (url) {
                    cacheSet(key, url);
                    return url;
                }
            } catch {
                /* fall through */
            }
            return null;
        },
        resolveCached(request) {
            return urlCache.get(cacheKeyOf(request)) ?? null;
        },
        clearCache() {
            for (const url of urlCache.values()) {
                if (url.startsWith("blob:")) {
                    try {
                        URL.revokeObjectURL(url);
                    } catch {
                        /* ignore */
                    }
                }
            }
            urlCache.clear();
            moodIndex.clear();
            knownActs.clear();
            indexPromise = null;
        },
    };
}
