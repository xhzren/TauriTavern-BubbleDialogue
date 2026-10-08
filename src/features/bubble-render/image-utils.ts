/**
 * 头像图片处理。
 *
 * 原版在上传前会做尺寸校验与压缩；这里保持同样的思路：
 * - 限制体积，避免超大图把存储和 IPC 拖垮（宿主 blob 走 base64 IPC）
 * - 可选转 WebP 压缩，跟随「存储优化」里的开关与质量
 */

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const MAX_DIMENSION = 1024;

export interface CompressOptions {
    enabled: boolean;
    quality: number;
}

/** 读成 ImageBitmap 以拿到原始尺寸；失败时抛可读错误 */
async function decode(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
    if (typeof createImageBitmap === "function") {
        return await createImageBitmap(file);
    }
    const url = URL.createObjectURL(file);
    try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error("图片解码失败"));
            el.src = url;
        });
        return image;
    } finally {
        URL.revokeObjectURL(url);
    }
}

/**
 * 按需压缩。返回可直接入库的 Blob。
 * 未开启压缩时原样返回，但仍做体积与尺寸校验。
 */
export async function prepareAvatarBlob(file: File, options: CompressOptions): Promise<Blob> {
    if (file.size > MAX_UPLOAD_BYTES * 4) {
        throw new Error(`图片过大（${(file.size / 1024 / 1024).toFixed(1)}MB），请先自行压缩`);
    }

    const source = await decode(file);
    const width = "width" in source ? source.width : 0;
    const height = "height" in source ? source.height : 0;

    const needsResize = Math.max(width, height) > MAX_DIMENSION;
    if (!options.enabled && !needsResize) {
        return file;
    }

    const scale = needsResize ? MAX_DIMENSION / Math.max(width, height) : 1;
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(source as CanvasImageSource, 0, 0, targetW, targetH);
    if ("close" in source && typeof source.close === "function") {
        source.close();
    }

    const quality = Math.min(1, Math.max(0.3, options.quality));
    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((result) => resolve(result), "image/webp", quality);
    });
    if (!blob) return file;
    // 压缩反而变大时用原图（小图常见）
    return blob.size < file.size ? blob : file;
}

/** 从文件名推断一个可用的角色名（去掉扩展名） */
export function nameFromFile(fileName: string): string {
    return String(fileName ?? "").replace(/\.[^.]+$/, "").trim() || "未命名";
}
