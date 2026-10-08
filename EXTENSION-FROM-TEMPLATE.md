# 从本模板创建自己的扩展（完整操作手册）

> 本文件是自包含的。新对话直接读这一篇即可开工，不需要重新研究模板或宿主源码。
> 所有路径为绝对路径，可直接套用。
> 结论基于 2026-10-07 对两个仓库的源码级核对：
> - 模板：`D:\Dev\CodeX\TauriTavern-Creator-Extension`（git: Darkatse/TauriTavern-Creator-Extension，HEAD `9bfd3a5`）
> - 宿主：`D:\Dev\CodeX\TauriTavern`（git: Darkatse/TauriTavern，版本 2.3.0）

---

## 0. 先分清两个仓库

| 仓库 | 角色 | 你能对它做什么 |
|------|------|----------------|
| `D:\Dev\CodeX\TauriTavern-Creator-Extension` | **这就是官方扩展模板本身**（README 原话：「可直接 fork、修改，作为你自己扩展的起点」） | 复制、改造、编译成你自己的扩展 |
| `D:\Dev\CodeX\TauriTavern` | 宿主（酒馆本体），提供加载机制与 API | **只读参考**。绝不能 import 它的内部模块，只能运行时用 `window.__TAURITAVERN__` |

所以「根据模板创建自己的扩展」＝ **复制模板 → 换身份 → 换功能模块 → 保留外壳布局**。

模板的架构原则（摘自 `docs/ARCHITECTURE.md`）：
- 入口由 `manifest.json` 定义，产物是 `dist/index.js` + `dist/style.css`
- 只有 `src/host/` 允许碰 `window.__TAURITAVERN__`
- 每个功能是一个独立目录，增删功能＝增删文件夹
- 不引入 Vue Router / Pinia / UI 组件库，只有 Vue 3 + Vite

---

## 1. 六件事总览

| # | 任务 | 难度 | 不改的后果 |
|---|------|------|-----------|
| 1 | 改身份（名字／包名／DOM id／localStorage key） | 低 | 与模板撞车，用户同时装两个会互相覆盖 |
| 2 | 改设计令牌前缀 `--ttce-*` → 自己的前缀 | 中 | CSS 全局注入无隔离，会污染宿主样式 |
| 3 | 替换功能模块（`src/features/`） | **核心** | 这是扩展真正的价值所在 |
| 4 | 改 i18n 文案与键 | 中 | 键在编译期校验，漏一个 build 直接失败 |
| 5 | 接宿主 API（新增能力走 `src/host/`） | 中 | 绕过 `src/host/` 会破坏分层，且失去能力探测 |
| 6 | 装进酒馆联调 | 低 | — |

**UI 布局（悬浮球 + 全屏面板 + 侧边栏 + 设置抽屉）模板已写好。第 3 步只换内容，不动骨架。**

---

## 2. 必改的身份文件（逐项清单）

| 文件（绝对路径） | 具体改什么 |
|---|---|
| `D:\Dev\CodeX\TauriTavern-Creator-Extension\manifest.json` | `display_name`、`author`、`homePage`。**`js`/`css` 保持 `dist/index.js` / `dist/style.css`** |
| `...\package.json` | `name` |
| `...\index.html` | `<title>`（仅影响本地 dev 预览） |
| `...\src\index.ts` | 三个常量 `FLOATING_ROOT_ID` / `SETTINGS_ROOT_ID` / `THEME_ROOT_CLASS`；以及所有 `console.error/warn` 的 `[TauriTavern Creator Extension]` 前缀 |
| `...\src\app\settings-store.ts` 第 7 行 | `STORAGE_KEY = 'ttce:settings'` ← **必须换**，否则与模板共用同一份 localStorage 设置 |
| `...\src\settings-page\ExtensionsPagePanel.vue` 约 69 行 | 抽屉标题文字 `TauriTavern Creator Extension` |
| `...\README.md` | 3 处品牌名 |

### 2.1 manifest.json 的硬约束（源自宿主源码，非推测）

- **`js` / `css` 只接受字符串或长度为 1 的字符串数组**；多元素数组 → 激活时抛错失败
  （证据：`D:\Dev\CodeX\TauriTavern\src\scripts\extensions\runtime\manifest-assets.js:1-18`、`asset-loader.js:61-65`）
