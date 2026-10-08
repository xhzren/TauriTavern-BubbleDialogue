# BubbleDialogue 交接文档

> 📘 **完整版看 [`HANDBOOK.md`](./HANDBOOK.md)**：渲染全链路、数据契约、全部修复记录、
> 铁律、已知缺口、测试清单，都在那里。
> 本文是**增量工作日志**（按时间累积），查某次改动的原始前后文用本文。

> 用途：新开对话时**先读这一篇**，即可继续工作，不必重新考古。
> 最后更新：2026-10-07

---

## 0. 新对话开场怎么用

1. 读本文件（尤其 **§7 铁律** 和 **§8 待定**）
2. 要改代码，再读 `EXTENSION-FROM-TEMPLATE.md`（模板作者的原始操作手册，含宿主约束的源码级证据）
3. 工作目录：`D:\Dev\CodeX\TauriTavern-BubbleDialogue`
4. 改完必须：`npm test` → `npm run build` → `npm run sync`
5. **不要在没跑测试的情况下声称修好了** —— 本项目已累计修掉约 10 个"看起来对但实际错"的 bug（§7 是清单），绝大多数是测试或真机取证抓出来的

---

## 1. 一句话现状

把两个酒馆助手（JS-Slash-Runner）脚本 —— **对话渲染系统 v7.1** 与 **轻量气泡 hydration** —— 合并成了 **一个 TauriTavern 原生第三方扩展**：
4 个管理页面 + 气泡 hydration + 提示词注入 + 双后端存储（原版 IndexedDB ↔ TT 原生）+ 导入导出与按范围转换。

构建通过、18 个测试全绿、已通过 junction 实时挂到真机酒馆。

---

## 2. 仓库 / 落点 / 环境

| 角色 | 路径 | 说明 |
|---|---|---|
| **本扩展（工作区）** | `D:\Dev\CodeX\TauriTavern-BubbleDialogue` | 从这里开发、构建 |
| 宿主（酒馆本体） | `D:\Dev\CodeX\TauriTavern` | **只读参考**，绝不 import 内部模块 |
| 模板来源 | `D:\Dev\CodeX\TauriTavern-Creator-Extension` | 本扩展 fork 自它；它也**同时安装在真机**，两者悬浮球曾像素级重叠 |
| **真机安装点** | `D:\AI\TauriTavern\data\extensions\third-party\BubbleDialogue` | **junction 链接**，直接指向工作区 |
| 真机数据根 | `D:\AI\TauriTavern\data` | `data/_tauritavern/extension-store/` 是原生存储落盘处 |
| 原版 IndexedDB 落盘 | `%LOCALAPPDATA%\com.tauritavern.client\EBWebView\Default\IndexedDB\http_tauri.localhost_0.indexeddb.leveldb` | LevelDB（snappy 压缩）；**排查数据问题时可从这里取证** |

**junction 的意义**：`npm run build` 后**无需任何复制**，酒馆直接看到新产物。所以改完只需要 build + 重启酒馆。
`npm run sync` 是**校验器**（检查链接与产物是否就位），不是复制器。

> 注意：junction 会暴露整个仓库（含 `node_modules`）。宿主发现扩展时只读一层目录、不递归，所以安全；但仓库里**不能有嵌套 `.git`**，否则宿主会当成独立 Git 仓库管理。

---

## 3. 常用命令

```bash
npm test      # 18 个测试，全绿才算过
npm run build # vue-tsc 类型检查 + vite 构建 → dist/
npm run sync  # 校验 junction 与产物
```

- **构建产物**：`dist/index.js`（~296 KB）、`dist/style.css`（~36 KB）、`dist/index.js.map`
- `manifest.json` 在**仓库根目录**（不在 dist），`js`/`css` 指向 `dist/...`
- 环境变量 `TT_EXT_DIR` 可覆盖安装点

---

## 4. 已实现的功能

### 4.1 四个页面（左侧「对话气泡」分类下）

| 页面 | 模块 id | 状态 |
|---|---|---|
| 头像管理 | `bubble-avatar` | 列表+搜索+上传+删除；**每行三个行内操作：改正文颜色 / 替换默认头像 / 重命名**；右侧详情显示**情绪差分**与**CG 图库**，点缩略图出大图 |
| 正文美化 | `bubble-style` | 16 个滑杆 + 颜色 + 字体 + Markdown 开关 ⚠️**只存不用，见 §8** |
| 情绪配置 | `bubble-mood` | 格式规则文本编辑 + 8 组情绪词增删改色 |
| 存储 | `bubble-storage` | 顶部双面板：**原版 DB** / **TT 原生** |

