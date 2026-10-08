import "fake-indexeddb/auto";
import { createIndexedDbAvatarLibrary } from "../src/features/bubble-render/indexeddb-avatar-library";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const GLOBAL = "_global_";
const SEP = "__";

function openAndSeed(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        // 版本与 store 结构完全照抄原脚本 _createStores
        const req = indexedDB.open("BubbleDialogueAvatars", 7);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains("avatars")) {
                const store = db.createObjectStore("avatars", { keyPath: "alias" });
                store.createIndex("createdAt", "createdAt", { unique: false });
            }
            if (!db.objectStoreNames.contains("config")) {
                db.createObjectStore("config", { keyPath: "key" });
            }
            if (!db.objectStoreNames.contains("mood_avatars")) {
                const mood = db.createObjectStore("mood_avatars", { keyPath: "id" });
                mood.createIndex("charId", "charId", { unique: false });
                mood.createIndex("alias", "alias", { unique: false });
                mood.createIndex("moodId", "moodId", { unique: false });
                mood.createIndex("lookupKey", "lookupKey", { unique: false });
            }
            if (!db.objectStoreNames.contains("local_fonts")) db.createObjectStore("local_fonts", { keyPath: "id" });
            if (!db.objectStoreNames.contains("cg_groups")) db.createObjectStore("cg_groups", { keyPath: "id" });
            if (!db.objectStoreNames.contains("cg_images")) {
                const cg = db.createObjectStore("cg_images", { keyPath: "id" });
                cg.createIndex("group", "group", { unique: false });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

const db = await openAndSeed();

// 写一条真实形态的头像 + 情绪差分
await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["avatars", "mood_avatars", "config"], "readwrite");
    tx.objectStore("avatars").put({
        alias: `${GLOBAL}${SEP}刘振宇`,
        imageBlob: new Blob(["MAIN"], { type: "image/webp" }),
        mimeType: "image/webp", fileName: "刘振宇.webp", fileSize: 4,
        createdAt: Date.now(), updatedAt: Date.now(),
    });

    // 关键：id = lookupKey + __img__ + hash（v13.1 起 id 不再等于 lookupKey）
    const lookupKey = `${GLOBAL}${SEP}刘振宇${SEP}mood-anger${SEP}outfit-casual${SEP}act-sfw`;
    tx.objectStore("mood_avatars").put({
        id: `${lookupKey}${SEP}img${SEP}abc123`,
        lookupKey,
        charId: GLOBAL,
        alias: "刘振宇",                    // 纯名字
        moodId: "mood-anger__outfit-casual__act-sfw",
        imageBlob: new Blob(["MOOD"], { type: "image/webp" }),
        mimeType: "image/webp", fileName: "刘振宇-mood.webp", fileSize: 4,
        createdAt: Date.now(), updatedAt: Date.now(),
    });

    // 另一张角色卡的数据（用于验证范围过滤）
    tx.objectStore("avatars").put({
        alias: `1921${SEP}孤儿头像`,
        imageBlob: new Blob(["ORPHAN"], { type: "image/webp" }),
        mimeType: "image/webp", fileName: "孤儿.webp", fileSize: 6,
        createdAt: Date.now(), updatedAt: Date.now(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
});

const lib = createIndexedDbAvatarLibrary({ mode: "global", charId: null });

// 1) 只列全局范围，名字正确（不能出现 1921）
const names = await lib.listAvatarNames();
check("global list contains 刘振宇", names.includes("刘振宇"), JSON.stringify(names));
check("global list excludes other scope", !names.includes("1921") && !names.includes("孤儿头像"), JSON.stringify(names));

// 2) 关键回归：情绪差分要能按 lookupKey 取到（此前拿 lookupKey 当主键，取不到）
const mood = await lib.getMoodAvatar("刘振宇", "mood-anger__outfit-casual__act-sfw");
check("mood record found via lookupKey index", mood !== null);
check("mood record has imageBlob", !!(mood && mood.imageBlob));

// 3) 列表也应按范围过滤
const moods = await lib.listMoodAvatars();
check("mood list scoped", moods.every((r) => String(r.charId) === GLOBAL), JSON.stringify(moods.map((r) => r.charId)));

// 4) 主头像
const main = await lib.getAvatar("刘振宇");
check("main avatar found", main !== null && !!main.imageBlob);

// 5) 同一 lookupKey 多张候选图（v13.1 特性）也要能取到
await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("mood_avatars", "readwrite");
    const lookupKey = `${GLOBAL}${SEP}刘振宇${SEP}mood-joy${SEP}outfit-casual${SEP}act-sfw`;
    for (const tag of ["a", "b"]) {
        tx.objectStore("mood_avatars").put({
            id: `${lookupKey}${SEP}img${SEP}${tag}`,
            lookupKey, charId: GLOBAL, alias: "刘振宇",
            moodId: "mood-joy__outfit-casual__act-sfw",
            imageBlob: new Blob(["JOY-" + tag], { type: "image/webp" }),
            mimeType: "image/webp", fileName: `joy-${tag}.webp`, fileSize: 5,
            createdAt: Date.now(), updatedAt: Date.now(),
        });
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
});
const multi = await lib.getMoodAvatar("刘振宇", "mood-joy__outfit-casual__act-sfw");
check("multi-candidate lookup works", multi !== null && !!multi.imageBlob);
const allMoods = await lib.listMoodAvatars();
check("all candidates listed", allMoods.filter((r) => String(r.moodId).startsWith("mood-joy")).length === 2,
    String(allMoods.filter((r) => String(r.moodId).startsWith("mood-joy")).length));

// 6) 删除情绪差分必须真的删掉（主键是 id，删错键会静默无效）
await lib.deleteMoodAvatar("刘振宇", "mood-anger__outfit-casual__act-sfw");
check("deleteMoodAvatar actually removes", (await lib.getMoodAvatar("刘振宇", "mood-anger__outfit-casual__act-sfw")) === null);
const afterDelete = await lib.listMoodAvatars();
check("deleted record gone from list", !afterDelete.some((r) => String(r.moodId) === "mood-anger__outfit-casual__act-sfw"));

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
