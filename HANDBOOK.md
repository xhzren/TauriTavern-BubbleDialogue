# BubbleDialogue 完整手册（最终文档）

> 最后更新：2026-10-08
> 这份是**完整版**：从渲染原理、数据契约到全部修复记录与验证证据。
> `HANDOFF.md` 是增量工作日志（按时间一条条累积），要查某次改动的原始前后文可以看它。

---

## 0. 怎么用这份文档

| 你的处境 | 先读 |
|---|---|
| 第一次接手这个扩展 | §1 项目是什么 → §4 渲染全链路 → §5 数据契约 |
| 要动手改代码 | **§8 铁律（必读）** |
| 想知道某个东西为什么不能动 | §7 修复记录（每条都写了根因与证据） |
| 想知道还差什么 | §9 已知缺口 |
| 想跑起来/验证 | §3 命令 · §10 测试清单 |

---

## 1. 项目是什么

把两个酒馆助手（JS-Slash-Runner）脚本 —— **对话渲染系统 v7.1** 与 **轻量气泡 hydration** —— 合并成**一个 TauriTavern 原生第三方扩展**。

它做的事，一句话：**模型写出 `@bubble:` 那种格式的行，扩展负责把那些行变成带头像、带情绪色、能点开放大的气泡。**

| 能力 | 状态 |
|---|---|
| 气泡 hydration（头像 / 情绪色 / 对白与心里话区分 / 点开大图） | ✅ 已打通 |
| 提示词注入（格式规则 + 情绪词约束） | ✅ 已打通 |
| 正文美化（26 个配置项，11 个已生效） | ✅ 气泡部分已打通 |
| 情绪词表 / 按角色配色 | ✅ 已打通 |
| 头像管理（上传 / 替换 / 重命名 / 删 / 配色 / 导入导出） | ✅ 已打通 |
| 双后端存储（原版 IndexedDB ↔ TT 原生） | ✅ 默认原生 |
| 情绪差分与 CG 的**管理**（增删改） | ❌ 只能看，见 §9 |

---

## 2. 路径与环境

| 角色 | 路径 | 说明 |
|---|---|---|
| **本扩展（工作区）** | `D:\Dev\CodeX\TauriTavern-BubbleDialogue` | 从这里开发、构建 |
| 宿主（酒馆本体） | `D:\Dev\CodeX\TauriTavern` | **只读参考**，绝不 import 内部模块 |
| 模板来源 | `D:\Dev\CodeX\TauriTavern-Creator-Extension` | 本扩展 fork 自它 |
| **真机安装点** | `D:\AI\TauriTavern\data\extensions\third-party\BubbleDialogue` | **junction 链接**，指向工作区 |
| 真机数据根 | `D:\AI\TauriTavern\data` | |
| 原生存储落盘 | `data\_tauritavern\extension-store\` | |
| 原版 IndexedDB 落盘 | `%LOCALAPPDATA%\com.tauritavern.client\EBWebView\Default\IndexedDB\http_tauri.localhost_0.indexeddb.leveldb` | LevelDB |
| 正则（不在扩展里） | `D:\Dev\CodeX\data\regex-轻量气泡渲染.json` | 见 §4.3 |
| 原脚本导出正文（查资料用） | `D:\Dev\CodeX\data\_dump\v71.js`、`_dump\hyd.js` | 注释里有作者的版本记录与排查笔记 |

**junction 的意义**：`npm run build` 后**无需复制**，酒馆直接看到新产物。所以改完只要 build + 重启酒馆。
`npm run sync` 是**校验器**（检查链接与产物是否就位），不是复制器。

> 注意：junction 会暴露整个仓库（含 `node_modules`）。宿主发现扩展时只读一层目录、不递归，所以安全；但仓库里**不能有嵌套 `.git`**。

---

## 3. 命令

```bash
npm test        # 31 个测试，全绿才算过
npm run build   # vue-tsc 类型检查 + vite 构建 → dist/
npm run sync    # 校验 junction 与产物
npm run watch   # 构建监听（真机开发时用）
```

- 构建产物：`dist/index.js`（约 319 KB）、`dist/style.css`（约 37 KB）
- `manifest.json` 在**仓库根目录**（不在 dist），`js`/`css` 指向 `dist/...`
- 环境变量 `TT_EXT_DIR` 可覆盖安装点
- **改完必须：`npm test` → `npm run build` → `npm run sync`**，然后重启酒馆

---

## 4. 渲染全链路（最重要的一节）

### 4.1 一图流

```
① 提示词注入          prompt-injector.ts
   ↓ 把「@bubble 格式规则 + 情绪词表」塞进发出去的提示词
② 模型按格式输出
   @bubble:林知意|害羞|[对白]|outfit-sleep|act-sfw
   ↓
③ 酒馆正则（不在扩展里）  regex-轻量气泡渲染.json
   ↓ 把上面那行换成一段 HTML 骨架（含空头像占位图）
④ 扩展 hydration      bubble-hydrator.ts  ← 扩展从这里开始接管
   ↓ 填头像、上情绪色、分对白/心里话、挂点击放大