- **JS 入口按 ES module 加载**：`script.type='module'`，并额外 `import(scriptUrl)` 兜底支持 top-level await
  （证据：`asset-loader.js:163-182`）
- 根 `manifest.json` 必须存在、必须是 JSON object，否则整个扩展被跳过
  （证据：`src\scripts\extensions.js:713-733`）
- `minimum_client_version` 不满足 → **不激活**（模板填的是 `1.16.0`）
- `dependencies` 是**扩展名数组**，必须全部已发现且已启用，否则不激活
  （证据：`extensions.js:761-817`）
- `auto_update` 仅对 third-party 生效，且只接受匿名 `http(s)` Git remote
- 资源路径支持 `${locale}` 占位符

模板当前的 manifest.json 全文：

```json
{
  "display_name": "TauriTavern Creator Extension",
  "author": "Darkatse",
  "version": "1.1.0",
  "js": "dist/index.js",
  "css": "dist/style.css",
  "homePage": "https://github.com/Darkatse/TauriTavern-Creator-Extension",
  "auto_update": false,
  "minimum_client_version": "1.16.0",
  "dependencies": []
}
```

### 2.2 安装目录与资源端点

- local：`data\default-user\extensions\<文件夹>`
- global：`data\extensions\third-party\<文件夹>`
- **同名时 local 优先**（发现时保留 local，读资源时先查 local）
- 资源 URL 唯一前缀：`/scripts/extensions/third-party/<文件夹>/<path>`，未命中返回**真实 404**（不回退 index.html）

---

## 3. UI 布局：要「完全模仿」就照这些文件抄

模板的视觉分三层，变量名**全部带 `ttce` 前缀**。模仿布局的最小改动＝把前缀换成自己的（如 `--myext-`），结构与数值原样保留。

### 3.1 设计令牌（换肤基础）— `D:\...\src\style.css`

约 60 个 CSS 变量，定义在 `.ttce-theme-root`；日间主题由 `.ttce-theme-root[data-ttce-appearance='day']` 覆盖。

```
--ttce-font-sans / --ttce-font-mono
--ttce-accent-blue / -green / -amber / -red
--ttce-bg-0 ~ bg-3 / bg-sidebar / bg-code
--ttce-border / -border-strong
--ttce-text / -text-muted / -text-soft / -text-inverse / -on-accent
--ttce-surface-hover / -surface-active / -chip-bg / -chip-strong-bg
--ttce-control-*（输入框）   --ttce-checkbox-*（复选框）
--ttce-primary-*（主按钮）   --ttce-accent-*-soft-*（柔和徽章）
--ttce-bubble-button-*   --ttce-backdrop
--ttce-shadow-panel / -shadow-floating / -shadow-dialog
--ttce-scrollbar / -scrollbar-hover
```

> ⚠️ **为什么必须换前缀**：宿主把扩展 CSS 用 `<link rel="stylesheet">` 直接挂到 `document.head`，
> **没有 Shadow DOM、没有 scoped 隔离**。你的选择器能命中宿主元素，宿主的也能命中你。
> `ttce` 就是防撞命名空间。
> （证据：`D:\Dev\CodeX\TauriTavern\src\scripts\extensions\runtime\asset-loader.js:105-137`）

### 3.2 外壳骨架（4 个文件）

| 文件 | 布局职责 |
|---|---|
| `src\App.vue` | 根容器；把 layout 快照写成 CSS 变量 `--ttce-viewport-*` / `--ttce-safe-inset-*`；渲染 `FloatingBubble` + `<Transition name="fade">` 包裹 `MainPanel` |
| `src\shell\bubble\FloatingBubble.vue` | 悬浮球：桌面 48px／触屏 40px；可拖拽并持久化位置；触屏设备空闲 1 秒自动吸边（只露 15px） |
| `src\shell\panel\MainPanel.vue` | **主面板，布局核心**（见 3.3） |
| `src\app\layout-store.ts` | 订阅 `api.layout` 快照，暴露 `compact`（≤768px）、`safeInsets`、`viewportFrame`、`safeFrame` |

### 3.3 主面板具体数值（照抄）— `src\shell\panel\MainPanel.vue`

