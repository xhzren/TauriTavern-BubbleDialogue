import type { AvatarRecord } from "./avatar-repository";

/**
 * 存储模式。
 *
 * - global：全局库。所有角色卡共用一份头像，charId 固定为 _global_。
 * - character：按角色卡隔离。每张卡有自己的头像库，查找时先查本卡、
 *   miss 再回退到全局（与原脚本 buildAvatarKey 的查找顺序一致）。
 */
export type StorageMode = "global" | "character";

/**
 * 头像库的命名空间解析。
 * 角色卡 id 可能是纯数字或任意字符串，直接当 namespace 有风险
 * （宿主限制 [A-Za-z0-9_.-]，且禁止 "." / ".."、不能以 "." 开头），
 * 因此统一走 store-key 的编码。
 */
export interface AvatarScope {
    mode: StorageMode;
    /** character 模式下的角色卡 id；global 模式为 null */
    charId: string | null;
}

export const GLOBAL_SCOPE: AvatarScope = { mode: "global", charId: null };

export function scopeFor(mode: StorageMode, charId: string | null): AvatarScope {
    return mode === "character" && charId ? { mode: "character", charId } : GLOBAL_SCOPE;
}

/** 同一次查询要依次尝试的 scope：本卡 -> 全局 */
export function scopeLookupChain(scope: AvatarScope): AvatarScope[] {
    if (scope.mode === "character") {
        return [scope, GLOBAL_SCOPE];
    }
    return [GLOBAL_SCOPE];
}

/** 导出包格式（与原脚本 7.1-zip 对齐） */
export const EXPORT_TYPE = "bubble-character";
export const EXPORT_VERSION = "7.1-zip";

export interface ExportAvatarEntry {
    name: string;
    mimeType: string;
    fileName: string;
    fileSize: number;
    width?: number;
    height?: number;
    createdAt?: number;
    updatedAt?: number;
    /** 网络图床地址；本地 blob 优先 */
    imageUrl: string | null;
    /** 该图片在 zip 内的路径 */
    zipPath: string;
}

export interface ExportMoodAvatarEntry extends ExportAvatarEntry {
    /** 形如 mood-joy__outfit-casual__act-sfw */
    moodId: string;
}

export interface ExportManifest {
    type: typeof EXPORT_TYPE;
    version: typeof EXPORT_VERSION;
    exportedAt: string;
    charId: string;
    charName: string;
    avatars: ExportAvatarEntry[];
    moodAvatars: ExportMoodAvatarEntry[];
    colors: Record<string, string | null>;
}

export interface ImportReport {
    avatars: number;
    moodAvatars: number;
    colors: number;
    skipped: number;
}

/** CG 图片组（按角色卡隔离） */
export interface CgGroupRecord {
    group: string;
    albumUrl: string;
    charId: string;
    count: number;
    imageUrls: string[];
}

/** 单张 CG 图片 */
export interface CgImageRecord {
    group: string;
    index: number;
    imageBlob?: Blob;
    sourceUrl?: string;
    mimeType?: string;
    fileSize?: number;
}

/** 某个范围内占用的数据统计（存储页列表用） */
export interface LibraryScopeStat {
    /** `_global_` 或角色卡 id */
    charId: string;
    avatars: number;
    moodAvatars: number;
    cgImages: number;
    bytes: number;
}

/** 头像库读写面。阶段 2 的原生实现与阶段 1 的 IDB 实现共用这个契约。 */
export interface AvatarLibrary {
    isReady(): Promise<boolean>;
    getAvatar(name: string): Promise<AvatarRecord | null>;
    getMoodAvatar(name: string, moodId: string): Promise<AvatarRecord | null>;
    listMoodAvatars(): Promise<AvatarRecord[]>;
    /**
     * 列出当前主范围（global 或当前角色卡）下的头像显示名。
     * 只列主范围，不回退链——列表展示要与「库范围」选择器一致。
     */
    listAvatarNames(): Promise<string[]>;
    getConfig(key: string): Promise<unknown>;
    setConfig(key: string, value: unknown): Promise<void>;
    putAvatar(name: string, blob: Blob, meta?: Record<string, unknown>): Promise<void>;
    putMoodAvatar(name: string, moodId: string, blob: Blob, meta?: Record<string, unknown>): Promise<void>;
    deleteAvatar(name: string): Promise<void>;
    deleteMoodAvatar(name: string, moodId: string): Promise<void>;
    /** 列出当前生效范围内的 CG 组（不预取图片二进制） */
    listCgGroups(): Promise<CgGroupRecord[]>;
    /** 列出某组下的 CG 图（不含 imageBlob，避免一次拉爆内存） */
    listCgImages(group: string): Promise<CgImageRecord[]>;
    /** 按需取单张 CG 的二进制 */
    getCgImageBlob(group: string, index: number): Promise<Blob | null>;
    /** 清空当前范围内的头像/差分/配置 */
    clear(): Promise<void>;
    /**
     * 清空整个头像库：所有角色卡范围 + 全局，一并删除。
     * 用于「重新导入」前彻底清场——含那些已经找不到归属的孤儿记录。
     */
    clearAll(): Promise<void>;
    /**
     * 只统计当前主范围（不含回退链）。
     * 面板展示要与「库范围」选择器一致；水合另走回退链。
     */
    getScopeStats(): Promise<{ avatars: number; moodAvatars: number; bytes: number }>;
    /**
     * 只列当前主范围的情绪差分（不含回退链）。
     * 面板展示用；水合解析走 listMoodAvatars() 的回退链。
     */
    listMoodAvatarsPrimary(): Promise<AvatarRecord[]>;
    /** 按范围统计占用（全局 + 每张角色卡），用于存储页列表 */
    listScopes(): Promise<LibraryScopeStat[]>;
    /** 只删除指定范围的数据（含该范围的 CG） */
    clearScope(charId: string): Promise<void>;
}