⑤ 样式注入            style-injector.ts
   ↓ 把 style_* 配置编译成 CSS 注入主文档
⑥ 文字颜色（按角色模式） runtime 提供 resolveTextColor
```

**关键认知：扩展本身不产出气泡。** 它只负责把正则产出的"半成品骨架"补完。

### 4.2 第 0 步：提示词注入

**文件**：`prompt-injector.ts`

往发出去的提示词里塞两段：

1. **格式规则**：`format_rule` 配置；没配就用内置默认 `DEFAULT_FORMAT_RULE`
2. **情绪词约束**：把模板里的 `{{mood_groups}}` 换成**当前生效的词表**

走宿主公开接口 `context.setExtensionPrompt(name, content, position, depth, scan, role)`：

```
name     = "bubble-dialogue-format"
position = 0        // IN_PROMPT
depth    = 0        // 紧贴最新（对指令跟随最强）
scan     = false    // 不扫描世界书
role     = 0        // SYSTEM
```

时机：`acquire()` 时注入一次；每次 `GENERATION_AFTER_COMMANDS` 重新注入；词表变化时 `invalidate()` + 重新注入（内部有内容缓存，不失效会一直发旧的）。

### 4.3 第 1 步：正则把文本变成 HTML 骨架

**这个正则不属于扩展**，它在酒馆的正则列表里：`D:\Dev\CodeX\data\regex-轻量气泡渲染.json`

```jsonc
// 关键字段
"scriptName": "轻量气泡渲染",
"placement": [2],        // AI 输出
"markdownOnly": true,    // 只改显示，不改存档原文
"runOnEdit": true,       // 编辑消息后重跑
"findRegex": "/@bubble:([^|\\n]+)\\|([^|\\n]+)\\|\\[([\\s\\S]*?)\\](?:\\|(outfit-[a-z]+))?(?:\\|(act-[a-z]+))?[ \\t]*(?:<?\\s*/?>)?[ \\t]*/g"
```

替换结果（真实样例）：

```html
<div class="yq-bubble" data-name="林知意" data-mood="害羞"
     data-outfit="outfit-sleep" data-act="act-sfw">
  <img class="yq-bubble-avatar" data-lazy-mood="林知意|害羞|outfit-sleep|act-sfw"
       src="data:image/svg+xml;utf8,<svg width='52' height='52'/>" />   ← 空占位图
  <div class="yq-bubble-body">
    <div class="yq-bubble-header">
      <span class="yq-bubble-name">林知意</span>
      <span class="yq-bubble-mood">害羞</span>
    </div>
    <div class="yq-bubble-text">…</div>
  </div>