**存储页两个面板**：
- **原版 DB**：按范围列出占用（全局 + 每张角色卡），每行 `[转换][删除]`，标题行 `[一键转换并删除]`
- **TT 原生**：统计数据 / 运行状态（导入导出已搬到头像管理页）

**正文美化已打通**：`style-injector.ts` 把 `style_*` 配置编译成 CSS，
注入主文档 `<style id="yq-bubble-lite-style">`；配置一变（`config.subscribe`）就重编译。
CSS 与原脚本 `_buildCSS` **逐字符一致**（6 组配置比对通过），迁移时不要凭感觉改数值。

**导入 / 导出在头像管理页**，位置在「库范围」切换按钮右边：
**作用在左边选中的那个范围上**——选「全局（共用）」就导全局库，选「按角色卡」就导这张卡，
按钮下方会写明当前范围。导出文件名用范围标识（全局是 `global`，角色卡是 charId）。
注意 `exportZip` / `importZip` 里的 charId 要用 `effectiveScope()`（当前范围），
不是当前角色卡的 id——选全局时导出的是全局库，manifest 里写卡 id 会误导。

**「统计数据」是全库口径**：汇总所有可触达范围，扩展启动后算一次，之后只在导入 / 转换 / 点「刷新统计」时重算。
**切换库范围不会、也不应改变它**——那是头像页「当前范围统计」的职责。

### 4.2 核心运行链路

1. **提示词注入** —— 把 `@bubble` 格式规则 + 情绪词约束注入 outgoing prompt（走 `context.setExtensionPrompt`，**不是** JSR 的 `injectPrompts`）
2. **气泡 hydration** —— 扫描 `.yq-bubble` / `.custom-yq-bubble`，按 6 级回退链解析头像、上情绪色、区分对白/心里话
3. **点头像看大图** —— `avatar-zoom.ts`（移植自原脚本 `_showZoom`）：点气泡头像 → 全屏遮罩显示原图，点任意处或按 Esc 关闭。
4. **事件驱动** —— `CHARACTER_MESSAGE_RENDERED` / `USER_MESSAGE_RENDERED` / `CHAT_CHANGED` / `GENERATION_STARTED|ENDED|STOPPED` + MutationObserver（流式增量）
5. **存储双后端** —— 原版 IndexedDB（只读兼容 + 可迁移）/ TT 原生 `api.extension.store`（默认）

### 4.3 加载提示

`src/components/LoadingHint.vue` —— 转圈 + 文案，完成后变绿色实心点 +「加载完成」，1.2 秒淡出。
已覆盖：缩略图 / 情绪差分 / CG / DB 扫描 / 导入导出 / 统计 / 配置读取。

---

## 5. 名词表

### 环境与工程

| 名词 | 大白话 | 本项目具体含义 |
|---|---|---|
| **TauriTavern (TT)** | 酒馆本体 | 宿主；提供 `window.__TAURITAVERN__` 平台 ABI |
| **BubbleDialogue** | 本扩展 | 我们正在做的这个第三方扩展 |
| **third-party 扩展** | 第三方扩展 | 放在 `data/extensions/third-party/<文件夹>`，有 `manifest.json`；**同 document 注入**（不是 iframe） |
| **junction** | 目录链接 | 让酒馆目录直接指向开发仓库，改完即时生效 |
| **manifest.json** | 扩展清单 | 定义入口 js/css；`js`/`css` 只接受字符串或单元素数组 |

### 宿主 API

| 名词 | 含义 |
|---|---|
| `window.__TAURITAVERN__.api` | 平台 ABI 总入口；等 `ready` 后可用 |
| `api.extension.store` | **全局** KV JSON + Blob 存储（**本项目默认后端**） |
| `api.chat` | 聊天读取/检索/共享；`handle.store` 是 **per-chat** 的 JSON 存储（**不能存图片**） |
| `api.layout` | safe-area / viewport / IME |
| `window.SillyTavern.getContext()` | ST 兼容面：`eventSource` / `eventTypes` / `setExtensionPrompt` / `characterId` / `name2`。**裸 `getContext`/`eventSource` 没有挂到 window**，必须走这个入口 |
| `setExtensionPrompt(name, content, position, depth, scan, role)` | 提示词注入的公开接口（本项目用它而非 JSR 私有 API） |

### 数据模型（关键，出错重灾区）

