import { createNativeAvatarLibrary } from "../src/features/bubble-render/native-avatar-library";
import { encodeStoreKey } from "../src/features/bubble-render/store-key";
import type { TauriTavernExtensionStoreApi } from "../src/host/api";

// 内存版 extension.store，模拟宿主并暴露落盘路径，验证隔离与编码
const kv = new Map<string, unknown>();
const blobs = new Map<string, Uint8Array>();
const paths: string[] = [];
const path = (ns: string, table: string, key: string) => {
    const p = `${ns}/${table}/${key}`;
    paths.push(p);
    return p;
};
const store = {
    async getJson({ namespace, table = "main", key }: any) { return kv.get(path(namespace, table, key)) ?? null; },
    async tryGetJson({ namespace, table = "main", key }: any) {
        const k = path(namespace, table, key);
        return kv.has(k) ? { found: true, value: kv.get(k) } : { found: false };
    },
    async setJson({ namespace, table = "main", key, value }: any) { kv.set(path(namespace, table, key), value); },
    async updateJson() {}, async renameKey() {}, async deleteJson() {},
    async listKeys({ namespace, table = "main" }: any) {
        return [...kv.keys()].filter(k => k.startsWith(`${namespace}/${table}/`)).map(k => k.split("/").pop()!).filter(Boolean);
    },
    async listTables() { return []; },
    async deleteTable({ namespace, table }: any) {
        // 真删：清掉该 namespace/table 下的 kv 与 blobs
        for (const k of [...kv.keys()]) if (k.startsWith(`${namespace}/${table}/`)) kv.delete(k);
        for (const k of [...blobs.keys()]) if (k.startsWith(`${namespace}/${table}/`)) blobs.delete(k);
    },
    async setBlob({ namespace, table = "main", key, data }: any) {
        blobs.set(path(namespace, table, key), new Uint8Array(await data.arrayBuffer()));
    },
    async getBlob({ namespace, table = "main", key }: any) {
        const p = path(namespace, table, key);
        const b = blobs.get(p);
        if (!b) throw new Error("not found: " + p);
        return new Blob([b.slice().buffer], { type: "image/webp" });
    },
    async deleteBlob({ namespace, table = "main", key }: any) { blobs.delete(path(namespace, table, key)); },
    async listBlobKeys() { return []; },
} as unknown as TauriTavernExtensionStoreApi;

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };
const blob = (tag: string) => new Blob([tag], { type: "image/webp" });

// 全局库
const globalLib = createNativeAvatarLibrary(store, { mode: "global", charId: null });
await globalLib.putAvatar("林知意", blob("GLOBAL-林知意"));
await globalLib.putMoodAvatar("林知意", "mood-joy__outfit-casual__act-sfw", blob("GLOBAL-mood"));

// 角色卡库（charId 用中文/数字混排，验证编码）
const charLib = createNativeAvatarLibrary(store, { mode: "character", charId: "银麒赎世" });
await charLib.putAvatar("林知意", blob("CHAR-林知意"));

// 1. 角色卡模式优先读本卡
const fromChar = await charLib.getAvatar("林知意");
check("character mode prefers own card", (await new Response(fromChar!.imageBlob).text()) === "CHAR-林知意");

// 2. 本卡没有的情绪 -> 回退全局
const moodFallback = await charLib.getMoodAvatar("林知意", "mood-joy__outfit-casual__act-sfw");
check("falls back to global for missing mood", (await new Response(moodFallback!.imageBlob).text()) === "GLOBAL-mood");

// 3. 全局库不受角色卡写入影响
const fromGlobal = await globalLib.getAvatar("林知意");
check("global untouched by char write", (await new Response(fromGlobal!.imageBlob).text()) === "GLOBAL-林知意");

// 4. 关键：所有落盘路径必须合法（宿主校验字符集）
const SAFE = /^[A-Za-z0-9_.-]+$/;
const bad = paths.filter(p => p.split("/").some(seg => !SAFE.test(seg)));
check("all store paths host-legal", bad.length === 0, bad.slice(0, 3).join(" | "));
console.log("     sample kv path:", [...new Set(paths)].find(p => p.includes("avatars")) ?? "(none)");
console.log("     blob keys:", [...blobs.keys()].slice(0,3));

// 5. 中文角色名与中文 charId 都能正确往返
const cn = await charLib.getAvatar("林知意");
check("chinese name round-trips", !!cn);
console.log("     encoded charId namespace:", encodeStoreKey(["bubble", "char", "银麒赎世"]));

// 6. 清空只影响本卡
await charLib.clear();
const afterClear = await charLib.getAvatar("林知意");
check("own-card record removed (now resolves to global)",
    afterClear ? (await new Response(afterClear.imageBlob).text()) === "GLOBAL-林知意" : false,
    afterClear ? await new Response(afterClear.imageBlob).text() : "null");
check("global survives char clear", !!(await globalLib.getAvatar("林知意"))?.imageBlob);

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