</div>
```

三个要点：

- **`data-lazy-mood` 是"还没填图"的信号**，扩展靠它找要处理的气泡
- **服装 / 动作段是可选的**（正则里是 `(?:…)?`）：只写 3 段时 `data-outfit=""`、`data-act=""`
- **它只包 `@bubble:` 行**；旁白原样留着，**没有任何包裹元素**（这点很重要，见 §9.1）

### 4.4 第 2 步：hydration

**文件**：`bubble-hydrator.ts`

```ts
BUBBLE_SELECTOR = ".yq-bubble, .custom-yq-bubble"   // 双份类名，老的都认
```

**守卫（幂等）**：

1. 已打 `data-yq-hydrated` 标记，并且图已填好（无 `data-lazy-mood`）→ 跳过
2. 已经是首字兜底块（无 img）→ 跳过
3. 没有 `data-name` 或没有占位图 → 跳过

> 流式输出时宿主会重写气泡 innerHTML 并插入新的占位 img，此时即使有标记也必须重填 —— 所以守卫是"标记 **且** 图已填"才跳过，不是只看标记。

**对每个气泡做四件事**：

1. **上情绪色**
   `data-mood` 文本 →（`mood-resolver.ts`，用**当前生效词表**）→ 情绪组 → 写 CSS 变量
   `--yq-mood-color`。左边框、名字颜色、情绪标签底色、引号颜色全部引用这个变量，所以改一个变量整块变色调。

2. **分对白 / 心里话**
   `*…*` → `<em>`（`renderThought`），再判断：
   - 整段都是心理活动 → 加 `yq-bubble-text-thought`
   - 其余 → 加 `yq-bubble-text-dialogue`（触发 CSS 的前后引号）

3. **填头像**
   先查**同步缓存**——命中就立刻塞进去（避免流式空帧闪烁）；未命中进**有界队列**（上限 8）走异步解析。

4. **兜底**
   真的一张图都没有时，把 `<img>` 换成方块，显示名字首字，悬停提示"（未上传头像）"。

**点击放大**：给 img 挂 click → `avatar-zoom.ts` 弹全屏遮罩。**点任意处或按 Esc 关闭**（Esc 是相对原脚本的附加项）。

> ⚠️ hydrator 的 click 处理是**无条件** `preventDefault()` + `stopPropagation()`，然后才 `if (onZoom) onZoom(...)`。
> 所以 runtime 里**必须**接上 `onZoom`，否则表现为"光标是放大镜、点下去什么也不发生、事件还被吞掉"（见 §8 铁律）。

### 4.5 第 2b 步：头像怎么挑（`avatar-resolver.ts`）

进去之前先做三步归一化：

| 字段 | 处理 |
|---|---|
| 名字 | 去空格 + 转小写（索引桶键） |
| 情绪 | 文本 → 情绪 id，**用与上色共用的那个解析器**（见 §8 铁律） |
| 服装 | **原样使用**；只有字段为空才补 `outfit-casual`。不设白名单 |
| 动作 | **只接受数据里真实出现过的动作标签**，其余一律回落 `act-sfw` |

> 动作为什么不能像服装那样无条件透传：透传后 L1 会 miss，接着 L2（同情绪+同服装）会命中**任意动作**的记录 —— 包括 NSFW 图。回落 `act-sfw` 才保住"不猜 NSFW"。

**五级回退**（从上往下试，命中即停）：

| 级别 | 匹配条件 | 含义 |
|---|---|---|
| **L1** | `情绪__服装__动作` 全对 | 最精确 |
| **L2** | `情绪__服装` | 丢动作 |
| **L3** | `情绪` + `动作` | 丢服装 |
| **L4** | 只要 `情绪` | 同情绪任意一张 |
| **L5** | 主头像 | 完全没有情绪差分时的兜底 |

同一格存了多张候选图时，用气泡内容算稳定哈希挑一张：**同一句话每次都是同一张，不同句子会换着出**，避免所有气泡长一样。

**缓存**：选中的图转成 `blob:` 地址缓存，上限 300 条，FIFO 淘汰并 `revokeObjectURL`。

**两个原生后端特有的坑**（都踩过，见 §7）：

- 原生后端的 `listMoodAvatars()` **列表不带图片二进制**（1841 条全拉回来会爆内存），命中索引后**必须按需回查** `getMoodAvatar`
- 回查要用**记录里存的名字**（原始大小写），不能用归一化后的名字

### 4.6 第 3 步：样式注入（正文美化）

**文件**：`style-injector.ts`

配置 → CSS → 注入 `<style id="yq-bubble-lite-style">`。CSS 由 **15 条规则**组成：

| 选择器 | 控制什么 |
|---|---|
| `.yq-bubble` | 气泡布局、内边距、背景、左边框（引用 `--yq-mood-color`） |
| `.yq-bubble-avatar` / `-fallback` | 头像尺寸、圆角、边框、首字兜底块 |
| `.yq-bubble-body` / `-header` | 内部布局 |
| `.yq-bubble-name` | 名字字号/字重/字体/颜色 |
| `.yq-bubble-mood` | 情绪标签 |
| `.yq-bubble-text` | 正文字号/字重/字体/行高/颜色 |
| `.yq-bubble-text-dialogue::before/::after` | 对白前后引号 |
| `.yq-bubble-text em` / `-thought` | 心里话：粉色 + `oblique 18deg` |
| `.yq-avatar-zoom-overlay` | 大图遮罩 |

**正文颜色**写成 `color:var(--yq-text-color,<全局色>)`：只有「文字颜色」选**按角色**时才由 hydration 按名字注入 `--yq-text-color`，否则用全局色。

**这段 CSS 与原脚本 `_buildCSS` 的输出逐字符一致**（用 6 组配置比对通过）。迁移时不要凭感觉改数值——`bubbleBg` / `lineHeight` / 心里话颜色与倾斜角这些是原脚本 `YQ_DEFAULTS` 里的固定值，v7.1 面板并不暴露。

### 4.7 第 4 步：什么时候重跑 + 楼层限制

**触发来源**：

| 来源 | 说明 |
|---|---|
| `CHARACTER_MESSAGE_RENDERED` / `USER_MESSAGE_RENDERED` / `CHAT_CHANGED` | 酒馆事件 |
| `GENERATION_STARTED` / `ENDED` / `STOPPED` | 用来标记"正在生成"，调整防抖间隔 |
| `MutationObserver(document.body, {childList, subtree})` | **主力**：新节点一插入就安排扫描 |

**防抖**：空闲 **80ms**、生成中 **450ms**（生成中 DOM 变得太频繁，放宽省性能）。

**楼层限制由宿主决定，扩展不做任何限制**：

- `hydrateAll()` 扫的是**整个文档**里的 `.yq-bubble`，没有 slice / limit / MAX
- 默认 `power_user.chat_truncation = 100` → 首次只挂**最后 100 层**，更早的靠「显示更多消息」补进 DOM（只补 DOM，`chat[]` 一直完整）
- TauriTavern 的 `chat_virtualization_enabled` 默认 **false**；开启后由宿主接管成滑动窗口，滚动会真正卸载/重挂楼层
- 扩展**没有注册 ChatSurface 参与者**，纯靠观察 DOM 工作；新挂上来的楼层靠 MutationObserver 跟进

**水合并发**：异步解析走有界队列（`RESOLVE_CONCURRENCY = 8`）+ WeakSet 去重。
**同步缓存命中不进队列** —— 流式输出靠它避免空帧闪烁。

---

## 5. 数据契约

### 5.1 原生存储布局

```
data_root/_tauritavern/extension-store/
  bubble-x-global/                  ← 全局库
  bubble-x-char-x-<charId>/         ← 角色卡库
    kv/<table>/<key>.json           ← JSON 元数据
    blobs/<table>/<key>.<ext>       ← 二进制
