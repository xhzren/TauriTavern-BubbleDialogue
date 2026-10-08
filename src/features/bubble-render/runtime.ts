import { reactive } from "vue";
import type { CreatorRuntimeContext } from "../../app/context";
import type { TauriTavernExtensionStoreApi } from "../../host/api";
import type { AvatarRecord } from "./avatar-repository";
import { createAvatarResolver, type AvatarResolver } from "./avatar-resolver";
import { createBubbleStyleInjector } from "./style-injector";
import { createAvatarZoom } from "./avatar-zoom";
import { mapWithConcurrency } from "./async-utils";
import { createBubbleHydrator } from "./bubble-hydrator";
import { createIndexedDbAvatarLibrary } from "./indexeddb-avatar-library";
import { createNativeAvatarLibrary } from "./native-avatar-library";
import { createFallbackMoodResolver, createMoodResolver } from "./mood-resolver";
import { createPromptInjector } from "./prompt-injector";
import { createConfigStore, type BubbleConfigStore } from "./config-store";
import { getStContext, resolveEventName, subscribeStEvent } from "./host-bridge";
import { migrateLibrary, type MigrationReport } from "./migration";
import { exportLibraryZip, importLibraryZip } from "./import-export";
import type {
    AvatarLibrary,
    AvatarScope,
    CgGroupRecord,
    CgImageRecord,
    ImportReport,
    LibraryScopeStat,
    StorageMode,
} from "./storage-types";
import { GLOBAL_SCOPE } from "./storage-types";
import { GLOBAL_CHAR_ID } from "./constants";
import { buildColorConfigKey } from "./key-format";

/** 删除一个头像时要逐条删差分（kv + blob），串行几百次 IPC 太慢，限并发批量化 */
const DELETE_CONCURRENCY = 8;

const SCAN_DELAY_STREAMING = 450;
const SCAN_DELAY_IDLE = 80;

/** 存储后端：legacy = 原 IndexedDB；native = TauriTavern 原生 extension.store */
export type StorageBackend = "legacy" | "native";

/** ST 在未打开角色卡时 name2 返回的哨兵值 */
const NO_CHARACTER_SENTINEL = "SillyTavern System";

export interface AvatarVariant {
    moodId: string;
    mood: string;
    outfit: string;
    act: string;
    /** 已经可用的预览 URL（blob:）；后端不预取二进制时为 null */
    previewUrl: string | null;
}

export interface BubbleRuntime {
    state: {
        ready: boolean;
        backend: StorageBackend;
        mode: StorageMode;
        hasCharacterCard: boolean;
        charId: string | null;
        charName: string;
        bubbleCount: number;
        injected: boolean;
        generationActive: boolean;
        busy: boolean;
        progress: { done: number; total: number } | null;
        lastResult: string | null;
        avatarNames: string[];
        avatarCount: number;
        moodCount: number;
        totalBytes: number;
        /** 统计仍在计算（列表/统计卡片要显示加载提示） */
        statsLoading: boolean;
        /** 宿主是否提供原生扩展存储 */
        nativeAvailable: boolean;
        /** 全库头像数（存储页「TT 原生」用，汇总所有范围） */
        totalAvatars: number;
        /** 全库情绪差分总数 */
        totalMoodAvatars: number;
        /** 全库 CG 图片总数 */
        totalCgImages: number;
        /** 全库占用字节 */
        totalStorageBytes: number;
        /** 全库统计仍在计算 */
        totalStatsLoading: boolean;
        /** 全库统计失败（例如原生存储不可用） */
        totalStatsError: boolean;
        /** 数据已变动但统计还是旧的（提示用户手动刷新，不自动重扫） */
        totalStatsStale: boolean;
        /** 分范围明细：全局 + 当前角色卡（存储页「TT 原生」表格用） */
        nativeScopes: LibraryScopeStat[];
        /** 正在删除的头像名（界面上把删除按钮置灰，避免连点） */
        deletingName: string | null;
        /** 「按角色」配色：名字(小写) → 正文颜色；供界面显示与正文上色 */
        avatarColors: Record<string, string>;
    };
    config: BubbleConfigStore;
    /** 多页面共享：引用计数归零才真正卸载 */
    acquire(): Promise<void>;
    release(): Promise<void>;
    hydrateNow(): void;
    refreshAvatars(): void;
    reinject(): void;
    setMode(mode: StorageMode): Promise<void>;
    addAvatar(name: string, blob: Blob): Promise<void>;
    /** 用新图替换某个已有头像的默认图（不动差分） */
    replaceAvatar(name: string, blob: Blob): Promise<void>;
    /** 重命名头像：主头像 + 全部差分一起搬；目标名被占用则报错 */
    renameAvatar(oldName: string, newName: string): Promise<void>;
    /** 设置/清除「按角色」配色的正文颜色（color 传 null 表示清除） */
    setAvatarColor(name: string, color: string | null): Promise<void>;
    deleteAvatar(name: string): Promise<void>;
    getAvatarPreviewUrl(name: string): Promise<string | null>;
    /** 某头像的情绪差分明细（右侧详情面板用），一次调用带回预览图 */
    getAvatarVariants(name: string): Promise<AvatarVariant[]>;
    /** 某情绪差分的预览 URL */
    getMoodVariantPreviewUrl(name: string, moodId: string): Promise<string | null>;
    listCgGroups(): Promise<CgGroupRecord[]>;
    listCgImages(group: string): Promise<CgImageRecord[]>;
    getCgImagePreviewUrl(group: string, index: number): Promise<string | null>;
    exportZip(): Promise<Uint8Array>;
    importZip(data: Uint8Array): Promise<ImportReport>;
    /** 原版 DB 里各范围的占用统计（全局 + 每张角色卡） */
    listDbScopes(): Promise<LibraryScopeStat[]>;
    /** 把某个范围的数据转换到原生存储（不动源数据） */
    convertScope(charId: string): Promise<MigrationReport>;
    /** 删除原版 DB 里某个范围的数据 */
    removeDbScope(charId: string): Promise<void>;
    /** 把原版 DB 的所有范围转换到原生存储，成功后逐个删除 */
    convertAllAndRemove(): Promise<{ scopes: number; converted: number; failed: number }>;
    /** 手动重算全库统计（存储页「刷新统计」按钮用），同时刷新各范围明细 */
    refreshTotalStats(): Promise<void>;
    /** 删除原生存储里某个范围的全部数据（全局 / 当前角色卡），另一个范围不受影响 */
    removeNativeScope(charId: string): Promise<void>;
    /** 强制重扫当前范围的统计（忽略缓存；用户手动刷新时用） */
    refreshScopeStats(): Promise<void>;
}

