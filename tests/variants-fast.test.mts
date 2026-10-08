import "fake-indexeddb/auto";
import { JSDOM } from "jsdom";
import { createBubbleRuntime } from "../src/features/bubble-render/runtime";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const dom = new JSDOM("<!DOCTYPE html><body></body>");
(globalThis as any).document = dom.window.document;
(globalThis as any).window = dom.window;
(globalThis as any).window.SillyTavern = {
    getContext: () => ({
        characterId: undefined, name2: "SillyTavern System",
        setExtensionPrompt: () => {}, eventSource: { on: () => {}, off: () => {} }, eventTypes: {},
    }),
};

const GLOBAL = "_global_", SEP = "__";

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
const COMBOS = [
    "mood-anger__outfit-casual__act-sfw",
    "mood-anger__outfit-formal__act-sfw",
    "mood-joy__outfit-casual__act-oral",
];
await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["avatars", "mood_avatars"], "readwrite");
    tx.objectStore("avatars").put({
        alias: `${GLOBAL}${SEP}测试角色`, imageBlob: new Blob(["M"], { type: "image/webp" }),
        mimeType: "image/webp", fileName: "m.webp", fileSize: 1, createdAt: 1, updatedAt: 1,
    });
    COMBOS.forEach((moodId, i) => {
        const lookupKey = `${GLOBAL}${SEP}测试角色${SEP}${moodId}`;
        tx.objectStore("mood_avatars").put({
            id: `${lookupKey}${SEP}img${SEP}h${i}`, lookupKey, charId: GLOBAL, alias: "测试角色",
            moodId, imageBlob: new Blob(["V" + i], { type: "image/webp" }),
            mimeType: "image/webp", fileName: `v${i}.webp`, fileSize: 2, createdAt: 1, updatedAt: 1,
        });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
});

const runtime = createBubbleRuntime({ host: { api: {} } } as any);

// 核心回归：一次调用就要带回预览图，不能再让页面逐个回查（那是「一张张慢慢冒」的根因）
const variants = await runtime.getAvatarVariants("测试角色");
check("all variants returned", variants.length === 3, String(variants.length));
check("every variant carries previewUrl", variants.every((v) => !!v.previewUrl),
    JSON.stringify(variants.map((v) => v.previewUrl)));
check("previewUrl is a blob url", variants.every((v) => String(v.previewUrl).startsWith("blob:")));

// 解析出的三段
check("mood split", variants[0].mood === "mood-anger", variants[0].mood);
check("outfit split", variants[0].outfit === "outfit-casual", variants[0].outfit);
check("act split", variants[0].act === "act-sfw", variants[0].act);

// 范围隔离：别的角色卡的数据不应混进来
await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("mood_avatars", "readwrite");
    const lookupKey = `1921${SEP}测试角色${SEP}mood-joy__outfit-casual__act-sfw`;
    tx.objectStore("mood_avatars").put({
        id: `${lookupKey}${SEP}img${SEP}x`, lookupKey, charId: "1921", alias: "测试角色",
        moodId: "mood-joy__outfit-casual__act-sfw", imageBlob: new Blob(["X"], { type: "image/webp" }),
        mimeType: "image/webp", fileName: "x.webp", fileSize: 1, createdAt: 1, updatedAt: 1,
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
});

const runtime2 = createBubbleRuntime({ host: { api: {} } } as any);
const scoped = await runtime2.getAvatarVariants("测试角色");
check("other scope excluded", scoped.length === 3, String(scoped.length));

// 缓存：同一次会话里重复取不应重复全表扫描（这里只验证结果一致）
const again = await runtime2.getAvatarVariants("测试角色");
check("repeat call consistent", again.length === 3, String(again.length));

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
