import { reactive } from 'vue';
import type { CreatorSettingsStore } from './settings-store';
import type { BubbleFeedBus } from '../shell/bubble/bubble-feed-bus';

export interface CreatorShellStore {
    state: {
        panelOpen: boolean;
        activeTab: string;
    };
    openPanel(tabId?: string): void;
    closePanel(): void;
    togglePanel(tabId?: string): void;
    setActiveTab(tabId: string): void;
}

export function createShellStore(
    settings: CreatorSettingsStore,
    bubbleBus: BubbleFeedBus,
): CreatorShellStore {
    const state = reactive({
        panelOpen: false,
        activeTab: settings.state.activeTab,
    });

    const setActiveTab = (tabId: string) => {
        state.activeTab = tabId;
        settings.setActiveTab(tabId);
    };

    const openPanel = (tabId?: string) => {
        if (tabId) {
            setActiveTab(tabId);
        }

        state.panelOpen = true;
        bubbleBus.markAllRead();
    };

    return {
        state,
        openPanel,
        closePanel() {
            state.panelOpen = false;
        },
        togglePanel(tabId?: string) {
            if (state.panelOpen && !tabId) {
                state.panelOpen = false;
                return;
            }

            openPanel(tabId);
        },
        setActiveTab,
    };
}
