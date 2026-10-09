import { JSDOM } from "jsdom";
import { unzipSync, strFromU8, zipSync, strToU8 } from "fflate";
import { getBubbleRuntime } from "../src/features/bubble-render/runtime";
import { encodeStoreKey } from "../src/features/bubble-render/store-key";
import { buildColorConfigKey } from "../src/features/bubble-render/key-format";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
(globalThis as any).document = dom.window.document;
(globalThis as any).window = dom.window;
(globalThis as any).MutationObserver = dom.window.MutationObserver;
(globalThis as any).URL.createObjectURL = (b: any) => "blob:" + (b?.tag ?? "blob");
(globalThis as any).URL.revokeObjectURL = () => {};

/** 稳定身份 = avatar 文件名去掉 .png（导出包的 charId 也会用它） */
const CHAR_ID = "银麒赎世";
const CHAR_INDEX = 0;
(globalThis as any).window.SillyTavern = {
    getContext: () => ({
        characterId: String(CHAR_INDEX), name2: "测试角色",
        characters: [{ avatar: `${CHAR_ID}.png`, name: "测试角色" }],
        setExtensionPrompt: () => {},
        eventSource: { on: () => {}, off: () => {} },
        eventTypes: {},
    }),
};

const GLOBAL_NS = encodeStoreKey(["bubble", "global"]);
const CHAR_NS = encodeStoreKey(["bubble", "char", CHAR_ID]);

function makeStore() {
    const kv = new Map<string, any>();
    const blobs = new Map<string, any>();
    const id = (ns: string, table: string, key: string) => `${ns}::${table}::${key}`;
    // 假的 blob：导出会调 arrayBuffer()，必须给上
    const fakeBlob = (tag: string) => ({ tag, arrayBuffer: async () => new TextEncoder().encode(tag).buffer });
    const seed = (ns: string, name: string, tag: string) => {
        kv.set(id(ns, "avatars", encodeStoreKey([name])), { name, alias: name, fileName: `${name}.webp`, mimeType: "image/webp", fileSize: 10 });
        blobs.set(id(ns, "avatars", encodeStoreKey([name]) + ".webp"), fakeBlob(tag));
    };
    seed(GLOBAL_NS, "全局甲", "g1");
    seed(GLOBAL_NS, "全局乙", "g2");
    seed(CHAR_NS, "本卡甲", "c1");

    return {
        kv, blobs,
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
            if (!v) throw new Error("Not found");
            return v;
        },
        async setJson({ namespace, table, key, value }: any) { kv.set(id(namespace, table ?? "main", key), value); },
        async setBlob({ namespace, table, key, data }: any) { blobs.set(id(namespace, table ?? "main", key), data); },
        async deleteJson({ namespace, table, key }: any) { kv.delete(id(namespace, table ?? "main", key)); },
        async deleteBlob({ namespace, table, key }: any) { blobs.delete(id(namespace, table ?? "main", key)); },
        async listTables() { return []; },
    } as any;
}

const makeContext = (store: unknown) => ({ host: { api: { extension: { store } } }, settings: {}, shell: {}, layout: {}, bubbleBus: {}, i18n: {} } as any);

const manifestOf = (zip: Uint8Array) => JSON.parse(strFromU8(unzipSync(zip)["manifest.json"]));

// ============================================================
// 1) 导出跟着当前范围走
// ============================================================
{
    const store = makeStore();
    const runtime = getBubbleRuntime(makeContext(store));
    await runtime.acquire();

    // 默认「全局」：只导全局那两张，manifest 写 _global_
    const globalZip = await runtime.exportZip();
    const globalManifest = manifestOf(globalZip);
    check("export global: charId is _global_", globalManifest.charId === "_global_", String(globalManifest.charId));
    check("export global: only global avatars",
        globalManifest.avatars.map((a: any) => a.name).sort().join(",") === "全局乙,全局甲",
        globalManifest.avatars.map((a: any) => a.name).join(","));

    // 切「按角色卡」：只导本卡的，manifest 写卡 id + 卡名
    await runtime.setMode("character");
    const charZip = await runtime.exportZip();
    const charManifest = manifestOf(charZip);
    check("export character: charId is the card id", charManifest.charId === CHAR_ID, String(charManifest.charId));
    check("export character: charName is the card name", charManifest.charName === "测试角色", String(charManifest.charName));
    check("export character: only this card's avatars",
        charManifest.avatars.map((a: any) => a.name).join(",") === "本卡甲",
        charManifest.avatars.map((a: any) => a.name).join(","));
    await runtime.release();
}

// ============================================================
// 2) 导入跟着当前范围走（配色写进对应范围的键）
// ============================================================
{
    const store = makeStore();
    const runtime = getBubbleRuntime(makeContext(store));
    await runtime.acquire();

    const zipWith = (name: string, color: string) => zipSync({
        "manifest.json": strToU8(JSON.stringify({
            type: "bubble-character", version: "7.1-zip", exportedAt: new Date().toISOString(),
            charId: CHAR_ID, charName: "测试角色", avatars: [], moodAvatars: [], colors: { [name]: color },
        })),
    }, { level: 0 });

    // 全局范围导入 → 配色写进 color__global___
    await runtime.importZip(zipWith("全局甲", "#ff0000"));
    const globalColorKey = encodeStoreKey([buildColorConfigKey(null, "全局甲")]);
    check("import global: color written to global key",
        store.kv.get(`${GLOBAL_NS}::config::${globalColorKey}`) === "#ff0000",
        String(store.kv.get(`${GLOBAL_NS}::config::${globalColorKey}`)));
    check("import global: color visible in global scope",
        runtime.state.avatarColors["全局甲"] === "#ff0000", String(runtime.state.avatarColors["全局甲"]));

    // 角色卡范围导入 → 配色写进 color_<charId>___
    await runtime.setMode("character");
    await runtime.importZip(zipWith("本卡甲", "#00ff00"));
    const charColorKey = encodeStoreKey([buildColorConfigKey(CHAR_ID, "本卡甲")]);
    check("import character: color written to card key",
        store.kv.get(`${CHAR_NS}::config::${charColorKey}`) === "#00ff00",
        String(store.kv.get(`${CHAR_NS}::config::${charColorKey}`)));
    check("import character: color visible in card scope",
        runtime.state.avatarColors["本卡甲"] === "#00ff00", String(runtime.state.avatarColors["本卡甲"]));

    // 切回全局时读到的还是全局那份，且不带出角色卡的颜色
    await runtime.setMode("global");
    check("color reload follows scope (global color back)",
        runtime.state.avatarColors["全局甲"] === "#ff0000", String(runtime.state.avatarColors["全局甲"]));
    check("color reload follows scope (card color not leaked)",
        runtime.state.avatarColors["本卡甲"] === undefined, String(runtime.state.avatarColors["本卡甲"]));
    await runtime.release();
}

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
