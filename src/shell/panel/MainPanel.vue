<script setup lang="ts">
import { computed } from 'vue';
import { useCreatorApp } from '../../app/context';
import ExtensionSettings from '../settings/ExtensionSettings.vue';
import type { Messages } from '../../i18n';

const { registry, shell, i18n } = useCreatorApp();
const t = i18n.t.bind(i18n);

const categoryLabelKeys: Record<string, keyof Messages> = {
    'bubble-dialogue': 'settings.area.bubbleDialogue',
    'character-tools': 'settings.area.characterTools',
    'extension-dev': 'settings.area.extensionDev',
    'memory-dev': 'settings.area.memoryDev',
};

const categories = ['bubble-dialogue', 'character-tools', 'extension-dev', 'memory-dev'];

const activeTab = computed(() => shell.state.activeTab);

/**
 * 兜底的当前页：localStorage 里可能残留已不存在的标签页 id
 * （例如扩展升级后旧的聚合页被拆成多个页面）。
 * 这种情况直接判定原 id，会让面板显示成空白，所以回退到第一个可用页面。
 */
const resolvedTab = computed(() => registry.resolveTab(activeTab.value));

const activeFeature = computed(() => (
    registry.getActiveFeatures().find((feature) => feature.id === resolvedTab.value) ?? null
));
const mobileTabs = computed(() => [
    { id: 'settings', label: t('panel.globalSettings') },
    ...registry.getActiveFeatures().map((feature) => ({
        id: feature.id,
        label: t(feature.titleKey),
    })),
]);

const getFeatures = (categoryId: string) => {
    return registry.getFeaturesByArea(categoryId as 'bubble-dialogue' | 'character-tools' | 'extension-dev' | 'memory-dev');
};

const setTab = (id: string) => {
    shell.setActiveTab(id);
};
</script>

<template>
  <div class="main-panel-backdrop" data-tt-mobile-surface="backdrop" @click="shell.closePanel()">
    <div class="main-panel-window" data-tt-mobile-surface="fullscreen-window" @click.stop>
      <!-- Sidebar -->
      <div class="panel-sidebar">
        <div class="sidebar-header">
            <h3>{{ t('panel.sidebarTitle') }}</h3>
        </div>
        
        <div class="sidebar-nav desktop-nav">
          <div class="nav-item" :class="{ active: resolvedTab === 'settings' }" @click="setTab('settings')">
             {{ t('panel.globalSettings') }}
          </div>
          <div v-for="cat in categories" :key="cat" class="nav-category">
             <div class="category-title" v-if="getFeatures(cat).length > 0">{{ t(categoryLabelKeys[cat]) }}</div>
             <div 
               v-for="feature in getFeatures(cat)" 
               :key="feature.id" 
               class="nav-item sub-item"
               :class="{ active: resolvedTab === feature.id }"
               @click="setTab(feature.id)"
             >
               {{ t(feature.titleKey) }}
             </div>
          </div>
        </div>

        <div class="mobile-nav">
          <button
            v-for="tab in mobileTabs"
            :key="tab.id"
            class="mobile-tab"
            :class="{ active: resolvedTab === tab.id }"
            @click="setTab(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="panel-content">
         <div class="content-header">
           <button class="close-btn" @click="shell.closePanel()">✕</button>
         </div>
         <div class="content-body">
            <div v-if="resolvedTab === 'settings'" class="feature-host settings-host">
              <ExtensionSettings />
            </div>
            <div v-else-if="activeFeature" class="feature-host">
              <component
                :is="activeFeature.component"
                :controller="activeFeature.controller"
              />
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-panel-backdrop {
    position: fixed;
    top: var(--ttbd-viewport-top, 0px);
    left: var(--ttbd-viewport-left, 0px);
    width: var(--ttbd-viewport-width, 100vw);
    height: var(--ttbd-viewport-height, 100vh);
    z-index: 99998; /* Just below bubble */
    background: var(--ttbd-backdrop);
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: var(--ttbd-safe-inset-top, 0px);
    padding-right: var(--ttbd-safe-inset-right, 0px);
    padding-bottom: var(--ttbd-safe-inset-bottom, 0px);
    padding-left: var(--ttbd-safe-inset-left, 0px);
    backdrop-filter: blur(2px);
}

.main-panel-window {
    width: min(96%, 1360px);
    height: min(94%, 1040px);
    background: var(--ttbd-bg-1);
    border: 1px solid var(--ttbd-border);
    border-radius: 8px;
    display: flex;
    overflow: hidden;
    min-height: 0;
    min-width: 0;
    box-shadow: var(--ttbd-shadow-panel);
    color: var(--ttbd-text);
    font-family: var(--ttbd-font-sans);
}

