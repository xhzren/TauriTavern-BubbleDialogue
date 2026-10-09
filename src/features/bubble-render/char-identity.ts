/**
 * 角色卡身份解析。
 *
 * **不要用 `getContext().characterId`（宿主的 `this_chid`）当身份**：
 * 它是 `characters` 数组的**下标**，宿主的 `setCharacterId()` 注释写得很明白
 * （"Sets a character array index"）。列表顺序 = 角色卡 png 文件名排序，
 * 所以增删/重命名任意一张排在前面的卡，下标就会整体平移——按这个键存的数据
 * 会变成界面里看不到的孤儿（原生存储无法枚举 namespace）。
 *
 * 宿主自己的稳定身份是 **avatar 文件名去掉 `.png`**
 * （见 src/tauri/main/adapters/st/active-chat-ref.js 的 characterStemFromAvatarFileName），
 * 这里跟它保持同一口径；拿不到文件名时退回角色名（宿主也是这个 fallback）。
 */

export interface CharacterIdentityInput {
    characterId?: number | string | null;
    name2?: string | null;
    characters?: unknown;
}

export interface CharacterIdentity {
    /** 稳定身份；没有打开角色卡时为 null */
    id: string | null;
    /** 展示用名字（来自 name2） */
    name: string;
    hasCard: boolean;
}

const AVATAR_EXTENSION = '.png';

function asCharacterRecord(value: unknown): { avatar?: unknown; name?: unknown } | null {
    return value && typeof value === 'object' ? (value as { avatar?: unknown; name?: unknown }) : null;
}

export function resolveCharacterIdentity(
    ctx: CharacterIdentityInput | null | undefined,
    noCardSentinel: string,
): CharacterIdentity {
    const rawName = typeof ctx?.name2 === 'string' ? ctx.name2.trim() : '';

    // characterId 是数组下标；空串不能当 0 用（Number('') === 0 会错认成第一张卡）
    const rawIndex = ctx?.characterId;
    const hasIndex = rawIndex !== undefined && rawIndex !== null && String(rawIndex).trim() !== '';
    const index = hasIndex ? Number(rawIndex) : Number.NaN;
    const characters = ctx?.characters;
    const active = Array.isArray(characters) && Number.isInteger(index) && index >= 0
        ? asCharacterRecord(characters[index])
        : null;

    const avatar = typeof active?.avatar === 'string' ? active.avatar.trim() : '';
    const fromAvatar = avatar.toLowerCase().endsWith(AVATAR_EXTENSION)
        ? avatar.slice(0, -AVATAR_EXTENSION.length)
        : '';
    const fromCharacterName = typeof active?.name === 'string' ? active.name.trim() : '';
    const fromDisplayName = rawName && rawName !== noCardSentinel ? rawName : '';

    const id = fromAvatar || fromCharacterName || fromDisplayName;
    // 未打开角色卡时 name2 是哨兵值，这不是真实角色
    const hasCard = Boolean(id) && rawName !== noCardSentinel;

    return {
        id: hasCard ? id : null,
        name: rawName || noCardSentinel,
        hasCard,
    };
}