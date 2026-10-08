import { readFileSync, existsSync } from "node:fs";
import { importLibraryZip } from "../src/features/bubble-render/import-export";
import type { AvatarLibrary, AvatarRecord } from "../src/features/bubble-render/avatar-repository";
import type { AvatarScope } from "../src/features/bubble-render/storage-types";

// 内存实现，用来验证导入逻辑确实把数据写进来了
const avatars = new Map<string, AvatarRecord>();
const mood = new Map<string, AvatarRecord>();
const configs = new Map<string, unknown>();

const library = {
    async isReady() { return true; },
    async getAvatar(name: string) { return avatars.get(name) ?? null; },
    async getMoodAvatar(name: string, moodId: string) { return mood.get(`${name}__${moodId}`) ?? null; },
    async listMoodAvatars() { return [...mood.values()]; },
    async listAvatarNames() { return [...avatars.keys()]; },
    async getConfig(k: string) { return configs.get(k) ?? null; },
    async setConfig(k: string, v: unknown) { configs.set(k, v); },
    async putAvatar(name: string, blob: Blob, meta: any = {}) { avatars.set(name, { alias: name, imageBlob: blob, ...meta }); },
    async putMoodAvatar(name: string, moodId: string, blob: Blob, meta: any = {}) { mood.set(`${name}__${moodId}`, { alias: name, moodId, imageBlob: blob, ...meta }); },
    async clear() { avatars.clear(); mood.clear(); configs.clear(); },
} as unknown as AvatarLibrary;

const SAMPLE_ZIP = process.env.BUBBLE_SAMPLE_ZIP ?? "D:/Dev/CodeX/data/bubble-character-银麒赎世-扩图总包-2026-06-07-第1部分-基础情绪修正版 (1).zip";
if (!existsSync(SAMPLE_ZIP)) {
    console.log("SKIP: sample zip not found ->", SAMPLE_ZIP);
    process.exit(0);
}

const zipPath = SAMPLE_ZIP;
console.log("reading", zipPath);
const data = new Uint8Array(readFileSync(zipPath));
console.log("zip bytes:", data.length);

const t0 = Date.now();
const report = await importLibraryZip(library, data, (done, total) => {
    if (done % 400 === 0) console.log("  progress", done, "/", total);
});
console.log("elapsed ms:", Date.now() - t0);
console.log("REPORT:", JSON.stringify(report));

console.log("avatars stored:", avatars.size);
console.log("mood stored:", mood.size);
console.log("configs:", [...configs.keys()]);

// 抽验：真实名字与真实 moodId
console.log("has 林知意:", avatars.has("林知意"));
console.log("has 九尾妖狐·绯月:", avatars.has("九尾妖狐·绯月"));
const probe = await library.getMoodAvatar("林知意", "mood-joy__outfit-casual__act-sfw");
console.log("mood probe 林知意 joy/casual/sfw:", probe ? "HIT size=" + (probe.imageBlob as Blob).size : "MISS");

// 二次导入应全部 skipped（合并语义，不覆盖）
const report2 = await importLibraryZip(library, data);
console.log("second import REPORT:", JSON.stringify(report2));
