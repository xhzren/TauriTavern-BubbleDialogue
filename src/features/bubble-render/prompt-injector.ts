import { DEFAULT_FORMAT_RULE, DEFAULT_MOOD_PROMPT_TEMPLATE, type MoodWordGroup } from "./constants";

/**
 * 把「对话格式规则 + 情绪词约束」注入到 outgoing prompt。
 *
 * 走宿主原生 context.setExtensionPrompt（不是 JSR 的 injectPrompts），
 * 该函数由 window.SillyTavern.getContext() 暴露，属于公开契约。
 *
 * 注入文本构建全程容错：配置读不到就回退到内置常量，
 * 保证「提示词管理器里永远能看到格式规则」，与存储状态解耦。
 */

export interface PromptInjector {
    apply(): void;
    invalidate(): void;
    dispose(): void;
}

export interface InjectorOptions {
    setExtensionPrompt: (name: string, content: string, position: number, depth: number, scan: boolean, role: number) => void;
    id?: string;
    readFormatRule: () => Promise<string | null>;
    readMoodGroups: () => Promise<MoodWordGroup[] | null>;
    readMoodTemplate: () => Promise<string | null>;
}

function buildGroupsText(groups: MoodWordGroup[]): string {
    return groups
        .map((group) => group.label + "组：" + group.words.join("、"))
        .join("\n")
        .trimEnd();
}

export function createPromptInjector(options: InjectorOptions): PromptInjector {
    const {
        setExtensionPrompt,
        id = "bubble-dialogue-format",
        readFormatRule,
        readMoodGroups,
        readMoodTemplate,
    } = options;

    let cache: string | null = null;

    async function buildContent(): Promise<string> {
        if (cache) return cache;

        let ruleText = "";
        try {
            const raw = await readFormatRule();
            ruleText = raw && raw.trim() ? raw.trim() : "";
        } catch {
            ruleText = "";
        }
        if (!ruleText) ruleText = DEFAULT_FORMAT_RULE;

        let groups: MoodWordGroup[] | null = null;
        try {
            groups = await readMoodGroups();
        } catch {
            groups = null;
        }

        let template = "";
        try {
            const rawTemplate = await readMoodTemplate();
            template = rawTemplate && rawTemplate.trim() ? rawTemplate.trim() : "";
        } catch {
            template = "";
        }
        if (!template) template = DEFAULT_MOOD_PROMPT_TEMPLATE;

        let moodText: string;
        if (groups && groups.length) {
            moodText = template.replace(/\{\{mood_groups\}\}/g, buildGroupsText(groups));
        } else {
            // 无自定义词表时保留模板原始占位符，避免注入一段空约束
            moodText = template;
        }

        cache = ruleText + "\n\n" + moodText;
        return cache;
    }

    return {
        apply() {
            void buildContent()
                .then((content) => {
                    try {
                        setExtensionPrompt(
                            id,
                            content,
                            0, // position: IN_PROMPT
                            0, // depth: 紧贴最新
                            false, // 不扫描世界书
                            0, // role: SYSTEM
                        );
                    } catch (error) {
                        console.warn("[BubbleDialogue] setExtensionPrompt failed.", error);
                    }
                })
                .catch((error) => {
                    console.warn("[BubbleDialogue] Failed to build injection content.", error);
                });
        },
        invalidate() {
            cache = null;
        },
        dispose() {
            cache = null;
        },
    };
}
