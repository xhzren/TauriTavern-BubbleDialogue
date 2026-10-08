import { JSDOM } from "jsdom";
import { getBubbleRuntime } from "../src/features/bubble-render/runtime";
import { encodeStoreKey } from "../src/features/bubble-render/store-key";
import { buildColorConfigKey } from "../src/features/bubble-render/key-format";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
const doc = dom.window.document;
(globalThis as any).document = doc;
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
const NAME = "林知意";
const MOODS = ["mood-joy__outfit-sleep__act-sfw", "mood-shy__outfit-sleep__act-sfw"];

/** 严格版假 store（删不存在的条目会抛错），支持 kv / blobs / config */
function makeStore() {
    const kv = new Map<string, any>();
    const blobs = new Map<string, any>();
    const strictErrors: string[] = [];
    const failBlobKeys = new Set<string>();
    const id = (ns: string, table: string, key: string) => `${ns}::${table}::${key}`;

    kv.set(id(NS, "avatars", encodeStoreKey([NAME])), { name: NAME, alias: NAME, fileName: `${NAME}.webp`, mimeType: "image/webp", fileSize: 10 });
    blobs.set(id(NS, "avatars", encodeStoreKey([NAME]) + ".webp"), { tag: "main-old" });
    for (const m of MOODS) {
        const k = encodeStoreKey([NAME, m]);
        kv.set(id(NS, "mood", k), { alias: NAME, name: NAME, moodId: m, fileName: `${NAME}_${m}.webp`, mimeType: "image/webp", fileSize: 20 });
        blobs.set(id(NS, "mood", k + ".webp"), { tag: "mood-" + m.split("__")[0] });
    }

    return {
        strictErrors, kv, blobs, failBlobKeys,
        async listKeys({ namespace, table }: any) {
            const p = `${namespace}::${table ?? "main"}::`;
            return [...kv.keys()].filter((x) => x.startsWith(p)).map((x) => x.slice(p.length));
        },
        async tryGetJson({ namespace, table, key }: any) {
            const v = kv.get(id(namespace, table ?? "main", key));
            return v === undefined ? { found: false } : { found: true, value: v };
        },
        async listBlobKeys({ namespace, table }: any) {
            const p = `${namespace}::${table ?? "main"}::`;
            return [...blobs.keys()].filter((x) => x.startsWith(p)).map((x) => x.slice(p.length));
        },
        async getBlob({ namespace, table, key }: any) {
            const v = blobs.get(id(namespace, table ?? "main", key));
            if (!v) throw new Error("Not found: " + key);
            return v;
        },
        async setJson({ namespace, table, key, value }: any) { kv.set(id(namespace, table ?? "main", key), value); },
        async setBlob({ namespace, table, key, data }: any) {
            if (failBlobKeys.has(key)) throw new Error("write failed: " + key);
            blobs.set(id(namespace, table ?? "main", key), data);
        },
        async deleteJson({ namespace, table, key }: any) {
            const k = id(namespace, table ?? "main", key);
            if (!kv.has(k)) { strictErrors.push("kv " + key); throw new Error("Not found: " + key); }
            kv.delete(k);
        },
        async deleteBlob({ namespace, table, key }: any) {
            const k = id(namespace, table ?? "main", key);
            if (!blobs.has(k)) { strictErrors.push("blob " + key); throw new Error("Not found: " + key); }
            blobs.delete(k);
        },
        async listTables() { return []; },
    } as any;
}

const makeContext = (store: unknown) => ({ host: { api: { extension: { store } } }, settings: {}, shell: {}, layout: {}, bubbleBus: {}, i18n: {} } as any);

// ============================================================
// 1) 重命名：主头像 + 全部差分一起搬，旧名字清掉
// ============================================================
{
    const store = makeStore();
    const runtime = getBubbleRuntime(makeContext(store));
    await runtime.acquire();

    await runtime.renameAvatar(NAME, "林知意2");

    const newKey = encodeStoreKey(["林知意2"]);
    check("rename: new main avatar exists", store.kv.has(`${NS}::avatars::${newKey}`));
    check("rename: new main blob exists", store.blobs.has(`${NS}::avatars::${newKey}.webp`));
    check("rename: old main avatar gone", !store.kv.has(`${NS}::avatars::${encodeStoreKey([NAME])}`));
    check("rename: new mood entries exist",
        MOODS.every((m) => store.kv.has(`${NS}::mood::${encodeStoreKey(["林知意2", m])}`)));
    check("rename: old mood entries gone",
        MOODS.every((m) => !store.kv.has(`${NS}::mood::${encodeStoreKey([NAME, m])}`)));
    check("rename: mood alias updated",
        MOODS.every((m) => store.kv.get(`${NS}::mood::${encodeStoreKey(["林知意2", m])}`)?.alias === "林知意2"));
    check("rename: no host-side strict errors", store.strictErrors.length === 0, store.strictErrors.slice(0, 2).join(" | "));
    check("rename: name list refreshed", runtime.state.avatarNames.includes("林知意2"));
    await runtime.release();
}

