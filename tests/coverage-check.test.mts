// 断言：三个区块必须覆盖全部 16 个滑杆，不能有字段被漏掉
import { readFileSync } from "node:fs";
const src = readFileSync("src/features/bubble-render/components/StylePage.vue", "utf8");
const all = [...src.matchAll(/key: '(style_[A-Za-z]+)'/g)].map((m) => m[1]);
const slices = [...src.matchAll(/sliders\.slice\((\d+), (\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
const explicit = [...src.matchAll(/num\('(style_[A-Za-z]+)'\)/g)].map((m) => m[1]);
const covered = new Set(explicit);
for (const [a, b] of slices) for (let i = a; i < b; i++) covered.add(all[i]);
const missing = all.filter((k) => !covered.has(k));
console.log("total sliders:", all.length);
console.log("slices:", JSON.stringify(slices));
console.log("missing:", missing.length ? missing.join(", ") : "(none)");
process.exit(missing.length === 0 ? 0 : 1);
