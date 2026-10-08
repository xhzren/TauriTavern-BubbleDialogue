import "fake-indexeddb/auto";
import { createIndexedDbAvatarLibrary } from "../src/features/bubble-render/indexeddb-avatar-library";
import { migrateLibrary } from "../src/features/bubble-render/migration";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const GLOBAL = "_global_", SEP = "__";
const blob = (tag: string, size = 10) => new Blob([tag.padEnd(size, "x")], { type: "image/webp" });

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open("BubbleDialogueAvatars", 7);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains("avatars")) {
                const s = db.createObjectStore("avatars", { keyPath: "alias" });
                s.createIndex("createdAt", "createdAt", { unique: false });
            }
            if (!db.objectStoreNames.contains("config")) db.createObjectStore("config", { keyPath: "key" });
            if (!db.objectStoreNames.contains("mood_avatars")) {
                const m = db.createObjectStore("mood_avatars", { keyPath: "id" });
                m.createIndex("charId", "charId", { unique: false });
                m.createIndex("alias", "alias", { unique: false });
                m.createIndex("moodId", "moodId", { unique: false });
                m.createIndex("lookupKey", "lookupKey", { unique: false });
            }
            if (!db.objectStoreNames.contains("local_fonts")) db.createObjectStore("local_fonts", { keyPath: "id" });
            if (!db.objectStoreNames.contains("cg_groups")) db.createObjectStore("cg_groups", { keyPath: "id" });
            if (!db.objectStoreNames.contains("cg_images")) {
                const c = db.createObjectStore("cg_images", { keyPath: "id" });
                c.createIndex("group", "group", { unique: false });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

const db = await openDb();
await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["avatars", "mood_avatars", "cg_groups", "cg_images"], "readwrite");
    const av = tx.objectStore("avatars");
    const mo = tx.objectStore("mood_avatars");
    const cg = tx.objectStore("cg_groups");
    const ci = tx.objectStore("cg_images");

    // 全局：1 头像 + 1 差分 + 1 组 1 图
    av.put({ alias: `${GLOBAL}${SEP}全局角色`, imageBlob: blob("g", 100), mimeType: "image/webp", fileName: "g.webp", fileSize: 100, createdAt: 1, updatedAt: 1 });
    const gKey = `${GLOBAL}${SEP}全局角色${SEP}mood-joy${SEP}outfit-casual${SEP}act-sfw`;
    mo.put({ id: `${gKey}${SEP}img${SEP}a`, lookupKey: gKey, charId: GLOBAL, alias: "全局角色", moodId: "mood-joy__outfit-casual__act-sfw", imageBlob: blob("gm", 200), mimeType: "image/webp", fileName: "gm.webp", fileSize: 200, createdAt: 1, updatedAt: 1 });
    cg.put({ id: "cg_group__全局CG", group: "全局CG", albumUrl: "", charId: GLOBAL, count: 1, imageUrls: [], createdAt: 1, updatedAt: 1 });
    ci.put({ id: "cg__全局CG__1", group: "全局CG", index: 1, imageBlob: blob("gc", 300), mimeType: "image/webp", fileSize: 300, cachedAt: 1 });

    // 角色卡 1921：2 头像 + 1 差分 + 1 组 1 图
    for (const n of ["甲", "乙"]) {
        av.put({ alias: `1921${SEP}${n}`, imageBlob: blob(n, 50), mimeType: "image/webp", fileName: `${n}.webp`, fileSize: 50, createdAt: 1, updatedAt: 1 });
    }
    const cKey = `1921${SEP}甲${SEP}mood-anger${SEP}outfit-casual${SEP}act-sfw`;
    mo.put({ id: `${cKey}${SEP}img${SEP}b`, lookupKey: cKey, charId: "1921", alias: "甲", moodId: "mood-anger__outfit-casual__act-sfw", imageBlob: blob("cm", 70), mimeType: "image/webp", fileName: "cm.webp", fileSize: 70, createdAt: 1, updatedAt: 1 });
    cg.put({ id: "cg_group__卡CG", group: "卡CG", albumUrl: "", charId: "1921", count: 1, imageUrls: [], createdAt: 1, updatedAt: 1 });
    ci.put({ id: "cg__卡CG__1", group: "卡CG", index: 1, imageBlob: blob("cc", 80), mimeType: "image/webp", fileSize: 80, cachedAt: 1 });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
});

const lib = createIndexedDbAvatarLibrary({ mode: "global", charId: null });

