import { unzip, zip, strToU8, strFromU8 } from "fflate";
import { buildColorConfigKey } from "./key-format";
import type { AvatarLibrary } from "./storage-types";
import {
    EXPORT_TYPE,
    EXPORT_VERSION,
    type ExportAvatarEntry,
    type ExportManifest,
    type ExportMoodAvatarEntry,
    type ImportReport,
} from "./storage-types";

/**
 * 头像库导入导出。
 *
 * 包格式与原脚本 7.1-zip 一致（可用示例包验证）：
 *   manifest.json  { type, version, exportedAt, charId, charName,
 *                    avatars[], moodAvatars[], colors{} }
 *   avatars/<序号>_<名字>.<ext>
 *   mood/<序号>_<名字>_<moodId>.<ext>
 *
 * 导入是「合并」而非「覆盖」：已存在的条目跳过并计入 skipped，
 * 避免误操作把已有的差分图冲掉。
 */

const SAFE_NAME_RE = /[\\/:*?"<>|]/g;

/** TS 5.9 收紧了 Uint8Array 的 buffer 泛型，这里显式取一份普通 ArrayBuffer 视图 */
function toBlobPart(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function safeFileName(name: string): string {
    return String(name ?? "").replace(SAFE_NAME_RE, "_").trim() || "unnamed";
}

function extOf(mimeType: string | undefined, fileName: string | undefined): string {
    const fromName = /\.(webp|png|jpg|jpeg|gif|avif)$/i.exec(String(fileName ?? ""));
    if (fromName) return fromName[1].toLowerCase();
    const mime = String(mimeType ?? "").toLowerCase();
    if (mime.includes("png")) return "png";
    if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
    if (mime.includes("gif")) return "gif";
    if (mime.includes("avif")) return "avif";
    return "webp";
}

export interface ExportOptions {
    library: AvatarLibrary;
    charId: string;
    charName: string;
    colors?: Record<string, string | null>;
    onProgress?: (done: number, total: number) => void;
}

/**
 * 导出为 zip（Uint8Array）。
 * 分批 await 让出主线程，避免大库导出时界面卡死。
 */
export async function exportLibraryZip(options: ExportOptions): Promise<Uint8Array> {
    const { library, charId, charName, colors = {}, onProgress } = options;

    const avatarKeys = await library.listAvatarNames();
    const moodRecords = await library.listMoodAvatars();

    const avatars: ExportAvatarEntry[] = [];
    const moodAvatars: ExportMoodAvatarEntry[] = [];
    const files: Record<string, Uint8Array> = {};

    const total = avatarKeys.length + moodRecords.length;
    let done = 0;
    const tick = () => {
        done += 1;
        if (onProgress && done % 20 === 0) onProgress(done, total);
    };

    for (let i = 0; i < avatarKeys.length; i += 1) {
        const name = avatarKeys[i];
        const record = await library.getAvatar(name);
        if (!record?.imageBlob) {
            tick();
            continue;
        }
        const ext = extOf(record.mimeType as string, record.fileName as string);
        const zipPath = `avatars/${i}_${safeFileName(name)}.${ext}`;
        files[zipPath] = new Uint8Array(await record.imageBlob.arrayBuffer());
        avatars.push({
            name,
            mimeType: (record.mimeType as string) || `image/${ext}`,
            fileName: `${safeFileName(name)}.${ext}`,
            fileSize: record.imageBlob.size,
            width: record.width as number | undefined,
            height: record.height as number | undefined,
            createdAt: record.createdAt as number | undefined,
            updatedAt: record.updatedAt as number | undefined,
            imageUrl: (record.sourceUrl as string) ?? null,
            zipPath,
        });
        tick();
        if (i % 50 === 49) await Promise.resolve();
    }

    for (let i = 0; i < moodRecords.length; i += 1) {
        const record = moodRecords[i];
        const name = String(record.alias ?? "");
        const moodId = String(record.moodId ?? "");
        if (!name || !moodId) {
            tick();
            continue;
        }
        // 列表不预取二进制，这里按需取
        const full = await library.getMoodAvatar(name, moodId);
        if (!full?.imageBlob) {
            tick();
            continue;
        }
        const ext = extOf(full.mimeType as string, full.fileName as string);
        const zipPath = `mood/${i}_${safeFileName(name)}_${moodId}.${ext}`;
        files[zipPath] = new Uint8Array(await full.imageBlob.arrayBuffer());
        moodAvatars.push({
            name,
            moodId,
            mimeType: (full.mimeType as string) || `image/${ext}`,
            fileName: `${safeFileName(name)}_${moodId}.${ext}`,
            fileSize: full.imageBlob.size,
            width: full.width as number | undefined,
            height: full.height as number | undefined,
            createdAt: full.createdAt as number | undefined,
            updatedAt: full.updatedAt as number | undefined,
            imageUrl: (full.sourceUrl as string) ?? null,
            zipPath,
        });
        tick();
        if (i % 50 === 49) await Promise.resolve();
    }

    const manifest: ExportManifest = {
        type: EXPORT_TYPE,
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        charId,
        charName,
        avatars,
        moodAvatars,
        colors,
    };
    files["manifest.json"] = strToU8(JSON.stringify(manifest, null, 2));

    // fflate 的 zip 是 callback 风格；level 0 = 仅打包不压缩
    // （图片已是 webp/png 高压缩格式，再压收益极低却很慢）
    return new Promise<Uint8Array>((resolve, reject) => {
        zip(files, { level: 0 }, (error, data) => {
            if (error) reject(error);
            else resolve(data);
        });
    });
}

/**
 * 从 zip 导入。合并语义：已存在则跳过。
 * manifest 解析失败会抛错（包不是本扩展格式）。
 */
export async function importLibraryZip(
    library: AvatarLibrary,
    data: Uint8Array,
    onProgress?: (done: number, total: number) => void,
    /** 配色写进哪个范围（与原脚本 buildColorConfigKey 一致）；不传按全局 */
    charId: string | null = null,
): Promise<ImportReport> {
    const entries = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
        unzip(data, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });

    const manifestRaw = entries["manifest.json"];
    if (!manifestRaw) {
        throw new Error("压缩包缺少 manifest.json，不是本扩展的头像包");
    }

    let manifest: ExportManifest;
    try {
        manifest = JSON.parse(strFromU8(manifestRaw)) as ExportManifest;
    } catch {
        throw new Error("manifest.json 解析失败");
    }
    if (manifest.type !== EXPORT_TYPE) {
        throw new Error(`不支持的包类型：${String(manifest.type)}`);
    }

    const report: ImportReport = { avatars: 0, moodAvatars: 0, colors: 0, skipped: 0 };
    const list = [...manifest.avatars, ...manifest.moodAvatars];
    const total = list.length;
    let done = 0;

    for (const entry of manifest.avatars) {
        const bytes = entries[entry.zipPath];
        if (!bytes) {
            report.skipped += 1;
            continue;
        }
        const exists = await library.getAvatar(entry.name);
        if (exists?.imageBlob) {
            report.skipped += 1;
            continue;
        }
        const blob = new Blob([toBlobPart(bytes)], { type: entry.mimeType || "image/webp" });
        await library.putAvatar(entry.name, blob, {
            fileName: entry.fileName,
            mimeType: entry.mimeType,
            width: entry.width,
            height: entry.height,
            sourceUrl: entry.imageUrl,
        });
        report.avatars += 1;
        done += 1;
        if (onProgress && done % 20 === 0) onProgress(done, total);
        if (done % 50 === 0) await Promise.resolve();
    }

    for (const entry of manifest.moodAvatars) {
        const bytes = entries[entry.zipPath];
        if (!bytes) {
            report.skipped += 1;
            continue;
        }
        const exists = await library.getMoodAvatar(entry.name, entry.moodId);
        if (exists?.imageBlob) {
            report.skipped += 1;
            continue;
        }
        const blob = new Blob([toBlobPart(bytes)], { type: entry.mimeType || "image/webp" });
        await library.putMoodAvatar(entry.name, entry.moodId, blob, {
            fileName: entry.fileName,
            mimeType: entry.mimeType,
            width: entry.width,
            height: entry.height,
            sourceUrl: entry.imageUrl,
        });
        report.moodAvatars += 1;
        done += 1;
        if (onProgress && done % 20 === 0) onProgress(done, total);
        if (done % 50 === 0) await Promise.resolve();
    }

    for (const [name, color] of Object.entries(manifest.colors ?? {})) {
        if (color) {
            // 键格式必须与原脚本一致（color_<charId>__<名字小写>），
            // 否则导出的配色读不回来
            await library.setConfig(buildColorConfigKey(charId, name), color);
            report.colors += 1;
        }
    }

    return report;
}

export { EXPORT_TYPE, EXPORT_VERSION };