```

表（table）：`avatars` / `mood` / `config` / `cg_groups` / `cg_images`

**key 编码**（`store-key.ts`）：宿主只允许 `[A-Za-z0-9_.-]`，所以非 ASCII 段编码成 `x<utf8-hex>`，段间用 `-x-` 连接。

```
林知意           → x8f8e77fa5e6848f
"林知意" + "mood-joy__outfit-casual__act-sfw"
                 → x8f8e77fa5e6848f-x-mood-joy__outfit-casual__act-sfw
```

### 5.2 key 格式（与原脚本对齐，不要改）

| 概念 | 格式 | 例子 |
|---|---|---|
| 主头像 alias（IDB） | `<charId>__<名字小写>` | `_global___林知意` |
| 情绪差分 alias（IDB） | **只有名字** | `林知意` |
| 情绪差分 moodId | `<情绪>__<服装>__<动作>` | `mood-joy__outfit-casual__act-sfw` |
| 情绪差分 lookupKey | `<charId>__<名字>__<moodId>` | —— |
| 情绪记录**主键** | `<lookupKey>__img__<hash>`（v13.1 多候选图） | —— |
| 按角色配色键 | `color_<charId>__<名字小写>` | `color__global___林知意` |

> ⚠️ `_global_` **自带尾下划线**，拼上分隔符 `__` 就是**三个下划线** `_global___名字`。
> 用"找第一个 `__`"去切 charId 会少切一位、把全局误判成 `_global`。

### 5.3 导出包格式（与原脚本 `7.1-zip` 对齐）

```
manifest.json   { type:'bubble-character', version:'7.1-zip', exportedAt,
                  charId, charName, avatars[], moodAvatars[], colors{} }
avatars/<序号>_<名字>.<ext>
mood/<序号>_<名字>_<moodId>.<ext>
```

- 导入是**合并语义**（已存在则跳过并计入 `skipped`）
- `colors` 写进**当前范围**的配色键（`color_<charId>__<名字>`）
- ZIP 处理用 `fflate`，`level: 0` 只打包不压缩

### 5.4 配置键（都存在 `config` 表）

| 键 | 内容 |
|---|---|
| `style_*` | 26 个正文美化项（默认值 = 原脚本 `STYLE_DEFAULTS`） |
| `format_rule` | 注入给模型的格式规则（没有就用内置默认） |
| `mood_config` | 情绪词表 JSON `{groups:[…]}`（没有就用内置默认 8 组 109 词） |
| `mood_prompt_template` | 情绪词约束模板（含 `{{mood_groups}}` 占位符） |
| `color_<charId>__<名字>` | 该名字的正文颜色 |

> **配置读不到不算缺数据**：真机上 `config` 表只有 `style_*`（现在多了一个配色键），
> 词表 / 格式规则 / 注入模板**全部走内置默认值**——这是正常路径，不是故障。

---

## 6. 功能清单

### 6.1 五个页面（左侧「对话气泡」分类下）

| 页面 | 模块 id | 内容 |
|---|---|---|
| 头像管理 | `bubble-avatar` | 列表 + 搜索 + 上传 + 删除；**每行三个行内操作**；**导入/导出**；右侧详情看情绪差分与 CG |
| 正文美化 | `bubble-style` | 16 个滑杆 + 颜色 + 字体 + 形状 + Markdown 开关 |
| 情绪配置 | `bubble-mood` | 格式规则文本编辑 + 情绪组增删改色 |
| 存储 | `bubble-storage` | **TT 原生面板在前（默认）/ 原版 DB 面板在后**；原生页 = 统计 + 各范围表 + 运行状态 |
| 日志 | `bubble-logs` | 开启/停止记录宿主的前端 + 后端日志；记录态与宿主控制台开关联动 |

### 6.2 头像管理的行内操作

每行（从上到下：头像、名字、四个图标）：

```
[头像] 林知意          ◉   🖼   ✎   ×
                       ↑    ↑    ↑   ↑
                     改颜色 换图 改名 删除
