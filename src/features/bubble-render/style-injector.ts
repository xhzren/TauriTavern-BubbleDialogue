/**
 * 正文美化：把 style_* 配置编译成 CSS 并注入主文档。
 *
 * 移植自原脚本（轻量气泡 hydration）的 _buildCSS + _injectCSS。
 * 原脚本里真正让气泡变样的就是这段 CSS；扩展此前只存配置、没注入，
 * 所以「正文美化」一直是只存不用。
 *
 * 覆盖范围：主文档里的 .yq-bubble 气泡 —— 头像尺寸/形状、名字/情绪/正文的
 * 字号字重字色、对白引号、心里话斜体、大图查看遮罩。
 *
 * 不覆盖：style_narration*（旁白）。那些由原脚本的 iframe 渲染器
 * （#dcRoot / .dc-narration-block）消费，不在本扩展接管的 DOM 范围内。
 */

import { STYLE_DEFAULTS } from "./constants";

/** 注入用的 style 元素 id（与原脚本一致，便于两边互相覆盖） */
export const STYLE_ELEMENT_ID = "yq-bubble-lite-style";

/**
 * 原脚本 YQ_DEFAULTS 里「v7.1 面板不暴露」的气泡外观基准值。
 * v7.1 只开放了部分开关，其余固定值沿用原脚本的取值。
 */
const BASE = {
    avatarBorderRadius: 12,
    nameSizeEm: 0.95,
    moodSizeEm: 0.78,
    quoteSizeEm: 1.2,
    lineHeight: 1.6,
    nameFontWeight: 700,
    dialogueFontWeight: 400,
    bubbleBg: "rgba(255,255,255,0.04)",
    bubbleBorderLeftWidth: 3,
    bubbleGap: 10,
    bubblePaddingX: 14,
    dialogueTextColor: "#f0933d",
    thoughtColor: "#ff8fc4",
    thoughtObliqueDeg: 18,
};

const AVATAR_SIZE_MIN = 32;
const AVATAR_SIZE_MAX = 96;
const FONT_SIZE_MIN = 12;
const FONT_SIZE_MAX = 22;
const WEIGHT_MIN = 100;
const WEIGHT_MAX = 900;

