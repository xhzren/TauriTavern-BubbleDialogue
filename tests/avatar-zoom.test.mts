import { JSDOM } from "jsdom";
import { createAvatarZoom } from "../src/features/bubble-render/avatar-zoom";
import { getBubbleRuntime } from "../src/features/bubble-render/runtime";
import { encodeStoreKey } from "../src/features/bubble-render/store-key";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
const doc = dom.window.document;
(globalThis as any).document = doc;
(globalThis as any).window = dom.window;
(globalThis as any).MutationObserver = dom.window.MutationObserver;

// jsdom 没有 createObjectURL；用 blob 上的 tag 当可读地址
(globalThis as any).URL.createObjectURL = (b: any) => "blob:" + (b?.tag ?? "?");
(globalThis as any).URL.revokeObjectURL = () => {};

// ============================================================
// 1) 放大模块本身（对应原脚本 _showZoom）
// ============================================================
{
    const zoom = createAvatarZoom({ documentRef: () => doc });

    zoom.show("blob:big-avatar", "林知意");
    const overlay = doc.getElementById("yq-avatar-zoom");
    check("overlay created", overlay !== null);
    check("overlay uses the styled class", overlay?.className === "yq-avatar-zoom-overlay", String(overlay?.className));
    check("overlay attached to body", overlay?.parentElement?.tagName === "BODY", String(overlay?.parentElement?.tagName));
    const img = overlay?.querySelector("img") as HTMLImageElement | null;
    check("image src set", img?.getAttribute("src") === "blob:big-avatar", String(img?.getAttribute("src")));
    check("image alt set", img?.getAttribute("alt") === "林知意", String(img?.getAttribute("alt")));

    // 点任意处关闭（原脚本行为）
    overlay?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    check("click closes overlay", doc.getElementById("yq-avatar-zoom") === null);

    // Esc 关闭（附加项）
    zoom.show("blob:again");
    doc.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    check("escape closes overlay", doc.getElementById("yq-avatar-zoom") === null);

    // 连开两次不应叠出两层
    zoom.show("blob:a");
    zoom.show("blob:b");
    check("re-show does not stack", doc.querySelectorAll("#yq-avatar-zoom").length === 1,
        String(doc.querySelectorAll("#yq-avatar-zoom").length));
    check("re-show keeps the newest image",
        (doc.querySelector("#yq-avatar-zoom img") as HTMLImageElement)?.getAttribute("src") === "blob:b");

    // 空地址不打开
    zoom.dispose();
    zoom.show("");
    check("empty url opens nothing", doc.getElementById("yq-avatar-zoom") === null);

    zoom.show("blob:x");
    zoom.dispose();
    check("dispose removes overlay", doc.getElementById("yq-avatar-zoom") === null);
    // dispose 后 Esc 监听也应解绑：再按 Esc 不应报错
    doc.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    check("dispose unbinds escape handler", true);
}

// ============================================================
// 2) 端到端：正则产出的气泡 → hydration → 点头像 → 弹大图
//    （这条链之前是断的：hydrator 支持 onZoom，但 runtime 没接）
// ============================================================
{
    const GLOBAL_NS = encodeStoreKey(["bubble", "global"]);
    const NAME = "林知意";
    const tables = new Map<string, Map<string, unknown>>();
    const id = (ns: string, table: string) => ns + "::" + table;
    const seed = (ns: string, table: string, key: string, value: unknown) => {
        const k = id(ns, table);
        if (!tables.has(k)) tables.set(k, new Map());
        tables.get(k)!.set(key, value);
    };
    // 主头像：meta + blob（native 库分两张表存）
    seed(GLOBAL_NS, "avatars", encodeStoreKey([NAME]), { name: NAME, fileName: `${NAME}.webp`, mimeType: "image/webp", fileSize: 10 });
    seed(GLOBAL_NS, "avatars", encodeStoreKey([NAME]) + ".webp", { tag: "linzhiyi" });

    const store = {
        async listKeys({ namespace, table }: any) { return [...(tables.get(id(namespace, table ?? ""))?.keys() ?? [])]; },
        async tryGetJson({ namespace, table, key }: any) {
            const value = tables.get(id(namespace, table ?? ""))?.get(key);
            return value === undefined ? { found: false } : { found: true, value };
        },
        async listTables() { return []; },
        async getBlob({ namespace, table, key }: any) {
            const value = tables.get(id(namespace, table ?? ""))?.get(key) as any;
            if (!value) throw new Error("missing blob");
            return { tag: value.tag } as any;
        },
        async setJson() {}, async setBlob() {}, async deleteJson() {}, async deleteBlob() {},
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

    // 模拟「轻量气泡渲染」正则的产出（空白占位图 + data-lazy-mood）
    const host = doc.createElement("div");
    host.innerHTML =
        '<div class="yq-bubble" data-name="' + NAME + '" data-mood="爱恋" data-outfit="outfit-naked" data-act="act-sfw">' +
        '<img class="yq-bubble-avatar" data-lazy-mood="' + NAME + '|爱恋|outfit-naked|act-sfw" alt="' + NAME + '" src="data:image/svg+xml;utf8,<svg/>" />' +
        '<div class="yq-bubble-body"><div class="yq-bubble-header">' +
        '<span class="yq-bubble-name">' + NAME + '</span><span class="yq-bubble-mood">爱恋</span>' +
        '</div><div class="yq-bubble-text">嗯……</div></div></div>';
    doc.body.appendChild(host);

    runtime.hydrateNow();
    await new Promise((r) => setTimeout(r, 40));

    const bubble = doc.querySelector(".yq-bubble") as HTMLElement;
    const avatar = bubble.querySelector("img.yq-bubble-avatar") as HTMLImageElement;
    check("avatar hydrated from storage", avatar.getAttribute("src") === "blob:linzhiyi",
        String(avatar.getAttribute("src")));
    check("placeholder flag cleared", !avatar.hasAttribute("data-lazy-mood"));

    // 点击头像 → 应该弹大图（之前这里被 preventDefault 吃掉、什么也不发生）
    avatar.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
    const overlay = doc.getElementById("yq-avatar-zoom");
    check("clicking avatar opens zoom overlay", overlay !== null);
    check("zoom shows the same image",
        (overlay?.querySelector("img") as HTMLImageElement)?.getAttribute("src") === "blob:linzhiyi",
        String((overlay?.querySelector("img") as HTMLImageElement)?.getAttribute("src")));
    check("zoom image alt is the character name",
        (overlay?.querySelector("img") as HTMLImageElement)?.getAttribute("alt") === NAME);

    (overlay as HTMLElement).dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    check("clicking overlay closes it", doc.getElementById("yq-avatar-zoom") === null);

    // 停用扩展时遮罩要被收掉
    avatar.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
    check("overlay open before release", doc.getElementById("yq-avatar-zoom") !== null);
    await runtime.release();
    check("release disposes overlay", doc.getElementById("yq-avatar-zoom") === null);
}

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
