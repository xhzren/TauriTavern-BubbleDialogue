import { JSDOM } from 'jsdom';
import { getBubbleRuntime } from '../src/features/bubble-render/runtime';
import { encodeStoreKey } from '../src/features/bubble-render/store-key';

let fail = 0;
const check = (n: string, c: boolean, e = '') => { if (!c) { fail++; console.log('FAIL', n, e); } else console.log('ok  ', n, e); };

const dom = new JSDOM('<!DOCTYPE html><body></body>');
(globalThis as any).document = dom.window.document;
(globalThis as any).window = dom.window;
(globalThis as any).MutationObserver = dom.window.MutationObserver;

const CHAR_ID = '1921';
(globalThis as any).window.SillyTavern = {
    getContext: () => ({
        characterId: CHAR_ID,
        name2: '测试角色',
        setExtensionPrompt: () => {},
        eventSource: { on: () => {}, off: () => {} },
        eventTypes: {},
    }),
};

const GLOBAL_NS = encodeStoreKey(['bubble', 'global']);
const CHAR_NS = encodeStoreKey(['bubble', 'char', CHAR_ID]);

function makeStore() {
    const tables = new Map<string, Map<string, unknown>>();
    const scans = new Map<string, number>();
    const id = (ns: string, table: string) => ns + '::' + table;
    const seed = (ns: string, table: string, key: string, value: unknown) => {
        const k = id(ns, table);
        if (!tables.has(k)) tables.set(k, new Map());
        tables.get(k)!.set(key, value);
    };
    seed(GLOBAL_NS, 'avatars', 'a', { name: '全局甲', fileSize: 100 });
    seed(GLOBAL_NS, 'avatars', 'b', { name: '全局乙', fileSize: 200 });
    seed(GLOBAL_NS, 'mood', 'm', { name: '全局甲', fileSize: 300 });
    seed(GLOBAL_NS, 'cg_groups', 'g1', { group: '全局CG', count: 1, imageUrls: [], albumUrl: '' });
    seed(CHAR_NS, 'avatars', 'c', { name: '卡甲', fileSize: 50 });

    return {
        scans,
        async listKeys({ namespace, table }: { namespace: string; table?: string }) {
            scans.set(namespace, (scans.get(namespace) ?? 0) + 1);
            return [...(tables.get(id(namespace, table ?? ''))?.keys() ?? [])];
        },
        async tryGetJson({ namespace, table, key }: { namespace: string; table?: string; key: string }) {
            const value = tables.get(id(namespace, table ?? ''))?.get(key);
            return value === undefined ? { found: false } : { found: true, value };
        },
        async listTables() { return []; },
        async setJson({ namespace, table, key, value }: any) {
            const k = id(namespace, table ?? '');
            if (!tables.has(k)) tables.set(k, new Map());
            tables.get(k)!.set(key, value);
        },
        async setBlob({ namespace, table, key }: any) {
            const k = id(namespace, table ?? '');
            if (!tables.has(k)) tables.set(k, new Map());
            tables.get(k)!.set(key, { fileSize: 64 });
        },
        async deleteJson() {},
        async deleteBlob() {},
    } as any;
}

const store = makeStore();
const ctx = { host: { api: { extension: { store } } }, settings: {}, shell: {}, layout: {}, bubbleBus: {}, i18n: {} } as any;
const runtime = getBubbleRuntime(ctx);

// ---- 1) 首次打开面板：真的加载 ----
await runtime.acquire();
await new Promise((r) => setTimeout(r, 50));
check('stats finished after first open', runtime.state.statsLoading === false);
const scansAfterFirstOpen = store.scans.get(GLOBAL_NS) ?? 0;
check('global scanned on first open', scansAfterFirstOpen > 0, String(scansAfterFirstOpen));

// ---- 2) 模拟关掉面板再打开：release + acquire ----
await runtime.release();
const scansBeforeReopen = store.scans.get(GLOBAL_NS) ?? 0;
await runtime.acquire();
// 关键：这次不应进入加载态
check('reopen does NOT show loading', runtime.state.statsLoading === false);
const scansAfterReopen = store.scans.get(GLOBAL_NS) ?? 0;
check('reopen does NOT rescan', scansAfterReopen === scansBeforeReopen,
    scansBeforeReopen + ' -> ' + scansAfterReopen);
check('reopen keeps avatar count', runtime.state.avatarCount === 2, String(runtime.state.avatarCount));

// ---- 3) 反复开关多次都不重扫 ----
for (let i = 0; i < 3; i++) {
    await runtime.release();
    await runtime.acquire();
}
const scansAfterMany = store.scans.get(GLOBAL_NS) ?? 0;
check('repeated close/open does NOT rescan', scansAfterMany === scansBeforeReopen,
    scansBeforeReopen + ' -> ' + scansAfterMany);

// ---- 4) CG 分组也缓存：重开不重拉 ----
const cg1 = await runtime.listCgGroups();
const scansAfterCg1 = store.scans.get(GLOBAL_NS) ?? 0;
const cg2 = await runtime.listCgGroups();
const scansAfterCg2 = store.scans.get(GLOBAL_NS) ?? 0;
check('cg groups cached', scansAfterCg2 === scansAfterCg1, scansAfterCg1 + ' -> ' + scansAfterCg2);
check('cg groups still returned', cg1.length === cg2.length && cg1.length > 0, String(cg1.length));

// ---- 5) 全库统计不因重开面板而重算 ----
await runtime.release();
await runtime.acquire();
await new Promise((r) => setTimeout(r, 50));
check('total stats still loaded after reopen', runtime.state.totalStatsLoading === false);
check('total avatars preserved after reopen', runtime.state.totalAvatars === 3, String(runtime.state.totalAvatars));

// ---- 6) 写入后统计应更新（防缓存做成永不更新的死数据）----
await runtime.setMode('character');
const beforeWrite = runtime.state.avatarCount;
await runtime.addAvatar('新卡头像', new Blob(['x'.repeat(64)], { type: 'image/webp' }));
check('writing updates count even with cache', runtime.state.avatarCount === beforeWrite + 1,
    beforeWrite + ' -> ' + runtime.state.avatarCount);

// ---- 7) 手动强制刷新仍然可用 ----
const scansBeforeForce = store.scans.get(GLOBAL_NS) ?? 0;
await runtime.setMode('global');
await runtime.refreshScopeStats();
const scansAfterForce = store.scans.get(GLOBAL_NS) ?? 0;
check('manual refresh still forces rescan', scansAfterForce > scansBeforeForce,
    scansBeforeForce + ' -> ' + scansAfterForce);

await runtime.release();
console.log(fail === 0 ? '\nALL PASS' : '\n' + fail + ' FAILED');
process.exit(fail === 0 ? 0 : 1);