```
.main-panel-backdrop  position:fixed, z-index:99998
                      四边用 --ttce-viewport-*，padding 用 --ttce-safe-inset-*
                      background:--ttce-backdrop, backdrop-filter:blur(2px)
.main-panel-window    width: min(96%, 1360px)   height: min(94%, 1040px)
                      border-radius:8px, display:flex, overflow:hidden
.panel-sidebar        width:220px，右侧 1px border
  .sidebar-header     padding:16px + 下边框；h3 为 14px 大写 letter-spacing:1px
  .category-title     11px 大写，color:--ttce-text-soft，padding:0 12px 8px
  .nav-item           padding:8px 12px, radius:6px, 13px, margin-bottom:4px
  .nav-item.active    background:--ttce-surface-active, font-weight:500
  .sub-item           padding-left:20px
.panel-content        flex:1，纵向 flex
  .content-header     height:36px，justify-content:flex-end → 右上角 ✕ 关闭按钮
  .content-body       flex:1，padding:14px 16px，overflow:hidden
  .feature-host       flex:1，min-height:0
@media (max-width:768px)
                      窗口变 100%/100%、border-radius:0、flex-direction:column
                      隐藏 .sidebar-header 与 .desktop-nav，显示 .mobile-nav
                      （横向滚动的胶囊按钮 .mobile-tab，radius:999px）
```

侧边栏顶部固定一个「设置」项，其下按三个分类（`character-tools` / `extension-dev` / `memory-dev`）分组列出**已启用**的功能。

### 3.4 设置 UI 有两处，别漏

1. **面板内的设置页** — `src\shell\settings\ExtensionSettings.vue`（内部套 `src\settings\CreatorSettingsPane.vue`）
2. **宿主扩展设置页里的抽屉** — `src\settings-page\ExtensionsPagePanel.vue`；
   它复用**宿主自己的 class**：`inline-drawer` / `wide100p` / `inline-drawer-toggle` / `inline-drawer-header` / `inline-drawer-content`，
   挂载点是 `#extensions_settings` 或 `#extensions_settings2`（见 `src\index.ts` 的 `getExtensionsSettingsHost()`）

宿主侧依据：`D:\Dev\CodeX\TauriTavern\src\index.html:6033-6072` 预置了一批 `div.extension_container`。
**未找到**名为 `renderExtension` 的专用挂载 API；约定就是自己建 `.extension_container` 挂上去
（第一方扩展也这么干，见 `src\scripts\extensions\mcp-manager\src\index.tsx:20-43`）。

### 3.5 生命周期（`src\index.ts`）

启动：`waitForDocumentReady()` → `waitForHostReady()` → `getHostApi()` → `createHostClient()` → `createSettingsStore()` → `createI18n()` → `getSupportedFeatureModules()` → `mountSettingsPanel()` → 订阅设置变化 → `queueLifecycleSync()` → 监听 `pagehide` 清理。

挂载**两个独立 Vue 应用实例**：
- 悬浮应用：注入 `CREATOR_APP_KEY` + `I18N_KEY`
- 设置面板：只注入 `I18N_KEY`

---

## 4. 核心工作：替换功能模块

### 4.1 模块接口 — `src\features\types.ts`

```ts
interface CreatorFeatureModule {
  id: string;
  area: 'character-tools' | 'extension-dev' | 'memory-dev';
  titleKey: keyof Messages;        // 显示名的 i18n 键
  descriptionKey: keyof Messages;  // 功能描述的 i18n 键
  order: number;                   // 侧边栏排序
  capabilities: HostCapability[];  // 宿主不支持 → 自动隐藏
  defaultEnabled: boolean;
  component: Component;
  createController(ctx: CreatorRuntimeContext): CreatorFeatureController;
}

interface CreatorFeatureController {
  activate(): Promise<void>;
  deactivate(): Promise<void>;
}
```

### 4.2 标准目录

```
src/features/my-feature/
├── module.ts                 # 模块定义 + 控制器工厂
└── components/MyView.vue     # 视图，通过 prop 收 controller
```

### 4.3 五步走

1. 建目录（如上）
2. 写 `module.ts` — 参照 `src\features\world-info\module.ts`（最完整范例：拉初始数据 + `subscribe` 实时订阅 + 推气泡通知 + `deactivate` 里退订）
3. 在 `src\features\modules.ts` 的数组里加入
4. 在 `src\i18n\types.ts` 的 `Messages` 接口加 `myFeature.title` / `myFeature.featureDesc`，
   再到 `en.ts` / `zh-hans.ts` / `zh-hant.ts` 补三个翻译（当前共 123 个键）
