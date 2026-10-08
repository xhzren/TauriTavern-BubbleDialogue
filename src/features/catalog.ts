import type { HostClient } from '../host/client';
import { creatorFeatureModules } from './modules';
import type { CreatorFeatureModule } from './types';

function sortModules(modules: CreatorFeatureModule[]) {
    return modules.slice().sort((left, right) => left.order - right.order);
}

export function getSupportedFeatureModules(
    host: Pick<HostClient, 'supportsAll'>,
): CreatorFeatureModule[] {
    return sortModules(creatorFeatureModules).filter((module) => host.supportsAll(module.capabilities));
}
