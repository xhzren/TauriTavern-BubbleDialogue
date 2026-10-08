/**
 * 宿主桥接层 —— 本扩展跑在主 document 的同 realm 内，直接通过
 * window.SillyTavern.getContext() 拿 ST 兼容面（事件总线 / 提示词注入 / 角色信息）。
 *
 * 所有裸 ST 全局（getContext / eventSource / event_types）都没有挂到 window 上，
 * 必须走 window.SillyTavern.getContext()。
 */

export interface StEventSource {
    on(event: string, handler: (...args: unknown[]) => void): void;
    off?(event: string, handler: (...args: unknown[]) => void): void;
    emit?(event: string, ...args: unknown[]): void;
}

export interface StEventTypes {
    [key: string]: string;
}

export interface StContext {
    chat?: unknown[];
    characters?: unknown[];
    name1?: string;
    name2?: string;
    characterId?: number | string;
    groupId?: number | string;
    chatId?: string;
    eventSource?: StEventSource;
    eventTypes?: StEventTypes;
    setExtensionPrompt?: (
        name: string,
        content: string,
        position?: number,
        depth?: number,
        scan?: boolean,
        role?: number,
    ) => void;
    [key: string]: unknown;
}

declare global {
    interface Window {
        SillyTavern?: {
            getContext?: () => StContext;
            libs?: unknown;
            i18n?: unknown;
        };
    }
}

/** 取得 ST 兼容上下文；宿主未就绪时返回 null，调用方需自行降级。 */
export function getStContext(): StContext | null {
    try {
        const factory = window.SillyTavern?.getContext;
        if (typeof factory !== "function") {
            return null;
        }
        return factory() ?? null;
    } catch {
        return null;
    }
}

export function getStEventSource(): StEventSource | null {
    return getStContext()?.eventSource ?? null;
}

export function getStEventTypes(): StEventTypes | null {
    return getStContext()?.eventTypes ?? null;
}

/**
 * 订阅事件并返回退订函数。订阅与退订使用同一批 handler 引用，
 * 保证 deactivate() 能清干净。
 */
export function subscribeStEvent(
    event: string,
    handler: (...args: unknown[]) => void,
): () => void {
    const source = getStEventSource();
    if (!source) {
        return () => {};
    }
    try {
        source.on(event, handler);
        return () => {
            try {
                source.off?.(event, handler);
            } catch {
                /* 退订失败不阻断卸载 */
            }
        };
    } catch {
        return () => {};
    }
}

/** 事件名解析：优先用宿主枚举，缺失时回退到 ST 的字符串字面量。 */
export function resolveEventName(key: string, fallback: string): string {
    const types = getStEventTypes();
    const value = types?.[key];
    return typeof value === "string" && value ? value : fallback;
}
