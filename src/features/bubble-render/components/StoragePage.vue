<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from '../../../i18n';
import type { BubblePageController } from '../modules';
import type { LibraryScopeStat } from '../storage-types';
import LoadingHint from '../../../components/LoadingHint.vue';

const props = defineProps<{ controller: BubblePageController }>();
const i18n = useI18n();
const t = i18n.t.bind(i18n);

const runtime = props.controller.runtime;
const state = computed(() => runtime.state);

const activePanel = ref<'legacy' | 'native'>('legacy');

// ---------------- 原版 DB 面板 ----------------

const dbScopes = ref<LibraryScopeStat[]>([]);
const dbLoading = ref(false);
/** 正在处理的范围（转换/删除中），避免重复点击 */
const rowBusy = ref<string | null>(null);
/** 待确认删除的范围 */
const pendingDelete = ref<string | null>(null);
/** 待确认「一键转换并删除」 */
const confirmConvertAll = ref(false);
/** 原生存储不可用时禁止转换 */
const canConvert = computed(() => state.value.nativeAvailable);

async function loadDbScopes() {
    dbLoading.value = true;
    try {
        dbScopes.value = await runtime.listDbScopes();
    } catch (error) {
        console.error('[BubbleDialogue] scan DB failed.', error);
        dbScopes.value = [];
    } finally {
        dbLoading.value = false;
    }
}

function scopeLabel(charId: string): string {
    return charId === '_global_' ? t('bubbleRender.scopeGlobal') : charId;
}

