import { createNativeAvatarLibrary } from "../src/features/bubble-render/native-avatar-library";
import { createAvatarResolver } from "../src/features/bubble-render/avatar-resolver";
import { mapWithConcurrency } from "../src/features/bubble-render/async-utils";
import type { TauriTavernExtensionStoreApi } from "../src/host/api";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const blob = (tag: string) => new Blob([tag], { type: "image/webp" });

// 内存 store：带一点延迟，模拟 IPC，并暴露读取次数
function makeStore(delayMs = 0) {
    const kv = new Map<string, unknown>();
    const blobs = new Map<string, Uint8Array>();
    const p = (ns: string, t: string, k: string) => `${ns}/${t}/${k}`;
    let reads = 0;
    const api = {
        async getJson({ namespace, table = "main", key }: any) { return kv.get(p(namespace, table, key)) ?? null; },
        async tryGetJson({ namespace, table = "main", key }: any) {
            reads += 1;
            if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
            const k = p(namespace, table, key);
            return kv.has(k) ? { found: true, value: kv.get(k) } : { found: false };
        },
        async setJson({ namespace, table = "main", key, value }: any) { kv.set(p(namespace, table, key), value); },
        async updateJson() {}, async renameKey() {}, async deleteJson({ namespace, table = "main", key }: any) { kv.delete(p(namespace, table, key)); },
        async listKeys({ namespace, table = "main" }: any) {
            return [...kv.keys()].filter((k) => k.startsWith(`${namespace}/${table}/`)).map((k) => k.split("/").pop()!);
        },
        async listTables() { return []; },
        async deleteTable({ namespace, table }: any) { for (const k of [...kv.keys()]) if (k.startsWith(`${namespace}/${table}/`)) kv.delete(k); for (const k of [...blobs.keys()]) if (k.startsWith(`${namespace}/${table}/`)) blobs.delete(k); },
        async setBlob({ namespace, table = "main", key, data }: any) { blobs.set(p(namespace, table, key), new Uint8Array(await data.arrayBuffer())); },
        async getBlob({ namespace, table = "main", key }: any) { const b = blobs.get(p(namespace, table, key)); if (!b) throw new Error("nf"); return new Blob([b.slice().buffer], { type: "image/webp" }); },
        async deleteBlob() {}, async listBlobKeys() { return []; },
    } as unknown as TauriTavernExtensionStoreApi;
    return { api, get readCount() { return reads; } };
}

const shared = makeStore();
const global = createNativeAvatarLibrary(shared.api, { mode: "global", charId: null });
const char = createNativeAvatarLibrary(shared.api, { mode: "character", charId: "2017" });

// 全局：2 头像 + 3 差分；角色卡：1 头像 + 0 差分
await global.putAvatar("全局甲", blob("g1"));
await global.putAvatar("全局乙", blob("g2"));
for (const mood of ["mood-joy__outfit-casual__act-sfw", "mood-anger__outfit-casual__act-sfw", "mood-sad__outfit-casual__act-sfw"]) {
    await global.putMoodAvatar("全局甲", mood, blob("gm"));
}
await char.putAvatar("卡片头像", blob("c1"));

// ---- 1) 列表只显示当前范围 ----
const charNames = await char.listAvatarNames();
check("char list shows only its own avatar", charNames.length === 1 && charNames[0] === "卡片头像", JSON.stringify(charNames));
const globalNames = await global.listAvatarNames();
check("global list shows only global", globalNames.length === 2, JSON.stringify(globalNames));

// ---- 2) 统计只算当前范围（这就是「角色卡范围却显示全局数字」的根因）----
const charStats = await char.getScopeStats();
check("char stats exclude global avatars", charStats.avatars === 1, JSON.stringify(charStats));
check("char stats exclude global moods", charStats.moodAvatars === 0, JSON.stringify(charStats));
const globalStats = await global.getScopeStats();
check("global stats own counts", globalStats.avatars === 2 && globalStats.moodAvatars === 3, JSON.stringify(globalStats));

// ---- 2b) 差分列表：展示用主范围，水合用回退链 ----
const charPrimary = await char.listMoodAvatarsPrimary();
check("primary mood list excludes global", charPrimary.length === 0, String(charPrimary.length));
const charChain = await char.listMoodAvatars();
check("chain mood list includes global (for hydration)", charChain.length === 3, String(charChain.length));

// ---- 3) 水合必须全局 + 角色一起用 ----
const resolver = createAvatarResolver(char as any);
const charMain = await resolver.resolve({ name: "卡片头像", mood: "", outfit: null, act: null, seed: "s1" });
check("hydration can read own avatar", charMain !== null);
const globalViaChar = await resolver.resolve({ name: "全局甲", mood: "mood-joy", outfit: "outfit-casual", act: "act-sfw", seed: "s2" });
check("hydration falls back to global mood", globalViaChar !== null, String(globalViaChar));
const globalMainViaChar = await resolver.resolve({ name: "全局乙", mood: "", outfit: null, act: null, seed: "s3" });
check("hydration falls back to global avatar", globalMainViaChar !== null, String(globalMainViaChar));

// ---- 4) 并发读取确实并行（防止退回串行 IPC）----
const items = Array.from({ length: 32 }, (_, i) => i);
const t0 = Date.now();
await mapWithConcurrency(items, 16, async () => { await new Promise((r) => setTimeout(r, 10)); return 1; });
const elapsed = Date.now() - t0;
check("bounded concurrency runs in parallel", elapsed < 80, `${elapsed}ms (serial would be ~320ms)`);

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