5. `npm run build`（内含 `vue-tsc`，漏 i18n 键会直接报编译错）

### 4.4 视图组件的两条硬规矩

- **订阅由控制器持有**，视图不直接订阅宿主事件（否则 `deactivate()` 清不干净，架构文档明确说这不算「模板级标准」）
- **视图通过 `controller` prop 拿状态与方法**；需要 shell / settings / i18n 就 `useCreatorApp()`

### 4.5 想改分类名？三处必须同步改

`area` 的标签硬编码在三处，改一处不改全会显示 key 原文：
1. `src\features\types.ts` 的 `FeatureArea` 类型
2. `src\shell\panel\MainPanel.vue` 的 `categories` 数组 + `categoryLabelKeys`
3. `src\settings\CreatorSettingsPane.vue` 的 `areaOrder` + `areaLabelKeys`

### 4.6 模板内置的 4 个模块（可删可留）

| 目录 | 功能 | 所需能力 | area |
|---|---|---|---|
| `world-info/` | 世界书监视器 | `worldInfo` | character-tools |
| `llm-api/` | AI 请求记录 | `dev.llmApiLogs` | extension-dev |
| `dev-logs/` | 应用日志 | `dev.frontendLogs`、`dev.backendLogs` | extension-dev |
| `chat-lab/` | 聊天记忆搜索 | `chat` | memory-dev |

---

## 5. 接宿主 API：只走 `src/host/`

### 5.1 分层约定

- `src\host\api.ts` — **唯一**接触 `window.__TAURITAVERN__` 的地方；含全部 ABI 类型 + `waitForHostReady()`
- `src\host\client.ts` — `HostClient`：能力探测 + 稳定封装（`supports` / `supportsAll` / `getChatHandle` / `getChatWindowInfo`）

模板已实现的能力（`HostCapability` 联合类型）：
`layout` | `chat` | `dev.frontendLogs` | `dev.backendLogs` | `dev.llmApiLogs` | `worldInfo`

宿主实际开放的完整 api 命名空间（模板未用，可自行扩展）：
`db`、`chat`、`chatSurface`、`characterCards`、`agent`、`llmConnections`、`mcp`、`skill`、`layout`、`dev`、`worldInfo`、`extension`（其下是 `api.extension.store`）

**新增 API 的流程**：
`api.ts` 的 `TauriTavernHostApi` 加类型 → `client.ts` 的 `HostCapability` 加成员 + `collectCapabilities()` 加探测 → 模块里声明 `capabilities`

### 5.2 等待宿主就绪

```js
await (window.__TAURITAVERN__?.ready ?? window.__TAURITAVERN_MAIN_READY__);
const api = window.__TAURITAVERN__.api;
```

两端兼容判据：`if (window.__TAURITAVERN__) { /* TT */ } else { /* 原生 ST */ }`

### 5.3 TauriTavern 独有的四个能力（值得优先用）

```js
// 1) 定位最后一条符合条件的消息（后端 Rust 扫描，不受窗口化加载影响）
const hit = await handle.locate.findLastMessage({
  role: 'assistant',
  hasExtraKeys: ['TavernDB_ACU_IsolatedData'],
  scanLimit: 2000,
});  // → { index, message } | null

// 2) 全文检索，内置 CJK bigram 分词
const hits = await handle.searchMessages({
  query: '关键词', limit: 20,
  filters: { role: 'assistant', startIndex: 0, endIndex: 5000, scanLimit: 5000 },
});  // → [{ index, score, snippet, role, text }]

// 3) per-chat 独立 KV（大状态）
await handle.store.setJson({ namespace: 'my-ext', key: 'index', value: data });
await handle.store.getJson({ namespace: 'my-ext', key: 'index' });
await handle.store.listKeys({ namespace: 'my-ext' });
await handle.store.deleteJson({ namespace: 'my-ext', key: 'old' });

// 4) 轻量配置（小状态，存 chat_metadata.extensions[namespace]）
await handle.metadata.setExtension({ namespace: 'my-ext', value: { lastFloor: 42 } });
await handle.metadata.get();
```

### 5.4 容易踩的坑（宿主源码确认）

