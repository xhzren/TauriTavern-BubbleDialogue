/**
 * 解析当前应显示的标签页 id。
 *
 * 为什么需要：扩展升级后页面可能被拆分或改名（例如原先一个聚合页拆成 4 个页面），
 * 而 localStorage 里还留着旧 id。如果直接按旧 id 查找，面板会渲染成空白。
 *
 * @param tabId 当前记录的标签页 id
 * @param activeIds 当前实际可用的页面 id 列表（按展示顺序）
 */
export function resolveActiveTab(tabId: string, activeIds: string[]): string {
    if (tabId === 'settings') {
        return 'settings';
    }
    if (activeIds.includes(tabId)) {
        return tabId;
    }
    return activeIds[0] ?? 'settings';
}
