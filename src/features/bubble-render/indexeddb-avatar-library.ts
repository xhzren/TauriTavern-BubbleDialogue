import type { AvatarRecord } from "./avatar-repository";
import { GLOBAL_CHAR_ID } from "./constants";
import { belongsToScope, buildAvatarKey as makeAvatarKey, buildMoodAlias, buildMoodLookupKey, charIdFromKey, extractDisplayName } from "./key-format";
import type { AvatarLibrary, AvatarScope, CgGroupRecord, CgImageRecord, LibraryScopeStat } from "./storage-types";

/**
 * 原始 IndexedDB 库（BubbleDialogueAvatars）的读写实现。
 *
 * 用户要求「保留原版 db 读取功能」，所以这一层必须能读；
 * 同时它也是迁移源（阶段 2 把数据搬到 TauriTavern 原生存储）。
 *
 * open 不带版本号：不触发 onupgradeneeded，不与原脚本抢建库权力，
 * 也不会因为版本落后抛 VersionError。
 */

const DB_NAME = "BubbleDialogueAvatars";
const STORE_AVATARS = "avatars";
const STORE_MOOD_AVATARS = "mood_avatars";
const STORE_CONFIG = "config";
const STORE_CG_GROUPS = "cg_groups";
const STORE_CG_IMAGES = "cg_images";
const STORE_LOCAL_FONTS = "local_fonts";

export const IDB_STORES = [
    STORE_AVATARS,
    STORE_MOOD_AVATARS,
    STORE_CONFIG,
    STORE_CG_GROUPS,
    STORE_CG_IMAGES,
    STORE_LOCAL_FONTS,
] as const;

function openDatabase(): Promise<IDBDatabase | null> {
    return new Promise((resolve) => {
        try {
            const request = indexedDB.open(DB_NAME);
            request.onsuccess = () => {
                const db = request.result;
                try {
                    if (
                        !db.objectStoreNames.contains(STORE_AVATARS) ||
                        !db.objectStoreNames.contains(STORE_MOOD_AVATARS)
                    ) {
                        db.close();
                        resolve(null);
                        return;
                    }
                } catch {
                    /* 探测失败按可用处理 */
                }
                resolve(db);
            };
            request.onerror = () => resolve(null);
            request.onblocked = () => resolve(null);
            request.onupgradeneeded = () => {};
        } catch {
            resolve(null);
        }
    });
}

function idbGet<T>(db: IDBDatabase | null, storeName: string, key: string): Promise<T | null> {
    if (!db) return Promise.resolve(null);
    return new Promise((resolve) => {
        try {
            if (!db.objectStoreNames.contains(storeName)) {
                resolve(null);
                return;
            }
            const tx = db.transaction(storeName, "readonly");
            const request = tx.objectStore(storeName).get(key);
            request.onsuccess = () => resolve((request.result as T) ?? null);
            request.onerror = () => resolve(null);
        } catch {
            resolve(null);
        }
    });
}

function idbGetAll<T>(db: IDBDatabase | null, storeName: string): Promise<T[]> {
    if (!db) return Promise.resolve([]);
    return new Promise((resolve) => {
        try {
            if (!db.objectStoreNames.contains(storeName)) {
                resolve([]);
                return;
            }
            const tx = db.transaction(storeName, "readonly");
            const request = tx.objectStore(storeName).getAll();
            request.onsuccess = () => resolve((request.result as T[]) ?? []);
            request.onerror = () => resolve([]);
        } catch {
            resolve([]);
        }
    });
}

function idbGetAllKeys(db: IDBDatabase | null, storeName: string): Promise<string[]> {
    if (!db) return Promise.resolve([]);
    return new Promise((resolve) => {
        try {
            if (!db.objectStoreNames.contains(storeName)) {
                resolve([]);
                return;
            }
            const tx = db.transaction(storeName, "readonly");
            const request = tx.objectStore(storeName).getAllKeys();
            request.onsuccess = () => resolve((request.result as string[]) ?? []);
            request.onerror = () => resolve([]);
        } catch {
            resolve([]);
        }
    });
}

