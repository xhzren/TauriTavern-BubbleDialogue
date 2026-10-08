import type { CreatorRuntimeContext } from "../../app/context";
import type { CreatorFeatureController, CreatorFeatureModule } from "../types";
import { getBubbleRuntime, type BubbleRuntime } from "./runtime";
import AvatarsPage from "./components/AvatarsPage.vue";
import StylePage from "./components/StylePage.vue";
import MoodPage from "./components/MoodPage.vue";
import StoragePage from "./components/StoragePage.vue";

/**
 * 四个页面（头像管理 / 正文美化 / 情绪配置 / 存储）共用同一份运行时。
 *
 * 用引用计数管理生命周期：只要还有一个页面开着，气泡渲染、提示词注入和
 * 事件订阅就保持运行；全部关掉才真正卸载。避免每个页面各建一份库造成状态不一致。
 */

export interface BubblePageController extends CreatorFeatureController {
    runtime: BubbleRuntime;
}

function createPageController(context: CreatorRuntimeContext): BubblePageController {
    const runtime = getBubbleRuntime(context);
    return {
        runtime,
        async activate() {
            await runtime.acquire();
        },
        async deactivate() {
            await runtime.release();
        },
    };
}

function page(
    id: string,
    titleKey: keyof import("../../i18n").Messages,
    descriptionKey: keyof import("../../i18n").Messages,
    order: number,
    component: CreatorFeatureModule["component"],
): CreatorFeatureModule {
    return {
        id,
        area: "bubble-dialogue",
        titleKey,
        descriptionKey,
        order,
        capabilities: [],
        defaultEnabled: true,
        component,
        createController: createPageController,
    };
}

export const bubbleAvatarModule = page(
    "bubble-avatar",
    "bubbleRender.pageAvatar",
    "bubbleRender.pageAvatarDesc",
    10,
    AvatarsPage,
);

export const bubbleStyleModule = page(
    "bubble-style",
    "bubbleRender.pageStyle",
    "bubbleRender.pageStyleDesc",
    20,
    StylePage,
);

export const bubbleMoodModule = page(
    "bubble-mood",
    "bubbleRender.pageMood",
    "bubbleRender.pageMoodDesc",
    30,
    MoodPage,
);

export const bubbleStorageModule = page(
    "bubble-storage",
    "bubbleRender.pageStorage",
    "bubbleRender.pageStorageDesc",
    40,
    StoragePage,
);

export const bubbleFeatureModules = [
    bubbleAvatarModule,
    bubbleStyleModule,
    bubbleMoodModule,
    bubbleStorageModule,
];

export type { BubbleRuntime };
