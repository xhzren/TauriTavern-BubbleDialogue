import type { AvatarRecord } from "./avatar-repository";
import { encodeStoreKey, withExtension } from "./store-key";
import {
    GLOBAL_SCOPE,
    type AvatarLibrary,
    type AvatarScope,
    type CgGroupRecord,
    type CgImageRecord,
    type LibraryScopeStat,
} from "./storage-types";
import { GLOBAL_CHAR_ID } from "./constants";
import { mapWithConcurrency } from "./async-utils";
import type { TauriTavernExtensionStoreApi } from "../../host/api";

/**
 * TauriTavern 原生存储实现（阶段 2）。
 *
 * 落盘位置：data_root/_tauritavern/extension-store/<namespace>/...
 *   - 配置（JSON）      kv/<table>/<key>.json
 *   - 头像等二进制      blobs/<table>/<key>
 *
 * 双模式：
 *   - global      -> namespace = bubble-global
 *   - character   -> namespace = bubble-char-<编码后的 charId>
 * 查找时先查本卡、miss 再回退全局（与 scopeLookupChain 一致）。
 */

const NS_PREFIX = "bubble";
const TABLE_AVATARS = "avatars";
const TABLE_MOOD = "mood";
const TABLE_CONFIG = "config";
const TABLE_CG_GROUPS = "cg_groups";
const TABLE_CG_IMAGES = "cg_images";
const DEFAULT_EXT = "webp";
/** 读取元数据的并发上限：太低会慢，太高会挤爆 IPC */
const READ_CONCURRENCY = 16;

function namespaceFor(scope: AvatarScope): string {
    if (scope.mode === "character" && scope.charId) {
        return encodeStoreKey([NS_PREFIX, "char", scope.charId]);
    }
    return encodeStoreKey([NS_PREFIX, "global"]);
}

/** blob 的 MIME 由宿主按 key 扩展名猜测，因此 key 必须带真实扩展名 */
function blobKey(name: string, extension: string | undefined): string {
    return withExtension(encodeStoreKey([name]), extension || DEFAULT_EXT);
}

function moodBlobKey(name: string, moodId: string, extension: string | undefined): string {
    return withExtension(encodeStoreKey([name, moodId]), extension || DEFAULT_EXT);
}

/** CG 图片 key：组名与序号都可能含非 ASCII，统一走编码 */
function cgBlobKey(group: string, index: number): string {
    return withExtension(encodeStoreKey([group, String(index)]), "webp");
}

function extOf(mimeType: string | undefined): string {
    const mime = String(mimeType ?? "").toLowerCase();
    if (mime.includes("png")) return "png";
    if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
    if (mime.includes("gif")) return "gif";
    if (mime.includes("avif")) return "avif";
    return DEFAULT_EXT;
}

function extFromName(fileName: string | undefined): string | undefined {
    const match = /\.(webp|png|jpg|jpeg|gif|avif)$/i.exec(String(fileName ?? ""));
    return match ? match[1].toLowerCase() : undefined;
}

/**
 * 已列出的 blob key 缓存（按 namespace::table）。
 *
 * 为什么需要：宿主对「删除不存在的条目」会返回错误，而且**在命令层就往界面弹
 * 「后端错误」**——扩展虽然 catch 了，那个提示也挡不住。
 * 所以删 blob 之前必须先确认它真的在。
 */
type BlobKeyCache = Map<string, Set<string>>;

function blobCacheKey(namespace: string, table: string): string {
    return namespace + "::" + table;
}

async function knownBlobKeys(
    cache: BlobKeyCache,
    store: TauriTavernExtensionStoreApi,
    namespace: string,
    table: string,
): Promise<Set<string>> {
    const key = blobCacheKey(namespace, table);
    const cached = cache.get(key);
    if (cached) return cached;
    let keys: string[] = [];
    try {
        keys = await store.listBlobKeys({ namespace, table });
    } catch {
        keys = [];
    }
    const set = new Set(keys);
    cache.set(key, set);
    return set;
}

async function readJson<T>(store: TauriTavernExtensionStoreApi, namespace: string, table: string, key: string): Promise<T | null> {
    try {
        const result = await store.tryGetJson({ namespace, table, key });
        if (result && result.found) {
            return result.value as T;
        }
    } catch {
        /* 不存在或损坏都按 null 处理 */
    }
    return null;
}

