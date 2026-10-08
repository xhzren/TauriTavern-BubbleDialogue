# 架构说明

本文档介绍扩展的分层结构。适用于以下场景：

- 以此为模板开发自己的扩展
- 新增功能模块
- 梳理数据流以排查问题

## 设计原则

### 1. 真实的第三方扩展

本项目的工作方式与任何 SillyTavern 第三方扩展完全一致：

- 入口由 `manifest.json` 定义
- 构建产物：`dist/index.js` + `dist/style.css`
- 不 import TauriTavern 内部模块

### 2. 宿主访问单点收口

只有 `src/host/` 接触 `window.__TAURITAVERN__`。功能模块、外壳、视图均通过 `HostClient` 接口间接访问宿主。

这意味着：
- 替换宿主适配层不影响功能代码
- 功能模块可以独立测试
- 搜索 `src/host/` 即可了解全部宿主 API 使用情况

### 3. 功能即模块

每个功能是独立目录：

```
src/features/your-feature/
├── module.ts           # 功能定义 + 控制器工厂
└── components/
    └── YourView.vue    # 视图组件
```

功能模块声明所需的宿主能力。注册表会自动隐藏宿主不支持的功能。

### 4. 依赖最少化

模板有意不引入 Vue Router、Pinia 和 UI 组件库，保证代码易读、易改、易删。

---

## 数据流

```
index.ts（入口）
  → HostClient（宿主适配）
    → Feature Registry（能力过滤、生命周期）
      → Feature Controllers（业务逻辑、订阅）
        → Shell（气泡、面板、设置）
          → Vue 组件（仅展示）
```

组件通过 `controller` prop 调用方法，不直接订阅宿主 API。

---

## 各层说明

### 入口（`src/index.ts`）

职责：
1. 等待 DOM 和宿主就绪
2. 创建 `I18nContext`
3. 组装 `CreatorAppContext`，挂载悬浮 Vue 应用
4. 在扩展页挂载设置面板
5. `pagehide` 时清理

入口挂载两个独立的 Vue 应用实例：
- **悬浮应用** — 气泡 + 主面板（注入 `CREATOR_APP_KEY` + `I18N_KEY`）
- **设置面板** — 嵌入扩展页（仅注入 `I18N_KEY`）

### 宿主适配层（`src/host/`）

| 文件 | 职责 |
|------|------|
| `api.ts` | 宿主 ABI 类型定义，`waitForHostReady()` 辅助函数 |
| `client.ts` | `HostClient`——能力探测、稳定调用封装 |

`HostClient` 提供：
- `api` — 宿主 API 命名空间的类型化引用
- `capabilities` — 已探测到的能力列表
- `supports(cap)` / `supportsAll(caps)` — 能力检查
- `getChatHandle()` / `getChatWindowInfo()` — 聊天上下文辅助方法

### 应用运行时（`src/app/`）

| 文件 | 职责 |
|------|------|
| `context.ts` | `CreatorAppContext` 定义和 Vue 注入键 |
| `create-creator-app.ts` | 组装设置、i18n、外壳、气泡总线和功能注册表 |
| `settings-store.ts` | 持久化功能开关、气泡位置、活动标签页、外观模式 |
| `shell-store.ts` | 面板开合状态、活动标签页、未读计数 |

### 多语言（`src/i18n/`）

零依赖的多语言系统，基于 Vue `provide/inject`。

| 文件 | 职责 |
|------|------|
| `types.ts` | `Locale` 联合类型，`Messages` 接口（约 110 个键） |
| `en.ts` | 英文翻译 |
| `zh-hans.ts` | 简体中文 |
| `zh-hant.ts` | 繁体中文 |
| `index.ts` | `resolveLocale()`、`createI18n()`、`useI18n()`、`I18N_KEY` |

语言根据 `navigator.language` 自动检测，无需手动选择。

所有翻译键类型为 `keyof Messages`，拼写错误会在编译时报错。

### 功能层（`src/features/`）

#### 模块接口

```ts
interface CreatorFeatureModule {
  id: string;
  area: 'character-tools' | 'extension-dev' | 'memory-dev';
  titleKey: keyof Messages;          // 显示名称的 i18n 键
  descriptionKey: keyof Messages;    // 功能描述的 i18n 键
  order: number;                     // 侧边栏排序
  capabilities: HostCapability[];    // 所需宿主能力
  defaultEnabled: boolean;
  component: Component;              // Vue 组件
  createController(ctx: CreatorRuntimeContext): CreatorFeatureController;
}
```

