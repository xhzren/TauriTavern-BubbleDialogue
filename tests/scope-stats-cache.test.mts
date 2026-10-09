import { JSDOM } from "jsdom";
import { getBubbleRuntime } from "../src/features/bubble-render/runtime";
import { encodeStoreKey } from "../src/features/bubble-render/store-key";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const dom = new JSDOM("<!DOCTYPE html><body></body>");
(globalThis as any).document = dom.window.document;
(globalThis as any).window = dom.window;
(globalThis as any).MutationObserver = dom.window.MutationObserver;

/** 稳定身份 = avatar 文件名去掉 .png；数组下标只是取 characters 里的当前项 */
const CHAR_STEM = "银麒赎世";
const CHAR_INDEX = 0;
const stContext = {
    characterId: String(CHAR_INDEX),
    name2: "测试角色",
    characters: [{ avatar: `${CHAR_STEM}.png`, name: "测试角色" }],
    setExtensionPrompt: () => {},
    eventSource: { on: () => {}, off: () => {} },
    eventTypes: {},
};
(globalThis as any).window.SillyTavern = { getContext: () => stContext };

const GLOBAL_NS = encodeStoreKey(["bubble", "global"]);
const CHAR_NS = encodeStoreKey(["bubble", "char", CHAR_STEM]);

/** 让 listKeys 真正按 namespace 返回内容（上面的占位版本返回空，这里补上） */
function makeRealStore() {
    const tables = new Map<string, Map<string, unknown>>();
    const scans = new Map<string, number>();
    const id = (ns: string, table: string) => `${ns}::${table}`;
    const seed = (ns: string, table: string, key: string, value: unknown) => {
        const k = id(ns, table);
        if (!tables.has(k)) tables.set(k, new Map());
        tables.get(k)!.set(key, value);
    };
    seed(GLOBAL_NS, "avatars", "a", { name: "全局甲", fileSize: 100 });
    seed(GLOBAL_NS, "avatars", "b", { name: "全局乙", fileSize: 200 });
    seed(GLOBAL_NS, "mood", "m", { name: "全局甲", fileSize: 300 });
    seed(CHAR_NS, "avatars", "c", { name: "卡甲", fileSize: 50 });

    return {
        scans,
        async listKeys({ namespace, table }: { namespace: string; table?: string }) {
            scans.set(namespace, (scans.get(namespace) ?? 0) + 1);
            const t = table ?? "";
            return [...(tables.get(id(namespace, t))?.keys() ?? [])];
        },
        async tryGetJson({ namespace, table, key }: { namespace: string; table?: string; key: string }) {
            const value = tables.get(id(namespace, table ?? ""))?.get(key);
            return value === undefined ? { found: false } : { found: true, value };
        },
        async listTables() { return []; },
        async setJson({ namespace, table, key, value }: any) {
            const k = id(namespace, table ?? "");
            if (!tables.has(k)) tables.set(k, new Map());
            tables.get(k)!.set(key, value);
        },
        async setBlob({ namespace, table, key }: any) {
            const k = id(namespace, table ?? "");
            if (!tables.has(k)) tables.set(k, new Map());
            tables.get(k)!.set(key, { fileSize: 64 });
        },
        async deleteJson() {},
        async deleteBlob() {},
    } as any;
}

function makeContext(store: unknown) {
    return { host: { api: { extension: { store } } }, settings: {}, shell: {}, layout: {}, bubbleBus: {}, i18n: {} } as any;
}

const store = makeRealStore();
const runtime = getBubbleRuntime(makeContext(store));
await runtime.acquire();
await new Promise((r) => setTimeout(r, 50));

// ---- 1) 启动后显式切到角色卡，应扫过角色卡 ----
await runtime.setMode("character");
const charScansAfterBoot = store.scans.get(CHAR_NS) ?? 0;
check("character scope scanned once on switch", charScansAfterBoot > 0, String(charScansAfterBoot));

// ---- 2) 切到全局：全局首次加载，扫一次 ----
await runtime.setMode("global");
check("global has 2 avatars", runtime.state.avatarCount === 2, String(runtime.state.avatarCount));
const globalScansFirst = store.scans.get(GLOBAL_NS) ?? 0;
check("global scanned on first switch", globalScansFirst > 0, String(globalScansFirst));

// ---- 3) 切回角色卡，再切回全局：全局不应再扫 ----
await runtime.setMode("character");
check("character has 1 avatar", runtime.state.avatarCount === 1, String(runtime.state.avatarCount));
await runtime.setMode("global");
const globalScansSecond = store.scans.get(GLOBAL_NS) ?? 0;
check("switching back to global does NOT rescan", globalScansSecond === globalScansFirst,
    `${globalScansFirst} -> ${globalScansSecond}`);
check("global still shows 2 avatars (from cache)", runtime.state.avatarCount === 2, String(runtime.state.avatarCount));

// ---- 4) 来回切多次仍不重扫 ----
for (let i = 0; i < 3; i++) {
    await runtime.setMode("character");
    await runtime.setMode("global");
}
const globalScansFinal = store.scans.get(GLOBAL_NS) ?? 0;
check("repeated round-trips do NOT rescan global", globalScansFinal === globalScansFirst,
    `${globalScansFirst} -> ${globalScansFinal}`);

// ---- 5) 在当前范围写入后，该范围缓存失效，统计更新 ----
await runtime.setMode("character");
const charScansBefore = store.scans.get(CHAR_NS) ?? 0;
await runtime.addAvatar("新头像", new Blob(["x".repeat(64)], { type: "image/webp" }));
const charScansAfter = store.scans.get(CHAR_NS) ?? 0;
check("writing in scope rescans that scope", charScansAfter > charScansBefore,
    `${charScansBefore} -> ${charScansAfter}`);

// ---- 6) 手动强制刷新应真的重扫 ----
const globalScansBeforeForce = store.scans.get(GLOBAL_NS) ?? 0;
await runtime.setMode("global");
await runtime.refreshScopeStats();
const globalScansAfterForce = store.scans.get(GLOBAL_NS) ?? 0;
check("manual refresh forces a rescan", globalScansAfterForce > globalScansBeforeForce,
    `${globalScansBeforeForce} -> ${globalScansAfterForce}`);

// ---- 7) 情绪差分也按范围缓存，切回不重扫 ----
await runtime.setMode("global");
await runtime.getAvatarVariants("全局甲");
const moodScansFirst = store.scans.get(GLOBAL_NS) ?? 0;
await runtime.setMode("character");
await runtime.setMode("global");
await runtime.getAvatarVariants("全局甲");
const moodScansSecond = store.scans.get(GLOBAL_NS) ?? 0;
check("mood variants cached across scope switches", moodScansSecond === moodScansFirst,
    `${moodScansFirst} -> ${moodScansSecond}`);


await runtime.release();
console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