export function createNativeAvatarLibrary(
    store: TauriTavernExtensionStoreApi,
    scope: AvatarScope = GLOBAL_SCOPE,
): AvatarLibrary {
    const namespace = namespaceFor(scope);
    const globalNamespace = namespaceFor(GLOBAL_SCOPE);
    const blobKeys: BlobKeyCache = new Map();
    const fallbackChain = scope.mode === "character" ? [namespace, globalNamespace] : [namespace];

    async function getAvatarFrom(ns: string, name: string): Promise<AvatarRecord | null> {
        const meta = await readJson<Record<string, unknown>>(store, ns, TABLE_AVATARS, encodeStoreKey([name]));
        if (!meta) return null;
        try {
            const blob = await store.getBlob({
                namespace: ns,
                table: TABLE_AVATARS,
                key: blobKey(name, extFromName(meta.fileName as string) ?? extOf(meta.mimeType as string)),
            });
            return { ...meta, imageBlob: blob } as AvatarRecord;
        } catch {
            return null;
        }
    }

    async function getMoodAvatarFrom(ns: string, name: string, moodId: string): Promise<AvatarRecord | null> {
        const meta = await readJson<Record<string, unknown>>(store, ns, TABLE_MOOD, encodeStoreKey([name, moodId]));
        if (!meta) return null;
        try {
            const blob = await store.getBlob({
                namespace: ns,
                table: TABLE_MOOD,
                key: moodBlobKey(name, moodId, extFromName(meta.fileName as string) ?? extOf(meta.mimeType as string)),
            });
            return { ...meta, imageBlob: blob } as AvatarRecord;
        } catch {
            return null;
        }
    }

    return {
        async isReady() {
            return true;
        },
        async getAvatar(name) {
            for (const ns of fallbackChain) {
                const record = await getAvatarFrom(ns, name);
                if (record) return record;
            }
            return null;
        },
        async getMoodAvatar(name, moodId) {
            for (const ns of fallbackChain) {
                const record = await getMoodAvatarFrom(ns, name, moodId);
                if (record) return record;
            }
            return null;
        },
        async listMoodAvatars() {
            const out: AvatarRecord[] = [];
            for (const ns of fallbackChain) {
                try {
                    const keys = await store.listKeys({ namespace: ns, table: TABLE_MOOD });
                    // 并发读取：串行读几千条等于几千次 IPC 往返，会卡到几十秒
                    const metas = await mapWithConcurrency(keys, READ_CONCURRENCY, (key) =>
                        readJson<Record<string, unknown>>(store, ns, TABLE_MOOD, key),
                    );
                    for (const meta of metas) {
                        // 列表不预取图片二进制，避免一次性拉爆内存；imageBlob 留给按需查询
                        if (meta) out.push(meta as AvatarRecord);
                    }
                } catch {
                    /* 单个 namespace 失败不影响其它 */
                }
            }
            return out;
        },
        async listAvatarNames() {
            // 只列主范围（列表展示与「库范围」选择器保持一致）
            const out: string[] = [];
            try {
                const keys = await store.listKeys({ namespace, table: TABLE_AVATARS });
                const metas = await mapWithConcurrency(keys, READ_CONCURRENCY, (key) =>
                    readJson<Record<string, unknown>>(store, namespace, TABLE_AVATARS, key),
                );
                for (const meta of metas) {
                    const name = String(meta?.name ?? meta?.alias ?? "");
                    if (name) out.push(name);
                }
            } catch {
                /* ignore */
            }
            return out;
        },
        async getConfig(key) {
            for (const ns of fallbackChain) {
                const value = await readJson<unknown>(store, ns, TABLE_CONFIG, encodeStoreKey([key]));
                if (value !== null) return value;
            }
            return null;
        },
        async setConfig(key, value) {
            await store.setJson({
                namespace,
                table: TABLE_CONFIG,
                key: encodeStoreKey([key]),
                value: value ?? null,
            });
        },
        async putAvatar(name, blob, meta = {}) {
            const key = encodeStoreKey([name]);
            const ext = extOf(blob.type);
            await store.setBlob({
                namespace,
                table: TABLE_AVATARS,
                key: blobKey(name, ext),
                data: blob,
            });
            // 新增了 blob：让「已知 blob key」缓存失效，否则紧接着删除会漏删
            blobKeys.delete(blobCacheKey(namespace, TABLE_AVATARS));
            await store.setJson({
                namespace,
                table: TABLE_AVATARS,
                key,
                value: {
                    // alias/name 存真实显示名；key 只用于寻址
                    alias: name,
                    name,
                    mimeType: blob.type || "image/webp",
                    fileName: (meta.fileName as string) || `${name}.${ext}`,
                    fileSize: blob.size,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    ...meta,
                },
            });
        },
        async putMoodAvatar(name, moodId, blob, meta = {}) {
            const key = encodeStoreKey([name, moodId]);
            const ext = extOf(blob.type);
            await store.setBlob({
                namespace,
                table: TABLE_MOOD,
                key: moodBlobKey(name, moodId, ext),
                data: blob,
            });
            blobKeys.delete(blobCacheKey(namespace, TABLE_MOOD));
            await store.setJson({
                namespace,
                table: TABLE_MOOD,
                key,
                value: {
                    alias: name,
                    name,
                    lookupKey: key,
                    moodId,
                    mimeType: blob.type || "image/webp",
                    fileName: (meta.fileName as string) || `${name}_${moodId}.${ext}`,
                    fileSize: blob.size,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    ...meta,
                },
            });
        },
        async deleteAvatar(name) {
            // kv 与 blob 都要删，否则会留下无主二进制。
            // 但**只删确实存在的**：宿主对「删除不存在的条目」会报 Not Found 并弹「后端错误」，
            // 那个提示在命令层就发出去了，扩展 catch 也拦不住。
            const key = encodeStoreKey([name]);
            const meta = await readJson<Record<string, unknown>>(store, namespace, TABLE_AVATARS, key);
            if (meta) {
                await store.deleteJson({ namespace, table: TABLE_AVATARS, key });
            }
            const ext = extFromName(meta?.fileName as string) ?? extOf(meta?.mimeType as string);
            const target = blobKey(name, ext);
            const existing = await knownBlobKeys(blobKeys, store, namespace, TABLE_AVATARS);
            if (existing.has(target)) {
                await store.deleteBlob({ namespace, table: TABLE_AVATARS, key: target });
                existing.delete(target);
            }
        },
        async deleteMoodAvatar(name, moodId) {
            const key = encodeStoreKey([name, moodId]);
            const meta = await readJson<Record<string, unknown>>(store, namespace, TABLE_MOOD, key);
            if (meta) {
                await store.deleteJson({ namespace, table: TABLE_MOOD, key });
            }
            const ext = extFromName(meta?.fileName as string) ?? extOf(meta?.mimeType as string);
            const target = moodBlobKey(name, moodId, ext);
            const existing = await knownBlobKeys(blobKeys, store, namespace, TABLE_MOOD);
            if (existing.has(target)) {
                await store.deleteBlob({ namespace, table: TABLE_MOOD, key: target });
                existing.delete(target);
            }
        },
        async listCgGroups() {
            const out: CgGroupRecord[] = [];
            for (const ns of fallbackChain) {
                try {
                    const keys = await store.listKeys({ namespace: ns, table: TABLE_CG_GROUPS });
                    for (const key of keys) {
                        const value = await readJson<CgGroupRecord>(store, ns, TABLE_CG_GROUPS, key);
                        if (value) out.push(value);
                    }
                } catch {
                    /* ignore */
                }
            }
            return out;
        },
        async listCgImages(group) {
            const out: CgImageRecord[] = [];
            for (const ns of fallbackChain) {
                try {
                    const keys = await store.listKeys({ namespace: ns, table: TABLE_CG_IMAGES });
                    for (const key of keys) {
                        const value = await readJson<CgImageRecord>(store, ns, TABLE_CG_IMAGES, key);
                        if (value && String(value.group) === group) out.push(value);
                    }
                } catch {
                    /* ignore */
                }
            }
            return out.sort((a, b) => Number(a.index) - Number(b.index));
        },
        async getCgImageBlob(group, index) {
            for (const ns of fallbackChain) {
                try {
                    return await store.getBlob({
                        namespace: ns,
                        table: TABLE_CG_IMAGES,
                        key: cgBlobKey(group, index),
                    });
                } catch {
                    /* 换下一个 scope */
                }
            }
            return null;
        },
        /**
         * 清空原生存储。
         *
         * 已知限制：宿主 API 只能按 namespace 操作，没有「列出所有 namespace」的能力，
         * 因此只能清掉「全局 + 当前角色卡」两个 namespace；其它角色卡的历史 namespace
         * 无法从这里触达（原版 IndexedDB 后端没有这个限制，它直接整表 clear）。
         */
        /**
         * 原生存储的范围统计。
         * 只能看到「全局 + 当前角色卡」两个 namespace——宿主 API 无法枚举 namespace，
         * 所以这里不会列出其它角色卡的历史数据（原版 DB 面板没有这个限制）。
         */
        /**
         * 只统计当前主范围（不含回退链）。
         * 面板展示要与「库范围」选择器一致——选角色卡就只显示该卡的数量，
         * 不能把全局的算进来。水合（应用到正文）另走 fallbackChain。
         */
        async listMoodAvatarsPrimary() {
            const out: AvatarRecord[] = [];
            try {
                const keys = await store.listKeys({ namespace, table: TABLE_MOOD });
                const metas = await mapWithConcurrency(keys, READ_CONCURRENCY, (key) =>
                    readJson<Record<string, unknown>>(store, namespace, TABLE_MOOD, key),
                );
                for (const meta of metas) {
                    if (meta) out.push(meta as AvatarRecord);
                }
            } catch {
                /* ignore */
            }
            return out;
        },
        async getScopeStats() {
            const stat = { avatars: 0, moodAvatars: 0, bytes: 0 };
            for (const table of [TABLE_AVATARS, TABLE_MOOD, TABLE_CG_IMAGES]) {
                try {
                    const keys = await store.listKeys({ namespace, table });
                    const metas = await mapWithConcurrency(keys, READ_CONCURRENCY, (key) =>
                        readJson<Record<string, unknown>>(store, namespace, table, key),
                    );
                    for (const meta of metas) {
                        const size = Number(meta?.fileSize ?? 0);
                        if (Number.isFinite(size)) stat.bytes += size;
                        if (table === TABLE_AVATARS) stat.avatars += 1;
                        else if (table === TABLE_MOOD) stat.moodAvatars += 1;
                    }
                } catch {
                    /* 单个表失败不影响其它 */
                }
            }
            return stat;
        },
        async listScopes() {
            const entries: Array<[string, string]> = [];
            if (namespace === globalNamespace) {
                entries.push([globalNamespace, GLOBAL_CHAR_ID]);
            } else {
                entries.push([namespace, scope.charId ?? GLOBAL_CHAR_ID]);
                entries.push([globalNamespace, GLOBAL_CHAR_ID]);
            }

            const out: LibraryScopeStat[] = [];
            for (const [ns, charId] of entries) {
                const stat: LibraryScopeStat = { charId, avatars: 0, moodAvatars: 0, cgImages: 0, bytes: 0 };
                try {
                    for (const table of [TABLE_AVATARS, TABLE_MOOD, TABLE_CG_IMAGES]) {
                        const keys = await store.listKeys({ namespace: ns, table });
                        const metas = await mapWithConcurrency(keys, READ_CONCURRENCY, (key) =>
                            readJson<Record<string, unknown>>(store, ns, table, key),
                        );
                        for (const meta of metas) {
                            const size = Number(meta?.fileSize ?? 0);
                            if (Number.isFinite(size)) stat.bytes += size;
                            if (table === TABLE_AVATARS) stat.avatars += 1;
                            else if (table === TABLE_MOOD) stat.moodAvatars += 1;
                            else stat.cgImages += 1;
                        }
                    }
                } catch {
                    /* 单个 namespace 失败不影响其它 */
                }
                out.push(stat);
            }
            return out;
        },
        async clearScope(charId) {
            const target = String(charId || GLOBAL_CHAR_ID);
            const ns = target === (scope.charId ?? GLOBAL_CHAR_ID) && target !== GLOBAL_CHAR_ID
                ? namespace
                : target === GLOBAL_CHAR_ID
                    ? globalNamespace
                    : null;
            if (!ns) return;
            for (const table of [TABLE_AVATARS, TABLE_MOOD, TABLE_CG_GROUPS, TABLE_CG_IMAGES]) {
                try {
                    await store.deleteTable({ namespace: ns, table });
                } catch {
                    /* ignore */
                }
            }
        },
        async clearAll() {
            // 全局 + 当前角色卡两个 namespace 全部删表
            for (const ns of new Set([namespace, globalNamespace])) {
                for (const table of [TABLE_AVATARS, TABLE_MOOD, TABLE_CG_GROUPS, TABLE_CG_IMAGES]) {
                    try {
                        await store.deleteTable({ namespace: ns, table });
                    } catch {
                        /* 不存在也算清干净 */
                    }
                }
            }
        },
        async clear() {
            for (const table of [TABLE_AVATARS, TABLE_MOOD, TABLE_CONFIG]) {
                try {
                    await store.deleteTable({ namespace, table });
                } catch {
                    /* ignore */
                }
            }
        },
    };
}
