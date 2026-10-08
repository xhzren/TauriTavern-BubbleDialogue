import { createAvatarResolver } from "../src/features/bubble-render/avatar-resolver";
import { DEFAULT_MOOD_WORD_GROUPS } from "../src/features/bubble-render/constants";
import type { AvatarRecord } from "../src/features/bubble-render/avatar-repository";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

(globalThis as any).URL.createObjectURL = (b: any) => "blob:" + b.tag;
(globalThis as any).URL.revokeObjectURL = () => {};

const NAME = "林知意";
const MOOD_IDS = ["mood-joy", "mood-anger", "mood-sad", "mood-anxious", "mood-calm", "mood-shy", "mood-disgust", "mood-love"];

/**
 * 造「原生后端形态」的数据：listMoodAvatars() 返回的元数据**不含 imageBlob**
 * （native-avatar-library 故意不预取二进制，避免 1841 条一起拉爆内存）。
 * 这正是之前出 bug 的形态。
 */
function nativeShapeRows(): AvatarRecord[] {
    const rows: AvatarRecord[] = [];
    for (const moodId of MOOD_IDS) {
        for (const outfit of ["outfit-casual", "outfit-sleep", "outfit-naked"]) {
            for (const act of ["act-sfw", "act-vaginal"]) {
                rows.push({ alias: NAME, name: NAME, moodId: `${moodId}__${outfit}__${act}`, mimeType: "image/webp" } as AvatarRecord);
            }
        }
    }
    return rows;
}

function makeRepo(rows: AvatarRecord[], log: string[]) {
    return {
        async getAvatar(n: string) { return n === NAME ? { alias: NAME, imageBlob: { tag: "MAIN" } } : null; },
        async getMoodAvatar(name: string, moodId: string) {
            log.push(`${name}|${moodId}`);
            return { alias: name, moodId, imageBlob: { tag: moodId } };
        },
        async listMoodAvatars() { return rows; },
        async getConfig() { return null; },
        async isReady() { return true; },
    } as any;
}

// ============================================================
// 1) 原生形态：不同情绪必须拿到不同图（曾全部掉到主头像）
// ============================================================
{
    const log: string[] = [];
    const resolver = createAvatarResolver(makeRepo(nativeShapeRows(), log), {
        getMoodGroups: () => DEFAULT_MOOD_WORD_GROUPS,
    });

    const moods = ["喜悦", "害羞", "平和", "爱恋", "紧张"];
    const got: string[] = [];
    for (const mood of moods) {
        got.push(String(await resolver.resolve({ name: NAME, mood, outfit: "outfit-sleep", act: "act-sfw", seed: NAME + "|" + mood + "|不同文字" + mood })));
    }
    console.log("   " + moods.map((m, i) => m + "→" + got[i].replace("blob:", "")).join("  "));

    check("no mood falls back to main avatar", got.every((u) => u !== "blob:MAIN"), got.join(","));
    check("each mood gets its own image", new Set(got).size === moods.length, String(new Set(got).size));
    check("喜悦 -> mood-joy", got[0] === "blob:mood-joy__outfit-sleep__act-sfw", got[0]);
    check("害羞 -> mood-shy", got[1] === "blob:mood-shy__outfit-sleep__act-sfw", got[1]);
    check("平和 -> mood-calm", got[2] === "blob:mood-calm__outfit-sleep__act-sfw", got[2]);
    check("on-demand fetch happened", log.length >= moods.length, String(log.length));
    check("fetch uses stored alias (not normalized)", log.every((l) => l.startsWith(NAME + "|")), log[0] ?? "");

    // 缓存：同一个气泡再解析一次不该重新回查
    const before = log.length;
    await resolver.resolve({ name: NAME, mood: "喜悦", outfit: "outfit-sleep", act: "act-sfw", seed: NAME + "|喜悦|不同文字喜悦" });
    check("repeat resolve hits url cache", log.length === before, `${before} -> ${log.length}`);

    // 表外情绪词仍然兜底到主头像
    const unknown = await resolver.resolve({ name: NAME, mood: "喵喵喵", outfit: "outfit-sleep", act: "act-sfw", seed: "x" });
    check("unknown mood -> main avatar", unknown === "blob:MAIN", String(unknown));
}

// ============================================================
// 2) IDB 形态：列表自带二进制，不应触发回查（原路径不能退化）
// ============================================================
{
    const log: string[] = [];
    const rows = nativeShapeRows().map((r) => ({ ...r, imageBlob: { tag: r.moodId } }));
    const resolver = createAvatarResolver(makeRepo(rows, log), { getMoodGroups: () => DEFAULT_MOOD_WORD_GROUPS });

    const url = await resolver.resolve({ name: NAME, mood: "喜悦", outfit: "outfit-sleep", act: "act-sfw", seed: "s1" });
    check("IDB shape resolves directly", url === "blob:mood-joy__outfit-sleep__act-sfw", String(url));
    check("IDB shape does no extra fetch", log.length === 0, String(log.length));
}

// ============================================================
// 3) 大小写：回查要用记录里存的名字，不能用归一化后的名字
// ============================================================
{
    const log: string[] = [];
    const rows: AvatarRecord[] = [
        { alias: "Noah", name: "Noah", moodId: "mood-joy__outfit-casual__act-sfw", mimeType: "image/webp" } as AvatarRecord,
    ];
    const repo: any = {
        async getAvatar() { return null; },
        async getMoodAvatar(name: string, moodId: string) {
            log.push(name);
            return { alias: name, moodId, imageBlob: { tag: "noah-joy" } };
        },
        async listMoodAvatars() { return rows; },
        async getConfig() { return null; },
        async isReady() { return true; },
    };
    const resolver = createAvatarResolver(repo, { getMoodGroups: () => DEFAULT_MOOD_WORD_GROUPS });
    const url = await resolver.resolve({ name: "noah", mood: "喜悦", outfit: "outfit-casual", act: "act-sfw", seed: "s3" });
    check("lowercase lookup still resolves", url === "blob:noah-joy", String(url));
    check("fetch used stored casing", log[0] === "Noah", String(log[0]));
}

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
