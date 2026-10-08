import { createAvatarResolver } from "../src/features/bubble-render/avatar-resolver";
import { extractDisplayName, buildAvatarKey, belongsToScope } from "../src/features/bubble-render/key-format";
import type { AvatarRepository, AvatarRecord } from "../src/features/bubble-render/avatar-repository";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

(globalThis as any).URL.createObjectURL = (b: any) => "blob:" + b.tag;
(globalThis as any).URL.revokeObjectURL = () => {};

// ---------- 真实数据形态（与原脚本 addMoodAvatar 一致）----------
// alias = 纯名字；moodId = 情绪__服装__动作；charId 单独字段
function moodRec(name: string, moodId: string, tag: string): AvatarRecord {
    return { alias: name, moodId, charId: "_global_", imageBlob: { tag } as any, mimeType: "image/webp" };
}
function mainRec(name: string, tag: string): AvatarRecord {
    return { alias: `_global___${name}`, imageBlob: { tag } as any, mimeType: "image/webp" };
}

const moodRows: AvatarRecord[] = [
    moodRec("林知意", "mood-love__outfit-casual__act-sfw", "L1-exact"),
    moodRec("林知意", "mood-love__outfit-naked__act-vaginal", "L1-nsfw"),
    moodRec("林知意", "mood-joy__outfit-casual__act-sfw", "joy"),
];
const repo: AvatarRepository = {
    async getAvatar(name) { return name === "林知意" ? mainRec("林知意", "L5-main") : null; },
    async getMoodAvatar() { return null; },
    async listMoodAvatars() { return moodRows; },
    async getConfig() { return null; },
    async isReady() { return true; },
};

const resolver = createAvatarResolver(repo);
const base = { name: "林知意", outfit: "outfit-casual", act: "act-sfw", seed: "s1" };

// 关键回归：情绪差分必须命中（此前索引键拼错，永远 miss）
const hit = await resolver.resolve({ ...base, mood: "心动" });
check("mood diff resolves (was broken)", hit === "blob:L1-exact", String(hit));

const nsfw = await resolver.resolve({ name: "林知意", mood: "心动", outfit: "outfit-naked", act: "act-vaginal", seed: "s2" });
check("exact nsfw variant resolves", nsfw === "blob:L1-nsfw", String(nsfw));

// 丢动作 -> L2（同 mood + 同 outfit）
const noAct = await resolver.resolve({ name: "林知意", mood: "心动", outfit: "outfit-naked", act: "act-oral", seed: "s3" });
check("falls back to same outfit", noAct === "blob:L1-nsfw", String(noAct));

// 只有情绪 -> L4
const moodOnly = await resolver.resolve({ name: "林知意", mood: "喜悦", outfit: null, act: null, seed: "s4" });
check("mood-only matches any outfit", moodOnly === "blob:joy", String(moodOnly));

// 完全未知情绪 -> L5 主头像
const unknown = await resolver.resolve({ name: "林知意", mood: "喵喵喵", outfit: null, act: null, seed: "s5" });
check("unknown mood -> main avatar", unknown === "blob:L5-main", String(unknown));

// 缓存
check("cached after resolve", resolver.resolveCached({ ...base, mood: "心动" }) === "blob:L1-exact");
resolver.clearCache();
check("cache cleared", resolver.resolveCached({ ...base, mood: "心动" }) === null);

// ---------- key-format 回归（“1921” 显示 bug）----------
check("global key -> name", extractDisplayName("_global___林知意") === "林知意", extractDisplayName("_global___林知意"));
check("numeric charId key -> name (was returning 1921)", extractDisplayName("1921__林知意") === "林知意",
    extractDisplayName("1921__林知意"));
check("numeric charId with explicit scope", extractDisplayName("1921__林知意", "1921") === "林知意");
check("mood lookupKey -> name", extractDisplayName("_global___林知意__mood-joy__outfit-casual__act-sfw") === "林知意",
    extractDisplayName("_global___林知意__mood-joy__outfit-casual__act-sfw"));
check("name containing dots survives", extractDisplayName("_global___撒勒·省魔态") === "撒勒·省魔态");
check("bare name passthrough", extractDisplayName("林知意") === "林知意");

check("buildAvatarKey global", buildAvatarKey(null, "林知意") === "_global___林知意");
check("buildAvatarKey char", buildAvatarKey("1921", "林知意") === "1921__林知意");
check("buildAvatarKey lowercases", buildAvatarKey(null, "Noah") === "_global___noah");

check("scope match global", belongsToScope("_global___林知意", null));
check("scope rejects other char", !belongsToScope("1921__林知意", null));
check("scope match char", belongsToScope("1921__林知意", "1921"));

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