- **不要依赖裸 ST 全局**：`getContext` / `eventSource` / `event_types` / `saveSettingsDebounced` / `popup`
  **都没有挂到 window**（对 `src/` 全量检索 0 命中）。要用 `window.SillyTavern.getContext()`，
  它返回的对象里有 `eventSource`、`eventTypes`、`saveSettingsDebounced`、`extensionSettings`、`Popup`、
  `callGenericPopup`、`renderExtensionTemplateAsync`
- **改了消息要显式落盘**：`await getContext().saveChat()`；不要 import `script.js` 内部的 `saveChat()`
- **消息索引用 0-based 绝对索引**，JSONL header 不计入
- **大状态用 `store.*`，小状态用 `metadata.*`**，不要塞进消息体（会膨胀 payload）
- **扫描必须有界**：`findLastMessage({scanLimit})`、`searchMessages({filters.scanLimit})`
- **命名空间／表／键字符集**只允许 `[A-Za-z0-9_.-]`，非空、不以 `.` 开头、禁止 `.` / `..`
- 可靠的库全局：`window._`（正式 ABI）、`Fuse`、`DOMPurify`、`localforage`、`Handlebars`、`showdown`、`moment`、`Popper`、`droll`；`jQuery`/`$`/`toastr` 也是全局

---

## 6. 构建与联调

```bash
cd D:\Dev\CodeX\TauriTavern-Creator-Extension

npm install     # 当前 node_modules 不存在，必须先装
npm run build   # = vue-tsc -b && vite build → dist/index.js + dist/style.css
```

产物：`dist\index.js`、`dist\style.css`、`dist\index.js.map`（当前 198KB / 40KB / 898KB）

构建配置要点（`vite.config.ts`）：
- lib 模式，`formats: ['es']`，`fileName: () => 'index.js'`，`cssFileName: 'style'`
- `cssCodeSplit: false` ← 保证只出一个 style.css
- `assetFileNames: '[name][extname]'`
- target `es2022`，开 sourcemap

装进酒馆：
```
data\default-user\extensions\<你的文件夹>\     # local
data\extensions\third-party\<你的文件夹>\      # global
```
然后重启酒馆 → 扩展设置页出现你的抽屉 → 打开总开关 → 悬浮球出现。

---

## 7. 模板的两个已知缺口（建议补）

### 7.1 未声明移动端 surface（重要）

全量 grep `data-tt-mobile-surface` / `applySurface` / `layout-kit` / `tt-inset` → **零命中**。
模板只用了 `api.layout` 快照做安全区适配，没有用 surface 契约。

宿主文档明确建议（`docs/API/Layout.md:89-98`、`ExtensionDEV.md:207`）：
全屏面板标 `fullscreen-window`、遮罩标 `backdrop`、悬浮球标 `free-window`、同源 iframe 标 `viewport-host`。

不补的风险：Android 的 `--tt-ime-bottom` 是 **surface-local** 的，**不承诺出现在 `:root`**；
带输入框的面板若不被识别为 IME target，键盘弹出时布局可能错位。

补法：
```js
import { waitForHostReady, SURFACE, applySurface } from '/scripts/tauritavern/layout-kit.js';
await waitForHostReady();
applySurface(panelEl,    SURFACE.FullscreenWindow);
applySurface(backdropEl, SURFACE.Backdrop);
applySurface(bubbleEl,   SURFACE.FreeWindow);
```
（硬 ABI 等价写法：`el.dataset.ttMobileSurface = 'fullscreen-window'`）

### 7.2 气泡 z-index 写死 99998

`MainPanel.vue` 的 `.main-panel-backdrop { z-index: 99998 }` 是硬编码，
与宿主自身弹窗的层叠顺序没有契约保证。联调时注意观察是否被宿主 UI 盖住。

---

## 8. 最省事的执行顺序

```
1. npm install（先确认能 build 通）
2. 批量替换 ttce → 你的前缀
     涉及：src\style.css、src\components\*.vue、src\settings\CreatorSettingsPane.vue、
           src\settings-page\ExtensionsPagePanel.vue、src\app\settings-store.ts 的 STORAGE_KEY
3. 改 manifest.json / package.json / src\index.ts 的三个 ID 常量
4. 删掉不需要的 features 目录，写你自己的第一个模块
5. 补 i18n 三语（en / zh-hans / zh-hant）
6. npm run build → 丢进 data\default-user\extensions\ → 重启验证
```

---

## 9. 文件速查表

