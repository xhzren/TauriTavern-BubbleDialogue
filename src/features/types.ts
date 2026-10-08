import type { Component } from 'vue';
import type { CreatorRuntimeContext } from '../app/context';
import type { HostCapability } from '../host/client';
import type { Messages } from '../i18n';

export type FeatureArea = 'bubble-dialogue' | 'character-tools' | 'extension-dev' | 'memory-dev';

export interface CreatorFeatureController {
    activate(): Promise<void>;
    deactivate(): Promise<void>;
}

export interface CreatorFeatureModule {
    id: string;
    area: FeatureArea;
    titleKey: keyof Messages;
    descriptionKey: keyof Messages;
    order: number;
    capabilities: HostCapability[];
    defaultEnabled: boolean;
    component: Component;
    createController(context: CreatorRuntimeContext): CreatorFeatureController;
}

export interface RegisteredCreatorFeature {
    id: string;
    area: FeatureArea;
    titleKey: keyof Messages;
    descriptionKey: keyof Messages;
    order: number;
    capabilities: HostCapability[];
    component: Component;
    controller: CreatorFeatureController;
    enabled: boolean;
    active: boolean;
}