/** 把 moodId 拆成 情绪 / 服装 / 动作 三段，便于详情面板分组展示 */
export function splitMoodId(moodId: string): { mood: string; outfit: string; act: string } {
    const parts = String(moodId ?? "").split("__");
    return {
        mood: parts[0] ?? "",
        outfit: parts[1] ?? "",
        act: parts[2] ?? "",
    };
}

function readCharIdentity(): { id: string | null; name: string; hasCard: boolean } {
    const ctx = getStContext();
    const rawId = ctx?.characterId;
    const id = rawId === undefined || rawId === null || rawId === "" ? null : String(rawId);
    const rawName = typeof ctx?.name2 === "string" ? ctx.name2.trim() : "";
    // 未打开角色卡时 name2 是 "SillyTavern System"，这不是真实角色
    const hasCard = id !== null && rawName !== NO_CHARACTER_SENTINEL;
    return {
        id: hasCard ? id : null,
        name: rawName || NO_CHARACTER_SENTINEL,
        hasCard,
    };
}

/**
 * 原生存储里「能触达」的各范围统计。
 *
 * 宿主 API 无法枚举 namespace，只能按名字操作，因此范围清单靠构造：
 * 全局 + 当前角色卡（没有角色卡时只有全局）。
 * 必须用「角色卡」句柄调 listScopes()：全局句柄只会返回全局一条。
 *
 * 明细与总量用同一次扫描拿到，避免同一批数据读两遍（全局几千条差分会明显变慢）。
 */
async function collectNativeScopes(
    store: TauriTavernExtensionStoreApi,
    charId: string | null,
): Promise<LibraryScopeStat[]> {
    const scope: AvatarScope = charId ? { mode: "character", charId } : GLOBAL_SCOPE;
    try {
        const rows = await createNativeAvatarLibrary(store, scope).listScopes();
        // 全局排最前：表格里读起来更顺
        return rows.sort((a, b) => Number(b.charId === GLOBAL_CHAR_ID) - Number(a.charId === GLOBAL_CHAR_ID));
    } catch (error) {
        console.warn("[BubbleDialogue] native scope stats failed.", error);
        return [];
    }
}

