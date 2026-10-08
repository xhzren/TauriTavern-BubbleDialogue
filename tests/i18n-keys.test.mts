import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

function walk(dir: string): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) out.push(...walk(p));
        else if (p.endsWith(".ts") || p.endsWith(".vue")) out.push(p);
    }
    return out;
}

// 1) 定义：types.ts
const types = readFileSync("src/i18n/types.ts", "utf8");
const defined = new Set([...types.matchAll(/'(bubbleRender\.[A-Za-z_]+)': string;/g)].map((m) => m[1]));

// 2) 三语必须提供同一批键
const locales = ["en", "zh-hans", "zh-hant"];
for (const locale of locales) {
    const src = readFileSync(`src/i18n/${locale}.ts`, "utf8");
    const keys = new Set([...src.matchAll(/'(bubbleRender\.[A-Za-z_]+)':/g)].map((m) => m[1]));
    const missing = [...defined].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !defined.has(k));
    check(`${locale}: no missing keys`, missing.length === 0, missing.slice(0, 5).join(","));
    check(`${locale}: no extra keys`, extra.length === 0, extra.slice(0, 5).join(","));
}

// 3) 源码里不应引用未定义的键（排除 i18n 自身）
const used = new Set<string>();
for (const p of walk("src")) {
    if (p.includes(`i18n${join("")}`)) continue;
    if (p.includes("i18n")) continue;
    const src = readFileSync(p, "utf8");
    for (const m of src.matchAll(/['"](bubbleRender\.[A-Za-z_]+)['"]/g)) {
        // 动态拼接的前缀（如 'bubbleRender.style_' + label）以 _ 结尾，不是真实键
        if (!m[1].endsWith("_")) used.add(m[1]);
    }
    // 动态拼接：style_<label> / shape_<name>
    if (p.endsWith("StylePage.vue")) {
        for (const m of src.matchAll(/label: '([A-Za-z]+)'/g)) used.add(`bubbleRender.style_${m[1]}`);
        for (const m of src.matchAll(/\['(narrationFont|dialogueFont|nameFont)',/g)) used.add(`bubbleRender.style_${m[1]}`);
        for (const shape of ["circle", "rounded", "square"]) used.add(`bubbleRender.shape_${shape}`);
    }
}
const undefinedRefs = [...used].filter((k) => !defined.has(k));
check("no references to undefined keys", undefinedRefs.length === 0, undefinedRefs.join(","));

// 4) 不应存在无人使用的键（避免死字符串被打进三语包）
const unused = [...defined].filter((k) => !used.has(k));
check("no unused keys", unused.length === 0, unused.join(","));

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
