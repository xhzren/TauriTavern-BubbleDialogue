import { encodeStoreKey, decodeStoreKey, withExtension } from "../src/features/bubble-render/store-key";
import { MOOD_GROUPS, DEFAULT_MOOD_WORD_GROUPS } from "../src/features/bubble-render/constants";

const SAFE = /^[A-Za-z0-9_.-]+$/;
let fail = 0;
function check(name: string, cond: boolean, extra = "") {
    if (!cond) { fail++; console.log("FAIL", name, extra); }
    else console.log("ok  ", name, extra);
}

// 中文名（真实用例）
const cn = encodeStoreKey(["_global_", "林知意", "mood-joy"]);
check("chinese key is host-safe", SAFE.test(cn) && !cn.startsWith("."), cn);
check("chinese key round-trips", JSON.stringify(decodeStoreKey(cn)) === JSON.stringify(["_global_","林知意","mood-joy"]), decodeStoreKey(cn).join("|"));

// 纯 ASCII 不应被编码（保持可读）
const ascii = encodeStoreKey(["_global_", "noah", "mood-joy"]);
check("ascii round-trips", JSON.stringify(decodeStoreKey(ascii)) === JSON.stringify(["_global_","noah","mood-joy"]), ascii);

// 混合
const mixed = encodeStoreKey(["_global_", "城崎诺亚A1", "outfit-casual"]);
check("mixed key safe", SAFE.test(mixed), mixed);
check("mixed round-trips", decodeStoreKey(mixed)[1] === "城崎诺亚A1", decodeStoreKey(mixed)[1]);

// 扩展名
check("extension appended", withExtension(cn, "webp").endsWith(".webp"), withExtension(cn,".webp").slice(-30));
check("bad extension ignored", withExtension(cn, "jp*g") === cn);

// 常量数据
check("8 mood groups", MOOD_GROUPS.length === 8, String(MOOD_GROUPS.length));
check("8 word groups", DEFAULT_MOOD_WORD_GROUPS.length === 8, String(DEFAULT_MOOD_WORD_GROUPS.length));
const words = DEFAULT_MOOD_WORD_GROUPS.reduce((a,g)=>a+g.words.length,0);
console.log("     total mood words:", words);
check("mood ids aligned", MOOD_GROUPS.every((g,i)=>g.id===DEFAULT_MOOD_WORD_GROUPS[i].id));

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
