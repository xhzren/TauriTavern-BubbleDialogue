import type { CreatorAppearanceMode } from '../app/appearance';
import type { FeatureArea } from '../features/types';
import type { Messages } from '../i18n';

export interface CreatorSettingsFeatureItem {
    id: string;
    area: FeatureArea;
    titleKey: keyof Messages;
    descriptionKey: keyof Messages;
    enabled: boolean;
}

export interface CreatorAppearanceOption {
    value: CreatorAppearanceMode;
    labelKey: keyof Messages;
}