export function createBubbleRuntime(context: CreatorRuntimeContext): BubbleRuntime {
    const initialIdentity = readCharIdentity();

    const state = reactive({
        ready: false,
        backend: "native" as StorageBackend,
        mode: "global" as StorageMode,
        hasCharacterCard: initialIdentity.hasCard,
        charId: initialIdentity.id,
        charName: initialIdentity.name,
        bubbleCount: 0,
        injected: false,
        generationActive: false,
        busy: false,
        progress: null as { done: number; total: number } | null,
        lastResult: null as string | null,
        avatarNames: [] as string[],
        avatarCount: 0,
        moodCount: 0,
        totalBytes: 0,
        statsLoading: true,
        nativeAvailable: false,
        /** 全库统计（存储页「TT 原生」专用）：汇总所有范围，与库范围选择器无关 */
        totalAvatars: 0,
        totalMoodAvatars: 0,
        totalCgImages: 0,
        totalStorageBytes: 0,
        totalStatsLoading: true,
        totalStatsError: false,
        totalStatsStale: false,
        /** 分范围明细（存储页「TT 原生」的各范围统计表）：全局 + 当前角色卡 */
        nativeScopes: [] as LibraryScopeStat[],
        deletingName: null as string | null,
        avatarColors: {} as Record<string, string>,
    });

    /** 没有角色卡时一律使用全局库 */
    function effectiveScope() {
        const mode: StorageMode = state.hasCharacterCard ? state.mode : "global";
        return { mode, charId: mode === "character" ? state.charId : null };
    }

    /** 宿主是否提供原生扩展存储（决定能否执行转换） */
    let nativeAvailable = false;

    let library: AvatarLibrary;
    let resolver = createAvatarResolver({} as AvatarLibrary);
    let moodResolver = createFallbackMoodResolver();

    function buildLibrary(): AvatarLibrary {
        const scope = effectiveScope();
        if (state.backend === "native") {
            const store = context.host.api.extension?.store as TauriTavernExtensionStoreApi | undefined;
            nativeAvailable = Boolean(store);
            if (store) {
                return createNativeAvatarLibrary(store, scope);
            }
            // 原生存储此刻不可用（例如 ABI 尚未装好）：先退回原库读取，
            // 但**不改写** state.backend——否则用户会被悄悄切到原版后端，
            // 而且之后 ABI 就绪也回不来了。
            console.warn("[BubbleDialogue] native store unavailable, reading legacy library as fallback.");
            return createIndexedDbAvatarLibrary(scope);
        }
        nativeAvailable = Boolean(context.host.api.extension?.store);
        return createIndexedDbAvatarLibrary(scope);
    }

    library = buildLibrary();
    state.nativeAvailable = nativeAvailable;

    const config = createConfigStore(() => ({
        getConfig: (key) => library.getConfig(key),
        setConfig: (key, value) => library.setConfig(key, value),
    }));

    /**
     * 建头像解析器。
     *
     * 情绪词表取自**当前生效的配置**（用户可编辑、可随导入数据变化），
     * 不是内置默认表——否则颜色按配置解析、头像按内置表解析，两边会对不上。
     */
    function buildResolver(): AvatarResolver {
        return createAvatarResolver(library, {
            getMoodGroups: () => config.state.moodGroups,
            // 与气泡上色共用同一个解析器：同一个词两边必须落到同一个情绪组，
            // 否则会出现「颜色是平和、差分却是喜悦」这种对不上的情况
            resolveMoodId: (moodText) => {
                const text = String(moodText ?? "").trim();
                if (!text) return "";
                return moodResolver(text)?.id ?? text;
            },
        });
    }

    resolver = buildResolver();

    /**
     * 正文美化：把 style_* 配置编译成 CSS 注入主文档。
     * 配置一变就更新（订阅），不再需要各页面手动触发。
     */
    const styleInjector = createBubbleStyleInjector({
        documentRef: () => document,
        readStyle: () => config.state.style,
    });
    /**
     * 配置订阅的退订句柄。跟随「启用/停用」生命周期创建与释放：
     * 不能在建注入器时一次性订阅——release 退订后重新 acquire 就再也收不到
     * 配置变更了（正文美化会停在旧值）。
     */
    let unsubscribeStyle: (() => void) | null = null;
    /** 上次生效的词表快照，用来判断「词表真的变了」 */
    let lastMoodGroupsJson = "";
    /** 上次生效的文字颜色模式：切换「全局 ↔ 按角色」要重新给已有气泡上色 */
    let lastTextColorMode = "";

    /**
     * 点气泡头像看大图。
     * hydrator 一直支持 onZoom，但之前没人接——点击被 preventDefault 吃掉却什么也不发生。
     */
    const avatarZoom = createAvatarZoom({ documentRef: () => document });

    const hydrator = createBubbleHydrator({
        documentRef: () => document,
        resolveAvatar: (request) => resolver.resolve(request),
        resolveCachedAvatar: (request) => resolver.resolveCached(request),
        resolveMoodGroup: (moodText) => moodResolver(moodText),
        resolveTextColor: (name) => {
            // 只有「按角色」模式才用单独配色；「全局」模式一律用全局色
            const mode = String(config.state.style.style_textColorMode ?? "global");
            if (mode !== "character") return null;
            return colorCache.get(colorCacheKey(name)) ?? null;
        },
        onZoom: (url, name) => avatarZoom.show(url, name),
    });

    const injector = createPromptInjector({
        setExtensionPrompt: (name, content, position, depth, scan, role) => {
            const ctx = getStContext();
            if (!ctx || typeof ctx.setExtensionPrompt !== "function") {
                console.warn("[BubbleDialogue] setExtensionPrompt is unavailable.");
                return;
            }
            ctx.setExtensionPrompt(name, content, position, depth, scan, role);
            state.injected = true;
        },
        readFormatRule: async () => {
            const value = await library.getConfig("format_rule");
            return typeof value === "string" ? value : null;
        },
        readMoodGroups: async () => {
            // 用**有效词表**（已套默认值），不要再读原始 mood_config：
            // 真机配置表里可能没有这个键，早退会让注入出去的模板留着
            // {{mood_groups}} 占位符——模型拿不到词表就只能自己造词，
            // 表外词最后又落回兜底，颜色和差分都对不上。
            const groups = config.state.moodGroups;
            return groups && groups.length ? groups : null;
        },
        readMoodTemplate: async () => {
            const value = await library.getConfig("mood_prompt_template");
            return typeof value === "string" ? value : null;
        },
    });

    /**
     * 情绪差分记录缓存（**当前范围**，不含回退链）。
     * 详情面板要展示「这个范围里有哪些差分」，混入全局同名的会误导；
     * 水合解析另走 listMoodAvatars() 的回退链。
     * 全表扫描几千条很慢，缓存后点头像不再重扫；任何写操作后失效。
     */
    const moodRecordsCache = new Map<string, AvatarRecord[]>();
    /** 差分记录缓存最多保留几个范围（按插入顺序淘汰最旧的） */
    const MOOD_RECORDS_CACHE_LIMIT = 4;
    /** 正在进行的差分扫描，避免同范围并发重复扫 */
    const moodRecordsInFlight = new Map<string, Promise<AvatarRecord[]>>();

    /** 差分记录也按范围缓存：切回全局不该重扫几千条 */
    function invalidateMoodRecords(charId?: string) {
        const key = charId ?? statsCacheKey();
        moodRecordsCache.delete(key);
        moodRecordsInFlight.delete(key);
    }

    function invalidateAllMoodRecords() {
        moodRecordsCache.clear();
        moodRecordsInFlight.clear();
    }

    async function getMoodRecords(): Promise<AvatarRecord[]> {
        const key = statsCacheKey();
        const cached = moodRecordsCache.get(key);
        if (cached) return cached;
        const pending = moodRecordsInFlight.get(key);
        if (pending) return pending;
        const task = library.listMoodAvatarsPrimary();
        moodRecordsInFlight.set(key, task);
        try {
            const records = await task;
            moodRecordsCache.set(key, records);
            // 换卡不再清缓存（数据没变，切回来要能命中），因此这里加上限，
            // 避免长时间浏览很多张卡后把历史记录一直攒在内存里。
            while (moodRecordsCache.size > MOOD_RECORDS_CACHE_LIMIT) {
                const oldest = moodRecordsCache.keys().next().value;
                if (oldest === undefined) break;
                moodRecordsCache.delete(oldest);
            }
            return records;
        } finally {
            moodRecordsInFlight.delete(key);
        }
    }

    /**
     * 全库统计（存储页「TT 原生」）的执行闸门。
     *
     * 契约：整份扩展生命周期内**只自动算一次**（扩展启用时），
     * 之后只有用户点「刷新统计」才会重算。
     * - done：是否已经算过；
     * - inFlight：同一次扫描的共享 promise。没有它的话，
     *   「上一次还在跑（几千条记录要几秒到几十秒），用户又开了一次面板」
     *   会并发触发第二次全库扫描。
     */
    let totalStatsDone = false;
    let totalStatsInFlight: Promise<void> | null = null;

    /**
     * CG 分组列表也按范围缓存。
     * 关掉面板再打开时组件会重新挂载，onMounted 会重拉一次 CG；
     * 而 CG 分组只随导入/转换变化，和统计一样不该每次重开都重扫。
     */
    const cgGroupsCache = new Map<string, CgGroupRecord[]>();
    const cgGroupsInFlight = new Map<string, Promise<CgGroupRecord[]>>();

    function invalidateCgGroups(charId?: string) {
        const key = charId ?? statsCacheKey();
        cgGroupsCache.delete(key);
        cgGroupsInFlight.delete(key);
    }

    function invalidateAllCgGroups() {
        cgGroupsCache.clear();
        cgGroupsInFlight.clear();
    }

    let observer: MutationObserver | null = null;
    let scanTimer: number | null = null;
    const unsubscribers: Array<() => void> = [];
    let refCount = 0;

    /**
     * 当前范围的统计结果缓存，键是范围的命名空间标识（全局 / 各角色卡）。
     *
     * 为什么需要：全局库有几千条情绪差分，getScopeStats() 是全表扫描，
     * 每次切换库范围都重扫会让「切回全局」明显卡顿。而某个范围的数据
     * 只有在该范围发生写操作（上传/删除/导入/转换）时才会变，
     * 切换范围本身不改变任何数据，因此缓存结果、按需失效。
     */
    const statsCache = new Map<string, ScopeStatsSnapshot>();
    /** 正在进行的统计，避免同范围并发重复扫 */
    const statsInFlight = new Map<string, Promise<ScopeStatsSnapshot>>();

    interface ScopeStatsSnapshot {
        names: string[];
        stats: { avatars: number; moodAvatars: number; bytes: number };
    }

    /** 当前范围的缓存键：全局固定为 _global_，角色卡用其 id */
    function statsCacheKey(): string {
        const scope = effectiveScope();
        return scope.mode === "character" && scope.charId ? scope.charId : GLOBAL_CHAR_ID;
    }

    /** 某个范围的数据被改写后调用；不传则失效当前范围 */
    function invalidateStatsCache(charId?: string) {
        const key = charId ?? statsCacheKey();
        statsCache.delete(key);
        statsInFlight.delete(key);
    }

    /** 所有范围的数据都被改写（如一键转换）；或者无法确定改了哪个范围 */
    function invalidateAllStats() {
        statsCache.clear();
        statsInFlight.clear();
    }

    /**
     * 读取当前范围统计。命中缓存直接返回，不再扫库。
     * force = true 时忽略缓存重扫（用户手动刷新）。
     */
    async function loadScopeStats(force = false): Promise<ScopeStatsSnapshot> {
        const key = statsCacheKey();
        if (!force) {
            const cached = statsCache.get(key);
            if (cached) return cached;
            const pending = statsInFlight.get(key);
            if (pending) return pending;
        }
        const task = (async () => {
            // 列表先出：listAvatarNames 只需一次 listKeys，比读全部元数据快得多。
            const names = (await library.listAvatarNames()).filter(Boolean);
            // 数量/体积只统计「当前范围」，与库范围选择器一致；
            // 水合（应用到正文）另走 fallbackChain，两者互不影响。
            const stats = await library.getScopeStats();
            return { names, stats };
        })();
        statsInFlight.set(key, task);
        try {
            const snapshot = await task;
            statsCache.set(key, snapshot);
            return snapshot;
        } finally {
            statsInFlight.delete(key);
        }
    }

        /**
     * 把缓存里的统计结果直接写进 state：不扫库，也不进加载态。
     *
     * 页面重新打开（关掉悬浮窗再开）时用。数据没变过，
     * 没必要再让用户看一次转圈。返回 false 表示没有缓存，调用方需真的加载。
     */
    function applyCachedStats(): boolean {
        const cached = statsCache.get(statsCacheKey());
        if (!cached) return false;
        state.avatarNames = cached.names;
        state.avatarCount = cached.names.length;
        state.moodCount = cached.stats.moodAvatars;
        state.totalBytes = cached.stats.bytes;
        state.statsLoading = false;
        return true;
    }

async function refreshAvatarStats(options: { force?: boolean } = {}) {
        state.statsLoading = true;
        try {
            const snapshot = await loadScopeStats(options.force === true);
            state.avatarNames = snapshot.names;
            state.avatarCount = snapshot.names.length;
            // 颜色要先读进内存，水合时才能同步取到
            await loadAvatarColors(snapshot.names);
            state.moodCount = snapshot.stats.moodAvatars;
            state.totalBytes = snapshot.stats.bytes;
        } catch (error) {
            console.warn("[BubbleDialogue] avatar stats failed.", error);
        } finally {
            state.statsLoading = false;
        }
    }

    /**
     * 全库统计：汇总原生存储里所有能触达范围的数据。
     *
     * 与 refreshAvatarStats() 的区别：
     * - 那个统计「当前库范围」，切全局/角色卡必须重算，头像页列表依赖它；
     * - 这个汇总所有范围，只受真实写入（导入/转换/删除）影响，
     *   切换库范围不应改变结果，因此不在 rebuild() 里跑。
     *
     * 宿主 API 无法枚举 namespace，只能看到「全局 + 当前角色卡」两个范围；
     * 其它角色卡的历史数据无法从这里触达（原生面板的这个限制是宿主的，不是本扩展的）。
     */
    async function computeTotalStats() {
        state.totalStatsLoading = true;
        state.totalStatsError = false;
        try {
            const store = context.host.api.extension?.store as TauriTavernExtensionStoreApi | undefined;
            if (!store) {
                // ABI 可能还没装好；不算「已统计」，下次启用时机再试
                state.totalStatsError = true;
                return;
            }
            const scopes = await collectNativeScopes(store, state.charId);
            const totals = { avatars: 0, moodAvatars: 0, cgImages: 0, bytes: 0 };
            for (const row of scopes) {
                totals.avatars += row.avatars;
                totals.moodAvatars += row.moodAvatars;
                totals.cgImages += row.cgImages;
                totals.bytes += row.bytes;
            }
            state.nativeScopes = scopes;
            state.totalAvatars = totals.avatars;
            state.totalMoodAvatars = totals.moodAvatars;
            state.totalCgImages = totals.cgImages;
            state.totalStorageBytes = totals.bytes;
            totalStatsDone = true;
            state.totalStatsStale = false;
            console.info(
                `[BubbleDialogue] 全库统计完成：范围 ${scopes.map((row) => row.charId).join(", ")}；头像 ${totals.avatars}、差分 ${totals.moodAvatars}、CG ${totals.cgImages}`,
            );
        } catch (error) {
            console.warn("[BubbleDialogue] total stats failed.", error);
            state.totalStatsError = true;
        } finally {
            state.totalStatsLoading = false;
        }
    }

    /**
     * 扩展启用时的自动统计：整份生命周期内只会真正扫一次。
     * 扫描进行中再次调用会复用同一个 promise，不会并发重扫。
     */
    function requestTotalStatsOnce(): Promise<void> {
        if (totalStatsDone) return Promise.resolve();
        if (!totalStatsInFlight) {
            totalStatsInFlight = computeTotalStats().finally(() => {
                totalStatsInFlight = null;
            });
        }
        return totalStatsInFlight;
    }

    /** 用户手动刷新：强制重算（若已有扫描在跑，等它结束后再算一次） */
    async function forceTotalStats(): Promise<void> {
        const pending = totalStatsInFlight;
        if (pending) {
            try {
                await pending;
            } catch {
                /* 上一次失败不影响这次重算 */
            }
        }
        totalStatsInFlight = computeTotalStats().finally(() => {
            totalStatsInFlight = null;
        });
        await totalStatsInFlight;
    }

    /** 写入/覆盖主头像（addAvatar 与 replaceAvatar 共用） */
    async function doAddAvatar(name: string, blob: Blob, replaced: boolean) {
        invalidateMoodRecords();
        await library.putAvatar(name, blob, { mimeType: blob.type });
        invalidateStatsCache();
        await refreshAvatarStats();
        resolver.clearCache();
        hydrator.refresh();
        hydrator.hydrateAll();
        state.lastResult = replaced
            ? `已替换「${name}」的默认头像`
            : `已添加/更新头像「${name}」`;
    }

    /**
     * 删除一个头像：差分逐条删，再删主头像。
     *
     * 防连点：删一个角色要跑几百次 IPC（几百毫秒到几秒），
     * 这期间再点一次会让两个流程抢同一批文件——后到的那个被宿主报 Not Found，
     * 而宿主的错误提示是在命令层弹的，扩展 catch 也挡不住。
     */
    async function doDeleteAvatar(name: string) {
        if (state.deletingName === name) return;
        state.deletingName = name;
        try {
            invalidateMoodRecords();
            const moodRecords = await library.listMoodAvatars();
            // 去重：角色卡范围的回退链（本卡 + 全局）会让同一条记录出现两次，
            // 并发删同一个 key 同样会撞出 Not Found。
            const moodIds = [
                ...new Set(
                    moodRecords
                        .filter((record) => String(record.alias ?? "") === name)
                        .map((record) => String(record.moodId ?? ""))
                        .filter(Boolean),
                ),
            ];
            // 单条失败不中断整批：一个坏条目不该让整个头像只删一半
            let failed = 0;
            await mapWithConcurrency(moodIds, DELETE_CONCURRENCY, async (moodId) => {
                try {
                    await library.deleteMoodAvatar(name, moodId);
                } catch (error) {
                    failed += 1;
                    console.warn(`[BubbleDialogue] delete mood avatar failed: ${name} / ${moodId}`, error);
                }
            });
            await library.deleteAvatar(name);
            invalidateStatsCache();
            await refreshAvatarStats();
            resolver.clearCache();
            hydrator.refresh();
            hydrator.hydrateAll();
            state.lastResult = failed
                ? `已删除头像「${name}」，但有 ${failed} 条差分删除失败（详见控制台）`
                : `已删除头像「${name}」`;
        } finally {
            state.deletingName = null;
        }
    }

    /**
     * 「按角色」配色的内存缓存（名字小写 → 颜色）。
     *
     * 水合是**同步**取色的，所以必须先把颜色读进内存。
     * 键与原脚本 buildColorConfigKey 一致：`color_<charId>__<名字小写>`，
     * 读取时先本卡、再全局（与原脚本 getColor 一致）。
     */
    const colorCache = new Map<string, string>();
    const colorCacheKey = (name: string) => String(name ?? "").trim().toLowerCase();

    async function readStoredColor(key: string): Promise<string | null> {
        try {
            const value = await library.getConfig(key);
            return typeof value === "string" && value.trim() ? value.trim() : null;
        } catch {
            return null;
        }
    }

    /** 读某名字的颜色：先本卡、再全局 */
    async function readAvatarColor(name: string): Promise<string | null> {
        const own = await readStoredColor(buildColorConfigKey(state.charId, name));
        if (own) return own;
        if (state.charId) {
            const fallback = await readStoredColor(buildColorConfigKey(GLOBAL_CHAR_ID, name));
            if (fallback) return fallback;
        }
        return null;
    }

    /** 预取当前范围所有头像的颜色（头像列表加载后调用） */
    async function loadAvatarColors(names: string[]): Promise<void> {
        const unique = [...new Set(names.map(colorCacheKey).filter(Boolean))];
        colorCache.clear();
        await mapWithConcurrency(unique, DELETE_CONCURRENCY, async (key) => {
            const color = await readAvatarColor(key);
            if (color) colorCache.set(key, color);
        });
        state.avatarColors = Object.fromEntries(colorCache);
    }

    function scheduleScan() {
        if (scanTimer !== null) window.clearTimeout(scanTimer);
        const delay = state.generationActive ? SCAN_DELAY_STREAMING : SCAN_DELAY_IDLE;
        scanTimer = window.setTimeout(() => {
            scanTimer = null;
            hydrator.hydrateAll();
            state.bubbleCount = document.querySelectorAll(".yq-bubble, .custom-yq-bubble").length;
        }, delay);
    }

    function startObserver() {
        if (observer) return;
        try {
            observer = new MutationObserver((mutations) => {
                if (!mutations.some((m) => m.addedNodes && m.addedNodes.length > 0)) return;
                scheduleScan();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        } catch {
            observer = null;
        }
    }

    function syncIdentity() {
        const identity = readCharIdentity();
        state.hasCharacterCard = identity.hasCard;
        state.charId = identity.id;
        state.charName = identity.name;
    }

    function bindHostEvents() {
        const rendered = resolveEventName("CHARACTER_MESSAGE_RENDERED", "character_message_rendered");
        const userRendered = resolveEventName("USER_MESSAGE_RENDERED", "user_message_rendered");
        const chatChanged = resolveEventName("CHAT_CHANGED", "chat_changed");
        const genStarted = resolveEventName("GENERATION_STARTED", "generation_started");
        const genEnded = resolveEventName("GENERATION_ENDED", "generation_ended");
        const genStopped = resolveEventName("GENERATION_STOPPED", "generation_stopped");
        const genAfterCommands = resolveEventName("GENERATION_AFTER_COMMANDS", "generation_after_commands");

        for (const event of [rendered, userRendered, chatChanged]) {
            unsubscribers.push(subscribeStEvent(event, () => scheduleScan()));
        }
        unsubscribers.push(subscribeStEvent(genStarted, () => { state.generationActive = true; }));
        for (const event of [genEnded, genStopped]) {
            unsubscribers.push(
                subscribeStEvent(event, () => {
                    state.generationActive = false;
                    scheduleScan();
                }),
            );
        }
        unsubscribers.push(subscribeStEvent(genAfterCommands, () => injector.apply()));
        // 换卡时同步身份；没有角色卡就强制回全局库
        unsubscribers.push(
            subscribeStEvent(chatChanged, () => {
                const before = state.charId;
                syncIdentity();
                if (before !== state.charId) {
                    // 换卡只是换了「看哪张卡」：两边数据都没变，缓存全部保留。
                    // 注意不要顺手 invalidateStatsCache()——当前范围可能是全局，
                    // 那会把全局缓存删掉，导致这里重扫几千条记录。
                    void rebuild();
                }
            }),
        );
    }

    /**
     * 同步情绪解析器。
     *
     * 必须用 `config.state.moodGroups`（**已经套过默认值的有效词表**），
     * 不能再自己去读原始 `mood_config`：
     * 真机上配置表里可能根本没有 mood_config（只有 style_*），
     * 早退之后解析器会一直停在「只认 id / label、不认同义词」的兜底版本，
     * 于是「得意」这类同义词：颜色走兜底 → 平和（绿），
     * 头像却按完整词表 → 喜悦，颜色和差分对不上。
     */
    function syncMoodResolver() {
        const groups = config.state.moodGroups;
        moodResolver = groups && groups.length
            ? createMoodResolver(groups)
            : createFallbackMoodResolver();
    }

    /**
     * 重建当前范围的库句柄。
     *
     * 注意：这里**不清**统计/差分缓存。切换库范围只是换了个读写句柄，
     * 数据本身没变，重扫（尤其是全局几千条差分）没有意义。
     * 缓存只在真实写操作处失效（addAvatar / delete / 导入 / 转换）。
     */
    async function rebuild() {
        library = buildLibrary();
        state.nativeAvailable = nativeAvailable;
        resolver = buildResolver();
        state.ready = await library.isReady();
        await config.load();
        syncMoodResolver();
        await refreshAvatarStats();
        styleInjector.apply();
        resolver.clearCache();
        hydrator.refresh();
        hydrator.hydrateAll();
    }

    return {
        state,
        config,
        async acquire() {
            refCount += 1;
            if (refCount > 1) return;

            syncIdentity();
            state.ready = await library.isReady();
            await config.load();
            syncMoodResolver();
            // 重新打开面板时，若当前范围已有缓存就直接复用：
            // 数据没变过，不该再让用户看一次「正在统计」。
            if (!applyCachedStats()) {
                await refreshAvatarStats();
            }
            // 全库统计：扩展启用时自动算一次，之后只有用户点「刷新统计」才会重算。
            // 开角色卡、切库范围、关开面板都不算「启用」。
            void requestTotalStatsOnce();
            injector.apply();
            console.info(
                `[BubbleDialogue] 运行时已就绪：后端 ${state.backend}、当前范围 ${state.mode}、头像 ${state.avatarCount}`,
            );
            // 配置一变就重编译 CSS；load() 之后订阅，保证首次用的是已读到的配置
            unsubscribeStyle?.();
            unsubscribeStyle = config.subscribe(() => {
                styleInjector.apply();
                // 词表改了：解析器要跟着换，提示词也要重新注入
                //（injector 内部有内容缓存，不 invalidate 会一直发旧的）
                const json = JSON.stringify(config.state.moodGroups);
                if (json !== lastMoodGroupsJson) {
                    lastMoodGroupsJson = json;
                    syncMoodResolver();
                    injector.invalidate();
                    injector.apply();
                }
                // 文字颜色模式切换（全局 ↔ 按角色）后，已经水合的气泡不会自动重上色，
                // 必须 refresh 掉「已处理」标记再跑一遍水合。
                const mode = String(config.state.style.style_textColorMode ?? "global");
                if (mode !== lastTextColorMode) {
                    lastTextColorMode = mode;
                    hydrator.refresh();
                    hydrator.hydrateAll();
                }
            });
            styleInjector.apply();
            bindHostEvents();
            startObserver();
            hydrator.hydrateAll();
            state.bubbleCount = document.querySelectorAll(".yq-bubble, .custom-yq-bubble").length;
        },
        async release() {
            refCount = Math.max(0, refCount - 1);
            if (refCount > 0) return;

            for (const unsubscribe of unsubscribers.splice(0)) unsubscribe();
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            if (scanTimer !== null) {
                window.clearTimeout(scanTimer);
                scanTimer = null;
            }
            injector.dispose();
            unsubscribeStyle?.();
            unsubscribeStyle = null;
            styleInjector.dispose();
            avatarZoom.dispose();
            resolver.clearCache();
            state.injected = false;
        },
        hydrateNow() {
            hydrator.hydrateAll();
            state.bubbleCount = document.querySelectorAll(".yq-bubble, .custom-yq-bubble").length;
        },
        refreshAvatars() {
            resolver.clearCache();
            hydrator.refresh();
            hydrator.hydrateAll();
        },
        reinject() {
            injector.invalidate();
            injector.apply();
        },
        async setMode(mode) {
            if (mode === state.mode) return;
            state.mode = mode;
            await rebuild();
        },
        addAvatar: (name, blob) => doAddAvatar(name, blob, false),
        async replaceAvatar(name, blob) {
            await doAddAvatar(name, blob, true);
        },
        async renameAvatar(oldName, newName) {
            const target = String(newName ?? "").trim();
            if (!target) throw new Error("新名字不能为空");
            if (target === oldName) return;
            if (await library.getAvatar(target)) throw new Error(`名字「${target}」已被占用`);
            const main = await library.getAvatar(oldName);
            if (!main) throw new Error(`头像「${oldName}」不存在`);

            state.busy = true;
            try {
                // 先全部「复制到新名」，都成功了再删旧的——中途失败不会把头像弄丢
                if (main.imageBlob) {
                    await library.putAvatar(target, main.imageBlob, {
                        fileName: main.fileName,
                        mimeType: main.mimeType,
                        width: main.width,
                        height: main.height,
                        sourceUrl: main.sourceUrl,
                    });
                }
                const records = await library.listMoodAvatars();
                const moodIds = [
                    ...new Set(
                        records
                            .filter((record) => String(record.alias ?? record.name ?? "") === oldName)
                            .map((record) => String(record.moodId ?? ""))
                            .filter(Boolean),
                    ),
                ];
                let failed = 0;
                await mapWithConcurrency(moodIds, DELETE_CONCURRENCY, async (moodId) => {
                    try {
                        const full = await library.getMoodAvatar(oldName, moodId);
                        if (!full?.imageBlob) return;
                        await library.putMoodAvatar(target, moodId, full.imageBlob, {
                            fileName: full.fileName,
                            mimeType: full.mimeType,
                            width: full.width,
                            height: full.height,
                            sourceUrl: full.sourceUrl,
                        });
                    } catch (error) {
                        failed += 1;
                        console.warn(`[BubbleDialogue] rename mood avatar failed: ${oldName} → ${target} / ${moodId}`, error);
                    }
                });
                if (failed) {
                    throw new Error(`有 ${failed} 条差分复制失败，已中止（原头像未改动）`);
                }

                // 配色配置一起搬走
                const oldColor = await readStoredColor(buildColorConfigKey(state.charId, oldName));
                if (oldColor) {
                    await library.setConfig(buildColorConfigKey(state.charId, target), oldColor);
                    await library.setConfig(buildColorConfigKey(state.charId, oldName), null);
                }

                // 复制全部成功，才删旧的（doDeleteAvatar 内部会刷新列表与颜色缓存）
                await doDeleteAvatar(oldName);
                state.lastResult = `已重命名「${oldName}」→「${target}」`;
            } finally {
                state.busy = false;
            }
        },
        async setAvatarColor(name, color) {
            const key = colorCacheKey(name);
            try {
                await library.setConfig(buildColorConfigKey(state.charId, name), color);
                if (color) colorCache.set(key, color);
                else colorCache.delete(key);
                state.avatarColors = Object.fromEntries(colorCache);
                hydrator.refresh();
                hydrator.hydrateAll();
                state.lastResult = color
                    ? `已设置「${name}」的正文颜色（需把「正文美化 → 文字颜色」切到「按角色」才生效）`
                    : `已清除「${name}」的正文颜色`;
            } catch (error) {
                state.lastResult = `设置颜色失败：${error instanceof Error ? error.message : String(error)}`;
            }
        },
        deleteAvatar: doDeleteAvatar,
        async getAvatarPreviewUrl(name) {
            try {
                const record = await library.getAvatar(name);
                if (!record?.imageBlob) return null;
                return URL.createObjectURL(record.imageBlob);
            } catch {
                return null;
            }
        },
        async getAvatarVariants(name) {
            try {
                const records = await getMoodRecords();
                return records
                    .filter((record) => String(record.alias ?? "") === name)
                    .map((record) => {
                        const moodId = String(record.moodId ?? "");
                        const parts = splitMoodId(moodId);
                        // IDB 后端的列表已带 imageBlob，直接生成 URL，省掉 N 次回查
                        let previewUrl: string | null = null;
                        if (record.imageBlob) {
                            try {
                                previewUrl = URL.createObjectURL(record.imageBlob);
                            } catch {
                                previewUrl = null;
                            }
                        }
                        return { moodId, ...parts, previewUrl };
                    })
                    .filter((item) => item.moodId);
            } catch {
                return [];
            }
        },
        async getMoodVariantPreviewUrl(name, moodId) {
            try {
                const record = await library.getMoodAvatar(name, moodId);
                if (!record?.imageBlob) return null;
                return URL.createObjectURL(record.imageBlob);
            } catch {
                return null;
            }
        },
        async listCgGroups() {
            const key = statsCacheKey();
            const cached = cgGroupsCache.get(key);
            if (cached) return cached;
            const pending = cgGroupsInFlight.get(key);
            if (pending) return pending;
            const task = library.listCgGroups();
            cgGroupsInFlight.set(key, task);
            try {
                const groups = await task;
                cgGroupsCache.set(key, groups);
                return groups;
            } catch {
                return [];
            } finally {
                cgGroupsInFlight.delete(key);
            }
        },
        async listCgImages(group) {
            try {
                return await library.listCgImages(group);
            } catch {
                return [];
            }
        },
        async getCgImagePreviewUrl(group, index) {
            try {
                const blob = await library.getCgImageBlob(group, index);
                return blob ? URL.createObjectURL(blob) : null;
            } catch {
                return null;
            }
        },
        async exportZip() {
            state.busy = true;
            state.progress = { done: 0, total: 0 };
            try {
                // 注意用**当前范围**的 charId，不是当前角色卡的：
                // 选「全局」时导出的就是全局库，manifest 里写角色卡 id 会误导
                const scope = effectiveScope();
                const data = await exportLibraryZip({
                    library,
                    charId: scope.charId ?? GLOBAL_CHAR_ID,
                    charName: scope.mode === "character" ? state.charName || "未命名" : "全局",
                    // 当前范围的「按角色」配色一起导出，否则包里 colors 永远是空的
                    colors: { ...state.avatarColors },
                    onProgress: (done, total) => {
                        state.progress = { done, total };
                    },
                });
                state.lastResult = `已导出 ${(data.length / 1024 / 1024).toFixed(1)} MB`;
                return data;
            } finally {
                state.busy = false;
                state.progress = null;
            }
        },
        async listDbScopes() {
            // 统计的是原版 DB，与当前后端无关
            const legacy = createIndexedDbAvatarLibrary({ mode: "global", charId: null });
            try {
                return await legacy.listScopes();
            } catch (error) {
                console.warn("[BubbleDialogue] list DB scopes failed.", error);
                return [];
            }
        },
        async convertScope(charId) {
            const store = context.host.api.extension?.store as TauriTavernExtensionStoreApi | undefined;
            if (!store) {
                throw new Error("宿主不支持原生扩展存储，无法转换");
            }
            const scope: AvatarScope =
                charId === GLOBAL_CHAR_ID
                    ? { mode: "global", charId: null }
                    : { mode: "character", charId };
            // primaryOnly：只搬这个范围自己的数据，绝不把全局记录混进角色卡
            const source = createIndexedDbAvatarLibrary(scope, { primaryOnly: true });
            const target = createNativeAvatarLibrary(store, scope);
            const report = await migrateLibrary({
                source,
                target,
                scope,
                configKeys: charId === GLOBAL_CHAR_ID ? undefined : [],
                onProgress: (done, total) => {
                    state.progress = { done, total };
                },
            });
            // 转换写入的是「被转换的那个范围」，可能不是当前显示的范围，
            // 因此失效该范围自己的缓存，而不是当前范围。
            invalidateStatsCache(charId);
            invalidateMoodRecords(charId);
            invalidateCgGroups(charId);
            if (state.backend === "native") {
                await rebuild();
            }
            // 数据变了，但不自动重扫：全库统计只由启用时和用户手动刷新触发
            state.totalStatsStale = true;
            console.info(
                `[BubbleDialogue] 转换范围 ${charId}：头像 ${report.avatars}、差分 ${report.moodAvatars}、跳过 ${report.skipped}、失败 ${report.failed}`,
            );
            return report;
        },
        async removeDbScope(charId) {
            const legacy = createIndexedDbAvatarLibrary({ mode: "global", charId: null });
            await legacy.clearScope(charId);
            resolver.clearCache();
        },
        async convertAllAndRemove() {
            const scopes = await this.listDbScopes();
            let converted = 0;
            let failed = 0;
            for (const scope of scopes) {
                try {
                    await this.convertScope(scope.charId);
                    // 转换成功才删源，失败就留着，避免数据丢失
                    await this.removeDbScope(scope.charId);
                    converted += 1;
                } catch (error) {
                    console.warn(`[BubbleDialogue] convert scope ${scope.charId} failed.`, error);
                    failed += 1;
                }
            }
            // 一键转换会改写所有范围，缓存全部失效
            invalidateAllStats();
            invalidateAllMoodRecords();
            invalidateAllCgGroups();
            await rebuild();
            state.totalStatsStale = true;
            return { scopes: scopes.length, converted, failed };
        },
        async refreshTotalStats() {
            await forceTotalStats();
        },
        async removeNativeScope(charId) {
            const store = context.host.api.extension?.store as TauriTavernExtensionStoreApi | undefined;
            if (!store) {
                throw new Error("宿主不支持原生扩展存储，无法删除");
            }
            const scope: AvatarScope =
                charId === GLOBAL_CHAR_ID ? GLOBAL_SCOPE : { mode: "character", charId };
            await createNativeAvatarLibrary(store, scope).clearScope(charId);
            // 只有被删的那个范围变了：按范围失效缓存，其它范围的统计继续复用
            invalidateStatsCache(charId);
            invalidateMoodRecords(charId);
            invalidateCgGroups(charId);
            resolver.clearCache();
            if (state.backend === "native") {
                await rebuild();
            }
            hydrator.refresh();
            hydrator.hydrateAll();
            // 明细里该范围立即归零，避免用户对空范围再点一次删除
            const index = state.nativeScopes.findIndex((row) => row.charId === charId);
            if (index >= 0) {
                state.nativeScopes = state.nativeScopes.map((row, i) =>
                    i === index ? { charId: row.charId, avatars: 0, moodAvatars: 0, cgImages: 0, bytes: 0 } : row,
                );
            }
            // 与导入/转换一致：不自动重扫全库统计，标成过期交给「刷新统计」
            state.totalStatsStale = true;
        },
        async refreshScopeStats() {
            await refreshAvatarStats({ force: true });
        },
        async importZip(data) {
            invalidateMoodRecords();
            state.busy = true;
            state.progress = { done: 0, total: 0 };
            try {
                const report = await importLibraryZip(
                    library,
                    data,
                    (done, total) => {
                        state.progress = { done, total };
                    },
                    // 配色写进**当前范围**（全局范围就用 _global_）
                    effectiveScope().charId,
                );
                state.lastResult = `导入完成：头像 ${report.avatars}、差分 ${report.moodAvatars}、配色 ${report.colors}，跳过 ${report.skipped}`;
                console.info(
                    `[BubbleDialogue] 导入 ZIP：头像 ${report.avatars}、差分 ${report.moodAvatars}、配色 ${report.colors}、跳过 ${report.skipped}`,
                );
                invalidateStatsCache();
                invalidateCgGroups();
                await refreshAvatarStats();   // 内部会重新预取配色
                // 同上：不自动重扫全库统计，只标记过期
                state.totalStatsStale = true;
                resolver.clearCache();
                hydrator.refresh();
                hydrator.hydrateAll();
                return report;
            } finally {
                state.busy = false;
                state.progress = null;
            }
        },
    };
}

/**
 * 四个页面共用同一份运行时。
 * 用 WeakMap 以 context 为键，避免页面重挂载时拿到旧 context 的实例。
 */
const runtimes = new WeakMap<CreatorRuntimeContext, BubbleRuntime>();

export function getBubbleRuntime(context: CreatorRuntimeContext): BubbleRuntime {
    let runtime = runtimes.get(context);
    if (!runtime) {
        runtime = createBubbleRuntime(context);
        runtimes.set(context, runtime);
    }
    return runtime;
}

export { NO_CHARACTER_SENTINEL };