// ---- 1) 范围统计 ----
const scopes = await lib.listScopes();
check("two scopes listed", scopes.length === 2, JSON.stringify(scopes.map((s) => s.charId)));
check("global first", scopes[0].charId === GLOBAL, scopes[0].charId);

const g = scopes.find((s) => s.charId === GLOBAL)!;
const c = scopes.find((s) => s.charId === "1921")!;
check("global counts", g.avatars === 1 && g.moodAvatars === 1 && g.cgImages === 1, JSON.stringify(g));
check("char counts", c.avatars === 2 && c.moodAvatars === 1 && c.cgImages === 1, JSON.stringify(c));
check("global bytes", g.bytes === 100 + 200 + 300, String(g.bytes));
check("char bytes", c.bytes === 50 + 50 + 70 + 80, String(c.bytes));

// ---- 2) primaryOnly：迁移源不能带上全局 ----
const charOnly = createIndexedDbAvatarLibrary({ mode: "character", charId: "1921" }, { primaryOnly: true });
const names = await charOnly.listAvatarNames();
check("primaryOnly lists only own avatars", names.length === 2 && names.includes("甲") && names.includes("乙"), JSON.stringify(names));
const moods = await charOnly.listMoodAvatars();
check("primaryOnly moods exclude global", moods.every((r) => String(r.charId) === "1921"), JSON.stringify(moods.map((r) => r.charId)));

// 对照组：不开 primaryOnly 时会带上全局
const withFallback = createIndexedDbAvatarLibrary({ mode: "character", charId: "1921" });
const mixed = await withFallback.listMoodAvatars();
check("without primaryOnly includes global (why the flag matters)", mixed.length === 2, String(mixed.length));

// ---- 3) 迁移到内存 target，验证不会把全局混进角色卡 ----
const kv = new Map<string, unknown>(); const blobs = new Map<string, Uint8Array>();
const p = (ns: string, t: string, k: string) => `${ns}/${t}/${k}`;
const store = {
    async getJson({ namespace, table = "main", key }: any) { return kv.get(p(namespace, table, key)) ?? null; },
    async tryGetJson({ namespace, table = "main", key }: any) { const k = p(namespace, table, key); return kv.has(k) ? { found: true, value: kv.get(k) } : { found: false }; },
    async setJson({ namespace, table = "main", key, value }: any) { kv.set(p(namespace, table, key), value); },
    async updateJson() {}, async renameKey() {}, async deleteJson({ namespace, table = "main", key }: any) { kv.delete(p(namespace, table, key)); },
    async listKeys({ namespace, table = "main" }: any) { return [...kv.keys()].filter((k) => k.startsWith(`${namespace}/${table}/`)).map((k) => k.split("/").pop()!); },
    async listTables() { return []; },
    async deleteTable({ namespace, table }: any) { for (const k of [...kv.keys()]) if (k.startsWith(`${namespace}/${table}/`)) kv.delete(k); for (const k of [...blobs.keys()]) if (k.startsWith(`${namespace}/${table}/`)) blobs.delete(k); },
    async setBlob({ namespace, table = "main", key, data }: any) { blobs.set(p(namespace, table, key), new Uint8Array(await data.arrayBuffer())); },
    async getBlob({ namespace, table = "main", key }: any) { const b = blobs.get(p(namespace, table, key)); if (!b) throw new Error("nf"); return new Blob([b.slice().buffer], { type: "image/webp" }); },
    async deleteBlob() {}, async listBlobKeys() { return []; },
} as any;

const { createNativeAvatarLibrary } = await import("../src/features/bubble-render/native-avatar-library");
const scope = { mode: "character" as const, charId: "1921" };
const target = createNativeAvatarLibrary(store, scope);
const report = await migrateLibrary({ source: charOnly, target, scope, configKeys: [] });
check("migrated own avatars only", report.avatars === 2, String(report.avatars));
check("migrated own moods only", report.moodAvatars === 1, String(report.moodAvatars));
check("target has 2 avatars", (await target.listAvatarNames()).length === 2, String((await target.listAvatarNames()).length));

// ---- 4) 按范围删除 ----
await lib.clearScope("1921");
const after = await lib.listScopes();
check("char scope removed", !after.some((s) => s.charId === "1921"), JSON.stringify(after.map((s) => s.charId)));
check("global survived", after.some((s) => s.charId === GLOBAL));
const gLib = createIndexedDbAvatarLibrary({ mode: "global", charId: null });
check("global avatar still readable", (await gLib.getAvatar("全局角色")) !== null);
check("global mood still readable", (await gLib.getMoodAvatar("全局角色", "mood-joy__outfit-casual__act-sfw")) !== null);

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
