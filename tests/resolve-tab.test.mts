import { resolveActiveTab } from "../src/features/resolve-tab";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const pages = ["bubble-avatar", "bubble-style", "bubble-mood", "bubble-storage"];

check("valid id kept", resolveActiveTab("bubble-mood", pages) === "bubble-mood");
check("settings kept", resolveActiveTab("settings", pages) === "settings");
// 升级场景：旧聚合页 id 已不存在
check("stale id falls back to first page", resolveActiveTab("bubble-render", pages) === "bubble-avatar",
    resolveActiveTab("bubble-render", pages));
check("unknown id falls back", resolveActiveTab("nope", pages) === "bubble-avatar");
check("no pages -> settings", resolveActiveTab("nope", []) === "settings");
check("settings works with no pages", resolveActiveTab("settings", []) === "settings");

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
