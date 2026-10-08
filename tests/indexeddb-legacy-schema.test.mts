/**
 * 回归：老版 BubbleDialogueAvatars（v6 及更早）的 mood_avatars 没有 lookupKey 索引。
 *
 * 现场证据（用户真机）：
 *   - 原版 DB 面板能看到 1841 条情绪差分（listScopes 走 getAll，不需要索引）
 *   - 转换到原生存储后「头像 25、差分 0」
 *     （getMoodAvatar 走 lookupKey 索引，索引不存在 → 每条都查不到）
 * 原脚本在同位置也写了「索引查不到就退化为扫描」的兜底，本扩展此前没有。
 */
import "fake-indexeddb/auto";
import { createIndexedDbAvatarLibrary } from "../src/features/bubble-render/indexeddb-avatar-library";
import { createNativeAvatarLibrary } from "../src/features/bubble-render/native-avatar-library";
import { migrateLibrary } from "../src/features/bubble-render/migration";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const GLOBAL = "_global_";
const SEP = "__";

// 老库 schema：mood_avatars 故意不建 lookupKey 索引
const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("BubbleDialogueAvatars", 6);
    req.onupgradeneeded = () => {
        const d = req.result;
        const avatars = d.createObjectStore("avatars", { keyPath: "alias" });
        avatars.createIndex("createdAt", "createdAt", { unique: false });
        d.createObjectStore("config", { keyPath: "key" });
        const mood = d.createObjectStore("mood_avatars", { keyPath: "id" });
        mood.createIndex("charId", "charId", { unique: false });
        mood.createIndex("alias", "alias", { unique: false });
        mood.createIndex("moodId", "moodId", { unique: false });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
});

check("legacy schema has no lookupKey index",
    !db.transaction("mood_avatars").objectStore("mood_avatars").indexNames.contains("lookupKey"));

await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["avatars", "mood_avatars"], "readwrite");
    tx.objectStore("avatars").put({
        alias: `${GLOBAL}${SEP}老库角色`,
        imageBlob: new Blob(["LEGACY-MAIN"], { type: "image/webp" }),
        mimeType: "image/webp", fileName: "老库角色.webp", fileSize: 11,
        createdAt: 1, updatedAt: 1,
    });
    const lookupKey = `${GLOBAL}${SEP}老库角色${SEP}mood-joy${SEP}outfit-casual${SEP}act-sfw`;
    tx.objectStore("mood_avatars").put({
        id: `${lookupKey}${SEP}img${SEP}legacy`,
        lookupKey, charId: GLOBAL, alias: "老库角色",
        moodId: "mood-joy__outfit-casual__act-sfw",
        imageBlob: new Blob(["LEGACY-MOOD"], { type: "image/webp" }),
        mimeType: "image/webp", fileName: "老库角色-mood.webp", fileSize: 11,
        createdAt: 1, updatedAt: 1,
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
});

const lib = createIndexedDbAvatarLibrary({ mode: "global", charId: null });

// 1) 列表口径：没有索引也要能列出来（走整表）
const listed = await lib.listMoodAvatars();
check("legacy DB: mood listed", listed.length === 1, String(listed.length));

// 2) 取单条：索引未命中时必须退化为整表过滤
const mood = await lib.getMoodAvatar("老库角色", "mood-joy__outfit-casual__act-sfw");
check("legacy DB: mood found without lookupKey index", mood !== null);
check("legacy DB: fallback returns blob", !!(mood && mood.imageBlob));

// 3) 找不到的仍然返回 null（兜底不能变成「什么都算命中」）
check("legacy DB: unknown mood still null",
    (await lib.getMoodAvatar("老库角色", "mood-sad__outfit-casual__act-sfw")) === null);
check("legacy DB: unknown name still null",
    (await lib.getMoodAvatar("查无此人", "mood-joy__outfit-casual__act-sfw")) === null);

// 4) 端到端：就是用户报的那条链路（原版 DB → 原生存储）
const kv = new Map<string, unknown>();
const blobs = new Map<string, Uint8Array>();
const key = (ns: string, t: string, k: string) => `${ns}/${t}/${k}`;
const nativeStore = {
    async getJson({ namespace, table = "main", key: k }: any) { return kv.get(key(namespace, table, k)) ?? null; },
    async tryGetJson({ namespace, table = "main", key: k }: any) {
        const full = key(namespace, table, k);
        return kv.has(full) ? { found: true, value: kv.get(full) } : { found: false };
    },
    async setJson({ namespace, table = "main", key: k, value }: any) { kv.set(key(namespace, table, k), value); },
    async updateJson() {}, async renameKey() {}, async deleteJson() {},
    async listKeys({ namespace, table = "main" }: any) {
        return [...kv.keys()].filter((k) => k.startsWith(`${namespace}/${table}/`)).map((k) => k.split("/").pop()!);
    },
    async listTables() { return []; },
    async deleteTable() {},
    async setBlob({ namespace, table = "main", key: k, data }: any) {
        blobs.set(key(namespace, table, k), new Uint8Array(await data.arrayBuffer()));
    },
    async getBlob({ namespace, table = "main", key: k }: any) {
        const b = blobs.get(key(namespace, table, k));
        if (!b) throw new Error("not found");
        return new Blob([b.slice().buffer], { type: "image/webp" });
    },
    async deleteBlob() {}, async listBlobKeys() { return []; },
} as any;

const scope = { mode: "global" as const, charId: null };
const report = await migrateLibrary({
    source: createIndexedDbAvatarLibrary(scope, { primaryOnly: true }),
    target: createNativeAvatarLibrary(nativeStore, scope),
    scope,
    configKeys: [],
});
check("migration moves avatars", report.avatars === 1, JSON.stringify(report));
check("migration moves mood diffs", report.moodAvatars === 1, JSON.stringify(report));
check("migration skips/fails nothing", report.skipped === 0 && report.failed === 0, JSON.stringify(report));

const target = createNativeAvatarLibrary(nativeStore, scope);
check("native target has the mood record",
    (await target.listMoodAvatars()).some((r) => String(r.moodId) === "mood-joy__outfit-casual__act-sfw"));

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);