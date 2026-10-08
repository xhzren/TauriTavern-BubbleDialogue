import type { AvatarLibrary, AvatarScope } from "./storage-types";
import { extractDisplayName } from "./key-format";

/**
 * 把原始 IndexedDB 头像库迁移到 TauriTavern 原生存储。
 *
 * 设计约束：
 * - 只复制，不删除源。原库保留，迁移失败或后悔都能退回。
 * - 逐条写入并计数，中途失败不影响已写入部分（可重跑，已存在会跳过）。
 * - 分批 await 让出主线程，几千条差分图也不会卡死界面。
 */

export interface MigrationReport {
    avatars: number;
    moodAvatars: number;
    configs: number;
    skipped: number;
    failed: number;
}

export interface MigrationOptions {
    source: AvatarLibrary;
    target: AvatarLibrary;
    scope: AvatarScope;
    configKeys?: string[];
    onProgress?: (done: number, total: number) => void;
}

const DEFAULT_CONFIG_KEYS = ["format_rule", "mood_config", "mood_prompt_template"];

export async function migrateLibrary(options: MigrationOptions): Promise<MigrationReport> {
    const { source, target, scope, configKeys = DEFAULT_CONFIG_KEYS, onProgress } = options;

    const report: MigrationReport = {
        avatars: 0,
        moodAvatars: 0,
        configs: 0,
        skipped: 0,
        failed: 0,
    };

    if (!(await source.isReady())) {
        return report;
    }

    // ---- 配置 ----
    for (const key of configKeys) {
        try {
            const value = await source.getConfig(key);
            if (value === null || value === undefined) continue;
            await target.setConfig(key, value);
            report.configs += 1;
        } catch {
            report.failed += 1;
        }
    }

    // ---- 主头像 ----
    const avatarNames = await source.listAvatarNames();
    // ---- 情绪差分 ----
    const moodRecords = await source.listMoodAvatars();

    const total = avatarNames.length + moodRecords.length;
    let done = 0;
    const tick = () => {
        done += 1;
        if (onProgress && done % 25 === 0) onProgress(done, total);
    };

    for (const name of avatarNames) {
        try {
            if (!name) {
                report.skipped += 1;
                tick();
                continue;
            }
            const existing = await target.getAvatar(name);
            if (existing?.imageBlob) {
                report.skipped += 1;
                tick();
                continue;
            }
            const record = await source.getAvatar(name);
            if (!record?.imageBlob) {
                report.skipped += 1;
                tick();
                continue;
            }
            await target.putAvatar(name, record.imageBlob, {
                fileName: record.fileName,
                mimeType: record.mimeType,
                width: record.width,
                height: record.height,
                sourceUrl: record.sourceUrl,
            });
            report.avatars += 1;
        } catch {
            report.failed += 1;
        }
        tick();
        if (done % 50 === 0) await Promise.resolve();
    }

    for (const record of moodRecords) {
        try {
            const name = nameFromKey(String(record.alias ?? ""));
            const moodId = String(record.moodId ?? "");
            if (!name || !moodId) {
                report.skipped += 1;
                tick();
                continue;
            }
            const existing = await target.getMoodAvatar(name, moodId);
            if (existing?.imageBlob) {
                report.skipped += 1;
                tick();
                continue;
            }
            // 列表不预取二进制，必须按需取一次
            const full = await source.getMoodAvatar(name, moodId);
            if (!full?.imageBlob) {
                report.skipped += 1;
                tick();
                continue;
            }
            await target.putMoodAvatar(name, moodId, full.imageBlob, {
                fileName: full.fileName,
                mimeType: full.mimeType,
                width: full.width,
                height: full.height,
                sourceUrl: full.sourceUrl,
            });
            report.moodAvatars += 1;
        } catch {
            report.failed += 1;
        }
        tick();
        if (done % 50 === 0) await Promise.resolve();
    }

    // scope 参与签名，避免未来扩展按模式差异化时被误删
    void scope;
    return report;
}

/** 统一走 key-format 的解析，避免各处口径不一致 */
function nameFromKey(key: string): string {
    return extractDisplayName(key, null);
}
