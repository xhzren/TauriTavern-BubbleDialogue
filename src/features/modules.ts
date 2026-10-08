import { bubbleFeatureModules } from './bubble-render/modules';
import { logsFeatureModule } from './dev-logs/module';

export const creatorFeatureModules = [
    ...bubbleFeatureModules,
    logsFeatureModule,
];