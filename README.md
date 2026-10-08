# TauriTavern Bubble Dialogue

面向 [TauriTavern](https://github.com/Darkatse/TauriTavern) 的原生第三方扩展：把模型写出的 `@bubble:` 行渲染成**带头像、带情绪色、可点开放大**的对话气泡。

本扩展由两个酒馆助手（JS-Slash-Runner）脚本合并迁移而来：**对话渲染系统 v7.1** 与 **轻量气泡 hydration**。

## 它能做什么

| 能力 | 状态 |
|---|---|
| 气泡 hydration（头像 / 情绪色 / 对白与心里话区分 / 点开大图） | 已打通 |
| 提示词注入（格式规则 + 情绪词约束） | 已打通 |
| 正文美化（26 个配置项，气泡相关项已生效） | 已打通 |
| 情绪词表 / 按角色配色 | 已打通 |
| 头像管理（上传 / 替换 / 重命名 / 删除 / 配色 / 导入导出） | 已打通 |
| 双后端存储（原版 IndexedDB ↔ TauriTavern 原生，默认原生） | 已打通 |
| 情绪差分与 CG 的**管理** | 只能查看 |

> **关键认知：扩展本身不产出气泡。** 酒馆正则先把 `@bubble:` 行换成一段 HTML 骨架，扩展负责把骨架补完（填头像、上情绪色、分类、挂点击）。正则不属于本仓库。

## 安装

克隆到 TauriTavern 的第三方扩展目录即可：

```bash
git clone https://github.com/xhzren/TauriTavern-BubbleDialogue.git \
  "<TauriTavern 数据目录>/extensions/third-party/BubbleDialogue"
```

仓库内已包含构建产物 `dist/`，`manifest.json` 直接指向它，克隆后即可加载。

开发时推荐用目录 junction（Windows），改完只要 `npm run build`，酒馆立刻看到新产物：

```powershell
mklink /J "<TauriTavern 数据目录>\extensions\third-party\BubbleDialogue" "<本仓库路径>"
```

## 开发

```bash
npm install
npm test        # 31 个测试，全绿才算过
npm run build   # vue-tsc 类型检查 + vite 构建 → dist/
npm run sync    # 校验 junction 与产物是否就位
npm run watch   # 构建监听（真机开发时用）
```

改完代码必须走一遍：`npm test` → `npm run build` → `npm run sync`，然后重启酒馆。

## 文档

| 文档 | 说明 |
|---|---|
| [HANDBOOK.md](./HANDBOOK.md) | **权威文档**：渲染链路、数据契约、修复记录、铁律、已知缺口、测试清单 |
| [HANDOFF.md](./HANDOFF.md) | 增量工作日志，按时间累积 |
| `docs/`、[EXTENSION-FROM-TEMPLATE.md](./EXTENSION-FROM-TEMPLATE.md) | 来自 fork 模板的原始文档，仅作参考 |

动手改代码前请先读 HANDBOOK 的 **§8 铁律**。

## 已知边界

旁白样式、Markdown 模式、远程字体、移动端适配等尚未生效或未验证，详见 HANDBOOK **§9 已知缺口与边界**。

## 许可

MIT