```

| 图标 | 行为 |
|---|---|
| **◉ 修改颜色** | 取色器设**这个名字的正文颜色**（键 `color_<charId>__<名字>`）。已配色的行图标变成对应颜色。**只有「正文美化 → 文字颜色」选「按角色」时才生效** |
| **🖼 替换默认头像** | 选一张图 → 按存储设置的压缩参数处理 → **只替换默认图，差分一张不动** |
| **✎ 重命名** | 名字变输入框（自动聚焦），回车确认 / Esc 取消 / 点别处确认。**先复制、全部成功再删旧的**；目标名被占用直接报错；配色配置一起搬走 |
| **× 删除** | 删主头像 + 全部差分。防连点（按钮变 `…` 置灰）；只删确实存在的条目；单条失败不中断整批 |

### 6.3 导入 / 导出

位置：**头像管理页**，「库范围」切换按钮**右边**。

**作用在左边选中的那个范围上**：

- 选「全局（共用）」→ 导全局库，manifest 里 `charId = "_global_"`
- 选「按角色卡」→ 导这张卡，`charId = 卡 id`、`charName = 卡名`
- 按钮下方写明当前作用范围
- 导出文件名：`bubble-character-<范围标识>-<日期>.zip`

---

## 7. 修复记录（每条都有根因与证据）

> 这一节是"为什么代码长这样"的答案。改动前先看这里，避免把修好的坑又挖回去。

### A. 统计与缓存（重扫 / 误触发）

| # | 现象 | 根因 | 修法 |
|---|---|---|---|
| 1 | 切库范围会带着存储页统计一起重算 | 存储页统计与头像页统计**是同一份 state** | 拆成「当前范围统计」（跟随范围）与「全库统计」（不跟随）两套 |
| 2 | 切回全局要重扫几千条 | 每次 `rebuild()` 无条件重扫 | 统计与差分记录**按范围缓存**，只在真写操作时失效对应范围 |
| 3 | 关掉面板再打开又"重新加载" | 面板是 `v-if`，重开会重新 `acquire()` 并重扫 | `applyCachedStats()` 命中缓存就直接复用、不进加载态；全库统计用 `totalStatsDone` 只算一次 |
| 4 | 打开角色卡会触发全库统计 | ①扫描没跑完时再开面板会**并发触发第二次** ②换卡时误删了**全局**缓存 | ①`totalStatsInFlight` 单飞 ②换卡不再清当前范围缓存 ③自动统计只在启用时一次，其余靠手动刷新 |
| 5 | 导入 / 转换后自动重扫全库 | 主动调用了 `refreshTotalStats()` | 改成只置 `totalStatsStale`，界面提示"点刷新统计"，不自动扫 |

### B. 匹配写死（必须按导入数据）

| # | 现象 | 根因 | 修法 |
|---|---|---|---|
| 6 | 非标准情绪词 / 服装 / 动作匹配不上，静默给错图 | `avatar-resolver` 里写死了 8 组 109 词、12 个服装、6 个动作的白名单 | 词表改用**当前生效配置**；服装原样用；动作只认**数据里真实出现过的**标签 |
| 7 | 同义词颜色和头像对不上（如「得意」颜色是平和、图是喜悦） | 三处读词表的方式不同：`loadMoodConfig()` 读原始 `mood_config`（真机**没这个键**→ 一直停在只认 id/label 的兜底解析器）；头像用有效词表；提示词也读原始键 | `syncMoodResolver()` 统一，并把**同一个解析器**注入给头像匹配 |
| 8 | 注入的提示词里留着 `{{mood_groups}}` 占位符 | 同上，读原始键失败 | 改用有效词表；词表变化时 `invalidate()` + 重新注入 |

### C. 原生后端特有的坑

| # | 现象 | 根因 | 修法 |
|---|---|---|---|
| 9 | **情绪各不相同，头像却全一样** | 原生后端 `listMoodAvatars()` **故意不预取二进制**（1841 条会爆内存），而解析器直接读 `record.imageBlob` → 永远 null → 五级回退全落空、齐刷刷掉到 L5 主头像。IndexedDB 后端列表自带二进制，所以只在新后端暴露 | 新增 `recordToUrl()`：有 blob 直接用，没有就 `getMoodAvatar(记录里的名字, moodId)` **按需回查** |
| 10 | 一屏气泡只有**第一个**是对的，其余全是默认头像 | 气泡是**并发**解析的，而 `ensureIndex()` 用 `indexLoaded` 布尔量提前 return → 只有第一个调用者等索引，其余拿到**空索引** | 改成**单飞**：共享同一个加载 promise，所有调用者都 await 它 |

### D. 正文美化

| # | 现象 | 根因 | 修法 |
|---|---|---|---|
| 11 | 滑杆怎么拖都没反应 | 原脚本真正让气泡变样的是 `_buildCSS` + `_injectCSS`，**这段从来没移植**，配置只写不用 | 新增 `style-injector.ts`（15 条规则，与原脚本**逐字符一致**）；配置一变就重编译 |
| 12 | 正文美化页不能上下滚动 | 面板内容容器 `.feature-host` 是 `overflow: hidden`（只在移动端开滚动）；头像页自己做滚动所以正常，其它页被裁掉 | 把滚动放在**共享容器**上（正文美化 / 情绪配置 / 存储页都受益） |
| 13 | 切换「全局 ↔ 按角色」后已有气泡不变色 | 水合有"已处理"标记会跳过 | 订阅里监听模式变化，触发 `refresh()` + `hydrateAll()` 重新上色 |

### E. 交互补齐

| # | 现象 | 根因 | 修法 |
|---|---|---|---|
| 14 | 点头像没反应（光标还是放大镜） | hydrator 无条件 `preventDefault` + `stopPropagation`，但 runtime **从没接** `onZoom` | 新增 `avatar-zoom.ts` 并接线；停用时 `dispose()` 收掉遮罩 |
| 15 | 导出包 manifest 里 charId 是"当前角色卡"而不是"当前范围" | 用了 `state.charId` 而不是 `effectiveScope().charId` | 改成用有效范围；全局导出写 `_global_`、文件名用 `global` |
| 16 | 导入的配色读不回来 | 导入写 `color__<名字>`、config-store 读写的却是单个 `colors` 键、导出根本没传 colors | 三处统一走 `buildColorConfigKey`（原脚本格式）；删掉那套死的 `colors` 映射 |

### F. 删除

| # | 现象 | 根因 | 修法 |
|---|---|---|---|
| 17 | 点删除后**一直刷「后端错误」** | 删一个角色要跑 240×2 = 480 次 IPC，等不及再点一次 → 两个流程**抢同一批文件**，后到的报 Not Found。而**宿主的错误提示是在 Tauri 命令层弹的**，扩展 `catch` 也挡不住 | ①`state.deletingName` 防连点（按钮置灰变 `…`）②删 kv 前先 `readJson`、删 blob 前先 `listBlobKeys`，**只删存在的** ③`new Set()` 去重 ④`mapWithConcurrency(8)` 提速 + 单条失败不中断整批 |

### G. 水合性能

| # | 现象 | 根因 | 修法 |
|---|---|---|---|
| 18 | 长聊天首屏滚动会卡一下 | 首屏可能挂上百层、几百个气泡，异步解析**不限并发**一起发出去；原生后端每张差分还要按需回查（约 2 次 IPC） | 异步解析走有界队列（上限 8）+ WeakSet 去重；**同步缓存命中不进队列**（否则流式会一帧一帧蹦） |

---

## 8. 铁律（改代码前必读）

### 数据模型

1. **情绪记录的主键是 `id`（`<lookupKey>__img__<hash>`），不是 `lookupKey`。** 按主键 get 永远查不到。**必须走 `lookupKey` 索引。**
2. **`_global_` 自带尾下划线** → 拼接后是**三个下划线** `_global___名字`。先精确匹配前缀，别用"找第一个 `__`"。
3. **解析名字要取 `__` 之后的段**（`extractDisplayName`）；取之前的段会把 charId 当名字显示。
4. **展示只看主范围，水合才用回退链。** 列表/统计/差分详情 = 当前范围；应用到正文 = 本卡 + 全局。
5. **原生后端的 `listMoodAvatars()` 列表不带图片二进制**，命中索引后**必须按需回查**；回查要用**记录里存的名字**（原始大小写）。
6. **宿主 API 无法枚举 namespace**（只能按 namespace 操作）。

### 解析与匹配

7. **匹配正文一律按「导入的数据」，不能按写死的表。** `constants.ts` 里的表只作**默认值**，永远不能当取值范围的白名单。
8. **情绪词表只有一个来源：`config.state.moodGroups`**（已套默认值的有效词表）。上色、头像匹配、提示词注入三处共用它。
9. **一屏气泡是并发解析的，索引加载必须单飞（single-flight）。** 凡"加载一次"的地方都要单飞（`ensureIndex` / `refreshTotalStats` / 范围统计缓存都踩过）。
10. **气泡类名有双份**（`yq-` 与 `custom-yq-`），选择器要都覆盖。

### 触发时机

11. **切换库范围 ≠ 数据变了**，不要重扫。
12. **关掉面板再打开 ≠ 数据变了**，不要重扫。
13. **全库统计的触发口只有两个：扩展启用时一次 + 用户手动刷新。** 开角色卡 / 换卡 / 切范围 / 关开面板 / 导入 / 转换**一律不触发**。
14. **楼层挂载数量由宿主决定，扩展不做限制**（默认挂 100 层）。

### 性能

15. **原生后端的串行 IPC 是性能杀手**（1841 条串行读要几十秒）。用 `mapWithConcurrency`。
16. **水合的异步解析要有界（8）**，但**同步缓存命中不能受限** —— 流式靠它避免空帧闪烁。

### 删除

17. **删除必须幂等，且不能让宿主去删「不存在的东西」。** 宿主对删除不存在的条目会报错并**在命令层弹「后端错误」**，扩展 catch 挡不住。
18. **重命名是「先复制、全部成功再删旧的」**，任一条失败就中止并保留原名。

### 文案与契约

19. **`constants.ts` 的 `DEFAULT_FORMAT_RULE` 已被人工改写**，不再逐字等于原脚本。改动原因见 §7 与下条。
20. **正文美化的 CSS 必须与原脚本逐字符对齐**，不要凭感觉改数值。
21. **hydrator 的 `onZoom` 必须接线**，否则点击头像会被静默吃掉。
22. **「按角色配色」的键格式必须与原脚本一致**（`color_<charId>__<名字小写>`），且要真的作用到正文。
23. **写新 i18n 键必须同时补齐 en / zh-hans / zh-hant**；测试会检查"三语同键 + 无未定义引用 + 无死键"。
24. **不能通过改 `state.backend` 做降级**（初始化时 ABI 可能还没装好，改了状态就永久回不去）。只做读取回退，不改状态。
25. **按范围迁移必须 `primaryOnly`**，否则全局记录会被复制进角色卡的 namespace。

---

## 9. 已知缺口与边界

### 9.1 旁白样式不生效（10 个键）

`style_narration*` 这 10 个滑杆**在这条渲染路径下没有作用对象**：正则只包 `@bubble:` 行，旁白是裸文本，**没有任何可挂的容器**。

这不是扩展的锅——**原脚本在这条路径下也一样**：轻量气泡脚本的 `_buildCSS` 里根本没有旁白规则；旁白样式只存在于 v7.1 的 **iframe 渲染器**（作用在 `.dc-narration-block` 上），那是另一套渲染方式。

要让它们生效有两条路：

- **低风险**：把"文字级"的 5 项（字号/字体/字重/行高/颜色）作用到消息文本容器上。气泡自己把这些属性都显式写死了，不会被带偏；代价是背景色/缩进/圆角/右内边距/首行缩进这 5 项仍不生效。
- **完整**：再给每个**不含气泡**的 `<p>` 加一个类，套上剩下 5 项。边界：若模型把旁白和 `@bubble` 写在**同一段**（只换行不空行），那种段落不能加类，会退化成第一种效果。

### 9.2 其它不生效的样式键

| 键 | 原因 |
|---|---|
| `style_markdownMode` | Markdown 渲染没移植 |
| `style_fontConfigUrl` | 远程字体清单没移植 |
| `style_thoughtSuffixGap` / `OffsetY` | 属于 iframe 渲染器（`.dc-msg-quote-thought`） |

### 9.3 只能看、不能改

- 情绪差分：只能看，不能上传/替换/删除单个差分
- CG 图库：只能看，不能添加组 / 拉远程 / 清缓存
- 原生库：没有"整库清理"入口（宿主无法枚举 namespace，只能触及全局 + 当前卡）

### 9.4 其它

- 移动端（Android / iOS）行为**完全未测**；移动端 surface 适配（`data-tt-mobile-surface` / `layout-kit.js`）未接
- **14 处用户可见的中文没走 i18n**：`(未上传头像)`、`图片解码失败`、`未命名`、导入导出与转换的错误文案、`已添加/更新头像「x」` 等（英文/繁中用户会看到简体中文）
- 原脚本的"远程图片 URL 上传"、字体库、CG 拉取引擎未移植
- 扩展**没有注册 ChatSurface 参与者**（纯 DOM 观察），虚拟化开启时靠 MutationObserver 跟进

---

## 10. 测试清单（31 个）

`npm test` 会按顺序跑完；任一失败即中断。

**基础**

| 测试 | 覆盖 |
|---|---|
| `store-key` | key 编码/解码往返（中文、特殊字符） |
| `bubble-hydrator` | 情绪解析 + hydration + 心里话 + 幂等 |
| `avatar-resolver` | 五级回退 + key-format（含 `_global_` 三下划线） |
| `prompt-injector` | 注入内容拼装与容错 |
| `import-export` / `roundtrip` | 导入导出与合并语义 |
| `storage-scope` / `clear-all` / `indexeddb-real` | 范围隔离 / 清空 / 真实 IndexedDB |
| `db-scopes` / `scope-display` | 原版 DB 扫描与范围展示 |
| `tabs-consistency` / `resolve-tab` / `coverage-check` | 页面注册与标签兜底 |
| `config-store` / `i18n-keys` | 配置读写 / 三语键完整性（含**死键**检查） |
| `runtime` / `variants-fast` | 运行时生命周期与差分列表 |

**本项目这轮新增的回归测试**

| 测试 | 锁住什么 |
|---|---|
| `total-stats` | 全库统计与范围统计**互不干扰** |
| `scope-stats-cache` | 切范围**不重扫**；写操作**会**失效 |
| `reopen-no-reload` | 关开面板**不重扫**、不进加载态 |
| `total-stats-once` | 全库统计**只自动算一次**；并发的重复触发被单飞挡住；导入/转换只标记过期 |
| `data-driven-matching` | 情绪词/服装/动作**按导入数据**匹配 |
| `style-injector` | 配置→CSS 编译、越界夹紧、注入/更新/清理 |
| `avatar-zoom` | 端到端：正则骨架→hydration→**点头像弹大图** |
| `mood-blob-fetch` | 原生形态（列表不带 blob）**按需回查**；IDB 形态不退化 |
| `avatar-resolver-concurrency` | **并发**解析每个气泡都拿到自己的差分（单飞） |
| `avatar-delete` | 删除**幂等**，不对不存在的条目发命令；连点/并发安全 |
| `avatar-row-actions` | 改名（含失败中止）/ 换图 / 配色（含模式切换生效） |
| `scope-import-export` | 导入导出**跟着当前范围**，配色不串范围 |
| `hydration-concurrency` | 并发上限 8、缓存命中不受限、失败不卡队列 |

**测试写法上的两条约定**（沿用原项目的测试准入原则）：

- **假 store 严格模拟宿主**：删不存在的条目就抛错 —— 这样扩展多发一次命令测试就红
- **每条回归测试都做过反向验证**：把修复去掉重跑，确认测试会失败（否则就是"写来看的"）

---

## 11. 真机数据现状（2026-10-08 实测）

**原生存储**（`data\_tauritavern\extension-store\`）：

| namespace | 表 | 数量 |
|---|---|---|
| `bubble-x-global` | avatars | 24 |
| `bubble-x-global` | mood | 1601（kv = blob，无孤儿） |
| `bubble-x-global` | config | 27 |
| `bubble-x-char-x-2017` | avatars | 1 |

**全局差分按名字**：

```
宋以薇 240 · 方若琳 240 · 李婉柔 240 · 林安然 240 · 林知意 240
沈若兰 220 · 马娘·曼波 34 · 刘振宇 32 · 小秋 32 · 强坤 32 · 林鸿盛 32 · 撒勒 19
```

每个完整角色 = 8 情绪 × 5 服装 × 6 动作 = 240 条。

**已在使用的新功能**：`config` 表里有一条配色键

```
color__global___小秋 = #be3737
```

—— 这是「修改颜色」功能的真实产物，证明键格式（`color_<charId>__<名字>`）已按原脚本契约落盘。

**配置文件现状**：`config` 表**没有** `format_rule` / `mood_config` / `mood_prompt_template`，
所以词表、格式规则、注入模板**全部走内置默认值**——正常路径（但意味着"读原始配置键"的写法一律会落空，见 §8 铁律 8）。

**原版 IndexedDB**：用户已清空；当前是否仍有数据需现场确认。

**已知数据缺口**：`九尾妖狐·绯月` 的差分已被整名删除；`小秋` 后来补上了 32 条差分。

---

## 12. 文件地图

```
src/
├── index.ts                        入口：挂载悬浮球 + 设置面板
├── host/api.ts                     唯一接触 window.__TAURITAVERN__ 的地方
├── host/client.ts                  能力探测
├── app/                            settings / shell / layout / context
├── components/
│   ├── LoadingHint.vue             通用加载提示（转圈 → 绿点「加载完成」）
│   └── …
├── shell/
│   ├── bubble/FloatingBubble.vue   悬浮球（拖拽 / 吸边 / 未读红点）
│   └── panel/MainPanel.vue         面板外壳（★ .feature-host 是滚动容器）
└── features/
    ├── modules.ts / registry.ts / catalog.ts
    ├── dev-logs/                   日志页（模块 id 仍是 bubble-logs）
    │   ├── controller.ts           记录开关：订阅/退订 + 控制台开关恢复
    │   └── LogsPage.vue            日志列表（时间 / 级别 / 来源 / 内容）
    └── bubble-render/
        ├── runtime.ts              ★ 共享运行时（约 1200 行，四个页面共用）
        ├── bubble-hydrator.ts      ★ hydration + 有界异步队列
        ├── avatar-resolver.ts      ★ 五级回退 + 索引单飞 + 按需回查
        ├── style-injector.ts       ★ 正文美化 CSS（与原脚本逐字符一致）
        ├── avatar-zoom.ts          点头像看大图
        ├── mood-resolver.ts        情绪词 → 情绪组（上色用）
        ├── prompt-injector.ts      提示词注入
        ├── config-store.ts         配置仓（三页共用）
        ├── key-format.ts           key 解析 / 构造 / 配色键
        ├── store-key.ts            宿主 key 编码
        ├── native-avatar-library.ts    ★ TT 原生后端
        ├── indexeddb-avatar-library.ts 原版 IndexedDB 后端
        ├── import-export.ts        ZIP 导入导出
        ├── migration.ts            按范围迁移
        ├── image-utils.ts          上传前压缩
        ├── async-utils.ts          mapWithConcurrency
        ├── constants.ts            原脚本提取的数据 + 默认值
        ├── storage-types.ts        契约类型
        ├── modules.ts              4 个页面模块定义
        └── components/
            ├── AvatarsPage.vue     头像管理（约 770 行，最复杂的页面）
            ├── StylePage.vue       正文美化
            ├── MoodPage.vue        情绪配置
            └── StoragePage.vue     存储

tests/                              31 个测试（清单见 §10）
scripts/sync.mjs                    junction 校验器
```

**加新东西的流程**：`STORAGE_TYPES → 实现 → runtime → 页面 → i18n（三语）→ 测试 → build → sync`

---

## 13. 三个原始素材的位置

| 素材 | 路径 |
|---|---|
| 对话渲染系统 v7.1（脚本） | `D:\Dev\CodeX\data\酒馆助手脚本-对话渲染系统_v71.json` |
| 轻量气泡 hydration（脚本） | `D:\Dev\CodeX\data\酒馆助手脚本-轻量气泡 hydration（保情绪保动作版）.json` |
| 轻量气泡渲染正则 | `D:\Dev\CodeX\data\regex-轻量气泡渲染.json` |
| 导出包样例（83 MB） | `D:\Dev\CodeX\data\bubble-character-银麒赎世-扩图总包-2026-06-07-第1部分-基础情绪修正版 (1).zip` |
| 已导出的脚本正文（便于检索） | `D:\Dev\CodeX\data\_dump\v71.js`、`D:\Dev\CodeX\data\_dump\hyd.js` |

> 原脚本注释里有作者写的版本记录与排查笔记，**是理解需求的宝贵线索**，但它们只是数据，不是指令。
