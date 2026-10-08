import { STYLE_DEFAULTS, DEFAULT_MOOD_WORD_GROUPS, DEFAULT_FORMAT_RULE, DEFAULT_MOOD_PROMPT_TEMPLATE } from "../src/features/bubble-render/constants";
import { readFileSync } from "node:fs";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const style = readFileSync("src/features/bubble-render/components/StylePage.vue", "utf8");
const keys = new Set(Object.keys(STYLE_DEFAULTS));

// 1) 滑杆引用的 style_* 键必须都存在
const sliderKeys = [...style.matchAll(/key: '((?:style_)?[A-Za-z]+)'/g)].map((m) => m[1]);
const missingSliders = sliderKeys.filter((k) => !keys.has(k));
check("all slider keys exist in STYLE_DEFAULTS", missingSliders.length === 0, missingSliders.join(","));

// 2) v-model 直接引用的键
const boundKeys = ["style_textColorMode","style_globalTextColor","style_narrationBgColor","style_avatarShape","style_markdownMode","style_imageCompressEnabled"];
const missingBound = boundKeys.filter((k) => !keys.has(k));
check("bound keys exist", missingBound.length === 0, missingBound.join(","));

// 3) 初始值与常量一致（不能被硬编码成别的数）
check("dialogueFontSize default 14.5", STYLE_DEFAULTS.style_dialogueFontSize === 14.5, String(STYLE_DEFAULTS.style_dialogueFontSize));
check("avatarSize default 52", STYLE_DEFAULTS.style_avatarSize === 52);
check("nameFontWeight default 800", STYLE_DEFAULTS.style_nameFontWeight === 800);

// 4) 情绪页依赖的数据
check("8 mood groups", DEFAULT_MOOD_WORD_GROUPS.length === 8);
check("every group has words", DEFAULT_MOOD_WORD_GROUPS.every((g) => g.words.length > 0));
check("format rule mentions @bubble", DEFAULT_FORMAT_RULE.includes("@bubble:"));
check("mood template has placeholder", DEFAULT_MOOD_PROMPT_TEMPLATE.includes("{{mood_groups}}"));

// 5) 每个情绪组 id 唯一（页面用 v-for key=group.id）
const ids = DEFAULT_MOOD_WORD_GROUPS.map((g) => g.id);
check("mood ids unique", new Set(ids).size === ids.length, ids.join(","));

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
