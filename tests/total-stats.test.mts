import { JSDOM } from "jsdom";
import { getBubbleRuntime, NO_CHARACTER_SENTINEL } from "../src/features/bubble-render/runtime";
import { encodeStoreKey } from "../src/features/bubble-render/store-key";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const dom = new JSDOM("<!DOCTYPE html><body></body>");
(globalThis as any).document = dom.window.document;
(globalThis as any).window = dom.window;
(globalThis as any).MutationObserver = dom.window.MutationObserver;

const CHAR_ID = "1921";
const stContext = {
    characterId: CHAR_ID,
    name2: "测试角色",
    setExtensionPrompt: () => {},
    eventSource: { on: () => {}, off: () => {} },
    eventTypes: {},
};
(globalThis as any).window.SillyTavern = { getContext: () => stContext };

const GLOBAL_NS = encodeStoreKey(["bubble", "global"]);
const CHAR_NS = encodeStoreKey(["bubble", "char", CHAR_ID]);

/** 造一个内存版原生 store：全局 2 头像 / 角色卡 1 头像 */
function makeStore() {
    const tables = new Map<string, Map<string, unknown>>();
    const nsTable = (ns: string, table: string) => `${ns}::${table}`;
    const seed = (ns: string, table: string, key: string, value: unknown) => {
        const id = nsTable(ns, table);
        if (!tables.has(id)) tables.set(id, new Map());
        tables.get(id)!.set(key, value);
    };
    seed(GLOBAL_NS, "avatars", "a", { name: "全局甲", fileSize: 100 });
    seed(GLOBAL_NS, "avatars", "b", { name: "全局乙", fileSize: 200 });
    seed(GLOBAL_NS, "mood", "m", { name: "全局甲", fileSize: 300 });
    seed(CHAR_NS, "avatars", "c", { name: "卡甲", fileSize: 50 });

    // 记录被读取过的 namespace，用来判断统计覆盖了哪些范围
    const touched = new Set<string>();
    return {
        touched,
        async listKeys({ namespace, table }: { namespace: string; table?: string }) {
            touched.add(namespace);
            return [...(tables.get(nsTable(namespace, table ?? ""))?.keys() ?? [])];
        },
        async tryGetJson({ namespace, table, key }: { namespace: string; table?: string; key: string }) {
            const value = tables.get(nsTable(namespace, table ?? ""))?.get(key);
            return value === undefined ? { found: false } : { found: true, value };
        },
        async listTables({ namespace }: { namespace: string }) {
            touched.add(namespace);
            return [];
        },
    } as any;
}

function makeContext(store: unknown) {
    return { host: { api: { extension: { store } } }, settings: {}, shell: {}, layout: {}, bubbleBus: {}, i18n: {} } as any;
}

const store = makeStore();
const ctx = makeContext(store);
const runtime = getBubbleRuntime(ctx);
check("character card detected", runtime.state.hasCharacterCard === true);

await runtime.acquire();
// acquire 里的全库统计是 fire-and-forget，等它跑完
await new Promise((r) => setTimeout(r, 50));

// ---- 1) 全库统计汇总了所有可触达范围 ----
check("total stats finished", runtime.state.totalStatsLoading === false);
check("total avatars = global 2 + char 1", runtime.state.totalAvatars === 3, String(runtime.state.totalAvatars));
check("total mood variants = 1", runtime.state.totalMoodAvatars === 1, String(runtime.state.totalMoodAvatars));
check("total bytes = 100+200+300+50", runtime.state.totalStorageBytes === 650, String(runtime.state.totalStorageBytes));
check("store touched both namespaces", store.touched.has(GLOBAL_NS) && store.touched.has(CHAR_NS),
    [...store.touched].join(","));

// ---- 2) 切换库范围不应重跑全库统计 ----
const before = {
    totalAvatars: runtime.state.totalAvatars,
    totalMood: runtime.state.totalMoodAvatars,
    bytes: runtime.state.totalStorageBytes,
};
const touchedBefore = store.touched.size;

await runtime.setMode("global");
await new Promise((r) => setTimeout(r, 50));
check("switch to global keeps total avatars", runtime.state.totalAvatars === before.totalAvatars,
    `${before.totalAvatars} -> ${runtime.state.totalAvatars}`);
check("switch to global keeps total mood", runtime.state.totalMoodAvatars === before.totalMood);
check("switch to global keeps total bytes", runtime.state.totalStorageBytes === before.bytes);
check("switching scope does NOT re-scan namespaces", store.touched.size === touchedBefore,
    `${touchedBefore} -> ${store.touched.size}`);

await runtime.setMode("character");
await new Promise((r) => setTimeout(r, 50));
check("switch back to character keeps total avatars", runtime.state.totalAvatars === before.totalAvatars,
    `${before.totalAvatars} -> ${runtime.state.totalAvatars}`);
check("switching back does NOT re-scan namespaces", store.touched.size === touchedBefore,
    `${touchedBefore} -> ${store.touched.size}`);

// ---- 3) 当前范围统计仍应跟随库范围（与全库统计互不干扰）----
await runtime.setMode("global");
check("scope stats follow scope: global has 2 avatars", runtime.state.avatarCount === 2, String(runtime.state.avatarCount));
await runtime.setMode("character");
check("scope stats follow scope: character has 1 avatar", runtime.state.avatarCount === 1, String(runtime.state.avatarCount));
check("total stats still 3 after scope switches", runtime.state.totalAvatars === 3, String(runtime.state.totalAvatars));

// ---- 4) 手动刷新入口可用 ----
await runtime.refreshTotalStats();
check("manual refresh keeps totals", runtime.state.totalAvatars === 3, String(runtime.state.totalAvatars));
check("manual refresh clears loading", runtime.state.totalStatsLoading === false);

// ---- 5) 原生存储不可用时应标记失败，而不是显示 0 ----
const noStoreCtx = { host: { api: {} }, settings: {}, shell: {}, layout: {}, bubbleBus: {}, i18n: {} } as any;
const rNoStore = getBubbleRuntime(noStoreCtx);
await rNoStore.acquire();
await new Promise((r) => setTimeout(r, 50));
check("no native store -> totalStatsError true", rNoStore.state.totalStatsError === true);
check("no native store -> totals stay 0", rNoStore.state.totalAvatars === 0);
await rNoStore.release();

await runtime.release();
console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
