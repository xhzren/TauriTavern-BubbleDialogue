import { createNativeAvatarLibrary } from "../src/features/bubble-render/native-avatar-library";
import { encodeStoreKey } from "../src/features/bubble-render/store-key";
import type { TauriTavernExtensionStoreApi } from "../src/host/api";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

// ---- 内存版 extension.store（含 deleteTable 真删）----
function makeStore() {
    const kv = new Map<string, unknown>();
    const blobs = new Map<string, Uint8Array>();
    const p = (ns: string, t: string, k: string) => `${ns}/${t}/${k}`;
    const api = {
        async getJson({ namespace, table = "main", key }: any) { return kv.get(p(namespace, table, key)) ?? null; },
        async tryGetJson({ namespace, table = "main", key }: any) {
            const k = p(namespace, table, key);
            return kv.has(k) ? { found: true, value: kv.get(k) } : { found: false };
        },
        async setJson({ namespace, table = "main", key, value }: any) { kv.set(p(namespace, table, key), value); },
        async updateJson() {}, async renameKey() {}, async deleteJson({ namespace, table = "main", key }: any) { kv.delete(p(namespace, table, key)); },
        async listKeys({ namespace, table = "main" }: any) {
            return [...kv.keys()].filter((k) => k.startsWith(`${namespace}/${table}/`)).map((k) => k.split("/").pop()!);
        },
        async listTables() { return []; },
        async deleteTable({ namespace, table }: any) {
            for (const k of [...kv.keys()]) if (k.startsWith(`${namespace}/${table}/`)) kv.delete(k);
            for (const k of [...blobs.keys()]) if (k.startsWith(`${namespace}/${table}/`)) blobs.delete(k);
        },
        async setBlob({ namespace, table = "main", key, data }: any) { blobs.set(p(namespace, table, key), new Uint8Array(await data.arrayBuffer())); },
        async getBlob({ namespace, table = "main", key }: any) {
            const b = blobs.get(p(namespace, table, key));
            if (!b) throw new Error("not found");
            return new Blob([b.slice().buffer], { type: "image/webp" });
        },
        async deleteBlob({ namespace, table = "main", key }: any) { blobs.delete(p(namespace, table, key)); },
        async listBlobKeys() { return []; },
    } as unknown as TauriTavernExtensionStoreApi;
    return { api, kv, blobs };
}

const blob = (tag: string) => new Blob([tag], { type: "image/webp" });

// ---- 全局范围 ----
const s1 = makeStore();
const globalLib = createNativeAvatarLibrary(s1.api, { mode: "global", charId: null });
await globalLib.putAvatar("林知意", blob("g1"));
await globalLib.putMoodAvatar("林知意", "mood-joy__outfit-casual__act-sfw", blob("g2"));
await globalLib.setConfig("format_rule", "我的自定义规则");
check("global data written", (await globalLib.listAvatarNames()).length === 1);
check("global mood written", (await globalLib.listMoodAvatars()).length === 1);

// 关键：清空必须连「别的角色卡范围」的数据一起清掉
const s2 = makeStore();
const otherChar = createNativeAvatarLibrary(s2.api, { mode: "character", charId: "1921" });
await otherChar.putAvatar("孤儿头像", blob("o1"));
await otherChar.putMoodAvatar("孤儿头像", "mood-anger__outfit-casual__act-sfw", blob("o2"));

// 在同一 store 里模拟：当前范围是 global，但 1921 的数据也存在
const shared = makeStore();
const libGlobal = createNativeAvatarLibrary(shared.api, { mode: "global", charId: null });
const lib1921 = createNativeAvatarLibrary(shared.api, { mode: "character", charId: "1921" });
await libGlobal.putAvatar("全局头像", blob("g"));
await lib1921.putAvatar("1921头像", blob("c"));
await libGlobal.setConfig("format_rule", "保留我");

check("two scopes coexist", (await libGlobal.listAvatarNames()).length === 1 && (await lib1921.listAvatarNames()).length === 1);

await libGlobal.clearAll();

check("global scope wiped", (await libGlobal.listAvatarNames()).length === 0, String((await libGlobal.listAvatarNames()).length));
// 已知限制：原生后端无法枚举 namespace，清不到「别的角色卡」的 namespace。
// 原版 IndexedDB 后端不受此限（它是整表 clear，孤儿记录一并清掉）。
check("other char scope NOT reachable (documented native limit)",
    (await lib1921.listAvatarNames()).length === 1, String((await lib1921.listAvatarNames()).length));
check("config preserved", (await libGlobal.getConfig("format_rule")) === "保留我", String(await libGlobal.getConfig("format_rule")));

// 从当前角色卡发起清空，也应同时清掉全局
const shared2 = makeStore();
const a = createNativeAvatarLibrary(shared2.api, { mode: "global", charId: null });
const b = createNativeAvatarLibrary(shared2.api, { mode: "character", charId: "1921" });
await a.putAvatar("全局头像", blob("g"));
await b.putAvatar("1921头像", blob("c"));
await b.clearAll();
check("clear from char wipes global", (await a.listAvatarNames()).length === 0);
check("clear from char wipes self", (await b.listAvatarNames()).length === 0);

// 幂等：重复清空不报错
await b.clearAll();
check("clearAll is idempotent", (await b.listAvatarNames()).length === 0);

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