| 名词 | 含义 |
|---|---|
| **scope（库范围）** | `global`（全局共用）或 `character`（按角色卡隔离） |
| **charId** | 角色卡标识。全局是字面量 `_global_`；角色卡是**数字下标**（如 `2017`、`1921`） |
| **alias** | 头像记录的自然键。**主头像** = `<charId>__<名字小写>`；**情绪差分** = 只有名字 |
| **lookupKey** | 情绪差分的复合键 = `<charId>__<名字>__<moodId>`（**只是索引，不是主键**） |
| **id（情绪记录主键）** | `<lookupKey>__img__<hash>` —— v13.1 支持"同槽位多候选图"后，id 不再等于 lookupKey |
| **moodId** | `情绪__服装__动作`，如 `mood-joy__outfit-casual__act-sfw` |
| **情绪差分** | 同一角色不同情绪/服装/动作的立绘变体 |
| **outfit / act** | 服装 / 动作标签（合法池锁死，如 `outfit-naked`、`act-vaginal`） |
| **CG 图库** | 按角色卡分组的立绘图库（`cg_groups` / `cg_images` 两张表） |

### 存储与解析

| 名词 | 含义 |
|---|---|
| **原版 / legacy / IDB** | 原脚本建立的 IndexedDB 库 `BubbleDialogueAvatars`（6 张表） |
| **原生 / native** | TT 的 `api.extension.store`，落盘 `data/_tauritavern/extension-store/<namespace>/` |
| **namespace / table / key** | 原生存储的三级命名。宿主**只允许 `[A-Za-z0-9_.-]`**，所以中文要 hex 编码 |
| **回退链 fallbackChain** | 查找顺序：先本卡、miss 再全局。**水合用链，展示只看主范围** |
| **hydration** | 给正则产出的气泡元素填头像/上色/分对白与心里话 |
| **`.yq-bubble`** | 气泡元素类名（原版正则产出；类名有 `yq-` 与 `custom-yq-` 双份，操作要同时处理） |
| **`@bubble` 格式** | 提示词约定的输出格式：`@bubble:角色名|情绪|[对白]|服装|动作` |

---

## 6. 数据契约

### 6.1 导出包格式（与原脚本 `7.1-zip` 对齐）

```
manifest.json   { type:'bubble-character', version:'7.1-zip', exportedAt,
                  charId, charName, avatars[], moodAvatars[], colors{} }
avatars/<序号>_<名字>.<ext>
mood/<序号>_<名字>_<moodId>.<ext>
```

导入是**合并语义**（已存在跳过）。处理 ZIP 用 `fflate`（`level: 0` 只打包不压缩）。

### 6.2 原版 IndexedDB 表结构（照抄原脚本，勿改）

| store | keyPath | 索引 |
|---|---|---|
| `avatars` | `alias` | `createdAt` |
| `config` | `key` | — |
| `mood_avatars` | **`id`** | `charId` / `alias` / `moodId` / **`lookupKey`** |
| `local_fonts` | `id` | — |
| `cg_groups` | `id` | — |
| `cg_images` | `id` | `group` |

### 6.3 原生存储路径

```
extension-store/bubble-x-global/{kv,blobs}/{avatars,mood,cg_groups,cg_images}/...
extension-store/bubble-x-char-x-<charId>/{kv,blobs}/...
```
（`-x-` 是段分隔符；含非 ASCII 的段会 hex 编码）

---

## 7. 铁律（血泪教训 —— 改代码前必读）

这些全是**实际踩过并修掉**的 bug，每一条都有测试守着。违反其中任何一条，测试会红。

1. **情绪记录的主键是 `id`（`<lookupKey>__img__<hash>`），不是 `lookupKey`。**
   按主键 get 永远查不到 → 缩略图全空、删除静默失效。**必须走 `lookupKey` 索引。**

2. **全库统计与当前范围统计是两套独立状态，不要合并。**
   存储页「TT 原生 → 统计数据」= `totalAvatars/totalMoodAvatars/totalCgImages/totalStorageBytes`，
   汇总所有可触达范围，**只在扩展启动、导入、转换后重算**；
   头像页的 `avatarCount/moodCount/totalBytes` = 当前库范围，切全局/角色卡必须重算。
   两者共用过同一份 state，曾导致「切一下库范围，存储页统计也跟着转圈」。

