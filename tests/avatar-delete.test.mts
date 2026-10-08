import { JSDOM } from "jsdom";
import { getBubbleRuntime } from "../src/features/bubble-render/runtime";
import { encodeStoreKey } from "../src/features/bubble-render/store-key";
import { createNativeAvatarLibrary } from "../src/features/bubble-render/native-avatar-library";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
(globalThis as any).document = dom.window.document;
(globalThis as any).window = dom.window;
(globalThis as any).MutationObserver = dom.window.MutationObserver;
(globalThis as any).URL.createObjectURL = (b: any) => "blob:" + b.tag;
(globalThis as any).URL.revokeObjectURL = () => {};
(globalThis as any).window.SillyTavern = {
    getContext: () => ({
        characterId: undefined, name2: "SillyTavern System",
        setExtensionPrompt: () => {},
        eventSource: { on: () => {}, off: () => {} },
        eventTypes: {},
    }),
};

const NS = encodeStoreKey(["bubble", "global"]);
const NAME = "九尾妖狐·绯月";
const MOOD_IDS = ["mood-calm__outfit-sleep__act-oral", "mood-calm__outfit-sleep__act-handjob", "mood-joy__outfit-casual__act-sfw"];

/**
 * 严格版假 store：**删不存在的条目就抛错**，和宿主的真实行为一致。
 * 这样只要扩展多发了一次删除命令，测试就会红。
 */
function makeStore() {
    const kv = new Set<string>();
    const blobs = new Set<string>();
    const meta = new Map<string, any>();
    const strictErrors: string[] = [];
    const deleted: string[] = [];
    const id = (ns: string, table: string, key: string) => `${ns}::${table}::${key}`;

    // 主头像
    kv.add(id(NS, "avatars", encodeStoreKey([NAME])));
    blobs.add(id(NS, "avatars", encodeStoreKey([NAME]) + ".webp"));
    meta.set(id(NS, "avatars", encodeStoreKey([NAME])), { name: NAME, alias: NAME, fileName: `${NAME}.webp`, mimeType: "image/webp", fileSize: 10 });
    // 差分
    for (const moodId of MOOD_IDS) {
        const k = encodeStoreKey([NAME, moodId]);
        kv.add(id(NS, "mood", k));
        blobs.add(id(NS, "mood", k + ".webp"));
        meta.set(id(NS, "mood", k), { alias: NAME, name: NAME, moodId, fileName: `${NAME}_${moodId}.webp`, mimeType: "image/webp", fileSize: 20 });
    }
    // 另一角色：不该被碰
    kv.add(id(NS, "avatars", encodeStoreKey(["林知意"])));
    blobs.add(id(NS, "avatars", encodeStoreKey(["林知意"]) + ".webp"));
    meta.set(id(NS, "avatars", encodeStoreKey(["林知意"])), { name: "林知意", alias: "林知意", fileName: "林知意.webp", mimeType: "image/webp", fileSize: 10 });

    const kvTable = (ns: string, table: string) => [...kv].filter((x) => x.startsWith(`${ns}::${table}::`)).map((x) => x.split("::").slice(2).join("::"));

    return {
        strictErrors, deleted, kv, blobs, meta,
        async listKeys({ namespace, table }: any) { return kvTable(namespace, table ?? "main"); },
        async tryGetJson({ namespace, table, key }: any) {
            const v = meta.get(id(namespace, table ?? "main", key));
            return v === undefined ? { found: false } : { found: true, value: v };
        },
        async listBlobKeys({ namespace, table }: any) {
            return [...blobs].filter((x) => x.startsWith(`${namespace}::${table}::`)).map((x) => x.split("::").slice(2).join("::"));
        },
        async getBlob({ namespace, table, key }: any) {
            if (!blobs.has(id(namespace, table ?? "main", key))) throw new Error("Not found: " + key);
            return { tag: key } as any;
        },
        async deleteJson({ namespace, table, key }: any) {
            const k = id(namespace, table ?? "main", key);
            if (!kv.has(k)) { strictErrors.push("kv " + key); throw new Error("Not found: " + key); }
            kv.delete(k); meta.delete(k); deleted.push("kv " + key);
        },
        async deleteBlob({ namespace, table, key }: any) {
            const k = id(namespace, table ?? "main", key);
            if (!blobs.has(k)) { strictErrors.push("blob " + key); throw new Error("Not found: " + key); }
            blobs.delete(k); deleted.push("blob " + key);
        },
        async listTables() { return []; },
        async setJson() {}, async setBlob() {},
    } as any;
}

const makeContext = (store: unknown) => ({ host: { api: { extension: { store } } }, settings: {}, shell: {}, layout: {}, bubbleBus: {}, i18n: {} } as any);

