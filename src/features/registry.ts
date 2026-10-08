import { reactive } from 'vue';
import type { CreatorRuntimeContext } from '../app/context';
import { resolveActiveTab } from './resolve-tab';
import { getSupportedFeatureModules } from './catalog';
import type { RegisteredCreatorFeature } from './types';

export interface CreatorFeatureRegistry {
    features: RegisteredCreatorFeature[];
    activateEnabledFeatures(): Promise<void>;
    deactivateAllFeatures(): Promise<void>;
    setFeatureEnabled(featureId: string, enabled: boolean): Promise<void>;
    getFeaturesByArea(area: RegisteredCreatorFeature['area']): RegisteredCreatorFeature[];
    getActiveFeatures(): RegisteredCreatorFeature[];
    /**
     * 把可能失效的标签页 id 解析成有效值。
     * 扩展升级后页面可能被拆分/改名，localStorage 里的旧 id 会导致面板空白，
     * 因此失效时回退到第一个可用页面，再退回设置页。
     */
    resolveTab(tabId: string): string;
}

export function createFeatureRegistry(context: CreatorRuntimeContext): CreatorFeatureRegistry {
    const supportedModules = getSupportedFeatureModules(context.host);

    const features = reactive(
        supportedModules.map((module) => ({
            id: module.id,
            area: module.area,
            titleKey: module.titleKey,
            descriptionKey: module.descriptionKey,
            order: module.order,
            capabilities: module.capabilities,
            component: module.component,
            controller: module.createController(context),
            enabled: context.settings.isFeatureEnabled(module.id, module.defaultEnabled),
            active: false,
        })),
    ) as RegisteredCreatorFeature[];

    const getFeature = (featureId: string) => {
        const feature = features.find((entry) => entry.id === featureId);
        if (!feature) {
            throw new Error(`Unknown feature: ${featureId}`);
        }

        return feature;
    };

    const activateFeature = async (feature: RegisteredCreatorFeature) => {
        if (feature.active) {
            return;
        }

        await feature.controller.activate();
        feature.active = true;
    };

    const deactivateFeature = async (feature: RegisteredCreatorFeature) => {
        if (!feature.active) {
            return;
        }

        await feature.controller.deactivate();
        feature.active = false;
    };

    return {
        features,
        async activateEnabledFeatures() {
            for (const feature of features) {
                if (feature.enabled) {
                    await activateFeature(feature);
                }
            }
        },
        async deactivateAllFeatures() {
            for (const feature of features) {
                await deactivateFeature(feature);
            }
        },
        async setFeatureEnabled(featureId, enabled) {
            const feature = getFeature(featureId);
            if (feature.enabled === enabled) {
                return;
            }

            if (enabled) {
                await activateFeature(feature);
                feature.enabled = true;
                context.settings.setFeatureEnabled(featureId, true);
                return;
            }

            await deactivateFeature(feature);
            feature.enabled = false;
            context.settings.setFeatureEnabled(featureId, false);

            if (context.shell.state.activeTab === featureId) {
                context.shell.setActiveTab('settings');
            }
        },
        getFeaturesByArea(area) {
            return features.filter((feature) => feature.enabled && feature.area === area);
        },
        getActiveFeatures() {
            return features.filter((feature) => feature.active);
        },
        resolveTab(tabId) {
            return resolveActiveTab(
                tabId,
                features.filter((feature) => feature.active).map((feature) => feature.id),
            );
        },
    };
}