2b. **切换库范围不等于数据变了，不要重扫。**
   统计（`avatarCount/moodCount/totalBytes`）与情绪差分列表都**按范围缓存**，
   只在真实写操作时失效对应范围：上传/删除/导入→当前范围，转换→被转换的那个范围，
   一键转换→全部。切换库范围只是换读写句柄，**不清缓存**。
   曾因 rebuild() 无条件重扫，导致每次切回全局都要重扫几千条差分。
   用户要强制重扫：头像页「重新加载本范围」（`runtime.refreshScopeStats()`）。

2c. **全库统计的触发口只有两个：扩展启用时一次 + 用户手动刷新。**
   `requestTotalStatsOnce()` 用 `totalStatsDone` + `totalStatsInFlight` 双闸门：
   前者保证整份生命周期只自动算一次，后者保证「上一次还在跑（几千条记录要几秒到几十秒）
   用户又开了一次面板」不会并发触发第二次全库扫描（并发重扫曾经是真实 bug）。
   开角色卡 / 换卡 / 切库范围 / 关开面板 / 导入 / 转换 **一律不触发全库统计**；
   导入和转换只置 `totalStatsStale` 提示用户手动刷新。
   特别注意：`CHAT_CHANGED` 里**不要**顺手 `invalidateStatsCache()`——
   当前范围可能是全局，那会删掉全局缓存、当场重扫几千条。

2d. **关掉面板再打开不等于数据变了，不要重扫。**
   面板是 `v-if` 挂载的：关掉会卸载组件并 `release()` runtime，再打开会重新 `acquire()`；
   但数据没变过。启动时若当前范围已有统计缓存就直接复用（`applyCachedStats()`），
   **不进加载态、不扫库**。全库统计用 `totalStatsDone` 标记，只在首次启动算一次。
   CG 分组列表同样按范围缓存。缓存只在真实写操作处失效；强制重扫走 `refreshScopeStats()`。

2e. **匹配正文一律按「导入的数据」，不能按写死的表。**
   - **情绪词表**：`avatar-resolver` 与颜色解析共用**配置里的词表**
     （`config.state.moodGroups`，用户可编辑、随数据走）。
     曾经写死 `DEFAULT_MOOD_WORD_GROUPS` → 颜色按配置解析、头像按内置表解析，两边对不上。
   - **服装**：原样使用（只在字段为空时补 `outfit-casual`）。写死白名单会让数据里
     存在的非标准服装永远匹配不上 L1 精确级，静默退到别的差分。
   - **动作**：只接受「数据里真实出现过的标签」，否则回落 `act-sfw`。
     动作**不能**像服装那样无条件透传——透传后 L1 会 miss，
     接着 L2（同情绪+同服装）会命中任意动作的记录，包括 NSFW 图。
   - `constants.ts` 里的表只作**默认值**（用户没配置时用），
     永远不能当成取值范围的白名单。

2f. **正文美化的 CSS 必须与原脚本逐字符对齐，不要凭感觉改数值。**
   `style-injector.ts` 的 `buildBubbleCss()` 移植自原脚本 `_buildCSS`：
   同一份配置下输出必须与原脚本完全一致（已用 6 组配置逐字符比对）。
   改数值前先回原脚本对一遍——`bubbleBg` / `lineHeight` / 心理话颜色与倾斜角
   这些是 `YQ_DEFAULTS` 里的固定值，v7.1 面板并不暴露。
   另外面板容器 `.feature-host` 是滚动容器：页面内容高了要能滚，
   头像页用 `height:100%` + 两栏各自滚动，不要给功能页再加嵌套滚动条。

2g. **hydrator 的 `onZoom` 必须接线，否则点击头像会被静默吃掉。**
   `bubble-hydrator` 的点击处理**总是** `preventDefault()` + `stopPropagation()`，
   然后才 `if (onZoom) onZoom(...)`。没接 `onZoom` 时表现为：
   光标是放大镜、点下去什么也不发生（事件还被吞掉，连冒泡都没有）。
   运行时里对应的是 `createAvatarZoom({...})` + `onZoom: (url, name) => avatarZoom.show(url, name)`；
   `release()` 归零时要 `avatarZoom.dispose()`，否则停用扩展后遮罩会留在屏幕上。

2h. **原生后端的 `listMoodAvatars()` 列表不带图片二进制，命中索引后必须按需回查。**
   `native-avatar-library` 故意不预取（1841 条一起拉会爆内存），列表项只有元数据；
   `indexeddb-avatar-library` 的列表**自带** `imageBlob`。
   所以解析器不能直接读 `record.imageBlob`——那样在原生后端永远是 null，
   五级回退全部落空、**每个气泡都掉到 L5 主头像**，表现是「正文情绪各不相同，头像却全一样」。
   正确做法：`recordToUrl()` —— 有 blob 直接用（IDB），没有就 `repository.getMoodAvatar(记录里的名字, moodId)` 回查。
   回查要用**记录里存的名字**（原始大小写），不能用归一化后的名字。

