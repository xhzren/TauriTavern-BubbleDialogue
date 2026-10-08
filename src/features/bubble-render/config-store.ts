import { reactive } from "vue";
import {
    DEFAULT_FORMAT_RULE,
    DEFAULT_MOOD_PROMPT_TEMPLATE,
    DEFAULT_MOOD_WORD_GROUPS,
    STYLE_DEFAULTS,
} from "./constants";

/**
 * 配置仓：三个页面（头像管理 / 正文美化 / 情绪配置）共用同一份状态。
 *
 * 读写都走「当前生效的库」，所以切换存储后端或库范围后，
 * 配置会自动跟着切到对应的库，不需要页面自己关心实现。
 */

export interface MoodGroupDraft {
    id: string;
    label: string;
    color: string;
    words: string[];
}

export interface BubbleConfigState {
    formatRule: string;
    moodTemplate: string;
    moodGroups: MoodGroupDraft[];
    style: Record<string, unknown>;
    loaded: boolean;
}

/** 页面依赖的最小读写面，由控制器注入（避免与存储实现耦合） */
export interface ConfigIo {
    getConfig(key: string): Promise<unknown>;
    setConfig(key: string, value: unknown): Promise<void>;
}

function toMoodDrafts(raw: unknown): MoodGroupDraft[] {
    const fallback = () =>
        DEFAULT_MOOD_WORD_GROUPS.map((group) => ({ ...group, words: [...group.words] }));

    if (!Array.isArray(raw)) return fallback();
    const groups = (raw as Array<Record<string, unknown>>)
        .map((group) => ({
            id: String(group.id ?? ""),
            label: String(group.label ?? ""),
            color: String(group.color ?? "#999999"),
            words: Array.isArray(group.words) ? group.words.map(String) : [],
        }))
        .filter((group) => group.id && group.label);
    return groups.length ? groups : fallback();
}

export function createConfigStore(getIo: () => ConfigIo) {
    const state = reactive<BubbleConfigState>({
        formatRule: DEFAULT_FORMAT_RULE,
        moodTemplate: DEFAULT_MOOD_PROMPT_TEMPLATE,
        moodGroups: toMoodDrafts(null),
        style: { ...STYLE_DEFAULTS },
        loaded: false,
    });

    const listeners = new Set<() => void>();
    const notify = () => {
        for (const listener of listeners) listener();
    };

    /**
     * 逐键读取，单项坏了不影响其它项。
     * 之前整体 try/catch 会让一个损坏的 mood_config 连带 style / colors 都读不出来。
     */
    async function readKey<T>(io: ConfigIo, key: string): Promise<T | null> {
        try {
            const value = await io.getConfig(key);
            return (value ?? null) as T | null;
        } catch (error) {
            console.warn(`[BubbleDialogue] config "${key}" read failed.`, error);
            return null;
        }
    }

    async function load() {
        const io = getIo();

        const formatRule = await readKey<unknown>(io, "format_rule");
        if (typeof formatRule === "string" && formatRule.trim()) {
            state.formatRule = formatRule;
        }

        const template = await readKey<unknown>(io, "mood_prompt_template");
        if (typeof template === "string" && template.trim()) {
            state.moodTemplate = template;
        }

        const moodConfig = await readKey<unknown>(io, "mood_config");
        if (typeof moodConfig === "string" && moodConfig.trim()) {
            try {
                const parsed = JSON.parse(moodConfig) as { groups?: unknown };
                state.moodGroups = toMoodDrafts(parsed.groups);
            } catch (error) {
                console.warn("[BubbleDialogue] mood_config is not valid JSON; using defaults.", error);
                state.moodGroups = toMoodDrafts(null);
            }
        }

        // 并行读取：串行会变成 30 次来回，面板打开时明显卡顿
        const style: Record<string, unknown> = { ...STYLE_DEFAULTS };
        const styleKeys = Object.keys(STYLE_DEFAULTS);
        const styleValues = await Promise.all(styleKeys.map((key) => readKey<unknown>(io, key)));
        styleKeys.forEach((key, index) => {
            const value = styleValues[index];
            if (value !== null && value !== undefined) {
                style[key] = value;
            }
        });
        state.style = style;

        state.loaded = true;
        notify();
    }

    function persist(key: string, value: unknown) {
        return getIo().setConfig(key, value);
    }

    return {
        state,
        load,
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        /** 供控制器重建库后重新载入 */
        markStale() {
            state.loaded = false;
        },
        async setFormatRule(value: string) {
            state.formatRule = value;
            await persist("format_rule", value);
            notify();
        },
        async setMoodTemplate(value: string) {
            state.moodTemplate = value;
            await persist("mood_prompt_template", value);
            notify();
        },
        async setMoodGroups(groups: MoodGroupDraft[]) {
            state.moodGroups = groups;
            await persist("mood_config", JSON.stringify({ groups }));
            notify();
        },
        async addMoodWord(groupId: string, word: string) {
            const text = word.trim();
            if (!text) return;
            const groups = state.moodGroups.map((group) =>
                group.id === groupId && !group.words.includes(text)
                    ? { ...group, words: [...group.words, text] }
                    : group,
            );
            await this.setMoodGroups(groups);
        },
        async removeMoodWord(groupId: string, word: string) {
            const groups = state.moodGroups.map((group) =>
                group.id === groupId ? { ...group, words: group.words.filter((w) => w !== word) } : group,
            );
            await this.setMoodGroups(groups);
        },
        async setMoodColor(groupId: string, color: string) {
            const groups = state.moodGroups.map((group) =>
                group.id === groupId ? { ...group, color } : group,
            );
            await this.setMoodGroups(groups);
        },
        async setStyle(key: string, value: unknown) {
            state.style = { ...state.style, [key]: value };
            await persist(key, value);
            notify();
        },
        async setStyleMany(patch: Record<string, unknown>) {
            const next = { ...state.style, ...patch };
            state.style = next;
            for (const [key, value] of Object.entries(patch)) {
                await persist(key, value);
            }
            notify();
        },
        async resetStyleKey(key: string) {
            const defaults = STYLE_DEFAULTS as Record<string, unknown>;
            const fallback = key in defaults ? defaults[key] : undefined;
            state.style = { ...state.style, [key]: fallback };
            await persist(key, fallback);
            notify();
        },
        async resetStyleAll() {
            state.style = { ...STYLE_DEFAULTS };
            for (const [key, value] of Object.entries(STYLE_DEFAULTS)) {
                await persist(key, value);
            }
            notify();
        },
        async resetFormatRule() {
            state.formatRule = DEFAULT_FORMAT_RULE;
            await persist("format_rule", DEFAULT_FORMAT_RULE);
            notify();
        },
        async resetMoodTemplate() {
            state.moodTemplate = DEFAULT_MOOD_PROMPT_TEMPLATE;
            await persist("mood_prompt_template", DEFAULT_MOOD_PROMPT_TEMPLATE);
            notify();
        },
        async resetMoodGroups() {
            state.moodGroups = DEFAULT_MOOD_WORD_GROUPS.map((group) => ({
                ...group,
                words: [...group.words],
            }));
            await persist("mood_config", JSON.stringify({ groups: state.moodGroups }));
            notify();
        },
    };
}

export type BubbleConfigStore = ReturnType<typeof createConfigStore>;
