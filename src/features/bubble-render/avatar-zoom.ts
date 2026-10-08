/**
 * 头像大图查看。
 *
 * 移植自原脚本（轻量气泡 hydration）的 _showZoom：
 * 点气泡头像 → 全屏遮罩 + 原图；点任意处关闭。
 *
 * 遮罩的样式在 style-injector 的 .yq-avatar-zoom-overlay 里，
 * 这里只负责行为，不重复写样式。
 */

const OVERLAY_ID = "yq-avatar-zoom";

export interface AvatarZoom {
    /** 打开大图；重复调用只保留最新一张 */
    show(url: string, alt?: string): void;
    /** 关掉并解绑（停用扩展时调用） */
    dispose(): void;
}

export interface AvatarZoomOptions {
    documentRef: () => Document;
}

export function createAvatarZoom(options: AvatarZoomOptions): AvatarZoom {
    const { documentRef } = options;
    let escapeHandler: ((event: KeyboardEvent) => void) | null = null;

    /** 取文档；宿主文档不可用时返回 null，调用方直接放弃 */
    function currentDoc(): Document | null {
        try {
            return documentRef() ?? null;
        } catch {
            return null;
        }
    }

    function close() {
        const doc = currentDoc();
        if (!doc) return;
        doc.getElementById(OVERLAY_ID)?.remove();
        if (escapeHandler) {
            doc.removeEventListener("keydown", escapeHandler);
            escapeHandler = null;
        }
    }

    return {
        show(url, alt = "") {
            if (!url) return;
            const doc = currentDoc();
            if (!doc) return;

            // 已经开着的先收掉，避免叠加出多层遮罩
            close();

            const overlay = doc.createElement("div");
            overlay.id = OVERLAY_ID;
            overlay.className = "yq-avatar-zoom-overlay";

            const img = doc.createElement("img");
            img.src = url;
            img.alt = alt;
            overlay.appendChild(img);

            // 与原脚本一致：点遮罩任意处关闭
            overlay.addEventListener("click", close);
            // 附加：Esc 也能关（原脚本只有点击；全屏遮罩没有键盘出口不合适）
            escapeHandler = (event: KeyboardEvent) => {
                if (event.key === "Escape") close();
            };
            doc.addEventListener("keydown", escapeHandler);

            (doc.body ?? doc.documentElement).appendChild(overlay);
        },
        dispose() {
            close();
        },
    };
}
