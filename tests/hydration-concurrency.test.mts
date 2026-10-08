import { JSDOM } from "jsdom";
import { createBubbleHydrator, RESOLVE_CONCURRENCY } from "../src/features/bubble-render/bubble-hydrator";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

(globalThis as any).URL.createObjectURL = (b: any) => "blob:" + b.tag;
(globalThis as any).URL.revokeObjectURL = () => {};

/** 造 n 个带占位图的气泡 */
function makeDoc(n: number) {
    const dom = new JSDOM("<!DOCTYPE html><body></body>");
    const doc = dom.window.document;
    for (let i = 0; i < n; i += 1) {
        const b = doc.createElement("div");
        b.className = "yq-bubble";
        b.setAttribute("data-name", "角色" + i);
        b.setAttribute("data-mood", "喜悦");
        b.setAttribute("data-outfit", "outfit-casual");
        b.setAttribute("data-act", "act-sfw");
        b.innerHTML = '<img class="yq-bubble-avatar" data-lazy-mood="x" src="data:image/svg+xml;utf8,<svg/>" />' +
            '<div class="yq-bubble-text">台词' + i + '</div>';
        doc.body.appendChild(b);
    }
    return { dom, doc };
}

const BUBBLES = 60;

// ============================================================
// 1) 并发不能超过上限，而且最终全部水合（不能饿死）
// ============================================================
{
    const { doc } = makeDoc(BUBBLES);
    let inFlight = 0;
    let maxInFlight = 0;
    let calls = 0;

    const hydrator = createBubbleHydrator({
        documentRef: () => doc as any,
        resolveAvatar: async (req) => {
            calls += 1;
            inFlight += 1;
            maxInFlight = Math.max(maxInFlight, inFlight);
            await new Promise((r) => setTimeout(r, 5));
            inFlight -= 1;
            return "blob:" + req.name;
        },
        resolveCachedAvatar: () => null,
        resolveMoodGroup: () => null,
    });

    hydrator.hydrateAll();
    // 60 个 / 8 并发 × 5ms ≈ 40ms，留足余量
    await new Promise((r) => setTimeout(r, 800));

    console.log("   并发上限 =", RESOLVE_CONCURRENCY, "｜实测峰值 =", maxInFlight, "｜解析次数 =", calls);
    check("never exceeds the concurrency cap", maxInFlight <= RESOLVE_CONCURRENCY, String(maxInFlight));
    check("cap actually engaged (not serial)", maxInFlight > 1, String(maxInFlight));
    check("all bubbles resolved once", calls === BUBBLES, String(calls));
    const filled = [...doc.querySelectorAll("img.yq-bubble-avatar")].filter((img) => String(img.getAttribute("src")).startsWith("blob:"));
    check("all bubbles eventually hydrated", filled.length === BUBBLES, String(filled.length));
}

// ============================================================
// 2) 防抖重扫不能把同一个气泡重复排队
// ============================================================
{
    const { doc } = makeDoc(30);
    let calls = 0;
    const hydrator = createBubbleHydrator({
        documentRef: () => doc as any,
        resolveAvatar: async () => {
            calls += 1;
            await new Promise((r) => setTimeout(r, 10));
            return "blob:x";
        },
        resolveCachedAvatar: () => null,
        resolveMoodGroup: () => null,
    });

    // 模拟防抖期间连续多次扫描（流式/滚动都会这样）
    hydrator.hydrateAll();
    hydrator.hydrateAll();
    hydrator.hydrateAll();
    await new Promise((r) => setTimeout(r, 400));

    check("repeated scans do not double-queue", calls === 30, String(calls));
}

// ============================================================
// 3) 同步缓存命中必须「立即」填图，不能进队列
//    流式输出靠这条避免空帧闪烁，不能被并发限制拖慢
// ============================================================
{
    const { doc } = makeDoc(5);
    const hydrator = createBubbleHydrator({
        documentRef: () => doc as any,
        resolveAvatar: async () => "blob:slow",
        resolveCachedAvatar: (req) => "blob:cached-" + req.name,
        resolveMoodGroup: () => null,
    });

    hydrator.hydrateAll();
    // 不给任何 await 的机会，立刻检查
    const images = [...doc.querySelectorAll("img.yq-bubble-avatar")] as HTMLImageElement[];
    const immediate = images.filter((img) => String(img.getAttribute("src")).startsWith("blob:cached-"));
    check("cache hits fill synchronously (no flicker)", immediate.length === 5, String(immediate.length));
}

// ============================================================
// 4) 单个气泡解析失败不能卡住队列
// ============================================================
{
    const { doc } = makeDoc(20);
    let calls = 0;
    const hydrator = createBubbleHydrator({
        documentRef: () => doc as any,
        resolveAvatar: async (req) => {
            calls += 1;
            if (req.name === "角色3") throw new Error("boom");
            await new Promise((r) => setTimeout(r, 3));
            return "blob:" + req.name;
        },
        resolveCachedAvatar: () => null,
        resolveMoodGroup: () => null,
    });

    hydrator.hydrateAll();
    await new Promise((r) => setTimeout(r, 500));

    check("failed bubble does not stall the queue", calls === 20, String(calls));
    const filled = [...doc.querySelectorAll("img.yq-bubble-avatar")].filter((img) => String(img.getAttribute("src")).startsWith("blob:"));
    check("other bubbles still hydrated", filled.length === 19, String(filled.length));
}

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
