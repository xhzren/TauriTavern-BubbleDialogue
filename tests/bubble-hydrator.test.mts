import { JSDOM } from "jsdom";
import { createMoodResolver, createFallbackMoodResolver } from "../src/features/bubble-render/mood-resolver";
import { createBubbleHydrator } from "../src/features/bubble-render/bubble-hydrator";
import { DEFAULT_MOOD_WORD_GROUPS } from "../src/features/bubble-render/constants";

let fail = 0;
function check(name: string, cond: boolean, extra = "") {
    if (!cond) { fail++; console.log("FAIL", name, extra); }
    else console.log("ok  ", name, extra);
}

const resolve = createMoodResolver(DEFAULT_MOOD_WORD_GROUPS);

// 真实用例：脚本别名表里出现的情绪
check("exact label 喜悦", resolve("喜悦")?.id === "mood-joy", resolve("喜悦")?.id ?? "null");
check("exact id mood-joy", resolve("mood-joy")?.id === "mood-joy");
check("synonym 开心 -> joy", resolve("开心")?.id === "mood-joy", resolve("开心")?.id ?? "null");
check("synonym 恼火 -> anger", resolve("恼火")?.id === "mood-anger", resolve("恼火")?.id ?? "null");
check("synonym 心动 -> love", resolve("心动")?.id === "mood-love", resolve("心动")?.id ?? "null");
check("substring 有点心动 -> love", resolve("有点心动呢")?.id === "mood-love", resolve("有点心动呢")?.id ?? "null");
check("unknown falls back to calm", resolve("喵喵喵")?.id === "mood-calm", resolve("喵喵喵")?.id ?? "null");
check("empty -> null", resolve("") === null);

const fb = createFallbackMoodResolver();
check("fallback resolver works", fb("愤怒")?.id === "mood-anger", fb("愤怒")?.id ?? "null");

// ---- hydration 用真实 DOM ----
const dom = new JSDOM(`<!DOCTYPE html><body>
<div class="yq-bubble" data-name="林知意" data-mood="心动" data-outfit="outfit-casual" data-act="act-sfw">
  <img class="yq-bubble-avatar" data-lazy-mood="心动" />
  <div class="yq-bubble-text">嗯...再深一点...</div>
</div>
<div class="yq-bubble" data-name="城崎诺亚" data-mood="紧张">
  <img class="yq-bubble-avatar" data-lazy-mood="紧张" />
  <div class="yq-bubble-text">*我真的能做好吗？*</div>
</div>
</body>`);
const doc = dom.window.document;
(globalThis as any).document = doc;

const calls: string[] = [];
const hydrator = createBubbleHydrator({
    documentRef: () => doc as any,
    resolveAvatar: async (req) => { calls.push(req.name); return "blob:fake/" + req.name; },
    resolveCachedAvatar: () => null,
    resolveMoodGroup: (m) => resolve(m),
});

hydrator.hydrateAll();

const b1 = doc.querySelector(".yq-bubble") as any;
check("bubble marked hydrated", b1.dataset.yqHydrated === "1");
check("mood color applied", b1.style.getPropertyValue("--yq-mood-color") === "#ec4899", b1.style.getPropertyValue("--yq-mood-color"));
await new Promise(r => setTimeout(r, 10));
const img1 = b1.querySelector("img") as any;
check("avatar src filled", decodeURIComponent(String(img1.src)).includes("林知意"), decodeURIComponent(String(img1.src)));
check("placeholder attr removed", !img1.hasAttribute("data-lazy-mood"));

const b2 = doc.querySelectorAll(".yq-bubble")[1] as any;
const text2 = b2.querySelector(".yq-bubble-text") as any;
check("thought rendered as <em>", text2.innerHTML.includes("<em>"), text2.innerHTML);
check("thought class applied", text2.classList.contains("yq-bubble-text-thought"), text2.className);
check("dialogue class on b1", (b1.querySelector(".yq-bubble-text") as any).classList.contains("yq-bubble-text-dialogue"));

// 幂等：第二次不应重复调用 resolver
const before = calls.length;
hydrator.hydrateAll();
check("idempotent (no re-resolve)", calls.length === before, `${before} -> ${calls.length}`);

// refresh 后应重新解析
hydrator.refresh();
await new Promise(r => setTimeout(r, 10));
hydrator.hydrateAll();
check("refresh forces re-resolve", calls.length > before, `${before} -> ${calls.length}`);

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