2i. **一屏气泡是「并发」解析的，索引加载必须单飞（single-flight）。**
   `hydrator.hydrateAll()` 在同一个 tick 里对每个气泡都发起 `resolve()`。
   `ensureIndex()` 早期用 `indexLoaded` 布尔量提前 return → 只有第一个调用者等索引，
   其余全部拿到**还是空的索引** → 谁都匹配不上 → 齐刷刷掉到 L5 主头像。
   症状：**一条消息里只有第一个气泡是对的，其余全是默认头像**。
   正确写法：把加载 promise 存下来共享，所有调用者都 await 同一个 promise。
   （同样的坑在 `refreshTotalStats` / 范围统计缓存里也踩过——凡是「加载一次」的地方都要单飞。）

2j. **情绪词表只有一个来源：`config.state.moodGroups`（已套默认值的有效词表）。**
   上色、头像匹配、提示词注入三处必须共用它。曾经有三套读法：
   - `loadMoodConfig()` 自己读原始 `mood_config` → 真机配置表里**没有这个键**，
     早退后解析器一直停在「只认 id/label、不认同义词」的兜底版本；
   - 头像匹配用 `config.state.moodGroups`（带词表）；
   - 提示词注入也读原始 `mood_config` → 注入出去的模板留着 `{{mood_groups}}` 占位符，
     模型拿不到词表只能自己造词。
   后果：同义词「得意」颜色走兜底→平和（绿），头像却按完整词表→喜悦，两边对不上。
   现在统一走 `syncMoodResolver()` + `resolveMoodId` 注入，三处保证一致。

2k. **`constants.ts` 里的 `DEFAULT_FORMAT_RULE` 已被人工改写（不再逐字等于原脚本）。**
   原因：原脚本的动作段只给了词表，没给「怎么从正文推导」的规则，
   而 `act-sfw` 被标成「日常(默认)」并在全文出现 10+ 次 → 模型强烈锚定它。
   真机实测：正文明确在写口交、服装段都写成 `outfit-naked`，动作段仍写 `act-sfw`，
   最近 82 个气泡里 **act-sfw 占 100%**，导进去的 NSFW 差分（每种 act 40 张）一张没用上。
   改写内容：动作段改成**判定规则 + 对照示例**（正文写什么 → 第5段写什么），
   并把几处「默认用 act-sfw」的措辞改成「NSFW 场景必须按判定规则换」。
   情绪模板补了一条「不要机械重复同一个情绪词」。
   注意：这条是**提示词文案**，效果只能靠真机对话验证；
   若模型开始过度使用 NSFW 标签，回头收紧「对照示例」即可。

2l. **删除必须是幂等的，而且不能让宿主去删「不存在的东西」。**
   宿主对 `deleteJson` / `deleteBlob` 找不到文件时会返回 `Not found`，
   并且**在 Tauri 命令层就往界面弹「后端错误」**——扩展里 catch 掉也没用，提示照样弹。
   所以：
   - 删 kv 前先 `readJson`，为 null 就不发删除命令；
   - 删 blob 前先 `listBlobKeys` 确认 key 在（结果按 namespace::table 缓存，写入后失效）；
   - 运行时用 `state.deletingName` **防连点**——删一个角色要跑几百次 IPC，
     用户等不及再点一次，两个流程会抢同一批文件，后到的全报 Not Found。
     这就是真机上「点删除后一直刷后端错误」的原因（数据其实是删干净了，只是提示很吓人）。
   - 差分删除用 `mapWithConcurrency(…, DELETE_CONCURRENCY=8)`，串行几百次 IPC 太慢；
     单条失败只记数不中断整批，失败数会写进 `state.lastResult`。

2m. **「按角色配色」的键格式必须与原脚本一致，且要真的作用到正文。**
   键：`buildColorConfigKey(charId, name)` = `color_<charId>__<名字小写>`；
   读取先本卡、再回退 `_global_`（与原脚本 `getColor` 一致）。
   消费侧：水合时按名字写 CSS 变量 `--yq-text-color`，样式表里正文色写成
   `color:var(--yq-text-color,<全局色>)`——**只有 `style_textColorMode === "character"` 才注入**。
   坑：切换「全局 ↔ 按角色」后，已经水合的气泡不会自动重上色，
   必须 `hydrator.refresh() + hydrateAll()`（订阅里监听模式变化做这件事）。
   另外导入/导出配色也走同一个键函数，否则包里 colors 永远读不回来。