// ============================================================
// 2) 重命名被占用 / 复制失败 都要拦住
// ============================================================
{
    const store = makeStore();
    // 目标名已被占用
    store.kv.set(`${NS}::avatars::${encodeStoreKey(["林知意2"])}`,
        { name: "林知意2", alias: "林知意2", fileName: "林知意2.webp", mimeType: "image/webp" });
    store.blobs.set(`${NS}::avatars::${encodeStoreKey(["林知意2"])}.webp`, { tag: "occupied" });
    const runtime = getBubbleRuntime(makeContext(store));
    await runtime.acquire();

    let msg = "";
    try { await runtime.renameAvatar(NAME, "林知意2"); } catch (e) { msg = e instanceof Error ? e.message : String(e); }
    check("rename: occupied name rejected", msg.includes("已被占用"), msg);
    check("rename: original untouched after rejection", store.kv.has(`${NS}::avatars::${encodeStoreKey([NAME])}`));
    await runtime.release();
}

{
    const store = makeStore();
    // 让某条差分的图写不进去 → 必须中止，旧名字保留
    store.failBlobKeys.add(encodeStoreKey(["林知意2", MOODS[1]]) + ".webp");
    const runtime = getBubbleRuntime(makeContext(store));
    await runtime.acquire();

    let failed = false;
    try { await runtime.renameAvatar(NAME, "林知意2"); } catch { failed = true; }
    check("rename: aborts when a mood copy fails", failed);
    check("rename: original main avatar kept on failure", store.kv.has(`${NS}::avatars::${encodeStoreKey([NAME])}`));
    await runtime.release();
}

// ============================================================
// 3) 替换默认头像：只换主图，不动差分
// ============================================================
{
    const store = makeStore();
    const runtime = getBubbleRuntime(makeContext(store));
    await runtime.acquire();

    await runtime.replaceAvatar(NAME, { tag: "main-new", type: "image/webp", size: 30 } as any);

    check("replace: main blob replaced",
        store.blobs.get(`${NS}::avatars::${encodeStoreKey([NAME])}.webp`)?.tag === "main-new");
    check("replace: moods untouched", MOODS.every((m) => store.blobs.has(`${NS}::mood::${encodeStoreKey([NAME, m])}.webp`)));
    check("replace: result message", String(runtime.state.lastResult).includes("已替换"));
    await runtime.release();
}

// ============================================================
// 4) 改颜色：写进 color_<charId>__<名字>，并且真的作用到正文
// ============================================================
{
    const store = makeStore();
    const runtime = getBubbleRuntime(makeContext(store));
    await runtime.acquire();

    await runtime.setAvatarColor(NAME, "#ff0000");
    const key = buildColorConfigKey(null, NAME);
    check("color: stored under original key format", key === "color__global___林知意", key);
    check("color: persisted", store.kv.get(`${NS}::config::${encodeStoreKey([key])}`) === "#ff0000");
    check("color: exposed to UI", runtime.state.avatarColors["林知意"] === "#ff0000");

    // 造一个气泡，看颜色有没有落到 --yq-text-color
    const host = doc.createElement("div");
    host.innerHTML =
        '<div class="yq-bubble" data-name="林知意" data-mood="喜悦" data-outfit="outfit-sleep" data-act="act-sfw">' +
        '<img class="yq-bubble-avatar" data-lazy-mood="x" src="data:image/svg+xml;utf8,<svg/>" />' +
        '<div class="yq-bubble-text">测试</div></div>';
    doc.body.appendChild(host);

    // 默认是「全局」模式 → 不该注入 per-name 颜色
    runtime.hydrateNow();
    await new Promise((r) => setTimeout(r, 30));
    const bubble = doc.querySelector(".yq-bubble") as HTMLElement;
    check("color: not applied in global mode", bubble.style.getPropertyValue("--yq-text-color") === "",
        bubble.style.getPropertyValue("--yq-text-color"));

    // 切到「按角色」模式后应生效
    await runtime.config.setStyle("style_textColorMode", "character");
    runtime.hydrateNow();
    await new Promise((r) => setTimeout(r, 30));
    check("color: applied in character mode",
        (doc.querySelector(".yq-bubble") as HTMLElement).style.getPropertyValue("--yq-text-color") === "#ff0000",
        (doc.querySelector(".yq-bubble") as HTMLElement).style.getPropertyValue("--yq-text-color"));

    // 清除
    await runtime.setAvatarColor(NAME, null);
    check("color: cleared from state", runtime.state.avatarColors["林知意"] === undefined);
    await runtime.release();
}

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