function num(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/** 只接受 #rgb / #rrggbb 这类合法色值，避免把坏值直接写进 CSS */
function hexColor(value: unknown, fallback: string): string {
    const text = String(value ?? "").trim();
    return /^#[0-9a-f]{3,8}$/i.test(text) ? text : fallback;
}

function fontStack(family: string, fallback: string): string {
    const text = String(family ?? "").trim();
    return text ? '"' + text + '", ' + fallback : "inherit";
}

function defaultValue(key: string, fallback: number): number {
    return num(STYLE_DEFAULTS[key], fallback);
}

/**
 * 把 style_* 配置编译成气泡 CSS。
 * 规则顺序与选择器与原脚本 _buildCSS 保持一致（含 .custom-yq- 双份类名）。
 */
export function buildBubbleCss(style: Record<string, unknown>): string {
    const avatarSize = clamp(
        num(style.style_avatarSize, defaultValue("style_avatarSize", 52)),
        AVATAR_SIZE_MIN,
        AVATAR_SIZE_MAX,
    );
    const avatarSizeStr = avatarSize + "px";

    // 形状映射与原脚本一致：circle → 50% / square → 0 / rounded → 8px
    const shape = String(style.style_avatarShape ?? "");
    const avatarBRStr =
        shape === "circle"
            ? "50%"
            : shape === "square"
              ? "0px"
              : shape === "rounded"
                ? "8px"
                : BASE.avatarBorderRadius + "px";

    const dialogueFontSizePx = clamp(
        num(style.style_dialogueFontSize, defaultValue("style_dialogueFontSize", 14.5)),
        FONT_SIZE_MIN,
        FONT_SIZE_MAX,
    );
    const nameSize = "calc(" + dialogueFontSizePx + "px * " + BASE.nameSizeEm + ")";
    const moodSize = "calc(" + dialogueFontSizePx + "px * " + BASE.moodSizeEm + ")";
    const quoteSize = "calc(" + dialogueFontSizePx + "px * " + BASE.quoteSizeEm + ")";
    const dialogueSize = dialogueFontSizePx + "px";

    const dialogueFamily = fontStack(
        String(style.style_dialogueFontFamily ?? ""),
        '"Source Han Serif SC", serif',
    );
    const nameFamily = fontStack(
        String(style.style_nameFontFamily ?? ""),
        '"Source Han Serif SC", serif',
    );

    const nameWeight = clamp(
        num(style.style_nameFontWeight, BASE.nameFontWeight),
        WEIGHT_MIN,
        WEIGHT_MAX,
    );
    const dialogueWeight = clamp(
        num(style.style_dialogueFontWeight, BASE.dialogueFontWeight),
        WEIGHT_MIN,
        WEIGHT_MAX,
    );

    const dialogueColor = hexColor(style.style_globalTextColor, BASE.dialogueTextColor);
    const thoughtColor = BASE.thoughtColor;
    const thoughtStyle = "oblique " + BASE.thoughtObliqueDeg + "deg";

    // v7.1 的「气泡间距」实际用作上下内边距，且下限 6px（与原脚本一致）
    const paddingY =
        Math.max(
            6,
            num(style.style_dialogueSpacing, defaultValue("style_dialogueSpacing", 10)),
        ) + "px";
    const paddingX = BASE.bubblePaddingX + "px";
    const gap = BASE.bubbleGap + "px";
    const borderLeftWidth = BASE.bubbleBorderLeftWidth + "px";

    return [
        ".yq-bubble,.custom-yq-bubble{display:flex;gap:" +
            gap +
            ";margin:10px 0;padding:" +
            paddingY +
            " " +
            paddingX +
            ";background:" +
            BASE.bubbleBg +
            ";border-left:" +
            borderLeftWidth +
            " solid var(--yq-mood-color,rgba(255,255,255,0.3));border-radius:8px;align-items:flex-start;transition:border-color 0.2s}",
        ".yq-bubble-avatar,.custom-yq-bubble-avatar{width:" +
            avatarSizeStr +
            ";height:" +
            avatarSizeStr +
            ";border-radius:" +
            avatarBRStr +
            ";flex-shrink:0;object-fit:cover;background:rgba(255,255,255,0.06);border:2px solid var(--yq-mood-color,rgba(255,255,255,0.2));cursor:zoom-in;display:block}",
        ".yq-bubble-avatar-fallback,.custom-yq-bubble-avatar-fallback{width:" +
            avatarSizeStr +
            ";height:" +
            avatarSizeStr +
            ";border-radius:" +
            avatarBRStr +
            ";flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:calc(" +
            avatarSizeStr +
            " * 0.42);font-weight:700;color:#fff;background:var(--yq-mood-color,rgba(255,255,255,0.18));border:2px solid var(--yq-mood-color,rgba(255,255,255,0.2));font-family:" +
            nameFamily +
            ";cursor:default;user-select:none}",
        ".yq-bubble-body,.custom-yq-bubble-body{flex:1;min-width:0}",
        ".yq-bubble-header,.custom-yq-bubble-header{display:flex;gap:8px;align-items:baseline;margin-bottom:4px}",
        ".yq-bubble-name,.custom-yq-bubble-name{font-weight:" +
            nameWeight +
            ";font-size:" +
            nameSize +
            ";color:var(--yq-mood-color,rgba(255,255,255,0.95));font-family:" +
            nameFamily +
            "}",
        ".yq-bubble-mood,.custom-yq-bubble-mood{font-size:" +
            moodSize +
            ";color:#fff;padding:1px 6px;background:var(--yq-mood-color,rgba(255,255,255,0.15));border-radius:4px;opacity:0.85}",
        // 正文颜色：优先用气泡自己的 --yq-text-color（「按角色」配色模式会按名字注入），
        // 没有才用「全局」配置色
        ".yq-bubble-text,.custom-yq-bubble-text{color:var(--yq-text-color," +
            dialogueColor + ")" +
            ";line-height:" +
            BASE.lineHeight +
            ";word-break:break-word;position:relative;padding:0 2px;font-size:" +
            dialogueSize +
            ";font-family:" +
            dialogueFamily +
            ";font-weight:" +
            dialogueWeight +
            "}",
        ".yq-bubble-text.yq-bubble-text-dialogue::before,.custom-yq-bubble-text.custom-yq-bubble-text-dialogue::before{content:'\\201C';color:var(--yq-mood-color,rgba(255,255,255,0.4));font-size:" +
            quoteSize +
            ";font-weight:700;margin-right:2px}",
        ".yq-bubble-text.yq-bubble-text-dialogue::after,.custom-yq-bubble-text.custom-yq-bubble-text-dialogue::after{content:'\\201D';color:var(--yq-mood-color,rgba(255,255,255,0.4));font-size:" +
            quoteSize +
            ";font-weight:700;margin-left:2px}",
        ".yq-bubble-text em,.yq-bubble-text i,.custom-yq-bubble-text em,.custom-yq-bubble-text i{font-style:" +
            thoughtStyle +
            ";color:" +
            thoughtColor +
            ";font-weight:normal}",
        ".yq-bubble-text-thought,.custom-yq-bubble-text-thought{font-style:" +
            thoughtStyle +
            ";color:" +
            thoughtColor +
            "}",
        ".yq-avatar-zoom-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;animation:yq-zoom-fade 0.15s ease-out}",
        ".yq-avatar-zoom-overlay img{max-width:90vw;max-height:90vh;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.6)}",
        "@keyframes yq-zoom-fade{from{opacity:0}to{opacity:1}}",
    ].join("\n");
}

export interface BubbleStyleInjector {
    /** 读当前配置并注入 / 更新样式；重复调用只更新内容，不重建元素 */
    apply(): void;
    /** 移除注入的样式（卸载时调用） */
    dispose(): void;
}

export interface BubbleStyleInjectorOptions {
    documentRef: () => Document;
    readStyle: () => Record<string, unknown>;
}

export function createBubbleStyleInjector(options: BubbleStyleInjectorOptions): BubbleStyleInjector {
    const { documentRef, readStyle } = options;

    return {
        apply() {
            let doc: Document;
            try {
                doc = documentRef();
            } catch {
                return;
            }
            const css = buildBubbleCss(readStyle() ?? {});
            const existing = doc.getElementById(STYLE_ELEMENT_ID);
            if (existing) {
                // 配置变更时更新现有样式（不重建），与原脚本一致
                if (existing.textContent !== css) existing.textContent = css;
                return;
            }
            const styleEl = doc.createElement("style");
            styleEl.id = STYLE_ELEMENT_ID;
            styleEl.textContent = css;
            (doc.head ?? doc.body ?? doc.documentElement)?.appendChild(styleEl);
        },
        dispose() {
            try {
                documentRef().getElementById(STYLE_ELEMENT_ID)?.remove();
            } catch {
                /* 文档已不可用，忽略 */
            }
        },
    };
}
