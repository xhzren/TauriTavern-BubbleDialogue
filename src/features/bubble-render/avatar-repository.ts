/**
 * 头像仓储抽象。
 *
 * 阶段 1：提供 IndexedDB 只读实现，直接复用原脚本建立的 BubbleDialogueAvatars 库，
 *         保证合并后气泡立刻能渲染（不要求用户先迁移数据）。
 * 阶段 2：替换为 TauriTavern 原生实现（api.extension.store 的 Blob / JSON），
 *         控制器与视图代码不需要改动。
 */

export interface AvatarRecord {
    alias?: string;
    imageBlob?: Blob;
    sourceUrl?: string | null;
    mimeType?: string;
    [key: string]: unknown;
}

export interface AvatarRepository {
    /** 主头像（无情绪差分） */
    getAvatar(name: string): Promise<AvatarRecord | null>;
    /** 情绪差分头像，moodId 形如 mood-joy 或 name__mood__outfit__act */
    getMoodAvatar(name: string, moodId: string): Promise<AvatarRecord | null>;
    /** 列出所有情绪差分 record，用于 fallback 池与名字索引 */
    listMoodAvatars(): Promise<AvatarRecord[]>;
    /** 读取配置项；不存在返回 null */
    getConfig(key: string): Promise<unknown>;
    /** 仓储是否可用（库未建好时返回 false，调用方走内置默认值） */
    isReady(): Promise<boolean>;
}