2n. **重命名是「先复制、全部成功再删旧的」。**
   主头像 + 全部差分都搬到新名字；任何一条差分复制失败就**中止且保留原名**，
   避免改名把图弄丢。目标名已存在则直接报错（与原脚本 `rename` 一致）。
   配色配置也一起搬走。

2o. **水合的异步解析走有界队列（上限 8），但同步缓存命中不受限制。**
   首屏可能一次挂上上百个楼层、几百个气泡；原生后端的差分图又是按需回查的
   （列表不带二进制，每个气泡可能 2 次 IPC），不限并发就会瞬间打出几百次 IPC。
   注意区分两条路径：
   - **同步缓存命中**：立刻 `attach()`，不进队列——流式输出靠它避免空帧闪烁，
     被并发限制拖慢就会出现「头像一帧一帧蹦」；
   - **缓存未命中**：进 `resolveQueue`（`RESOLVE_CONCURRENCY = 8`），
     并用 WeakSet 去重，防止防抖重扫把同一个气泡重复排队（实测会放大 3 倍）。
   单条解析抛错只跳过它自己，不能卡住队列。

2p. **楼层挂载数量由宿主决定，扩展不做限制。**
   `hydrateAll()` 扫的是整个文档里的 `.yq-bubble`，没有 slice/limit。
   实际能渲染多少层取决于酒馆挂了多少层：
   - 默认 `power_user.chat_truncation = 100` → 首次只挂最后 100 层，
     更早的靠「显示更多消息」补进 DOM（只补 DOM，`chat[]` 一直完整）；
   - TauriTavern 的 `chat_virtualization_enabled` 默认 **false**；
     开启后由宿主接管成滑动窗口，滚动会卸载/重挂楼层。
   扩展靠 `MutationObserver(document.body, {childList, subtree})` +
   `CHARACTER_MESSAGE_RENDERED` 等事件跟进新挂上来的楼层（空闲 80ms / 生成中 450ms 防抖），
   没有注册 ChatSurface 参与者。

2q. **`_global_` 自带尾下划线**，拼上分隔符 `__` 是**三个下划线** `_global___名字`。
   用"找第一个 `__`"切 charId 会少切一位，把全局误判成 `_global`。**先精确匹配前缀。**

3. **解析名字要取 `__` 之后的段**（`extractDisplayName`）。
   取之前的段会把 charId 当成名字显示（曾表现为列表里一堆叫"1921"的条目）。

4. **展示只看主范围，水合才用回退链。**
   列表/统计/差分详情 = 当前范围；应用到正文 = 全局 + 角色一起。

5. **按范围迁移必须 `primaryOnly`**，否则全局记录会被复制进角色卡的 namespace。

6. **原生后端的串行 IPC 是性能杀手。**
   串行读 1841 个 JSON 要几十秒（表现为"统计一直转圈"）。**用 `mapWithConcurrency`（并发 16）。**

7. **宿主 API 无法枚举 namespace**（只能按 namespace 操作）。
   所以原生后端清不掉"别的角色卡的历史 namespace"。原版 DB 没这个限制（它整表 clear）。

8. **不能通过改 `state.backend` 做降级**。
   初始化时 ABI 可能还没装好，改了状态就永久回不去了。**只做读取回退，不改状态。**

9. **写新 i18n 键必须同时补齐 en / zh-hans / zh-hant**；
   测试会检查"三语同键 + 无未定义引用 + **无死键**"（死键这条抓过 3 次漏网）。

10. **气泡类名有双份**（`yq-bubble-avatar` 与 `custom-yq-bubble-avatar`），选择器要都覆盖。

---

## 8. 待定 / 未做

### 8.1 已知功能缺口（用户可见）