### 改身份必动
| 文件 | 内容 |
|---|---|
| `manifest.json` | display_name / author / homePage |
| `package.json` | name |
| `index.html` | title |
| `src\index.ts` | FLOATING_ROOT_ID / SETTINGS_ROOT_ID / THEME_ROOT_CLASS / console 前缀 |
| `src\app\settings-store.ts:7` | STORAGE_KEY |
| `src\settings-page\ExtensionsPagePanel.vue` | 抽屉标题 |
| `README.md` | 品牌名 ×3 |

### 改 UI 样式
| 文件 | 内容 |
|---|---|
| `src\style.css` | 约 60 个 `--ttce-*` 令牌 + day 主题覆盖 |
| `src\shell\panel\MainPanel.vue` | 主面板布局（220px 侧边栏 / 1360×1040 窗口 / 768px 断点） |
| `src\shell\bubble\FloatingBubble.vue` | 悬浮球拖拽与吸边 |
| `src\App.vue` | layout 快照 → CSS 变量 |
| `src\app\layout-store.ts` | layout 订阅与 compact 判定 |

### 改功能
| 文件 | 内容 |
|---|---|
| `src\features\types.ts` | 模块接口 + FeatureArea |
| `src\features\modules.ts` | 模块注册表数组 |
| `src\features\catalog.ts` | 按能力过滤 + 排序 |
| `src\features\registry.ts` | 生命周期与启停 |
| `src\features\<id>\module.ts` | 你的控制器 |
| `src\features\<id>\components\*.vue` | 你的视图 |
| `src\i18n\types.ts` + 三个语言文件 | 文案键 |

### 改宿主对接
| 文件 | 内容 |
|---|---|
| `src\host\api.ts` | ABI 类型 + `waitForHostReady()` + `getHostApi()` |
| `src\host\client.ts` | HostCapability 探测 |

### 共享组件（可直接复用）
| 文件 | 用途 |
|---|---|
| `src\components\ExpandableTextPane.vue` | 文本块，可展开为全屏对话框 |
| `src\components\FactStrip.vue` | 横向键值徽章条 |
| `src\components\ImageCropper.vue` | 图片裁剪（自定义悬浮球图标用） |
| `src\shell\bubble\bubble-feed-bus.ts` | 气泡通知总线 |

---

## 10. 参考文档位置

模板自带（`D:\Dev\CodeX\TauriTavern-Creator-Extension\docs\`）：
- `ARCHITECTURE.md` — 分层结构、数据流、新增功能步骤、约束
- `FEATURES.md` — 4 个内置模块的功能与调用的宿主 API
- `HOST_API_MAP.md` — 宿主 API 映射

宿主（`D:\Dev\CodeX\TauriTavern\`）：
- `ExtensionDEV.md` — 扩展开发指南（根目录）
- `docs\API\README.md` — API 索引
- `docs\API\Chat.md` / `Layout.md` / `Migration.md` — 最常用三份
- `docs\API\Extension.md`（`api.extension.store`）、`Dev.md`、`WorldInfo.md`、`Database.md`、`Agent.md`、`MCP.md`、`Skill.md`、`ChatSurface.md`、`LlmConnections.md`
- `docs\CurrentState\ThirdPartyExtensions.md` — 目录、加载、资源端点
- `src\scripts\tauritavern\layout-kit.js` — 移动端布局 SDK（导出 `SURFACE` / `waitForHostReady` / `applySurface` / `subscribeLayout`）
- `docs\FrontendHostContract.md` — `window.__TAURITAVERN__` 契约

---

## 11. 未验证项与不确定性

- 本文档结论来自源码与文档核对，**没有在真实运行的酒馆实例中实测**。装进去后的实际观感、层级、键盘行为需自行验证。
- `docs\API\Layout.md:83` 提到 iOS 用 `env(safe-area-inset-*)`、Android 以 native 注入为准，跨平台行为可能略有差异。
- `docs\API\Database.md` 依赖 `TriviumDB 0.8.8`，升级后该 API 细节可能变化。
- 宿主仓库中**未找到**：manifest 必填字段全集清单、`renderExtension` 类专用挂载 API、裸 ST 全局注入代码。
  这三处结论是对本仓库检索的结果，不代表上游 SillyTavern 的行为。
- 行号对应 2026-10-07 的 checkout，后续提交可能偏移。
