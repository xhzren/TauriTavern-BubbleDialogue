/**
 * 日志页控制器的可观察行为：
 * - 只收本扩展自己的日志（宿主把第三方 console 的 target 统一打成 main，只能按前缀过滤）
 * - 开启：补历史 + 订阅前端日志；宿主控制台开关原来是关的才替用户打开
 * - 停止：退订 + 把控制台开关恢复原值（不覆盖用户自己的设置）
 * - 不订阅后端 tracing（那不是本扩展的日志）
 * - 关闭扩展（deactivate）等同停止；面板缓冲有上限
 */
import { createLogsFeatureController, isOwnLogEntry } from "../src/features/dev-logs/controller";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

function makeHost(captureEnabled: boolean) {
    const calls = { list: 0, tail: 0, subF: 0, subB: 0, unsubF: 0, unsubB: 0, getCapture: 0, setCapture: [] as boolean[] };
    let frontendHandler: ((entry: any) => void) | null = null;
    let backendHandler: ((entry: any) => void) | null = null;

    const api = {
        dev: {
            frontendLogs: {
                async list() {
                    calls.list += 1;
                    return [
                        { id: 1, timestampMs: 1000, level: "info", message: "[BubbleDialogue] runtime ready", target: "main" },
                        // 现场样本：别的脚本/宿主的日志，必须被过滤掉
                        { id: 2, timestampMs: 1100, level: "info", message: "%c[QR助手] [Whitelist] 缓存构建完成", target: "main" },
                        { id: 3, timestampMs: 1200, level: "warn", message: "Failed to insert focus rule: SyntaxError", target: "main" },
                    ];
                },
                async subscribe(handler: (entry: any) => void) {
                    calls.subF += 1;
                    frontendHandler = handler;
                    return () => { calls.unsubF += 1; frontendHandler = null; };
                },
                async getConsoleCaptureEnabled() { calls.getCapture += 1; return captureEnabled; },
                async setConsoleCaptureEnabled(enabled: boolean) { calls.setCapture.push(enabled); },
            },
            backendLogs: {
                async tail() { calls.tail += 1; return [{ id: 1, timestampMs: 900, level: "WARN", target: "tauritavern::store", message: "backend line" }]; },
                async subscribe(handler: (entry: any) => void) {
                    calls.subB += 1;
                    backendHandler = handler;
                    return () => { calls.unsubB += 1; backendHandler = null; };
                },
            },
        },
    };

    return {
        api,
        calls,
        emitFrontend: (entry: any) => frontendHandler?.(entry),
        emitBackend: (entry: any) => backendHandler?.(entry),
        hasHandlers: () => Boolean(frontendHandler || backendHandler),
    };
}

const context = (host: any) => ({ host } as any);

// ---- 0) 前缀判定 ----
check("own prefix detected", isOwnLogEntry("[BubbleDialogue] hello", "main"));
check("foreign entry rejected", !isOwnLogEntry("%c[QR助手] noise", "main"));
check("foreign target-only rejected", !isOwnLogEntry("noise", "main"));
check("owner target accepted", isOwnLogEntry("hello", "3p:BubbleDialogue"));

// ---- 1) 开关原本是关的：开启要替用户打开，停止要恢复 ----
const h1 = makeHost(false);
const c1 = createLogsFeatureController(context(h1));
check("starts stopped", c1.state.recording === false);

await c1.start();
check("recording after start", c1.state.recording === true);
check("console capture turned on", JSON.stringify(h1.calls.setCapture) === "[true]", JSON.stringify(h1.calls.setCapture));
check("subscribed frontend only", h1.calls.subF === 1 && h1.calls.subB === 0);
check("never tailed/subscribed backend", h1.calls.tail === 0 && h1.calls.subB === 0);
check("seed keeps only own logs", c1.state.entries.length === 1, JSON.stringify(c1.state.entries.map((e) => e.message)));
check("seed entry is ours", c1.state.entries[0]?.message.includes("[BubbleDialogue]"));

h1.emitFrontend({ id: 4, timestampMs: 2000, level: "error", message: "[BubbleDialogue] boom", target: "main" });
check("live own entry appended", c1.state.entries.length === 2, String(c1.state.entries.length));
check("live entry level", c1.state.entries.at(-1)?.level === "error");

h1.emitFrontend({ id: 5, timestampMs: 2100, level: "info", message: "[QR助手] still noisy", target: "main" });
check("live foreign entry filtered", c1.state.entries.length === 2, String(c1.state.entries.length));

await c1.stop();
check("stopped", c1.state.recording === false);
check("unsubscribed frontend", h1.calls.unsubF === 1);
check("console capture restored to false", JSON.stringify(h1.calls.setCapture) === "[true,false]", JSON.stringify(h1.calls.setCapture));
h1.emitFrontend({ id: 6, timestampMs: 3000, level: "info", message: "[BubbleDialogue] after-stop", target: "main" });
check("no entries appended after stop", c1.state.entries.length === 2, String(c1.state.entries.length));
check("entries kept after stop", c1.state.entries.length > 0);

// ---- 2) 开关原本就是开的：不要多写一次设置 ----
const h2 = makeHost(true);
const c2 = createLogsFeatureController(context(h2));
await c2.start();
await c2.stop();
check("already-on capture is not rewritten", h2.calls.setCapture.length === 0, JSON.stringify(h2.calls.setCapture));
check("stop still unsubscribes", h2.calls.unsubF === 1);

// ---- 3) 关闭扩展 / 关页面（deactivate）必须停掉订阅 ----
const h3 = makeHost(true);
const c3 = createLogsFeatureController(context(h3));
await c3.start();
await c3.deactivate();
check("deactivate stops recording", c3.state.recording === false);
check("deactivate unsubscribes", h3.calls.unsubF === 1 && !h3.hasHandlers());

// ---- 4) 宿主没有日志接口：给出错误且不进入记录态 ----
const c4 = createLogsFeatureController(context({ api: {} }));
await c4.start();
check("missing api -> not recording", c4.state.recording === false);
check("missing api -> error surfaced", c4.state.error !== null, String(c4.state.error));

// ---- 5) 缓冲上限：超出后丢最旧的，且不再增长 ----
const h5 = makeHost(true);
const c5 = createLogsFeatureController(context(h5));
await c5.start();
for (let i = 0; i < 400; i += 1) {
    h5.emitFrontend({ id: 1000 + i, timestampMs: 10000 + i, level: "info", message: `[BubbleDialogue] line-${i}`, target: "main" });
}
check("buffer capped", c5.state.entries.length === 300, String(c5.state.entries.length));
check("oldest dropped", c5.state.entries.at(0)?.message === "[BubbleDialogue] line-100", String(c5.state.entries.at(0)?.message));
c5.clear();
check("clear empties buffer", c5.state.entries.length === 0);
h5.emitFrontend({ id: 9999, timestampMs: 99999, level: "info", message: "[BubbleDialogue] after-clear", target: "main" });
check("dedupe table reset by clear", c5.state.entries.length === 1, String(c5.state.entries.length));
await c5.stop();

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);