| # | 事项 | 说明 |
|---|---|---|
| 0 | **切角色卡（换卡）才清旧卡缓存** | `CHAT_CHANGED` 且 charId 变化时，只清「旧卡」的缓存；全局缓存保留，切回全局可直接命中 |
| 0b | **配色（colors）链路是断的** | 导入写的是 `color__<名字>` 单键，`config-store` 读写的却是 `colors` 单键；导出根本没传 `colors`（永远导出空表）。而且 `state.colors` 没有任何渲染方消费。修之前要先定「配色」到底是什么语义 |
| 0c | **正文格式里的星号记号写死** | `bubble-hydrator` 用星号正则识别内心活动（与原脚本一致）。若用户改写 `format_rule` 换成别的记号，渲染不会跟随 |
| 0d | **全库统计覆盖面受宿主限制** | 宿主 API 无法枚举 namespace，所以「全库」实际 = 全局 + **当前角色卡**。其它角色卡的历史数据在这里看不到（不是本扩展的 bug） |
| 1 | **正文美化：气泡部分已打通，旁白部分不行** | 26 个 `style_*` 里 **11 个已生效**（气泡字号/字重/字色/字体、头像尺寸形状、气泡间距、图片压缩开关与质量）。**10 个旁白键 + 4 个其它键仍不生效**，原因见下 |
| 1a | 旁白键为什么不行 | `style_narration*`（10 个）由原脚本的 **iframe 渲染器**消费（`#dcRoot` / `.dc-narration-block`），本扩展不接管那个 DOM；主文档里也没有可挂的旁白容器。要生效得先定旁白 DOM 契约 |
| 1b | `style_textColorMode: "character"` 无效 | 切到「按角色」后没有取色来源：扩展里**没有给单个名字配色的 UI**，且导入写的是 `color__<名字>`，原脚本用的是 `color_<charId>__<名字>`。三处 key 约定不统一，要先统一再谈 |
| 1c | `style_markdownMode` / `style_fontConfigUrl` 无效 | Markdown 渲染与远程字体清单都没移植 |
| 1d | `style_thoughtSuffixGap` / `OffsetY` 无效 | 同样属于 iframe 渲染器（`.dc-msg-quote-thought`） |
| 2 | **情绪差分不能编辑** | 详情页只能**看**，不能上传/替换/删除单个差分 |
| 3 | **CG 图库不能管理** | 只能看，不能添加组 / 拉取远程 / 清缓存 |
| 4 | 头像上传只支持本地文件 | 原脚本的"远程图片 URL"、图片压缩尺寸策略未移植全 |
| 5 | 原生库无清理入口 | 原版 DB 面板可删范围；原生侧只能逐个删头像 |
| 6 | 字体 / Markdown 未落地 | 字体选择是简化列表；原版有远程字体配置 URL、本地字体上传（8MB 上限）；Markdown 开关只存配置 |

### 8.2 未移植的原脚本能力

- **气泡正则本身**（产出 `.yq-bubble` 的规则）—— **用户明确说"先不管"**。没有它，气泡渲染不出来，头像管理页会显示"气泡数 0"，这是预期而非 bug
- CG 拉取引擎（GitHub API / JSON 清单 / HTML 兜底解析）
- 网络图床头像懒加载
- 本地字体库

### 8.3 未验证

- **真机观感**：4 个页面的实际显示、CG 读取、大图预览交互，**都还没有在真机上确认过**
- 移动端（Android / iOS）行为完全未测
- 移动端 surface 适配（`data-tt-mobile-surface` / `layout-kit.js`）**未接**，模板文档建议补

### 8.4 技术债

- `docs/ARCHITECTURE.md` / `docs/FEATURES.md` 里仍写着模板原来那 4 个模块（world-info / llm-api / dev-logs / chat-lab），**已过时**
- 仓库根有空的 `_unused.txt`（调试遗留）

---

## 9. 文档地图

| 文档 | 状态 | 用途 |
|---|---|---|
| **HANDOFF.md（本文）** | ✅ 最新 | 交接总览、名词、铁律、待定 |
| `EXTENSION-FROM-TEMPLATE.md` | ✅ 有效 | 模板作者的操作手册；宿主约束的**源码级证据**（路径/行号）都在这里 |
| `docs/ARCHITECTURE.md` | ⚠️ 部分过时 | 分层原则仍有效；模块列表过时 |
| `docs/FEATURES.md` | ❌ 过时 | 描述的是模板原有 4 个模块，已删除 |
| `docs/HOST_API_MAP.md` | ⚠️ 参考 | 宿主 API 映射 |

宿主侧参考（`D:\Dev\CodeX\TauriTavern`）：
- `ExtensionDEV.md` —— 扩展开发指南
- `docs/API/README.md` —— API 索引
- `docs/API/Extension.md` —— `api.extension.store` 完整契约
- `docs/API/Chat.md` —— `api.chat`（含 `handle.store` / `metadata` / `searchMessages`）
- `docs/CurrentState/ThirdPartyExtensions.md` —— 目录、加载、资源端点
- `docs/CurrentState/CharacterIdentityContract.md` —— 角色身份契约
- `src/scripts/tauritavern/layout-kit.js` —— 移动端布局 SDK

