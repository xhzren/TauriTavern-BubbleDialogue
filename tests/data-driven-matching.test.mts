import { createAvatarResolver } from "../src/features/bubble-render/avatar-resolver";
import type { AvatarRepository, AvatarRecord } from "../src/features/bubble-render/avatar-repository";
import type { MoodWordGroup } from "../src/features/bubble-render/constants";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

(globalThis as any).URL.createObjectURL = (b: any) => "blob:" + b.tag;
(globalThis as any).URL.revokeObjectURL = () => {};

const NAME = "测试角色";

function moodRec(moodId: string, tag: string): AvatarRecord {
    return { alias: NAME, moodId, charId: "_global_", imageBlob: { tag } as any, mimeType: "image/webp" };
}
function mainRec(tag: string): AvatarRecord {
    return { alias: `_global___${NAME}`, imageBlob: { tag } as any, mimeType: "image/webp" };
}

/**
 * 「导入的数据」：故意包含内置表里没有的情绪 id / 服装 / 动作标签。
 * 扩展必须按这些实际标签匹配，而不是按写死的白名单。
 */
const moodRows: AvatarRecord[] = [
    moodRec("mood-happy__outfit-casual__act-sfw", "happy-casual"),   // 自定义情绪 id
    moodRec("mood-love__outfit-naked__act-kiss", "love-kiss"),       // 自定义动作
    moodRec("mood-love__outfit-naked__act-sfw", "love-sfw"),         // 动作兜底目标
    moodRec("mood-joy__outfit-school__act-sfw", "joy-school"),       // 自定义服装
    moodRec("mood-joy__outfit-casual__act-sfw", "joy-casual"),       // 干扰项
];

const repo: AvatarRepository = {
    async getAvatar(name) { return name === NAME ? mainRec("MAIN") : null; },
    async getMoodAvatar() { return null; },
    async listMoodAvatars() { return moodRows; },
    async getConfig() { return null; },
    async isReady() { return true; },
};

/** 当前生效的词表：注意 mood-happy 是内置默认表里没有的 */
const groups: MoodWordGroup[] = [
    { id: "mood-happy", label: "开心", color: "#f59e0b", words: ["爽", "愉快"] },
    { id: "mood-love", label: "爱恋", color: "#ec4899", words: ["心动"] },
    { id: "mood-joy", label: "喜悦", color: "#f59e0b", words: ["开心"] },
];

const resolver = createAvatarResolver(repo, { getMoodGroups: () => groups });

// ---- 1) 情绪词表必须来自配置，而不是内置默认表 ----
const custom = await resolver.resolve({ name: NAME, mood: "爽", outfit: "outfit-casual", act: "act-sfw", seed: "t1" });
check("custom mood word from config resolves", custom === "blob:happy-casual", String(custom));

// ---- 2) 自定义动作（数据里真实存在）必须走精确匹配 ----
const customAct = await resolver.resolve({ name: NAME, mood: "爱恋", outfit: "outfit-naked", act: "act-kiss", seed: "t2" });
check("custom act in data matches exactly", customAct === "blob:love-kiss", String(customAct));

// ---- 3) 自定义服装（数据里真实存在）必须走精确匹配 ----
const customOutfit = await resolver.resolve({ name: NAME, mood: "喜悦", outfit: "outfit-school", act: "act-sfw", seed: "t3" });
check("custom outfit in data matches exactly", customOutfit === "blob:joy-school", String(customOutfit));

// ---- 4) 安全语义：数据里没有的动作不得猜到 NSFW 差分 ----
const bogusAct = await resolver.resolve({ name: NAME, mood: "爱恋", outfit: "outfit-naked", act: "act-bogus", seed: "t4" });
check("unknown act falls back to act-sfw (no NSFW guessing)", bogusAct === "blob:love-sfw", String(bogusAct));

// ---- 5) 表外情绪词仍然落到主头像（原有行为不变）----
const unknown = await resolver.resolve({ name: NAME, mood: "喵喵喵", outfit: null, act: null, seed: "t5" });
check("unknown mood -> main avatar", unknown === "blob:MAIN", String(unknown));

// ---- 6) 缓存键与解析结果一致 ----
check("cache consistent for custom act",
    resolver.resolveCached({ name: NAME, mood: "爱恋", outfit: "outfit-naked", act: "act-kiss", seed: "t2" }) === "blob:love-kiss");

// ---- 7) 词表变化后（用户改配置 / 换数据）解析跟着变 ----
const swapped = createAvatarResolver(repo, {
    getMoodGroups: () => [{ id: "mood-joy", label: "喜悦", color: "#fff", words: ["爽"] }],
});
const afterSwap = await swapped.resolve({ name: NAME, mood: "爽", outfit: "outfit-school", act: "act-sfw", seed: "t7" });
check("word table change takes effect", afterSwap === "blob:joy-school", String(afterSwap));

// ---- 8) 不传词表时退回内置默认表（不配置也能用）----
const fallback = createAvatarResolver(repo);
const builtin = await fallback.resolve({ name: NAME, mood: "心动", outfit: "outfit-naked", act: "act-sfw", seed: "t8" });
check("no options -> builtin default table still works", builtin === "blob:love-sfw", String(builtin));

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
