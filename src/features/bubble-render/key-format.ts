import { CHAR_ID_SEPARATOR, GLOBAL_CHAR_ID } from "./constants";

/**
 * 头像库的 key 约定（与原脚本 v71 完全一致，不要改）：
 *
 *   主头像 alias   = `<charId>__<名字小写>`
 *   情绪差分 alias = 名字本身（不含 charId）
 *   情绪差分 moodId = `<情绪>__<服装>__<动作>`（已剥掉重复的名字前缀）
 *   情绪差分 lookupKey = `<charId>__<名字>__<moodId>`
 *
 * IDB 的 avatars store 用 keyPath=alias，所以 getAllKeys() 拿到的是上面第一种形态。
 */

/** 名字段之后再出现的 __ 都是情绪/服装/动作后缀，一律丢掉 */
function stripSuffix(segment: string): string {
    const index = segment.indexOf(CHAR_ID_SEPARATOR);
    return index >= 0 ? segment.slice(0, index) : segment;
}

/** 从 alias / key 里取出显示名 */
export function extractDisplayName(storedKey: string, charId?: string | null): string {
    const key = String(storedKey ?? "");
    if (charId !== null && charId !== undefined) {
        const prefix = String(charId) + CHAR_ID_SEPARATOR;
        if (key.startsWith(prefix)) {
            return stripSuffix(key.slice(prefix.length));
        }
    }
    const globalPrefix = GLOBAL_CHAR_ID + CHAR_ID_SEPARATOR;
    if (key.startsWith(globalPrefix)) {
        return stripSuffix(key.slice(globalPrefix.length));
    }
    // 回退：数字型 charId 不含下划线，第一个 __ 之后就是名字。
    // 注意是「之后」——取之前会把 charId 当成名字（历史 bug）。
    const sepIndex = key.indexOf(CHAR_ID_SEPARATOR);
    return sepIndex >= 0
        ? stripSuffix(key.slice(sepIndex + CHAR_ID_SEPARATOR.length))
        : key;
}

/**
 * 从 key 里解析出 charId（第一个 __ 之前的部分）。
 * `_global___名字` -> `_global_`；`1921__名字` -> `1921`；无法解析时回退全局。
 */
export function charIdFromKey(key: string): string {
    const raw = String(key ?? "");
    // `_global_` 自带尾下划线，拼上分隔符后是三个下划线（_global___名字）。
    // 直接找第一个 "__" 会少切一个字符、把全局误判成 "_global"，所以先精确匹配前缀。
    if (raw.startsWith(GLOBAL_CHAR_ID + CHAR_ID_SEPARATOR)) return GLOBAL_CHAR_ID;
    const index = raw.indexOf(CHAR_ID_SEPARATOR);
    if (index <= 0) return GLOBAL_CHAR_ID;
    return raw.slice(0, index) || GLOBAL_CHAR_ID;
}

/** 主头像的 alias */
export function buildAvatarKey(charId: string | null | undefined, name: string): string {
    return String(charId || GLOBAL_CHAR_ID) + CHAR_ID_SEPARATOR + name.trim().toLowerCase();
}

/** 情绪差分的 alias：只有名字 */
export function buildMoodAlias(name: string): string {
    return name.trim().toLowerCase();
}

/** 情绪差分的 lookupKey */
export function buildMoodLookupKey(
    charId: string | null | undefined,
    name: string,
    moodId: string,
): string {
    return (
        String(charId || GLOBAL_CHAR_ID) +
        CHAR_ID_SEPARATOR +
        name.trim().toLowerCase() +
        CHAR_ID_SEPARATOR +
        moodId
    );
}

/**
 * 「按角色配色」的配置键。
 * 与原脚本 buildColorConfigKey **完全一致**：`color_<charId>__<名字小写>`。
 * 注意 charId 后面是单下划线 + 双下划线分隔符（_global_ 自带尾下划线，拼起来是三个）。
 */
export function buildColorConfigKey(charId: string | null | undefined, name: string): string {
    return (
        "color_" +
        String(charId || GLOBAL_CHAR_ID) +
        CHAR_ID_SEPARATOR +
        String(name ?? "").trim().toLowerCase()
    );
}

/** 该 key 是否属于指定 charId 范围（用于按范围过滤列表） */
export function belongsToScope(key: string, charId: string | null | undefined): boolean {
    const prefix = String(charId || GLOBAL_CHAR_ID) + CHAR_ID_SEPARATOR;
    return String(key ?? "").startsWith(prefix);
}
