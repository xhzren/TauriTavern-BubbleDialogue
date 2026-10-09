import { JSDOM } from "jsdom";
import { getBubbleRuntime } from "../src/features/bubble-render/runtime";
import { encodeStoreKey } from "../src/features/bubble-render/store-key";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const dom = new JSDOM("<!DOCTYPE html><body></body>");
(globalThis as any).document = dom.window.document;
(globalThis as any).window = dom.window;
(globalThis as any).MutationObserver = dom.window.MutationObserver;

/** 数组下标（会随增删卡而平移，不能当身份） */
const CHAR_A = 0;
const CHAR_B = 1;
/** 稳定身份 = avatar 文件名去掉 .png */
const CHAR_A_STEM = "银麒赎世";
const CHAR_B_STEM = "林知意";
const GLOBAL_NS = encodeStoreKey(["bubble", "global"]);
const nsOf = (id: string) => encodeStoreKey(["bubble", "char", id]);

/** 可变的假 ST 上下文：测试里要模拟「打开另一张角色卡的对话」 */
let currentCharId: number = CHAR_A;
const handlers = new Map<string, Array<(...a: unknown[]) => void>>();
const eventSource = {
    on(event: string, handler: (...a: unknown[]) => void) {
        if (!handlers.has(event)) handlers.set(event, []);
        handlers.get(event)!.push(handler);
    },
    off(event: string, handler: (...a: unknown[]) => void) {
        const list = handlers.get(event) ?? [];
        const i = list.indexOf(handler);
        if (i >= 0) list.splice(i, 1);
    },
    emit(event: string) {
        for (const h of [...(handlers.get(event) ?? [])]) h();
    },
};
(globalThis as any).window.SillyTavern = {
    getContext: () => ({
        characterId: currentCharId,
        name2: "测试角色",
        // 稳定身份来自 avatar 文件名，不是数组下标。
        // characterId 仍用下标（模拟宿主），身份取 characters[下标].avatar。
        characters: [
            { avatar: `${CHAR_A_STEM}.png`, name: "甲卡" },
            { avatar: `${CHAR_B_STEM}.png`, name: "乙卡" },
        ],
        setExtensionPrompt: () => {},
        eventSource,
        eventTypes: {},
    }),
};

/**
 * 内存版原生 store，记录每个 namespace 被 listKeys 的次数。
 * 次数就是「有没有重扫」的直接证据。
 *
 * gateNs：让该 namespace 的 mood 表读取卡住，用于构造「扫描还在进行中」的时序。
 */
