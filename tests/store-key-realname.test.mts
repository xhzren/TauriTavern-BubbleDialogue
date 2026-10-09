/**
 * 换用「avatar 文件名」当身份后，命名空间/key 编码必须扛得住真实文件名。
 * 现场样本：4010 张卡里包含大写、空格、点号、西文字母等（宿主禁止 / \ ? < > : * | "）。
 */
import { encodeStoreKey, decodeStoreKey, withExtension } from "../src/features/bubble-render/store-key";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

const HOST_SAFE = /^[A-Za-z0-9_.-]+$/;
const bad = (s: string) => s.length === 0 || !HOST_SAFE.test(s) || s === "." || s === ".." || s.startsWith(".");

// 现场真实文件名（去 .png 即身份 id）
const realNames = [
    "银麒赎世",
    "___V1.4震惊！被车创死的我居然顶了别人的号！？",
    "_碎界纪元",
    "- 舌尖上的玉足美少女2.0",
    "- 小少女乐队时代1.7Pro",
    "- μ's学园偶像计划2.2",
    "A.B 卡",
    "大写的卡",
];

// 1) 命名空间：bubble + char + <id> 三段编码后必须宿主合法
for (const name of realNames) {
    const ns = encodeStoreKey(["bubble", "char", name]);
    check(`namespace legal: ${name.slice(0, 18)}`, !bad(ns), ns);
}

// 2) 往返：解码必须拿回原值（否则统计表里显示的范围名会是乱码）
for (const name of realNames) {
    const ns = encodeStoreKey(["bubble", "char", name]);
    const back = decodeStoreKey(ns);
    check(`round-trips: ${name.slice(0, 18)}`, back[2] === name, back[2]);
}

// 3) 不同 id 不会撞到同一个 namespace（否则两张卡的数据会混在一起）
const nsA = encodeStoreKey(["bubble", "char", "银麒赎世"]);
const nsB = encodeStoreKey(["bubble", "char", "银麒赎世2"]);
const nsC = encodeStoreKey(["bubble", "char", "银麒赎世-2"]);
check("distinct ids -> distinct namespaces", nsA !== nsB && nsB !== nsC && nsA !== nsC, `${nsA} / ${nsB} / ${nsC}`);

// 4) 关键：编码不会因为分隔符 "-x-" 而歧义
const tricky = "A-x-B";
const back = decodeStoreKey(encodeStoreKey(["bubble", "char", tricky]));
check("no separator ambiguity", back[2] === tricky, back[2]);

// 5) blob key 拼扩展名后仍合法
const blobKey = withExtension(encodeStoreKey(["bubble", "char", "银麒赎世", "林知意"]), "webp");
check("blob key legal", !bad(blobKey), blobKey);

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);