#### 注册表（`registry.ts`）

- 按宿主能力过滤可用模块
- 为每个模块创建控制器
- 从设置中读取默认开关状态
- 管理 `activate()` / `deactivate()` 生命周期

#### 内置模块

> 本仓库已把模板原有的 4 个示例模块（world-info / llm-api / dev-logs / chat-lab）删除，
> 替换为对话气泡相关的 4 个页面。模块清单以 `src/features/bubble-render/modules.ts` 为准。

| 模块 id | 页面 | 所需能力 |
|------|------|----------|
| `bubble-avatar` | 头像管理 | 无（可选 `extension.store`） |
| `bubble-style` | 正文美化 | 无 |
| `bubble-mood` | 情绪配置 | 无 |
| `bubble-storage` | 存储 | 无（转换需 `extension.store`） |

四个页面共用同一份运行时（`src/features/bubble-render/runtime.ts`，按 context 弱引用缓存 + 引用计数）。

### 外壳（`src/shell/`）

| 组件 | 职责 |
|------|------|
| `FloatingBubble.vue` | 可拖拽的悬浮气泡，带通知 feed |
| `MainPanel.vue` | 全屏面板，含侧边栏导航 |
| `ExtensionSettings.vue` | 面板内的设置页 |
| `bubble-feed-bus.ts` | 通知总线（功能模块推送，气泡展示） |

### 共享组件（`src/components/`）

| 组件 | 职责 |
|------|------|
| `ExpandableTextPane.vue` | 文本块，可展开为全屏对话框 |
| `FactStrip.vue` | 横向键值徽章条 |

---

## 如何新增功能

### 第 1 步：创建目录

```
src/features/my-feature/
├── module.ts
└── components/
    └── MyFeatureView.vue
```

### 第 2 步：定义模块（`module.ts`）

```ts
import type { CreatorFeatureModule } from '../types';
import MyFeatureView from './components/MyFeatureView.vue';

export const myFeatureModule: CreatorFeatureModule = {
  id: 'my-feature',
  area: 'extension-dev',           // 侧边栏分类
  titleKey: 'myFeature.title',
  descriptionKey: 'myFeature.featureDesc',
  order: 50,
  capabilities: ['chat'],          // 此功能需要的宿主能力
  defaultEnabled: true,
  component: MyFeatureView,
  createController(context) {
    return {
      async activate() { /* 订阅宿主 API */ },
      async deactivate() { /* 取消订阅、清理资源 */ },
    };
  },
};
```

### 第 3 步：注册

在 `src/features/modules.ts` 中添加：

```ts
import { myFeatureModule } from './my-feature/module';

export const creatorFeatureModules = [
  // ... 已有模块
  myFeatureModule,
];
```

### 第 4 步：添加 i18n 键

在 `src/i18n/types.ts` 的 `Messages` 接口中添加 `myFeature.title` 和 `myFeature.featureDesc`，然后在三个语言文件中补充翻译。

### 第 5 步：构建并测试

```bash
npm run build
```

类型检查器会在编译时捕获缺失的 i18n 键。

---

## 生命周期

### 启动流程

1. `waitForDocumentReady()`
2. `waitForHostReady()`
3. `createHostClient(hostApi)`
4. `createI18n()`
5. `createCreatorApp(host, { settings, i18n })`
6. `app.provide(CREATOR_APP_KEY, context)` + `app.provide(I18N_KEY, i18n)`
7. `app.mount(mountPoint)`

### 卸载流程

1. `registry.deactivateAllFeatures()` — 每个控制器释放订阅
2. `app.unmount()`
3. 从 DOM 移除挂载点

如果一个功能模块无法在 `deactivate()` 中完成清理，说明它还没有达到模板级标准。

---

## 约束

新增代码时请遵守以下规则：

1. **新功能放 `src/features/`** — 不要在外壳中写业务逻辑
2. **新宿主 API 走 `src/host/`** — 先在 `HostClient` 中添加能力定义
3. **订阅由控制器持有** — 视图不直接订阅宿主事件
4. **视图接收 `controller` prop** — 展示状态、调用控制器方法
5. **设置项放 `settings-store.ts`** — 不存在组件局部状态中
6. **i18n 键在 `types.ts` 中声明** — 所有面向用户的文本必须可翻译
