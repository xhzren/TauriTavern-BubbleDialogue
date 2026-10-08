import { createConfigStore } from "../src/features/bubble-render/config-store";
import { DEFAULT_FORMAT_RULE, DEFAULT_MOOD_WORD_GROUPS, STYLE_DEFAULTS } from "../src/features/bubble-render/constants";

let fail = 0;
const check = (n: string, c: boolean, e = "") => { if (!c) { fail++; console.log("FAIL", n, e); } else console.log("ok  ", n, e); };

// 内存 IO，模拟存储
const disk = new Map<string, unknown>();
const io = {
    async getConfig(key: string) { return disk.has(key) ? disk.get(key) : null; },
    async setConfig(key: string, value: unknown) { disk.set(key, value); },
};

const store = createConfigStore(() => io);
await store.load();

// 1) 空存储时应回落到内置默认
check("empty store -> default format rule", store.state.formatRule === DEFAULT_FORMAT_RULE);
check("empty store -> default mood groups", store.state.moodGroups.length === DEFAULT_MOOD_WORD_GROUPS.length);
check("empty store -> default style", store.state.style.style_dialogueFontSize === STYLE_DEFAULTS.style_dialogueFontSize);

// 2) 改格式规则 -> 落盘 -> 新实例能读回
await store.setFormatRule("自定义规则 ABC");
check("format rule persisted", disk.get("format_rule") === "自定义规则 ABC");

const store2 = createConfigStore(() => io);
await store2.load();
check("reload picks up custom rule", store2.state.formatRule === "自定义规则 ABC");

// 3) 情绪词增删
const gid = store2.state.moodGroups[0].id;
const before = store2.state.moodGroups[0].words.length;
await store2.addMoodWord(gid, "测试新词");
check("word added", store2.state.moodGroups[0].words.length === before + 1);
check("word persisted to disk", String(disk.get("mood_config")).includes("测试新词"));
await store2.addMoodWord(gid, "测试新词"); // 重复不应再加
check("duplicate word ignored", store2.state.moodGroups[0].words.length === before + 1);
await store2.removeMoodWord(gid, "测试新词");
check("word removed", store2.state.moodGroups[0].words.length === before);

// 4) 颜色修改
await store2.setMoodColor(gid, "#123456");
check("group color changed", store2.state.moodGroups[0].color === "#123456");

// 5) 样式单项修改 + 恢复默认
await store2.setStyle("style_dialogueFontSize", 19);
check("style value set", store2.state.style.style_dialogueFontSize === 19);
check("style persisted", disk.get("style_dialogueFontSize") === 19);
await store2.resetStyleKey("style_dialogueFontSize");
check("style reset to default", store2.state.style.style_dialogueFontSize === STYLE_DEFAULTS.style_dialogueFontSize);

// 6) 恢复全部默认
await store2.resetFormatRule();
check("format rule reset", store2.state.formatRule === DEFAULT_FORMAT_RULE);
await store2.resetMoodGroups();
check("mood groups reset", store2.state.moodGroups.length === DEFAULT_MOOD_WORD_GROUPS.length);

// 7) 脏数据不应炸：mood_config 是坏 JSON
disk.set("mood_config", "{ not valid json");
const store3 = createConfigStore(() => io);
await store3.load();
check("bad mood json falls back safely", store3.state.moodGroups.length === DEFAULT_MOOD_WORD_GROUPS.length);

// 7b) 关键：坏掉的 mood_config 不能连累其它配置读取
// （「按角色配色」已改为每个名字一个配置键，由 runtime 读，不再走 config-store）
disk.set("mood_config", "{ still broken");
disk.set("style_dialogueFontSize", 17);
const store4 = createConfigStore(() => io);
await store4.load();
check("bad mood does not block style", store4.state.style.style_dialogueFontSize === 17, String(store4.state.style.style_dialogueFontSize));
check("bad mood falls back to defaults", store4.state.moodGroups.length === DEFAULT_MOOD_WORD_GROUPS.length);

// 8) 订阅通知
let notified = 0;
const unsub = store3.subscribe(() => { notified += 1; });
await store3.setStyle("style_avatarSize", 64);
check("listener notified", notified === 1, String(notified));
unsub();
await store3.setStyle("style_avatarSize", 65);
check("unsubscribe works", notified === 1, String(notified));

console.log(fail === 0 ? "\nALL PASS" : "\n" + fail + " FAILED");
process.exit(fail === 0 ? 0 : 1);