function makeStore(options: { gateNs?: string } = {}) {
    const tables = new Map<string, Map<string, unknown>>();
    const reads = new Map<string, number>();
    const id = (ns: string, table: string) => ns + "::" + table;
    const seed = (ns: string, table: string, key: string, value: unknown) => {
        const k = id(ns, table);
        if (!tables.has(k)) tables.set(k, new Map());
        tables.get(k)!.set(key, value);
    };
    seed(GLOBAL_NS, "avatars", "a", { name: "全局甲", fileSize: 100 });
    seed(GLOBAL_NS, "mood", "m", { name: "全局甲", fileSize: 300 });
    seed(nsOf(CHAR_A_STEM), "avatars", "ca", { name: "甲卡头像", fileSize: 50 });
    seed(nsOf(CHAR_A_STEM), "mood", "cm", { name: "甲卡头像", fileSize: 70 });
    seed(nsOf(CHAR_B_STEM), "avatars", "cb", { name: "乙卡头像", fileSize: 60 });

    let gateOpen = false;
    let gateWaiters: Array<() => void> = [];
    let gateTripped = false;

    return {
        reads,
        /** 放行被 gate 卡住的那次读取 */
        releaseGate() {
            gateOpen = true;
            for (const w of gateWaiters) w();
            gateWaiters = [];
        },
        async listKeys({ namespace, table }: { namespace: string; table?: string }) {
            if (options.gateNs && !gateTripped && namespace === options.gateNs && table === "mood") {
                gateTripped = true;
                if (!gateOpen) await new Promise<void>((r) => gateWaiters.push(r));
            }
            reads.set(namespace, (reads.get(namespace) ?? 0) + 1);
            return [...(tables.get(id(namespace, table ?? ""))?.keys() ?? [])];
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

const makeContext = (store: unknown) => ({
    host: { api: { extension: { store } } },
    settings: {}, shell: {}, layout: {}, bubbleBus: {}, i18n: {},
} as any);

const readsOf = (store: any, ns: string) => store.reads.get(ns) ?? 0;
const globalReads = (store: any) => readsOf(store, GLOBAL_NS);
const settle = (ms = 80) => new Promise((r) => setTimeout(r, ms));
/**
 * 全库统计的专属探针：它会同时读「全局 + 当前角色卡」。
 * 只刷新当前范围统计（全局模式）不会碰角色卡 namespace，
 * 所以「角色卡 namespace 的读取次数」只由全库统计推动。
 */
/** 身份按当前打开那张卡的文件名算（下标只用来取 characters 里的当前项） */
const currentStem = () => (currentCharId === CHAR_B ? CHAR_B_STEM : CHAR_A_STEM);
const charProbe = (store: any) => readsOf(store, nsOf(currentStem()));

// ============================================================
// 场景 1：启用时算一次；关开面板、开角色卡、切范围都不再重扫
// ============================================================
{
    const store = makeStore();
    const runtime = getBubbleRuntime(makeContext(store));

    await runtime.acquire();
    await settle();
    check("enable: total stats computed", runtime.state.totalStatsLoading === false);
    check("enable: totals collected", runtime.state.totalAvatars === 2, String(runtime.state.totalAvatars));

    const charBaseline = charProbe(store);
    const globalBaseline = globalReads(store);
    check("enable: total stats covered character scope", charBaseline > 0, String(charBaseline));
    check("enable: global namespace was read", globalBaseline > 0, String(globalBaseline));

    // 关掉面板再打开（release -> acquire）
    await runtime.release();
    await runtime.acquire();
    await settle();
    check("reopen panel: no extra global reads", globalReads(store) === globalBaseline,
        globalBaseline + " -> " + globalReads(store));
    check("reopen panel: no extra total-stats reads", charProbe(store) === charBaseline,
        charBaseline + " -> " + charProbe(store));

    // 打开另一张角色卡的对话（CHAT_CHANGED + charId 变化）
    currentCharId = CHAR_B;
    eventSource.emit("chat_changed");
    await settle();
    check("open another character chat: no native reads for the new card", charProbe(store) === 0,
        String(charProbe(store)));
    check("open another character chat: no extra global reads", globalReads(store) === globalBaseline,
        globalBaseline + " -> " + globalReads(store));
    check("open another character chat: totals unchanged", runtime.state.totalAvatars === 2,
        String(runtime.state.totalAvatars));

    // 多次开关面板（仍处于全局模式）
    for (let i = 0; i < 3; i++) {
        await runtime.release();
        await runtime.acquire();
        await settle(20);
    }
    check("repeated open/close: no extra global reads", globalReads(store) === globalBaseline,
        globalBaseline + " -> " + globalReads(store));
    check("repeated open/close: still no reads for new card", charProbe(store) === 0,
        String(charProbe(store)));

    // 手动刷新：唯一允许的重扫入口
    await runtime.refreshTotalStats();
    await settle();
    check("manual refresh: rescans totals", charProbe(store) > 0, String(charProbe(store)));
    check("manual refresh: clears stale flag", runtime.state.totalStatsStale === false);

    await runtime.release();
    currentCharId = CHAR_A;
}

// ============================================================
// 场景 2：上一次扫描还在进行中时再开面板，不会并发触发第二次全库扫描
// ============================================================
{
    // 对照组：干净地启用一次，看会读几次角色卡范围
    const controlStore = makeStore();
    const controlRuntime = getBubbleRuntime(makeContext(controlStore));
    await controlRuntime.acquire();
    await settle();
    const oneEnableCharReads = charProbe(controlStore);
    check("control: one enable reads character scope", oneEnableCharReads > 0, String(oneEnableCharReads));
    await controlRuntime.release();

    // 实验组：把全库统计卡在角色卡的 mood 表上
    const store = makeStore({ gateNs: nsOf(CHAR_A_STEM) });
    const runtime = getBubbleRuntime(makeContext(store));

    const first = runtime.acquire();
    await settle(60);                 // 此时全库统计已卡在门上
    await runtime.release();          // 关掉面板
    const second = runtime.acquire(); // 再打开：不应开启第二次扫描
    await settle(60);

    store.releaseGate();
    await Promise.all([first, second]);
    await settle(120);

    check("scan in flight: no duplicate total scan",
        charProbe(store) === oneEnableCharReads,
        oneEnableCharReads + " vs " + charProbe(store));
    check("scan in flight: totals still computed", runtime.state.totalAvatars === 2,
        String(runtime.state.totalAvatars));

    await runtime.release();
}

// ============================================================
// 场景 3：导入不自动重扫全库统计，只标记过期
// ============================================================
{
    const store = makeStore();
    const runtime = getBubbleRuntime(makeContext(store));
    await runtime.acquire();
    await settle();
    // 全库统计会同时读角色卡范围；只刷新当前范围统计则不会碰它
    const charBaseline = charProbe(store);
    check("import setup: character scope was read by total stats", charBaseline > 0, String(charBaseline));

    const { zipSync, strToU8 } = await import("fflate");
    const manifest = {
        type: "bubble-character", version: "7.1-zip", exportedAt: new Date().toISOString(),
        charId: CHAR_A, charName: "测试角色", avatars: [], moodAvatars: [], colors: {},
    };
    const zip = zipSync({ "manifest.json": strToU8(JSON.stringify(manifest)) }, { level: 0 });
    await runtime.importZip(zip);
    await settle();

    check("import: marks stats stale", runtime.state.totalStatsStale === true);
    check("import: does not auto rescan totals",
        charProbe(store) === charBaseline,
        charBaseline + " -> " + charProbe(store));

    await runtime.refreshTotalStats();
    await settle();
    check("refresh after import: clears stale", runtime.state.totalStatsStale === false);

    await runtime.release();
}

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
