import type { CreatorRuntimeContext } from '../../app/context';
import type { CreatorFeatureModule } from '../types';
import LogsPage from './LogsPage.vue';
import { createLogsFeatureController } from './controller';

/**
 * 日志页：记录并查看扩展运行时的前端/后端日志。
 * 排在存储页之后（order 50）。
 */
export const logsFeatureModule: CreatorFeatureModule = {
    id: 'bubble-logs',
    area: 'bubble-dialogue',
    titleKey: 'logs.pageTitle',
    descriptionKey: 'logs.pageDesc',
    order: 50,
    // 宿主没提供日志接口时这个页面没有意义，直接不注册
    capabilities: ['dev.frontendLogs', 'dev.backendLogs'],
    defaultEnabled: true,
    component: LogsPage,
    createController: (context: CreatorRuntimeContext) => createLogsFeatureController(context),
};