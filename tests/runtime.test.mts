import { JSDOM } from "jsdom";
import { reactive } from "vue";
import { getBubbleRuntime, splitMoodId, NO_CHARACTER_SENTINEL } from "../src/features/bubble-render/runtime";
import { readFileSync } from "node:fs";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

// 最小 DOM / window 环境
const dom = new JSDOM("<!DOCTYPE html><body></body>");
(globalThis as any).document = dom.window.document;
(globalThis as any).window = dom.window;
(globalThis as any).MutationObserver = dom.window.MutationObserver;

// 假的 ST 上下文：无角色卡（name2 = SillyTavern System）
let injected = 0;
const stContext = {
    characterId: undefined,
    name2: NO_CHARACTER_SENTINEL,
    setExtensionPrompt: () => { injected += 1; },
    eventSource: { on: () => {}, off: () => {} },
    eventTypes: {},
};
(globalThis as any).window.SillyTavern = { getContext: () => stContext };

function makeContext() {
    return { host: { api: {} }, settings: {}, shell: {}, layout: {}, bubbleBus: {}, i18n: {} } as any;
}

// --- 1) 四个页面模块（modules.ts 引用了 .vue，这里做文本级校验避免加载 .vue）---
const modulesSrc = readFileSync("src/features/bubble-render/modules.ts", "utf8");
const ids = [...modulesSrc.matchAll(/^\s*"(bubble-[a-z]+)",$/gm)].map((m) => m[1]);
check("4 page modules declared", ids.length === 4, ids.join(","));
check("module ids unique", new Set(ids).size === ids.length, ids.join(","));
const orders = [...modulesSrc.matchAll(/^\s*(\d+),\n\s*\w+,$/gm)].map((m) => Number(m[1]));
check("orders ascending", orders.length === 4 && orders.every((o, i, a) => i === 0 || a[i - 1] < o), orders.join(","));
check("all pages use bubble-dialogue area", (modulesSrc.match(/area: "bubble-dialogue"/g) || []).length === 1,
    "定义处只应出现一次（page() 工厂内）");
check("all four pages registered", ["AvatarsPage","StylePage","MoodPage","StoragePage"].every((c) => modulesSrc.includes(c)));

// --- 2) 同一 context 复用同一运行时 ---
const ctx = makeContext();
const r1 = getBubbleRuntime(ctx);
const r2 = getBubbleRuntime(ctx);
check("same context -> same runtime instance", r1 === r2);
const other = makeContext();
check("different context -> different runtime", getBubbleRuntime(other) !== r1);

// --- 3) 无角色卡：回落全局 ---
check("no character card detected", r1.state.hasCharacterCard === false);
check("char name is sentinel", r1.state.charName === NO_CHARACTER_SENTINEL, r1.state.charName);
check("charId is null", r1.state.charId === null);

// --- 4) 引用计数 ---
await r1.acquire();
// 注入是异步 fire-and-forget，等一拍再断言
await new Promise((r) => setTimeout(r, 30));
check("acquire injects prompt", injected > 0, String(injected));
check("first acquire is active (injected flag)", r1.state.injected === true);

const injectedAfterFirst = injected;
await r1.acquire();
await r1.acquire();
await r1.acquire();
check("extra acquires do not re-run bootstrap", injected === injectedAfterFirst, `${injectedAfterFirst} -> ${injected}`);

await r1.release();
await r1.release();
await r1.release();
check("still active while refCount > 0", r1.state.injected === true);

await r1.release();
check("fully released -> teardown ran", r1.state.injected === false);

// --- 5) 重复释放不应变成负数 / 崩溃 ---
await r1.release();
check("over-release is safe", r1.state.injected === false);

// --- 6) 默认后端固定为原生，且原生不可用时不改写状态 ---
check("default backend is native", r1.state.backend === "native", r1.state.backend);
check("native store absent -> nativeAvailable false", r1.state.nativeAvailable === false);
check("fallback does NOT silently switch backend", r1.state.backend === "native", r1.state.backend);

// 提供原生 store 时应识别为可用
const withStore = makeContext();
(withStore.host.api as any).extension = { store: { listKeys: async () => [] } };
const r3 = getBubbleRuntime(withStore);
check("native store present -> nativeAvailable true", r3.state.nativeAvailable === true);

// --- 7) 统计加载态 ---
// r3 是新实例、尚未 acquire，用它验证初始态
check("statsLoading starts true (fresh runtime)", r3.state.statsLoading === true, String(r3.state.statsLoading));
await r3.acquire();
check("stats computed -> statsLoading false", r3.state.statsLoading === false);
// 已初始化过的实例再次 acquire 也不应卡在 loading
await r1.acquire();
check("re-acquire keeps statsLoading false", r1.state.statsLoading === false);
await r1.release();


// --- 8) moodId 拆解 ---
const parts = splitMoodId("mood-joy__outfit-naked__act-vaginal");
check("splitMoodId mood", parts.mood === "mood-joy", parts.mood);
check("splitMoodId outfit", parts.outfit === "outfit-naked");
check("splitMoodId act", parts.act === "act-vaginal");
const partial = splitMoodId("mood-anger");
check("splitMoodId tolerates short id", partial.mood === "mood-anger" && partial.outfit === "" && partial.act === "");

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
