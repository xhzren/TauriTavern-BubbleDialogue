import { createAvatarResolver } from "../src/features/bubble-render/avatar-resolver";
import { DEFAULT_MOOD_WORD_GROUPS } from "../src/features/bubble-render/constants";
import type { AvatarRecord } from "../src/features/bubble-render/avatar-repository";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

(globalThis as any).URL.createObjectURL = (b: any) => "blob:" + b.tag;
(globalThis as any).URL.revokeObjectURL = () => {};

const NAME = "林知意";
const MOOD_IDS = ["mood-joy", "mood-shy", "mood-calm", "mood-love", "mood-anxious", "mood-anger"];

/** 原生后端形态：列表不带二进制（要按需回查） */
function rows(): AvatarRecord[] {
    const out: AvatarRecord[] = [];
    for (const moodId of MOOD_IDS) {
        out.push({ alias: NAME, name: NAME, moodId: `${moodId}__outfit-sleep__act-sfw`, mimeType: "image/webp" } as AvatarRecord);
    }
    return out;
}

function makeRepo(delayMs: number) {
    const log: string[] = [];
    return {
        log,
        repo: {
            async getAvatar(n: string) { return n === NAME ? { alias: NAME, imageBlob: { tag: "MAIN" } } : null; },
            async getMoodAvatar(name: string, moodId: string) {
                log.push(moodId);
                return { alias: name, moodId, imageBlob: { tag: moodId } };
            },
            async listMoodAvatars() {
                // 真实后端读 1841 条元数据要花时间——这个窗口就是竞态发生的地方
                await new Promise((r) => setTimeout(r, delayMs));
                return rows();
            },
            async getConfig() { return null; },
            async isReady() { return true; },
        } as any,
    };
}

// ============================================================
// 1) 并发解析（hydrator 的真实行为）必须每个气泡都拿到自己的差分
//    曾用 indexLoaded 布尔量提前 return，除第一个外全部拿到空索引 → 主头像
// ============================================================
{
    const { repo, log } = makeRepo(60);
    const resolver = createAvatarResolver(repo, { getMoodGroups: () => DEFAULT_MOOD_WORD_GROUPS });

    const moods = ["喜悦", "害羞", "平和", "爱恋", "紧张", "得意"];
    // 关键：同一 tick 全部发起（不要 for-await 串行）
    const urls = await Promise.all(
        moods.map((m) => resolver.resolve({ name: NAME, mood: m, outfit: "outfit-sleep", act: "act-sfw", seed: NAME + "|" + m + "|文字" + m })),
    );

    console.log("   " + moods.map((m, i) => m + "→" + String(urls[i]).replace("blob:", "").split("__")[0]).join("  "));
    check("no concurrent resolve falls back to main", urls.every((u) => u !== "blob:MAIN"), urls.join(","));
    // 得意 是 喜悦(mood-joy) 的同义词 → 6 个词只对应 5 个情绪组
    check("distinct images == distinct mood groups", new Set(urls).size === 5, String(new Set(urls).size));
    check("喜悦 -> mood-joy", urls[0] === "blob:mood-joy__outfit-sleep__act-sfw", String(urls[0]));
    check("害羞 -> mood-shy", urls[1] === "blob:mood-shy__outfit-sleep__act-sfw", String(urls[1]));
    check("listMoodAvatars called once", log.length >= moods.length, String(log.length));
}

// ============================================================
// 2) 并发 + 索引尚未建好时，必须等同一个 promise，而不是用空索引
// ============================================================
{
    const { repo } = makeRepo(80);
    const resolver = createAvatarResolver(repo, { getMoodGroups: () => DEFAULT_MOOD_WORD_GROUPS });
    const results = await Promise.all([
        resolver.resolve({ name: NAME, mood: "喜悦", outfit: "outfit-sleep", act: "act-sfw", seed: "a" }),
        resolver.resolve({ name: NAME, mood: "爱恋", outfit: "outfit-sleep", act: "act-sfw", seed: "b" }),
    ]);
    check("two concurrent resolves both hit variants",
        results[0] === "blob:mood-joy__outfit-sleep__act-sfw" && results[1] === "blob:mood-love__outfit-sleep__act-sfw",
        results.join(","));
}

// ============================================================
// 3) 传入共用解析器时以它为准（保证颜色与头像落到同一个组）
// ============================================================
{
    const { repo } = makeRepo(0);
    const resolver = createAvatarResolver(repo, {
        getMoodGroups: () => DEFAULT_MOOD_WORD_GROUPS,
        // 模拟「与上色共用」的解析器：这里把 得意 特意指到 mood-calm
        resolveMoodId: (text) => (text === "得意" ? "mood-calm" : text),
    });
    const url = await resolver.resolve({ name: NAME, mood: "得意", outfit: "outfit-sleep", act: "act-sfw", seed: "s" });
    check("custom resolveMoodId is authoritative", url === "blob:mood-calm__outfit-sleep__act-sfw", String(url));
}

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