/**
 * 按索引查询。情绪差分的 store 主键是 `id`（形如 <lookupKey>__img__<hash>），
 * 不是 lookupKey，所以必须走 lookupKey 索引，不能拿 lookupKey 当主键 get。
 */
function idbGetAllByIndex<T>(
    db: IDBDatabase | null,
    storeName: string,
    indexName: string,
    value: string,
): Promise<T[]> {
    if (!db) return Promise.resolve([]);
    return new Promise((resolve) => {
        try {
            if (!db.objectStoreNames.contains(storeName)) {
                resolve([]);
                return;
            }
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            if (!store.indexNames.contains(indexName)) {
                resolve([]);
                return;
            }
            const request = store.index(indexName).getAll(IDBKeyRange.only(value));
            request.onsuccess = () => resolve((request.result as T[]) ?? []);
            request.onerror = () => resolve([]);
        } catch {
            resolve([]);
        }
    });
}

function idbPut(db: IDBDatabase | null, storeName: string, value: unknown): Promise<void> {
    if (!db) return Promise.resolve();
    return new Promise((resolve) => {
        try {
            if (!db.objectStoreNames.contains(storeName)) {
                resolve();
                return;
            }
            const tx = db.transaction(storeName, "readwrite");
            tx.objectStore(storeName).put(value as never);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
            tx.onabort = () => resolve();
        } catch {
            resolve();
        }
    });
}

function idbDelete(db: IDBDatabase | null, storeName: string, key: string): Promise<void> {
    if (!db) return Promise.resolve();
    return new Promise((resolve) => {
        try {
            if (!db.objectStoreNames.contains(storeName)) {
                resolve();
                return;
            }
            const tx = db.transaction(storeName, "readwrite");
            tx.objectStore(storeName).delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
            tx.onabort = () => resolve();
        } catch {
            resolve();
        }
    });
}

function idbClear(db: IDBDatabase | null, storeName: string): Promise<void> {
    if (!db) return Promise.resolve();
    return new Promise((resolve) => {
        try {
            if (!db.objectStoreNames.contains(storeName)) {
                resolve();
                return;
            }
            const tx = db.transaction(storeName, "readwrite");
            tx.objectStore(storeName).clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
            tx.onabort = () => resolve();
        } catch {
            resolve();
        }
    });
}

function buildAvatarKey(name: string, charId: string | null): string {
    return makeAvatarKey(charId, name);
}

function buildMoodKey(name: string, moodId: string, charId: string | null): string {
    return buildMoodLookupKey(charId, name, moodId);
}

/**
 * @param scope character 模式时先查本卡再回退全局；global 模式只用全局。
 */
type RawRecord = Record<string, unknown>;

/** 记录归属哪个范围：优先用 charId 字段，缺失时从 key 反推 */
function scopeOfRecord(record: RawRecord, keyField = "alias"): string {
    const explicit = record.charId;
    if (typeof explicit === "string" && explicit) return explicit;
    return charIdFromKey(String(record[keyField] ?? record.lookupKey ?? record.id ?? ""));
}

/** 体积：优先 fileSize，缺失时用 blob.size */
function sizeOfRecord(record: RawRecord): number {
    const size = Number(record.fileSize ?? 0);
    if (Number.isFinite(size) && size > 0) return size;
    const blob = record.imageBlob as Blob | undefined;
    return blob && typeof blob.size === "number" ? blob.size : 0;
}

export interface IndexedDbLibraryOptions {
    /**
     * 只读主范围，不向全局回退。
     * 按范围迁移时必须开——否则会把全局记录一起搬进角色卡 namespace。
     */
    primaryOnly?: boolean;
}

