import { createPromptInjector } from "../src/features/bubble-render/prompt-injector";
import { DEFAULT_FORMAT_RULE } from "../src/features/bubble-render/constants";

let fail = 0;
function check(name: string, cond: boolean, extra = "") {
    if (!cond) { fail++; console.log("FAIL", name, extra); }
    else console.log("ok  ", name, extra);
}

let captured: any = null;
const injector = createPromptInjector({
    setExtensionPrompt: (name, content, position, depth, scan, role) => {
        captured = { name, content, position, depth, scan, role };
    },
    // 模拟存储不可用：应回退内置常量，绝不放弃注入
    readFormatRule: async () => { throw new Error("db down"); },
    readMoodGroups: async () => { throw new Error("db down"); },
    readMoodTemplate: async () => { throw new Error("db down"); },
});

injector.apply();
await new Promise(r => setTimeout(r, 20));
check("injected despite storage failure", captured !== null);
check("uses default format rule", captured.content.includes(DEFAULT_FORMAT_RULE.slice(0, 40)));
check("contains @bubble spec", captured.content.includes("@bubble:角色名|情绪|[对白]|服装|动作"));
check("position/depth/scan/role correct",
    captured.position === 0 && captured.depth === 0 && captured.scan === false && captured.role === 0,
    JSON.stringify({p:captured.position,d:captured.depth,s:captured.scan,r:captured.role}));
check("mood template retained", captured.content.includes("情绪字段"));

// 自定义词表替换占位符
const custom = createPromptInjector({
    setExtensionPrompt: (n, c) => { captured = { content: c }; },
    readFormatRule: async () => "CUSTOM_RULE",
    readMoodGroups: async () => [{ id: "mood-x", label: "自定义", color: "#111111", words: ["词甲", "词乙"] }],
    readMoodTemplate: async () => "分组：{{mood_groups}}|END",
});
custom.apply();
await new Promise(r => setTimeout(r, 20));
check("custom rule used", captured.content.startsWith("CUSTOM_RULE"));
check("placeholder replaced", captured.content.includes("自定义组：词甲、词乙"), captured.content.slice(0, 80));
check("no leftover placeholder", !captured.content.includes("{{mood_groups}}"));

// 缓存失效
custom.invalidate();
custom.apply();
await new Promise(r => setTimeout(r, 20));
check("reinject after invalidate works", captured.content.startsWith("CUSTOM_RULE"));

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
