/**
 * 扩展存储的 key 编码。
 *
 * 宿主硬性限制（Rust 侧校验，两套 store 都是）：namespace / table / key
 * 只允许 [A-Za-z0-9_.-]，且不能是 "." / ".."、不能以 "." 开头。
 * 头像与 CG 分组名是中文（如「林知意」），直接当 key 会被拒绝。
 *
 * 因此把非 ASCII 段编码成 hex：每个 UTF-8 字节 → 两位小写 hex，字符集安全且可逆。
 *
 * 分隔符用 "-x-"：短横线合法，且真实取值里不会出现 "-x-" 这个组合
 * （mood-joy / act-sfw / outfit-casual 等都不会与之冲突）。
 * 不能用单个 "-"：它会把 mood-joy 切碎；也不能用 "_"：_global_ 自带下划线。
 *
 * 但角色卡 id 现在是**卡文件名**（见 char-identity.ts），而文件名是用户可控的，
 * 现场实测就有 "A-x-B"、"x" 这种。所以「看起来安全」的分隔符并不够：
 * 只要某段以 "x" 开头且其余部分是合法 hex，它就会被解码器当成 hex 段。
 * 规则很简单：**命中这两种情况就整段走 hex 编码**（而不是做局部转义），
 * 因为 hex 段只含 [0-9a-f]，天然不含 "-x-"，不可能再被切开。
 * 代价只是这类文件名稍长一点，换来任意文件名都能原样往返。
 */

const SAFE_RE = /^[A-Za-z0-9_.-]+$/;

function isSafe(value: string): boolean {
    return value.length > 0 && SAFE_RE.test(value) && value !== "." && value !== ".." && !value.startsWith(".");
}

const SEGMENT_SEPARATOR = "-x-";

function encodeSegment(segment: string): string {
    if (isSafe(segment)) {
        // 以 "x" 开头会被解码器误当成 hex 标记（"x" + 偶数个 hex）；
        // 含分隔符则会被切开。两种情况都整段走 hex。
        const isAmbiguous = segment.startsWith("x") || segment.includes(SEGMENT_SEPARATOR);
        if (!isAmbiguous) {
            return segment;
        }
    }
    const bytes = new TextEncoder().encode(segment);
    let hex = "";
    for (const byte of bytes) {
        hex += byte.toString(16).padStart(2, "0");
    }
    // "x" 前缀标记这是编码段，解码时据此还原；同时保证不以 "." 开头
    return `x${hex}`;
}

/** 解码单段：命中 hex 标记就还原成原文 */
function decodeSegment(segment: string): string {
    if (!segment.startsWith("x")) {
        return segment;
    }
    const hex = segment.slice(1);
    if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-f]+$/.test(hex)) {
        // 不是合法的 hex 段：可能是字面量 "x..."，此时保留原样
        return segment;
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i += 1) {
        bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return new TextDecoder().decode(bytes);
}

/** 把任意段（可含中文）编码成宿主接受的 key。 */
export function encodeStoreKey(segments: string[]): string {
    return segments
        .map(encodeSegment)
        .join(SEGMENT_SEPARATOR);
}

/** 还原 encodeStoreKey 的结果。 */
export function decodeStoreKey(key: string): string[] {
    return key.split(SEGMENT_SEPARATOR).map(decodeSegment);
}

/**
 * blob 的 MIME 由宿主按 key 的文件扩展名猜测。
 * 为了拿到正确的 image/* ，把真实扩展名作为最后一段拼在编码 key 之后。
 */
export function withExtension(key: string, extension: string): string {
    const normalized = extension.replace(/^\./, "");
    if (!normalized || !SAFE_RE.test(normalized)) {
        return key;
    }
    return `${key}.${normalized}`;
}
