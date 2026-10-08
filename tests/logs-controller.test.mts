/**
 * 日志页控制器的可观察行为：
 * - 开启：补历史 + 订阅前后端；宿主控制台开关原来是关的才替用户打开
 * - 停止：退订两端 + 把控制台开关恢复原值（不覆盖用户自己的设置）
 * - 关闭扩展（deactivate）：等同停止，不能留着订阅
 * - 面板缓冲有上限，不会无限涨
 */
import { createLogsFeatureController } from "../src/features/dev-logs/controller";

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
                    return [{ id: 1, timestampMs: 1000, level: "info", message: "seed-front", target: "3p:BubbleDialogue" }];
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
                async tail() {
                    calls.tail += 1;
                    return [{ id: 1, timestampMs: 900, level: "WARN", target: "tt", message: "seed-back" }];
                },
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

// ---- 1) 开关原本是关的：开启要替用户打开，停止要恢复 ----
const h1 = makeHost(false);
const c1 = createLogsFeatureController(context(h1));
check("starts stopped", c1.state.recording === false);

await c1.start();
check("recording after start", c1.state.recording === true);
check("console capture turned on", JSON.stringify(h1.calls.setCapture) === "[true]", JSON.stringify(h1.calls.setCapture));
check("subscribed both sources", h1.calls.subF === 1 && h1.calls.subB === 1);
check("seeded history from both sources", c1.state.entries.length === 2, String(c1.state.entries.length));
check("backend level normalized", c1.state.entries.some((e) => e.level === "warn"));

h1.emitFrontend({ id: 2, timestampMs: 2000, level: "error", message: "boom", target: "3p:BubbleDialogue" });
check("live frontend entry appended", c1.state.entries.length === 3, String(c1.state.entries.length));
check("live entry level", c1.state.entries.at(-1)?.level === "error");

await c1.stop();
check("stopped", c1.state.recording === false);
check("unsubscribed both", h1.calls.unsubF === 1 && h1.calls.unsubB === 1);
check("console capture restored to false", JSON.stringify(h1.calls.setCapture) === "[true,false]", JSON.stringify(h1.calls.setCapture));
h1.emitFrontend({ id: 3, timestampMs: 3000, level: "info", message: "after-stop", target: "3p:BubbleDialogue" });
check("no entries appended after stop", c1.state.entries.length === 3, String(c1.state.entries.length));
check("entries kept after stop", c1.state.entries.length > 0);

// ---- 2) 开关原本就是开的：不要多写一次设置 ----
const h2 = makeHost(true);
const c2 = createLogsFeatureController(context(h2));
await c2.start();
await c2.stop();
check("already-on capture is not rewritten", h2.calls.setCapture.length === 0, JSON.stringify(h2.calls.setCapture));
check("stop still unsubscribes", h2.calls.unsubF === 1 && h2.calls.unsubB === 1);

// ---- 3) 关闭扩展 / 关页面（deactivate）必须停掉订阅 ----
const h3 = makeHost(true);
const c3 = createLogsFeatureController(context(h3));
await c3.start();
await c3.deactivate();
check("deactivate stops recording", c3.state.recording === false);
check("deactivate unsubscribes", h3.calls.unsubF === 1 && h3.calls.unsubB === 1 && !h3.hasHandlers());

// ---- 4) 宿主没有日志接口：给出错误且不进入记录态 ----
const h4 = { api: {} };
const c4 = createLogsFeatureController(context(h4));
await c4.start();
check("missing api -> not recording", c4.state.recording === false);
check("missing api -> error surfaced", c4.state.error !== null, String(c4.state.error));

// ---- 5) 缓冲上限：超出后丢最旧的，且不再增长 ----
const h5 = makeHost(true);
const c5 = createLogsFeatureController(context(h5));
await c5.start();
for (let i = 0; i < 400; i += 1) {
    h5.emitFrontend({ id: 1000 + i, timestampMs: 10000 + i, level: "info", message: `line-${i}`, target: "t" });
}
check("buffer capped", c5.state.entries.length === 300, String(c5.state.entries.length));
check("oldest dropped", c5.state.entries.at(0)?.message === "line-100", String(c5.state.entries.at(0)?.message));
c5.clear();
check("clear empties buffer", c5.state.entries.length === 0);
h5.emitFrontend({ id: 9999, timestampMs: 99999, level: "info", message: "after-clear", target: "t" });
check("dedupe table reset by clear", c5.state.entries.length === 1, String(c5.state.entries.length));
await c5.stop();

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);