async function convertOne(charId: string) {
    rowBusy.value = charId;
    state.value.lastResult = null;
    try {
        const report = await runtime.convertScope(charId);
        state.value.lastResult = t('bubbleRender.convertDone', {
            scope: scopeLabel(charId),
            a: report.avatars,
            m: report.moodAvatars,
        });
    } catch (error) {
        state.value.lastResult = `${scopeLabel(charId)}: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
        rowBusy.value = null;
        await loadDbScopes();
    }
}

async function deleteOne(charId: string) {
    pendingDelete.value = null;
    rowBusy.value = charId;
    try {
        await runtime.removeDbScope(charId);
        state.value.lastResult = t('bubbleRender.deleteScopeDone', { scope: scopeLabel(charId) });
    } catch (error) {
        console.error('[BubbleDialogue] delete scope failed.', error);
    } finally {
        rowBusy.value = null;
        await loadDbScopes();
    }
}

async function convertAllAndRemove() {
    confirmConvertAll.value = false;
    rowBusy.value = '*';
    try {
        const result = await runtime.convertAllAndRemove();
        state.value.lastResult = t('bubbleRender.convertAllDone', {
            n: result.converted,
            f: result.failed,
        });
    } catch (error) {
        console.error('[BubbleDialogue] convert all failed.', error);
    } finally {
        rowBusy.value = null;
        await loadDbScopes();
    }
}

// ---------------- TT 原生面板 ----------------

function formatSize(bytes: number): string {
    if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
}

onMounted(() => {
    void loadDbScopes();
});
</script>

<template>
  <div class="bd-page">
    <nav class="bd-panels">
      <button type="button" class="bd-panel-btn" :class="{ active: activePanel === 'legacy' }"
              @click="activePanel = 'legacy'">{{ t('bubbleRender.panelLegacy') }}</button>
      <button type="button" class="bd-panel-btn" :class="{ active: activePanel === 'native' }"
              @click="activePanel = 'native'">{{ t('bubbleRender.panelNative') }}</button>
    </nav>

    <!-- ============ 原版 DB ============ -->
    <template v-if="activePanel === 'legacy'">
      <section class="bd-section">
        <h4 class="bd-sec">
          {{ t('bubbleRender.dbScopesTitle') }}
          <button type="button" class="bd-mini" :disabled="dbLoading" @click="loadDbScopes">
            {{ t('bubbleRender.btnRescan') }}
          </button>
        </h4>

        <div class="bd-loading-row">
          <LoadingHint :loading="dbLoading" :loading-text="t('bubbleRender.scanDb')"
                       :done-text="t('common.loaded')" />
        </div>

        <div v-if="!dbLoading && dbScopes.length === 0" class="bd-detail-empty small">
          {{ t('bubbleRender.noDbData') }}
        </div>

        <div v-else class="bd-table">
          <div class="bd-tr bd-th">
            <span>{{ t('bubbleRender.colScope') }}</span>
            <span>{{ t('bubbleRender.avatarCount') }}</span>
            <span>{{ t('bubbleRender.moodCount') }}</span>
            <span>{{ t('bubbleRender.colSize') }}</span>
            <span class="bd-th-actions">
              <template v-if="!confirmConvertAll">
                <button type="button" class="bd-btn tiny danger"
                        :disabled="rowBusy !== null || !canConvert"
                        :title="canConvert ? '' : t('bubbleRender.convertUnavailable')"
                        @click="confirmConvertAll = true">
                  {{ t('bubbleRender.btnConvertAllRemove') }}
                </button>
              </template>
              <template v-else>
                <button type="button" class="bd-btn tiny danger" :disabled="rowBusy !== null"
                        @click="convertAllAndRemove">{{ t('bubbleRender.btnConfirm') }}</button>
                <button type="button" class="bd-btn tiny ghost" @click="confirmConvertAll = false">
                  {{ t('bubbleRender.btnCancel') }}
                </button>
              </template>
            </span>
          </div>

          <div v-for="scope in dbScopes" :key="scope.charId" class="bd-tr">
            <span class="bd-scope" :title="scope.charId">{{ scopeLabel(scope.charId) }}</span>
            <span :data-label="t('bubbleRender.avatarCount')">{{ scope.avatars }}</span>
            <span :data-label="t('bubbleRender.moodCount')">{{ scope.moodAvatars }}</span>
            <span :data-label="t('bubbleRender.colSize')">{{ formatSize(scope.bytes) }}</span>
            <span class="bd-actions">
              <template v-if="pendingDelete === scope.charId">
                <button type="button" class="bd-btn tiny danger" :disabled="rowBusy !== null"
                        @click="deleteOne(scope.charId)">{{ t('bubbleRender.btnConfirm') }}</button>
                <button type="button" class="bd-btn tiny ghost" @click="pendingDelete = null">
                  {{ t('bubbleRender.btnCancel') }}
                </button>
              </template>
              <template v-else>
                <button type="button" class="bd-btn tiny"
                        :disabled="rowBusy !== null || !canConvert"
                        :title="canConvert ? '' : t('bubbleRender.convertUnavailable')"
                        @click="convertOne(scope.charId)">
                  {{ rowBusy === scope.charId ? t('bubbleRender.converting') : t('bubbleRender.btnConvert') }}
                </button>
                <button type="button" class="bd-btn tiny ghost danger-text" :disabled="rowBusy !== null"
                        @click="pendingDelete = scope.charId">
                  {{ t('bubbleRender.btnDelete') }}
                </button>
              </template>
            </span>
          </div>
        </div>

        <p class="bd-note">{{ t('bubbleRender.dbHint') }}</p>
        <p v-if="state.lastResult" class="bd-result">{{ state.lastResult }}</p>
      </section>
    </template>

    <!-- ============ TT 原生 ============ -->
    <template v-else>
      <section class="bd-section">
        <h4 class="bd-sec">{{ t('bubbleRender.statsTitle') }}</h4>
        <p class="bd-hint">{{ t('bubbleRender.statsAllScopesHint') }}</p>
        <div class="bd-loading-row">
          <LoadingHint :loading="state.totalStatsLoading" :loading-text="t('bubbleRender.loadingStats')"
                       :done-text="t('common.loaded')" />
        </div>
        <p v-if="state.totalStatsError" class="bd-result">{{ t('bubbleRender.statsUnavailable') }}</p>
        <p v-else-if="state.totalStatsStale" class="bd-hint">{{ t('bubbleRender.statsStaleHint') }}</p>
        <div class="bd-stats-row">
          <div class="bd-stat"><span class="bd-stat-label">{{ t('bubbleRender.totalAvatars') }}</span><span class="bd-stat-value">{{ state.totalAvatars }}</span></div>
          <div class="bd-stat"><span class="bd-stat-label">{{ t('bubbleRender.totalMoodAvatars') }}</span><span class="bd-stat-value">{{ state.totalMoodAvatars }}</span></div>
          <div class="bd-stat"><span class="bd-stat-label">{{ t('bubbleRender.totalCgImages') }}</span><span class="bd-stat-value">{{ state.totalCgImages }}</span></div>
          <div class="bd-stat"><span class="bd-stat-label">{{ t('bubbleRender.totalStorageSize') }}</span><span class="bd-stat-value">{{ formatSize(state.totalStorageBytes) }}</span></div>
        </div>
        <div class="bd-actions-row">
          <button type="button" class="bd-btn ghost" :disabled="state.totalStatsLoading"
                  @click="runtime.refreshTotalStats()">{{ t('bubbleRender.btnRefreshStats') }}</button>
        </div>
      </section>

      <section class="bd-section">
        <h4 class="bd-sec">{{ t('bubbleRender.sectionRuntime') }}</h4>
        <div class="bd-stats-row">
          <div class="bd-stat"><span class="bd-stat-label">{{ t('bubbleRender.statReady') }}</span><span class="bd-stat-value">{{ state.ready ? t('bubbleRender.yes') : t('bubbleRender.no') }}</span></div>
          <div class="bd-stat"><span class="bd-stat-label">{{ t('bubbleRender.statBubbles') }}</span><span class="bd-stat-value">{{ state.bubbleCount }}</span></div>
          <div class="bd-stat"><span class="bd-stat-label">{{ t('bubbleRender.statInjected') }}</span><span class="bd-stat-value">{{ state.injected ? t('bubbleRender.yes') : t('bubbleRender.no') }}</span></div>
        </div>
        <div class="bd-actions-row">
          <button type="button" class="bd-btn ghost" @click="runtime.hydrateNow()">{{ t('bubbleRender.btnHydrate') }}</button>
          <button type="button" class="bd-btn ghost" @click="runtime.refreshAvatars()">{{ t('bubbleRender.btnRefresh') }}</button>
          <button type="button" class="bd-btn ghost" @click="runtime.reinject()">{{ t('bubbleRender.btnReinject') }}</button>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.bd-page { display: flex; flex-direction: column; gap: 18px; }

.bd-panels { display: flex; border-bottom: 1px solid var(--ttbd-border, rgba(255,255,255,0.08)); }
.bd-panel-btn { flex: 1; padding: 9px 0; border: none; background: none; color: inherit; opacity: 0.55; font-size: 13px; cursor: pointer; border-bottom: 2px solid transparent; }
.bd-panel-btn.active { opacity: 1; font-weight: 600; border-bottom-color: var(--ttbd-accent, #58a6ff); }

.bd-section { display: flex; flex-direction: column; gap: 10px; }
.bd-sec { display: flex; align-items: center; gap: 10px; margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.55; border-bottom: 1px solid var(--ttbd-border, rgba(255,255,255,0.08)); padding-bottom: 6px; }
.bd-mini { margin-left: auto; padding: 3px 10px; border-radius: 6px; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); background: transparent; color: inherit; cursor: pointer; font-size: 11px; text-transform: none; letter-spacing: 0; }

.bd-loading-row { display: flex; align-items: center; gap: 10px; min-height: 18px; }
.bd-progress { font-size: 12px; opacity: 0.65; }

/* 表格式列表 */
.bd-table { display: flex; flex-direction: column; gap: 4px; }
.bd-tr { display: grid; grid-template-columns: minmax(90px, 1.6fr) 54px 54px 74px minmax(150px, 1.4fr); gap: 8px; align-items: center; padding: 7px 9px; border-radius: 8px; background: var(--ttbd-surface-2, rgba(255,255,255,0.04)); font-size: 12.5px; }
.bd-th { background: transparent; opacity: 0.6; font-size: 11px; padding-bottom: 4px; }
.bd-th-actions { display: flex; gap: 6px; justify-content: flex-end; }
.bd-scope { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bd-actions { display: flex; gap: 6px; justify-content: flex-end; }

.bd-segmented { display: inline-flex; border-radius: 8px; overflow: hidden; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); width: fit-content; }
.bd-seg { padding: 7px 16px; background: transparent; color: inherit; border: none; cursor: pointer; font-size: 13px; }
.bd-seg.active { background: var(--ttbd-accent, #58a6ff); color: #fff; }
.bd-seg:disabled { opacity: 0.45; cursor: not-allowed; }

.bd-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 10px; }
.bd-hint { margin: 0; font-size: 12px; line-height: 1.5; opacity: 0.65; }
.bd-stat { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 8px; background: var(--ttbd-surface-2, rgba(255,255,255,0.04)); }
.bd-stat-label { font-size: 11px; opacity: 0.6; }
.bd-stat-value { font-size: 15px; font-weight: 600; }

.bd-actions-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.bd-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); background: var(--ttbd-accent, #58a6ff); color: #fff; cursor: pointer; font-size: 13px; width: fit-content; }
.bd-btn.ghost { background: transparent; color: inherit; }
.bd-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.bd-btn.tiny { padding: 4px 9px; font-size: 11.5px; }
.bd-btn.danger { background: #c94f4f; border-color: #c94f4f; }
.bd-btn.danger-text { color: #e57373; }
.bd-btn.ghost.danger-text { background: transparent; }

.bd-note { margin: 0; font-size: 12px; line-height: 1.7; opacity: 0.65; }
.bd-result { margin: 0; padding: 8px 10px; border-radius: 6px; background: var(--ttbd-surface-2, rgba(255,255,255,0.04)); font-size: 12px; }
.bd-detail-empty { display: flex; align-items: center; justify-content: center; opacity: 0.45; font-size: 13px; }
.bd-detail-empty.small { min-height: 0; padding: 16px 0; }
.bd-file { display: none; }

/* ---------- 手机端：表格改成卡片，避免固定列宽把内容顶出屏幕 ---------- */
@media (max-width: 768px) {
    .bd-page { gap: 14px; }

    .bd-panel-btn { min-height: 46px; font-size: 14px; }

    .bd-sec { flex-wrap: wrap; gap: 8px; }
    .bd-mini { min-height: 40px; padding: 6px 12px; font-size: 12px; }

    .bd-table { gap: 10px; }

    /* 手机上表头只保留「一键转换并删除」，四个列名交给卡片内标签 */
    .bd-tr {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px 10px;
        padding: 12px;
        font-size: 13px;
    }

    .bd-th {
        display: flex;
        padding: 0 0 4px;
        background: transparent;
    }

    .bd-th > span:not(.bd-th-actions) { display: none; }
    .bd-th-actions { width: 100%; justify-content: flex-start; }

    .bd-scope {
        grid-column: 1 / -1;
        font-size: 14px;
        font-weight: 600;
        white-space: normal;
        overflow-wrap: anywhere;
    }

    .bd-tr > span[data-label] {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        overflow-wrap: anywhere;
    }

    .bd-tr > span[data-label]::before {
        content: attr(data-label);
        font-size: 10px;
        opacity: 0.6;
    }

    .bd-actions {
        grid-column: 1 / -1;
        justify-content: flex-start;
        flex-wrap: wrap;
        margin-top: 2px;
    }

    .bd-actions .bd-btn,
    .bd-th-actions .bd-btn { flex: 1 1 auto; min-height: 40px; }

    .bd-btn { min-height: 40px; }
    .bd-note { overflow-wrap: anywhere; }

    .bd-stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .bd-stat { padding: 10px 12px; }
    .bd-stat-value { font-size: 16px; }

    .bd-actions-row { gap: 10px; }
    .bd-actions-row .bd-btn { flex: 1 1 100%; min-height: 44px; }
}
</style>
