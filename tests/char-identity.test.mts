/**
 * 角色卡身份解析（稳定 id）。
 *
 * 回归重点：身份必须与「角色卡在列表里的下标」无关——
 * 以前用 ST 的 characterId（数组下标）当 key，增删一张排在前面的卡，
 * 按角色卡存的数据就会整体变成孤儿（原生存储看不到、删不掉）。
 */
import { resolveCharacterIdentity } from "../src/features/bubble-render/char-identity";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const SENTINEL = "SillyTavern System";
const card = { avatar: "林知意.png", name: "林知意" };

// 1) 正常情况：稳定 id = avatar 文件名去掉 .png
const a = resolveCharacterIdentity({ characterId: 3691, name2: "林知意", characters: [{}, card] }, SENTINEL);
check("id from avatar file name", a.id === "林知意", String(a.id));
check("hasCard true", a.hasCard === true);
check("display name kept", a.name === "林知意", a.name);

// 2) 关键：下标变了，身份不变
const b = resolveCharacterIdentity({ characterId: 5, name2: "林知意", characters: [{}, {}, {}, {}, {}, card] }, SENTINEL);
check("id survives index shift", b.id === a.id, `${a.id} -> ${b.id}`);

// 3) 没打开角色卡
const none = resolveCharacterIdentity({ characterId: undefined, name2: SENTINEL, characters: [card] }, SENTINEL);
check("no card -> id null", none.id === null, String(none.id));
check("no card -> hasCard false", none.hasCard === false);
check("no card -> name is sentinel", none.name === SENTINEL, none.name);

// 4) 有下标但名字是哨兵值：不算真实角色
const sentinel = resolveCharacterIdentity({ characterId: 0, name2: SENTINEL, characters: [card] }, SENTINEL);
check("sentinel name2 -> hasCard false", sentinel.hasCard === false, String(sentinel.id));

// 5) 下标是空串：不能当成 0（Number('') === 0，会错认成数组第一张卡）
//    数组第 0 张故意放另一张卡：若空串被当成 0，id 会变成「别的卡」而不是当前 name2
const other = { avatar: "别的卡.png", name: "别的卡" };
const emptyIndex = resolveCharacterIdentity({ characterId: "", name2: "林知意", characters: [other, card] }, SENTINEL);
check("empty index is not treated as 0", emptyIndex.id === "林知意", String(emptyIndex.id));
check("empty index does not pick first array entry", emptyIndex.id !== "别的卡", String(emptyIndex.id));

// 6) 没有 avatar 文件名：退回角色名（宿主同款 fallback）
const noAvatar = resolveCharacterIdentity({ characterId: 0, name2: "无名卡", characters: [{ name: "无名卡" }] }, SENTINEL);
check("fallback to character name", noAvatar.id === "无名卡", String(noAvatar.id));

// 7) avatar 不是 png（宿主里的 none 哨兵）：也退回名字
const notPng = resolveCharacterIdentity({ characterId: 0, name2: "某卡", characters: [{ avatar: "none", name: "某卡" }] }, SENTINEL);
check("non-png avatar falls back to name", notPng.id === "某卡", String(notPng.id));

// 8) 拿不到 characters 数组：退回 name2
const noArray = resolveCharacterIdentity({ characterId: 3, name2: "只有名字", characters: undefined }, SENTINEL);
check("no characters array -> name2 fallback", noArray.id === "只有名字", String(noArray.id));

// 9) 下标是数字字符串（宿主 this_chid 就是字符串）
const numericString = resolveCharacterIdentity({ characterId: "2", name2: "林知意", characters: [{}, {}, card] }, SENTINEL);
check("numeric string index works", numericString.id === "林知意", String(numericString.id));

// 10) 大写扩展名也认
const upper = resolveCharacterIdentity({ characterId: 0, name2: "大写的卡", characters: [{ avatar: "大写的卡.PNG", name: "大写的卡" }] }, SENTINEL);
check("uppercase .PNG stripped", upper.id === "大写的卡", String(upper.id));

// 11) 中文/空格/带点的文件名只去扩展名，不做其它改写
const weird = resolveCharacterIdentity({ characterId: 0, name2: "A.B 卡", characters: [{ avatar: "A.B 卡.png", name: "A.B 卡" }] }, SENTINEL);
check("only strips extension", weird.id === "A.B 卡", String(weird.id));

// 12) 数组越界 / 非整数下标：不崩，退回 name2
const outOfRange = resolveCharacterIdentity({ characterId: 99, name2: "越界卡", characters: [card] }, SENTINEL);
check("out-of-range index falls back to name2", outOfRange.id === "越界卡", String(outOfRange.id));
const nanIndex = resolveCharacterIdentity({ characterId: "abc", name2: "坏下标", characters: [card] }, SENTINEL);
check("non-numeric index falls back to name2", nanIndex.id === "坏下标", String(nanIndex.id));

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);