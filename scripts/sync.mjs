/**
 * 校验扩展目录链接是否正常。
 *
 * 推荐做法：把酒馆的扩展目录做成指向本仓库的目录 junction（Windows）
 *    mklink /J "D:\AI\TauriTavern\data\extensions\third-party\BubbleDialogue" "D:\Dev\CodeX\TauriTavern-BubbleDialogue"
 * 这样 dist 里的新产物立刻对酒馆可见，不需要每次复制。
 *
 * 用法：
 *   node scripts/sync.mjs              # 校验链接与产物
 *   node scripts/sync.mjs --link       # 打印建立链接的命令
 *   node scripts/sync.mjs --copy       # 没有链接时退化为复制（必须存在 dist）
 */

import { existsSync, statSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const REPO = resolve(".");
const DEFAULT_TARGET = "D:\\AI\\TauriTavern\\data\\extensions\\third-party\\BubbleDialogue";
const TARGET = resolve(process.env.TT_EXT_DIR ?? DEFAULT_TARGET);

/** manifest 引用的路径，必须能解析到真实文件 */
const REQUIRED = ["manifest.json", "dist/index.js", "dist/style.css"];

function log(m) { console.log(`[sync] ${m}`); }

if (process.argv.includes("--link")) {
    console.log(`mklink /J "${TARGET}" "${REPO}"`);
    process.exit(0);
}

const isDir = existsSync(TARGET) && statSync(TARGET).isDirectory();
let linked = false;
if (isDir) {
    try {
        // junction / symlink 下 realpath 与给定路径不同
        const { realpathSync } = await import("node:fs");
        linked = resolve(realpathSync(TARGET)) === REPO;
    } catch { linked = false; }
}

log(`target: ${TARGET}`);
log(`link:   ${linked ? "yes (live)" : "no"}`);

if (linked) {
    // 链接模式：只需确认产物存在
    let ok = true;
    for (const rel of REQUIRED) {
        const p = join(TARGET, rel);
        if (!existsSync(p)) { log(`MISSING ${rel}`); ok = false; }
        else log(`ok ${rel} (${statSync(p).size} bytes)`);
    }
    if (!ok) { log('run "npm run build" first'); process.exit(1); }
    log("linked and ready — rebuild with \"npm run build\" to update live");
    process.exit(0);
}

// 非链接模式：退化为复制
if (!existsSync(join(REPO, "dist"))) {
    log('dist not found, run "npm run build" first');
    process.exit(1);
}
await mkdir(join(TARGET, "dist"), { recursive: true });
for (const rel of REQUIRED) {
    await copyFile(join(REPO, rel), join(TARGET, rel));
    log(`copied ${rel}`);
}
log("copied (consider using --link for live updates)");
