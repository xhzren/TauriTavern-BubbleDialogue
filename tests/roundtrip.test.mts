import { readFileSync, existsSync } from "node:fs";
import { importLibraryZip, exportLibraryZip } from "../src/features/bubble-render/import-export";
import type { AvatarLibrary, AvatarRecord } from "../src/features/bubble-render/avatar-repository";

const avatars = new Map<string, AvatarRecord>();
const mood = new Map<string, AvatarRecord>();
const configs = new Map<string, unknown>();
const library = {
    async isReady() { return true; },
    async getAvatar(n: string) { return avatars.get(n) ?? null; },
    async getMoodAvatar(n: string, m: string) { return mood.get(`${n}__${m}`) ?? null; },
    async listMoodAvatars() { return [...mood.values()]; },
    async listAvatarNames() { return [...avatars.keys()]; },
    async getConfig(k: string) { return configs.get(k) ?? null; },
    async setConfig(k: string, v: unknown) { configs.set(k, v); },
    async putAvatar(n: string, b: Blob, meta: any = {}) { avatars.set(n, { alias: n, imageBlob: b, ...meta }); },
    async putMoodAvatar(n: string, m: string, b: Blob, meta: any = {}) { mood.set(`${n}__${m}`, { alias: n, moodId: m, imageBlob: b, ...meta }); },
    async clear() { avatars.clear(); mood.clear(); configs.clear(); },
} as unknown as AvatarLibrary;

const SAMPLE_ZIP = process.env.BUBBLE_SAMPLE_ZIP ?? "D:/Dev/CodeX/data/bubble-character-银麒赎世-扩图总包-2026-06-07-第1部分-基础情绪修正版 (1).zip";
if (!existsSync(SAMPLE_ZIP)) {
    console.log("SKIP: sample zip not found ->", SAMPLE_ZIP);
    process.exit(0);
}

// 1. 先导入真实包
const data = new Uint8Array(readFileSync(SAMPLE_ZIP));
const r1 = await importLibraryZip(library, data);
console.log("import:", JSON.stringify(r1));

// 2. 导出
const t0 = Date.now();
const out = await exportLibraryZip({ library, charId: "_global_", charName: "银麒赎世" });
console.log("export bytes:", out.length, "elapsed ms:", Date.now() - t0);

// 3. 再导入到全新库，验证 round-trip
const a2 = new Map<string, AvatarRecord>(); const m2 = new Map<string, AvatarRecord>();
const lib2 = {
    async isReady() { return true; },
    async getAvatar(n: string) { return a2.get(n) ?? null; },
    async getMoodAvatar(n: string, m: string) { return m2.get(`${n}__${m}`) ?? null; },
    async listMoodAvatars() { return [...m2.values()]; },
    async listAvatarNames() { return [...a2.keys()]; },
    async getConfig() { return null; },
    async setConfig() {},
    async putAvatar(n: string, b: Blob, meta: any = {}) { a2.set(n, { alias: n, imageBlob: b, ...meta }); },
    async putMoodAvatar(n: string, m: string, b: Blob, meta: any = {}) { m2.set(`${n}__${m}`, { alias: n, moodId: m, imageBlob: b, ...meta }); },
    async clear() {},
} as unknown as AvatarLibrary;

const r2 = await importLibraryZip(lib2, out);
console.log("re-import:", JSON.stringify(r2));

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };
check("avatar count preserved", r2.avatars === r1.avatars, `${r1.avatars} -> ${r2.avatars}`);
check("mood count preserved", r2.moodAvatars === r1.moodAvatars, `${r1.moodAvatars} -> ${r2.moodAvatars}`);
check("no data loss", r2.skipped === 0, "skipped=" + r2.skipped);
check("林知意 present", a2.has("林知意"));

// 字节级比对：抽一张图确认内容没坏
const orig = await library.getMoodAvatar("林知意", "mood-joy__outfit-casual__act-sfw");
const round = await lib2.getMoodAvatar("林知意", "mood-joy__outfit-casual__act-sfw");
check("round-trip blob present", !!orig?.imageBlob && !!round?.imageBlob);
if (orig?.imageBlob && round?.imageBlob) {
    check("byte size identical", orig.imageBlob.size === round.imageBlob.size, `${orig.imageBlob.size} vs ${round.imageBlob.size}`);
    const b1 = new Uint8Array(await orig.imageBlob.arrayBuffer());
    const b2 = new Uint8Array(await round.imageBlob.arrayBuffer());
    let same = b1.length === b2.length;
    for (let i = 0; i < Math.min(b1.length, b2.length); i++) if (b1[i] !== b2[i]) { same = false; break; }
    check("bytes identical", same);
}
console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
