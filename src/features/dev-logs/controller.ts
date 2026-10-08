import { reactive } from 'vue';
import type { CreatorRuntimeContext } from '../../app/context';
import type { BackendLogEntry, FrontendLogEntry, HostUnsubscribe } from '../../host/api';
import type { CreatorFeatureController } from '../types';

/**
 * 日志页的记录控制器。
 *
 * 为什么状态放在控制器而不是页面组件里：
 * MainPanel 只挂载当前页，切到别的页面组件就会被卸载。
 * 「开启记录」之后用户会去别的页面复现问题，记录必须继续，所以状态放在模块级控制器里。
 *
 * 日志来源是宿主提供的两个接口：
 * - dev.frontendLogs：前端 console 缓冲 + 订阅；需要宿主打开「控制台记录」开关才会入缓冲
 * - dev.backendLogs：后端 tracing 尾部 + 订阅（订阅时才开启事件流）
 */

export type LogSource = 'frontend' | 'backend';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogRecordEntry {
    /** 去重键：来源 + 宿主给的 id */
    key: string;
    timestampMs: number;
    level: LogLevel;
    source: LogSource;
    target: string;
    message: string;
}

export interface LogsFeatureController extends CreatorFeatureController {
    state: {
        recording: boolean;
        busy: boolean;
        error: string | null;
        entries: LogRecordEntry[];
    };
    start(): Promise<void>;
    stop(): Promise<void>;
    clear(): void;
}

/** 面板最多保留多少条，超出丢最旧的 */
const MAX_ENTRIES = 300;
/** 开启时先补多少条历史，避免面板一开始是空的 */
const SEED_LIMIT = 50;

function normalizeLevel(level: unknown): LogLevel {
    const value = String(level ?? '').toLowerCase();
    if (value === 'debug' || value === 'warn' || value === 'error') return value;
    return 'info';
}

export function createLogsFeatureController(context: CreatorRuntimeContext): LogsFeatureController {
    const state = reactive({
        recording: false,
        busy: false,
        error: null as string | null,
        entries: [] as LogRecordEntry[],
    });

    let unsubscribeFrontend: HostUnsubscribe | null = null;
    let unsubscribeBackend: HostUnsubscribe | null = null;
    /** 只有「我们替用户打开了控制台记录」时才记录原值，停止时恢复 */
    let consoleCaptureRestore: boolean | null = null;
    const seen = new Set<string>();

    const push = (entry: LogRecordEntry) => {
        if (seen.has(entry.key)) return;
        seen.add(entry.key);
        const next = state.entries.concat(entry);
        state.entries = next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next;
        // 去重表跟着窗口一起收敛，否则长时间记录会一直涨
        if (seen.size > MAX_ENTRIES * 2) {
            seen.clear();
            for (const item of state.entries) seen.add(item.key);
        }
    };

    const fromFrontend = (entry: FrontendLogEntry) => {
        push({
            key: `f:${entry.id}`,
            timestampMs: Number(entry.timestampMs ?? Date.now()),
            level: normalizeLevel(entry.level),
            source: 'frontend',
            target: String(entry.target ?? 'main'),
            message: String(entry.message ?? ''),
        });
    };

    const fromBackend = (entry: BackendLogEntry) => {
        push({
            key: `b:${entry.id}`,
            timestampMs: Number(entry.timestampMs ?? Date.now()),
            level: normalizeLevel(entry.level),
            source: 'backend',
            target: String(entry.target ?? ''),
            message: String(entry.message ?? ''),
        });
    };

    async function stop(): Promise<void> {
        const frontend = context.host.api.dev?.frontendLogs;
        const stopFrontend = unsubscribeFrontend;
        const stopBackend = unsubscribeBackend;
        unsubscribeFrontend = null;
        unsubscribeBackend = null;

        // 退订失败也要继续恢复开关，否则会把用户的设置留在「开」的状态
        if (stopFrontend) {
            try {
                await stopFrontend();
            } catch (error) {
                console.warn('[BubbleDialogue] unsubscribe frontend logs failed.', error);
            }
        }
        if (stopBackend) {
            try {
                await stopBackend();
            } catch (error) {
                console.warn('[BubbleDialogue] unsubscribe backend logs failed.', error);
            }
        }

        if (frontend && consoleCaptureRestore !== null) {
            const restore = consoleCaptureRestore;
            consoleCaptureRestore = null;
            try {
                await frontend.setConsoleCaptureEnabled(restore);
            } catch (error) {
                console.warn('[BubbleDialogue] restore console capture failed.', error);
            }
        }

        state.recording = false;
    }

    async function start(): Promise<void> {
        if (state.recording || state.busy) return;

        const frontend = context.host.api.dev?.frontendLogs;
        const backend = context.host.api.dev?.backendLogs;
        if (!frontend && !backend) {
            state.error = 'host-api-unavailable';
            return;
        }

        state.busy = true;
        state.error = null;
        try {
            if (frontend) {
                // 前端日志要宿主打开控制台记录才会进缓冲；原值记下来，停止时恢复
                const enabled = await frontend.getConsoleCaptureEnabled();
                if (!enabled) {
                    await frontend.setConsoleCaptureEnabled(true);
                    consoleCaptureRestore = enabled;
                }
                for (const entry of await frontend.list({ limit: SEED_LIMIT })) fromFrontend(entry);
            }
            if (backend) {
                for (const entry of await backend.tail({ limit: SEED_LIMIT })) fromBackend(entry);
            }

            if (frontend) unsubscribeFrontend = await frontend.subscribe(fromFrontend);
            if (backend) unsubscribeBackend = await backend.subscribe(fromBackend);

            state.recording = true;
        } catch (error) {
            state.error = error instanceof Error ? error.message : String(error);
            // 半途失败要回滚：已经订阅的、已经改过的开关都不能留着
            await stop();
        } finally {
            state.busy = false;
        }
    }

    return {
        state,
        start,
        stop,
        clear() {
            state.entries = [];
            seen.clear();
        },
        // 不自动开始：记录必须由用户显式开启
        async activate() {},
        async deactivate() {
            await stop();
        },
    };
}