// ============================================================
// 1) 正常删除：不该对不存在的条目发删除命令
// ============================================================
{
    const store = makeStore();
    const runtime = getBubbleRuntime(makeContext(store));
    await runtime.acquire();

    await runtime.deleteAvatar(NAME);

    check("no host-side strict errors", store.strictErrors.length === 0, store.strictErrors.slice(0, 3).join(" | "));
    check("main avatar kv deleted", !store.kv.has(`${NS}::avatars::${encodeStoreKey([NAME])}`));
    check("all mood kv deleted", MOOD_IDS.every((m) => !store.kv.has(`${NS}::mood::${encodeStoreKey([NAME, m])}`)));
    check("all mood blobs deleted", MOOD_IDS.every((m) => !store.blobs.has(`${NS}::mood::${encodeStoreKey([NAME, m])}.webp`)));
    check("other avatar untouched", store.kv.has(`${NS}::avatars::${encodeStoreKey(["林知意"])}`));
    check("deletingName cleared", runtime.state.deletingName === null);
    await runtime.release();
}

// ============================================================
// 2) 连点/并发：第二次删除必须是空操作，不能撞出 Not Found
// ============================================================
{
    const store = makeStore();
    const runtime = getBubbleRuntime(makeContext(store));
    await runtime.acquire();

    // 模拟用户连点两下
    await Promise.all([runtime.deleteAvatar(NAME), runtime.deleteAvatar(NAME)]);

    check("concurrent delete: no host-side strict errors", store.strictErrors.length === 0,
        store.strictErrors.slice(0, 3).join(" | "));
    check("concurrent delete: no duplicate deletions",
        store.deleted.length === new Set(store.deleted).size, String(store.deleted.length));
    check("concurrent delete: everything gone",
        !store.kv.has(`${NS}::avatars::${encodeStoreKey([NAME])}`) &&
        MOOD_IDS.every((m) => !store.kv.has(`${NS}::mood::${encodeStoreKey([NAME, m])}`)));

    // 再删一次（已不存在）：仍不能报错
    await runtime.deleteAvatar(NAME);
    check("re-delete after gone: no strict errors", store.strictErrors.length === 0,
        store.strictErrors.slice(0, 3).join(" | "));
    await runtime.release();
}

// ============================================================
// 3) 部分缺失（有元数据没图 / 有图没元数据）也不能报错
// ============================================================
{
    const store = makeStore();
    // 抹掉一个差分图，模拟导入不完整
    store.blobs.delete(`${NS}::mood::${encodeStoreKey([NAME, MOOD_IDS[0]])}.webp`);

    const runtime = getBubbleRuntime(makeContext(store));
    await runtime.acquire();
    await runtime.deleteAvatar(NAME);

    check("missing blob does not cause host error", store.strictErrors.length === 0,
        store.strictErrors.slice(0, 3).join(" | "));
    check("remaining entries still deleted",
        !store.kv.has(`${NS}::mood::${encodeStoreKey([NAME, MOOD_IDS[1]])}`));
    await runtime.release();
}

// ============================================================
// 4) 直接测库层：条目已经被删掉时，再删不能抛（宿主会弹「后端错误」）
//    这是并发/重复删除真正会走到的路径
// ============================================================
{
    const store = makeStore();
    const lib = createNativeAvatarLibrary(store, { mode: "global", charId: null });
    const moodId = MOOD_IDS[0];
    // 模拟「上一次删除已经把它删掉了」，但调用方还以为它在
    // 注意 kv 集合和 meta 映射都要清（meta 就是文件内容）
    store.kv.delete(`${NS}::mood::${encodeStoreKey([NAME, moodId])}`);
    store.meta.delete(`${NS}::mood::${encodeStoreKey([NAME, moodId])}`);
    store.blobs.delete(`${NS}::mood::${encodeStoreKey([NAME, moodId])}.webp`);

    let threw = false;
    try {
        await lib.deleteMoodAvatar(NAME, moodId);
    } catch {
        threw = true;
    }
    check("library: deleting an already-gone entry does not throw", !threw);
    check("library: no host-side strict error", store.strictErrors.length === 0, store.strictErrors.join(" | "));

    // 主头像同理
    const mainKey = encodeStoreKey([NAME]);
    store.kv.delete(`${NS}::avatars::${mainKey}`);
    store.meta.delete(`${NS}::avatars::${mainKey}`);
    store.blobs.delete(`${NS}::avatars::${mainKey}.webp`);
    let threwMain = false;
    try {
        await lib.deleteAvatar(NAME);
    } catch {
        threwMain = true;
    }
    check("library: deleting a gone main avatar does not throw", !threwMain);
    check("library: still no host-side strict error", store.strictErrors.length === 0, store.strictErrors.join(" | "));
}

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