export function createIndexedDbAvatarLibrary(
    scope: AvatarScope = { mode: "global", charId: null },
    options: IndexedDbLibraryOptions = {},
): AvatarLibrary {
    let dbPromise: Promise<IDBDatabase | null> | null = null;

    const ensureDb = () => {
        if (!dbPromise) dbPromise = openDatabase();
        return dbPromise;
    };

    const primaryCharId = scope.mode === "character" && scope.charId ? scope.charId : GLOBAL_CHAR_ID;
    const chain = options.primaryOnly
        ? [primaryCharId]
        : scope.mode === "character" && scope.charId
            ? [scope.charId, GLOBAL_CHAR_ID]
            : [GLOBAL_CHAR_ID];

    /**
     * 情绪表整表快照：只在 lookupKey 索引未命中时用到。
     *
     * 老库（v6 及更早创建的 BubbleDialogueAvatars）可能没有 lookupKey 索引——
     * open 不带版本号意味着我们不会替宿主升级 schema，只能在读侧兜底。
     * 原脚本在同位置也写了同样的兜底，说明这不是理论情况。
     * 缓存整表，避免每条差分都 getAll 一次（真机 1800+ 条会直接卡死）。
     */
    let moodTableScan: Promise<RawRecord[]> | null = null;
    const readMoodTable = (db: IDBDatabase | null) => {
        if (!moodTableScan) moodTableScan = idbGetAll<RawRecord>(db, STORE_MOOD_AVATARS);
        return moodTableScan;
    };
    /** 本实例写过情绪表后调用，避免读到旧快照 */
    const invalidateMoodTable = () => {
        moodTableScan = null;
    };

    return {
        async isReady() {
            return (await ensureDb()) !== null;
        },
        async getAvatar(name) {
            const db = await ensureDb();
            for (const charId of chain) {
                const record = await idbGet<AvatarRecord>(db, STORE_AVATARS, buildAvatarKey(name, charId));
                if (record) return record;
            }
            return null;
        },
        async getMoodAvatar(name, moodId) {
            const db = await ensureDb();
            const wantedName = String(name ?? "").trim().toLowerCase();
            const wantedMoodId = String(moodId ?? "");
            for (const charId of chain) {
                const lookupKey = buildMoodKey(name, moodId, charId);
                const rows = await idbGetAllByIndex<AvatarRecord>(
                    db,
                    STORE_MOOD_AVATARS,
                    "lookupKey",
                    lookupKey,
                );
                // 同一 lookupKey 可能有多张候选图，取第一张带图的
                const hit = rows.find((row) => row.imageBlob);
                if (hit) return hit;

                // 索引未命中：老库可能没有 lookupKey 索引（v6 及更早），
                // 或索引里没有这条记录。退化为整表过滤（快照已缓存）。
                const fallback = (await readMoodTable(db)).find((record) => (
                    scopeOfRecord(record, "alias") === String(charId)
                    && String(record.alias ?? "").trim().toLowerCase() === wantedName
                    && String(record.moodId ?? "") === wantedMoodId
                    && Boolean(record.imageBlob)
                ));
                if (fallback) return fallback as unknown as AvatarRecord;
            }
            return null;
        },
        async listMoodAvatars() {
            const db = await ensureDb();
            const all = await idbGetAll<AvatarRecord>(db, STORE_MOOD_AVATARS);
            // 归属判断必须与 listScopes / getScopeStats 完全一致（都走 scopeOfRecord）：
            // charId 字段缺失、空串、非字符串时按 key 反推，否则会出现
            // 「表格里算得到、迁移时却取不到」的口径分歧。
            const allowed = new Set(chain.map((id) => String(id)));
            return all.filter((record) => allowed.has(scopeOfRecord(record, "alias")));
        },
        async listAvatarNames() {
            const db = await ensureDb();
            const primary = scope.mode === "character" && scope.charId ? scope.charId : GLOBAL_CHAR_ID;
            const keys = await idbGetAllKeys(db, STORE_AVATARS);
            return keys
                .filter((key) => belongsToScope(key, primary))
                .map((key) => extractDisplayName(key, primary))
                .filter(Boolean);
        },
        async getConfig(key) {
            const db = await ensureDb();
            return idbGet<unknown>(db, STORE_CONFIG, key);
        },
        async setConfig(key, value) {
            const db = await ensureDb();
            await idbPut(db, STORE_CONFIG, { key, value });
        },
        async putAvatar(name, blob, meta = {}) {
            const db = await ensureDb();
            const key = buildAvatarKey(name, scope.charId);
            const primary = scope.mode === "character" && scope.charId ? scope.charId : GLOBAL_CHAR_ID;
            await idbPut(db, STORE_AVATARS, {
                alias: key,
                charId: primary,
                imageBlob: blob,
                mimeType: blob.type || "image/webp",
                fileName: (meta.fileName as string) || `${name}.webp`,
                fileSize: blob.size,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                ...meta,
            });
        },
        async putMoodAvatar(name, moodId, blob, meta = {}) {
            const db = await ensureDb();
            const key = buildMoodKey(name, moodId, scope.charId);
            const primary = scope.mode === "character" && scope.charId ? scope.charId : GLOBAL_CHAR_ID;
            await idbPut(db, STORE_MOOD_AVATARS, {
                // 与原脚本一致：mood 记录的 alias 只有名字，charId 单独存字段
                alias: buildMoodAlias(name),
                lookupKey: key,
                charId: primary,
                id: key,
                moodId,
                imageBlob: blob,
                mimeType: blob.type || "image/webp",
                fileName: (meta.fileName as string) || `${name}_${moodId}.webp`,
                fileSize: blob.size,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                ...meta,
            });
            invalidateMoodTable();
        },
        async deleteAvatar(name) {
            const db = await ensureDb();
            await idbDelete(db, STORE_AVATARS, buildAvatarKey(name, scope.charId));
        },
        async deleteMoodAvatar(name, moodId) {
            const db = await ensureDb();
            invalidateMoodTable();
            const primary = scope.mode === "character" && scope.charId ? scope.charId : GLOBAL_CHAR_ID;
            const lookupKey = buildMoodKey(name, moodId, primary);
            const rows = await idbGetAllByIndex<AvatarRecord>(
                db,
                STORE_MOOD_AVATARS,
                "lookupKey",
                lookupKey,
            );
            // 主键是 id，不是 lookupKey；删错键会静默无效
            for (const row of rows) {
                const id = String((row as { id?: unknown }).id ?? "");
                if (id) await idbDelete(db, STORE_MOOD_AVATARS, id);
            }
        },
        async listCgGroups() {
            const db = await ensureDb();
            const all = await idbGetAll<CgGroupRecord & { charId?: string }>(db, STORE_CG_GROUPS);
            // 与原版 listCgGroups 一致：按 charId 过滤；character 模式先本卡再全局
            const allowed = new Set(chain.map((id) => String(id)));
            return all.filter((group) => allowed.has(String(group.charId ?? GLOBAL_CHAR_ID)));
        },
        async listCgImages(group) {
            const db = await ensureDb();
            const all = await idbGetAll<CgImageRecord>(db, STORE_CG_IMAGES);
            return all
                .filter((image) => String(image.group ?? "") === group)
                .map(({ imageBlob: _ignored, ...rest }) => rest as CgImageRecord)
                .sort((a, b) => Number(a.index) - Number(b.index));
        },
        async getCgImageBlob(group, index) {
            const db = await ensureDb();
            const record = await idbGet<CgImageRecord>(db, STORE_CG_IMAGES, `cg__${group}__${index}`);
            return record?.imageBlob ?? null;
        },
        async clear() {
            const db = await ensureDb();
            invalidateMoodTable();
            for (const store of [STORE_AVATARS, STORE_MOOD_AVATARS, STORE_CONFIG]) {
                await idbClear(db, store);
            }
        },
        async listMoodAvatarsPrimary() {
            const db = await ensureDb();
            const all = await idbGetAll<AvatarRecord>(db, STORE_MOOD_AVATARS);
            return all.filter((record) => scopeOfRecord(record, "alias") === primaryCharId);
        },
        async getScopeStats() {
            const db = await ensureDb();
            const primary = primaryCharId;
            const stat = { avatars: 0, moodAvatars: 0, bytes: 0 };

            for (const record of await idbGetAll<RawRecord>(db, STORE_AVATARS)) {
                if (scopeOfRecord(record, "alias") !== primary) continue;
                stat.avatars += 1;
                stat.bytes += sizeOfRecord(record);
            }
            for (const record of await idbGetAll<RawRecord>(db, STORE_MOOD_AVATARS)) {
                if (scopeOfRecord(record, "alias") !== primary) continue;
                stat.moodAvatars += 1;
                stat.bytes += sizeOfRecord(record);
            }
            return stat;
        },
        async listScopes() {
            const db = await ensureDb();
            const stats = new Map<string, LibraryScopeStat>();
            const bucket = (charId: string) => {
                let entry = stats.get(charId);
                if (!entry) {
                    entry = { charId, avatars: 0, moodAvatars: 0, cgImages: 0, bytes: 0 };
                    stats.set(charId, entry);
                }
                return entry;
            };

            for (const record of await idbGetAll<RawRecord>(db, STORE_AVATARS)) {
                const entry = bucket(scopeOfRecord(record, "alias"));
                entry.avatars += 1;
                entry.bytes += sizeOfRecord(record);
            }
            for (const record of await idbGetAll<RawRecord>(db, STORE_MOOD_AVATARS)) {
                const entry = bucket(scopeOfRecord(record, "alias"));
                entry.moodAvatars += 1;
                entry.bytes += sizeOfRecord(record);
            }
            // CG 图片本身不带 charId，靠所属组归属
            const groupOwner = new Map<string, string>();
            for (const group of await idbGetAll<RawRecord>(db, STORE_CG_GROUPS)) {
                const name = String(group.group ?? "");
                if (name) groupOwner.set(name, scopeOfRecord(group, "id"));
            }
            for (const image of await idbGetAll<RawRecord>(db, STORE_CG_IMAGES)) {
                const owner = groupOwner.get(String(image.group ?? "")) ?? GLOBAL_CHAR_ID;
                const entry = bucket(owner);
                entry.cgImages += 1;
                entry.bytes += sizeOfRecord(image);
            }

            // 全局排最前，其余按体积从大到小
            return [...stats.values()].sort((a, b) => {
                if (a.charId === GLOBAL_CHAR_ID) return -1;
                if (b.charId === GLOBAL_CHAR_ID) return 1;
                return b.bytes - a.bytes;
            });
        },
        async clearScope(charId) {
            const db = await ensureDb();
            invalidateMoodTable();
            const target = String(charId || GLOBAL_CHAR_ID);

            for (const key of await idbGetAllKeys(db, STORE_AVATARS)) {
                if (charIdFromKey(key) === target) {
                    await idbDelete(db, STORE_AVATARS, key);
                }
            }
            for (const record of await idbGetAll<RawRecord>(db, STORE_MOOD_AVATARS)) {
                if (scopeOfRecord(record, "alias") === target) {
                    const id = String(record.id ?? "");
                    if (id) await idbDelete(db, STORE_MOOD_AVATARS, id);
                }
            }
            // CG：先删该范围的组，再删这些组下的图片
            const ownedGroups = new Set<string>();
            for (const group of await idbGetAll<RawRecord>(db, STORE_CG_GROUPS)) {
                if (scopeOfRecord(group, "id") === target) {
                    const name = String(group.group ?? "");
                    if (name) ownedGroups.add(name);
                    const id = String(group.id ?? "");
                    if (id) await idbDelete(db, STORE_CG_GROUPS, id);
                }
            }
            for (const image of await idbGetAll<RawRecord>(db, STORE_CG_IMAGES)) {
                if (ownedGroups.has(String(image.group ?? ""))) {
                    const id = String(image.id ?? "");
                    if (id) await idbDelete(db, STORE_CG_IMAGES, id);
                }
            }
        },
        async clearAll() {
            const db = await ensureDb();
            invalidateMoodTable();
            // 整表 clear，不做范围判断——这样连归属不明的孤儿记录一起清掉。
            // 刻意不动 config：格式规则/情绪词/样式不属于「头像库」，重新导入也不需要它们。
            for (const store of [STORE_AVATARS, STORE_MOOD_AVATARS, STORE_CG_GROUPS, STORE_CG_IMAGES]) {
                await idbClear(db, store);
            }
        },
    };
}