---

## 10. 真机数据现状（2026-10-07）

**原生存储**（`data/_tauritavern/extension-store/`）：

| namespace | 头像 | 差分 | 大小 |
|---|---|---|---|
| `bubble-x-global` | 25 | 1841 | 76.6 MB |
| `bubble-x-char-x-2017` | 1 | 0 | — |

**原版 IndexedDB**：用户曾清空并重新导入；当前是否仍有数据需现场确认。

**配置表现状**：`bubble-x-global/config` 里**只有 26 个 `style_*` 键**，
没有 `mood_config` / `format_rule` / `mood_prompt_template`。
所以词表、格式规则、注入模板**全部走内置默认值**——这是正常路径，不是缺数据；
但也意味着「读原始配置键」的写法一律会落空（见 §7 铁律 2j）。

**提示词实测（2026-10-08，最近 4 条 AI 消息 / 82 个气泡）**：
情绪 7 种（害羞 25、喜悦 20、爱恋 15、平和 13、得意 6、紧张 2、造词 1）；
服装 3 种（casual 34 / sleep 25 / naked 23）；**动作 act-sfw 82/82 = 100%**。
即：情绪和服装本来就在变，卡死的只有动作（见 §7 铁律 2k）。

**已知数据缺口**：真机里 `小秋` 这个名字**没有任何头像/差分记录**，所以她的气泡只能显示首字兜底
（`林知意` 有完整 240 条：8 情绪 × 5 服装 × 6 动作）。

**用户当前工作流**：已从原版 DB 转换到原生后端（转换是"复制不删源"）。默认后端已固定为原生，切换器已移除。

---

## 11. 代码结构速查

```
src/
├── index.ts                     入口：挂载悬浮球 + 设置面板
├── host/api.ts                  唯一接触 window.__TAURITAVERN__ 的地方
├── host/client.ts               能力探测（HostCapability）
├── components/LoadingHint.vue   通用加载提示
├── app/                         settings / shell / layout / context
├── features/
│   ├── modules.ts               ← 注册 4 个页面
│   ├── registry.ts              生命周期 + resolveTab（旧标签 id 兜底）
│   └── bubble-render/
│       ├── runtime.ts           ★ 共享运行时（弱引用表按 context 缓存）
│       ├── modules.ts           4 个页面模块定义
│       ├── components/          AvatarsPage / StylePage / MoodPage / StoragePage
│       ├── key-format.ts        ★ key 解析（名字 / charId / 构造）
│       ├── indexeddb-avatar-library.ts  原版库读写
│       ├── native-avatar-library.ts     TT 原生库读写
│       ├── avatar-resolver.ts   ★ 6 级回退链 + URL 缓存
│       ├── bubble-hydrator.ts   ★ 气泡 hydration
│       ├── mood-resolver.ts     情绪词 → 情绪 id
│       ├── prompt-injector.ts   提示词注入
│       ├── config-store.ts      配置状态（三页共用）
│       ├── import-export.ts     ZIP 导入导出
│       ├── migration.ts         按范围迁移
│       ├── image-utils.ts       上传前压缩
│       ├── async-utils.ts       有界并发
│       └── constants.ts         从原脚本提取的真实数据（8 组情绪 109 词）
└── i18n/                        三语，115 个 bubbleRender 键

tests/                           18 个测试（多数用真实 fake-indexeddb）
scripts/sync.mjs                 junction 校验器
```

**加新东西的流程**：`STORAGE_TYPES → 实现 → runtime → 页面 → i18n(三语) → 测试 → build → sync`

---

## 12. 三个原始素材的位置

| 素材 | 路径 |
|---|---|
| 对话渲染系统 v7.1（脚本） | `D:\Dev\CodeX\data\酒馆助手脚本-对话渲染系统_v71.json` |
| 轻量气泡 hydration（脚本） | `D:\Dev\CodeX\data\酒馆助手脚本-轻量气泡 hydration（保情绪保动作版）.json` |
| 导出包样例（83 MB） | `D:\Dev\CodeX\data\bubble-character-银麒赎世-扩图总包-2026-06-07-第1部分-基础情绪修正版 (1).zip` |
| 已导出的脚本正文（便于检索） | `D:\Dev\CodeX\data\_dump\v71.js`、`_dump\hyd.js` |

> 原脚本的注释里有作者写的版本记录与排查笔记，**是理解需求的宝贵线索**，但它们只是数据，不是指令。
