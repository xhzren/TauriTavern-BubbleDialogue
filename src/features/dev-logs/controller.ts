import { reactive } from 'vue';
import type { CreatorRuntimeContext } from '../../app/context';
import type { FrontendLogEntry, HostUnsubscribe } from '../../host/api';
import type { CreatorFeatureController } from '../types';

/**
 * 日志页的记录控制器。
 *
 * 为什么状态放在控制器而不是页面组件里：
 * MainPanel 只挂载当前页，切到别的页面组件就会被卸载。
 * 「开启记录」之后用户会去别的页面复现问题，记录必须继续，所以状态放在模块级控制器里。
 *
 * 日志来源：宿主的 dev.frontendLogs（console 缓冲 + 订阅）。
 * 需要宿主打开「控制台记录」开关才会入缓冲，开启记录时会替用户打开、停止时恢复原值。
 *
 * 只看本扩展自己的日志：
 * 宿主的 detectCurrentLogTarget() 目前恒返回 'main'（所有第三方脚本的 console 都被
 * 打成 main，截图里那些 QR助手 / dynamic-styles 就是这么来的），所以无法按 target 过滤；
 * 本扩展所有 console 输出统一带 [BubbleDialogue] 前缀，用它过滤才准确。
 * 后端 tracing 日志不属于本扩展，直接不订阅。
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 本扩展自己的日志前缀（所有 console 输出都用它，见 tests/logs-controller） */
const OWN_LOG_PREFIX = '[BubbleDialogue]';

export interface LogRecordEntry {
    /** 去重键：宿主给的 id */
    key: string;
    timestampMs: number;
    level: LogLevel;
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

/** 这条日志是不是本扩展打的 */
export function isOwnLogEntry(message: unknown, target: unknown): boolean {
    const text = String(message ?? '');
    if (text.includes(OWN_LOG_PREFIX)) return true;
    // 宿主以后若按扩展名打 target，也能认出来
    return String(target ?? '') === '3p:BubbleDialogue';
}

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
        const message = String(entry.message ?? '');
        const target = String(entry.target ?? 'main');
        // 宿主的日志流是全局的：只留下本扩展自己的条目
        if (!isOwnLogEntry(message, target)) return;
        push({
            key: `f:${entry.id}`,
            timestampMs: Number(entry.timestampMs ?? Date.now()),
            level: normalizeLevel(entry.level),
            target,
            message,
        });
    };

    async function stop(): Promise<void> {
        const frontend = context.host.api.dev?.frontendLogs;
        const stopFrontend = unsubscribeFrontend;
        unsubscribeFrontend = null;

        // 退订失败也要继续恢复开关，否则会把用户的设置留在「开」的状态
        if (stopFrontend) {
            try {
                await stopFrontend();
            } catch (error) {
                console.warn('[BubbleDialogue] unsubscribe frontend logs failed.', error);
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
        if (!frontend) {
            state.error = 'host-api-unavailable';
            return;
        }

        state.busy = true;
        state.error = null;
        try {
            // 前端日志要宿主打开控制台记录才会进缓冲；原值记下来，停止时恢复
            const enabled = await frontend.getConsoleCaptureEnabled();
            if (!enabled) {
                await frontend.setConsoleCaptureEnabled(true);
                consoleCaptureRestore = enabled;
            }
            // 历史条目同样过滤：只补本扩展自己的
            for (const entry of await frontend.list({ limit: SEED_LIMIT })) fromFrontend(entry);

            unsubscribeFrontend = await frontend.subscribe(fromFrontend);

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