.panel-sidebar {
    width: 220px;
    background: var(--ttbd-bg-sidebar);
    border-right: 1px solid var(--ttbd-border);
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
}

.sidebar-header {
    padding: 16px;
    border-bottom: 1px solid var(--ttbd-border);
}

.sidebar-header h3 {
    margin: 0;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--ttbd-text);
}

.sidebar-nav {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    padding: 12px 8px;
}

.mobile-nav {
    display: none;
}

.nav-item {
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    margin-bottom: 4px;
    transition: background 0.15s, color 0.15s;
    color: var(--ttbd-text-muted);
}

.nav-item:hover {
    background: var(--ttbd-surface-hover);
    color: var(--ttbd-text);
}

.nav-item.active {
    background: var(--ttbd-surface-active);
    color: var(--ttbd-text);
    font-weight: 500;
}

.nav-category {
    margin-top: 16px;
}

.category-title {
    font-size: 11px;
    text-transform: uppercase;
    color: var(--ttbd-text-soft);
    padding: 0 12px 8px;
    letter-spacing: 0.5px;
}

.sub-item {
    padding-left: 20px;
}

.panel-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--ttbd-bg-1);
    min-height: 0;
    min-width: 0;
}

.content-header {
    height: 36px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 12px;
    border-bottom: 1px solid var(--ttbd-border);
}

.close-btn {
    background: transparent;
    border: none;
    color: var(--ttbd-text-muted);
    cursor: pointer;
    font-size: 16px;
    padding: 4px 8px;
    border-radius: 4px;
}

.close-btn:hover {
    background: var(--ttbd-surface-hover);
    color: var(--ttbd-text);
}

.content-body {
    flex: 1;
    min-height: 0;
    min-width: 0;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.feature-host {
    flex: 1;
    min-height: 0;
    min-width: 0;
    display: flex;
    /* 功能页自己决定要不要滚动：
       头像页用 height:100% + 左右两栏各自滚动，所以这里不会出现第二根滚动条；
       正文美化 / 情绪配置 / 存储页内容比容器高，由这里滚动。
       之前只在移动端开 overflow-y，桌面端是 hidden，导致这几个页面滚不动。 */
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
}

.settings-host {
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    min-width: 0;
}

@media (max-width: 768px) {
    .main-panel-window {
        width: 100%;
        height: 100%;
        max-width: none;
        border-radius: 0;
        border-left: none;
        border-right: none;
        flex-direction: column;
    }

    .panel-sidebar {
        width: 100%;
        height: auto;
        flex-shrink: 0;
        border-right: none;
        border-bottom: 1px solid var(--ttbd-border);
    }

    .sidebar-header,
    .desktop-nav {
        display: none;
    }

    /* 标签条：隐藏滚动条、贴边吸附、加大触控高度 */
    .mobile-nav {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 8px 10px;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        scroll-snap-type: x proximity;
        overscroll-behavior-x: contain;
    }

    .mobile-nav::-webkit-scrollbar {
        display: none;
    }

    .mobile-tab {
        flex: 0 0 auto;
        min-height: 40px;
        padding: 8px 10px;
        border: 1px solid var(--ttbd-border);
        border-radius: 999px;
        background: var(--ttbd-bg-0);
        color: var(--ttbd-text-muted);
        font-size: 13px;
        white-space: nowrap;
        cursor: pointer;
        scroll-snap-align: center;
        -webkit-tap-highlight-color: transparent;
    }

    .mobile-tab.active {
        border-color: var(--ttbd-border-strong);
        background: var(--ttbd-surface-active);
        color: var(--ttbd-text);
        font-weight: 600;
    }

    .content-header {
        height: 44px;
        flex-shrink: 0;
        padding: 0 8px;
    }

    .close-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 44px;
        min-height: 44px;
        font-size: 20px;
    }

    .content-body {
        padding: 10px 12px;
    }

    /* 内容区是 flex 行容器，页面根节点会被压成 max-content 宽度。
       窄屏下强制铺满，否则设置页 / 头像详情页右边会空一条。 */
    .feature-host > * {
        width: 100%;
        min-width: 0;
    }

    /* 键盘弹出时让底部可滚动到底，避免输入框被挡住 */
    .feature-host,
    .settings-host {
        scroll-padding-bottom: max(
            calc(var(--tt-viewport-bottom-inset, var(--tt-inset-bottom, 0px)) - var(--tt-inset-bottom, 0px)),
            0px
        );
    }
}
</style>
