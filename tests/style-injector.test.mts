import { JSDOM } from "jsdom";
import { buildBubbleCss, createBubbleStyleInjector, STYLE_ELEMENT_ID } from "../src/features/bubble-render/style-injector";
import { STYLE_DEFAULTS } from "../src/features/bubble-render/constants";
import { getBubbleRuntime } from "../src/features/bubble-render/runtime";
import { encodeStoreKey } from "../src/features/bubble-render/store-key";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
(globalThis as any).document = dom.window.document;
(globalThis as any).window = dom.window;
(globalThis as any).MutationObserver = dom.window.MutationObserver;
(globalThis as any).URL.createObjectURL = (b: any) => "blob:" + b.tag;
(globalThis as any).URL.revokeObjectURL = () => {};

// ============================================================
// 1) CSS 编译：配置 → CSS（原来这段整个没移植，所以只存不用）
// ============================================================
{
    const css = buildBubbleCss({ ...STYLE_DEFAULTS });
    const rules = css.split("\n").filter(Boolean);

    check("produces the original 15 rules", rules.length === 15, String(rules.length));
    check("covers both yq- and custom-yq- classes",
        css.includes(".yq-bubble,") && css.includes(".custom-yq-bubble{"));

    // 默认值来自 STYLE_DEFAULTS，必须真的写进 CSS
    check("default avatar size applied", css.includes("width:52px;height:52px"), "");
    check("default shape rounded -> 8px", css.includes("border-radius:8px"), "");
    check("default dialogue font size applied", css.includes("font-size:14.5px"), "");
    check("default global text color applied", css.includes("color:var(--yq-text-color,#d9d9d9)"), "");
    check("dialogue spacing -> padding-y", css.includes("padding:10px 14px"), "");
    check("name size derives from dialogue size",
        css.includes("calc(14.5px * 0.95)"), "");
    check("thought style from YQ defaults",
        css.includes("oblique 18deg") && css.includes("#ff8fc4"), "");
    check("quote marks present", css.includes("201C") && css.includes("201D"), "");

    // 形状映射：circle → 50% / square → 0px
    check("circle -> 50%",
        buildBubbleCss({ ...STYLE_DEFAULTS, style_avatarShape: "circle" }).includes("border-radius:50%"));
    check("square -> 0px",
        buildBubbleCss({ ...STYLE_DEFAULTS, style_avatarShape: "square" }).includes("border-radius:0px"));

    // 用户改配置 → CSS 跟着变
    const bigger = buildBubbleCss({ ...STYLE_DEFAULTS, style_avatarSize: 80, style_globalTextColor: "#ff0000" });
    check("avatar size change applied", bigger.includes("width:80px;height:80px"), "");
    check("text color change applied", bigger.includes("color:var(--yq-text-color,#ff0000)"), "");

    // 越界值夹紧（滑杆范围 32..96 / 12..22）
    check("avatar size clamped to 96", buildBubbleCss({ ...STYLE_DEFAULTS, style_avatarSize: 500 }).includes("width:96px"));
    check("font size clamped to 22", buildBubbleCss({ ...STYLE_DEFAULTS, style_dialogueFontSize: 99 }).includes("font-size:22px"));
    check("font size clamped to 12", buildBubbleCss({ ...STYLE_DEFAULTS, style_dialogueFontSize: 1 }).includes("font-size:12px"));
    // 间距下限 6px（与原脚本 Math.max(6, ...) 一致）
    check("spacing has 6px floor", buildBubbleCss({ ...STYLE_DEFAULTS, style_dialogueSpacing: 0 }).includes("padding:6px 14px"));
    // 坏色值不写进 CSS
    check("invalid color falls back",
        buildBubbleCss({ ...STYLE_DEFAULTS, style_globalTextColor: "red;evil" }).includes("color:var(--yq-text-color,#f0933d)"));

    // 字体：设了就带引号 + 兜底字族；没设就 inherit
    const withFont = buildBubbleCss({ ...STYLE_DEFAULTS, style_dialogueFontFamily: "My Font" });
    check("font family becomes quoted stack", withFont.includes('"My Font", "Source Han Serif SC", serif'), "");
    const noFont = buildBubbleCss({ ...STYLE_DEFAULTS, style_dialogueFontFamily: "" });
    check("empty font family -> inherit", noFont.includes("font-family:inherit"), "");
}

