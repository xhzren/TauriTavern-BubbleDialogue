import defaultBubbleIcon from '../assets/default-bubble-icon.webp?inline';

/**
 * 默认悬浮球图标。
 *
 * 用 `?inline` 让构建把图片打成 data URL：
 * 扩展是从 /scripts/extensions/third-party/<名字>/dist/index.js 加载的，
 * 走 Vite 的独立资源文件会得到一个以站点根开头的 URL，在扩展目录下会 404。
 * data URL 也正好和「用户上传的图标」是同一种形态（settings-store 里存的就是 data URL）。
 */
export const DEFAULT_BUBBLE_ICON = defaultBubbleIcon;