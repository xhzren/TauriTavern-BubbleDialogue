import { MOOD_GROUPS, type MoodGroup, type MoodWordGroup } from "./constants";

/**
 * 情绪解析：把模型写的中文情绪词映射到 8 组差分之一。
 *
 * 顺序与原始脚本一致：精确命中（id / label / 词）-> 子串包含 -> 兜底 mood-calm。
 * 兜底到「平和」的原因：生图只做了 8 种差分，落空会掉到无情绪主头像，
 * 而平和是最中性的情绪，误判代价最小。
 */
export function createMoodResolver(groups: MoodWordGroup[]) {
    const index = new Map<string, MoodGroup>();
    for (const group of groups) {
        index.set(group.id, group);
        index.set(group.label, group);
        for (const word of group.words) {
            index.set(word, group);
        }
    }
    const keys = Array.from(index.keys());

    return function resolveMoodGroup(moodText: string): MoodGroup | null {
        const text = String(moodText ?? "").trim();
        if (!text) return null;
        const exact = index.get(text);
        if (exact) return exact;
        for (const key of keys) {
            if (text.includes(key)) {
                return index.get(key) ?? null;
            }
        }
        return index.get("mood-calm") ?? null;
    };
}

/** 无自定义配置时的默认解析器（只用 8 组色卡，不带词表） */
export function createFallbackMoodResolver() {
    const byId = new Map<string, MoodGroup>(MOOD_GROUPS.map((group) => [group.id, group]));
    const byLabel = new Map<string, MoodGroup>(MOOD_GROUPS.map((group) => [group.label, group]));
    return function resolve(moodText: string): MoodGroup | null {
        const text = String(moodText ?? "").trim();
        if (!text) return null;
        return byId.get(text) ?? byLabel.get(text) ?? byId.get("mood-calm") ?? null;
    };
}