// ============================================================
// 2) 注入器：建一次、之后只更新、dispose 能清掉
// ============================================================
{
    const doc = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>").window.document;
    let style = { ...STYLE_DEFAULTS } as Record<string, unknown>;
    const injector = createBubbleStyleInjector({ documentRef: () => doc, readStyle: () => style });

    injector.apply();
    const first = doc.getElementById(STYLE_ELEMENT_ID);
    check("style element injected", first !== null);
    check("injected into head", first?.parentElement?.tagName === "HEAD", String(first?.parentElement?.tagName));

    injector.apply();
    check("second apply does not duplicate", doc.querySelectorAll("#" + STYLE_ELEMENT_ID).length === 1);

    style = { ...STYLE_DEFAULTS, style_avatarSize: 72 };
    injector.apply();
    check("apply picks up new config",
        doc.getElementById(STYLE_ELEMENT_ID)?.textContent?.includes("width:72px") === true);

    injector.dispose();
    check("dispose removes element", doc.getElementById(STYLE_ELEMENT_ID) === null);
}

// ============================================================
// 3) 接进运行时：面板打开就注入，改配置实时更新，停用就清掉
// ============================================================
{
    const GLOBAL_NS = encodeStoreKey(["bubble", "global"]);
    const tables = new Map<string, Map<string, unknown>>();
    const id = (ns: string, table: string) => ns + "::" + table;
    const store = {
        async listKeys({ namespace, table }: any) { return [...(tables.get(id(namespace, table ?? ""))?.keys() ?? [])]; },
        async tryGetJson({ namespace, table, key }: any) {
            const value = tables.get(id(namespace, table ?? ""))?.get(key);
            return value === undefined ? { found: false } : { found: true, value };
        },
        async listTables() { return []; },
        async setJson({ namespace, table, key, value }: any) {
            const k = id(namespace, table ?? "");
            if (!tables.has(k)) tables.set(k, new Map());
            tables.get(k)!.set(key, value);
        },
        async setBlob() {},
        async deleteJson() {},
        async deleteBlob() {},
    } as any;

    (globalThis as any).window.SillyTavern = {
        getContext: () => ({
            characterId: undefined, name2: "SillyTavern System",
            setExtensionPrompt: () => {},
            eventSource: { on: () => {}, off: () => {} },
            eventTypes: {},
        }),
    };

    const ctx = { host: { api: { extension: { store } } }, settings: {}, shell: {}, layout: {}, bubbleBus: {}, i18n: {} } as any;
    const runtime = getBubbleRuntime(ctx);

    await runtime.acquire();
    check("acquire injects style", document.getElementById(STYLE_ELEMENT_ID) !== null);

    await runtime.config.setStyle("style_avatarSize", 88);
    check("config change updates CSS live",
        document.getElementById(STYLE_ELEMENT_ID)?.textContent?.includes("width:88px") === true);

    await runtime.release();
    check("release removes injected style", document.getElementById(STYLE_ELEMENT_ID) === null);

    // 重新启用后必须还能跟随配置（退订/重订不能断）
    await runtime.acquire();
    check("re-acquire injects again", document.getElementById(STYLE_ELEMENT_ID) !== null);
    await runtime.config.setStyle("style_avatarSize", 40);
    check("re-acquire still follows config",
        document.getElementById(STYLE_ELEMENT_ID)?.textContent?.includes("width:40px") === true);
    await runtime.release();
}

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
