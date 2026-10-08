<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from '../../i18n';
import type { LogRecordEntry, LogsFeatureController } from './controller';

const props = defineProps<{ controller: LogsFeatureController }>();
const i18n = useI18n();
const t = i18n.t.bind(i18n);

const state = computed(() => props.controller.state);
const listRef = ref<HTMLElement | null>(null);

const statusText = computed(() => (
    state.value.recording
        ? t('logs.statusRecording', { n: state.value.entries.length })
        : t('logs.statusStopped', { n: state.value.entries.length })
));

function pad(value: number, width = 2): string {
    return String(value).padStart(width, '0');
}

/** HH:MM:SS.mmm —— 日志排序/对照时间点用 */
function formatTime(timestampMs: number): string {
    const date = new Date(Number.isFinite(timestampMs) ? timestampMs : Date.now());
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

function sourceLabel(entry: LogRecordEntry): string {
    return entry.source === 'frontend' ? t('logs.sourceFrontend') : t('logs.sourceBackend');
}

// 记录中始终跟到最新一行；停止后不再打扰用户看历史
watch(() => state.value.entries.length, async () => {
    if (!state.value.recording) return;
    await nextTick();
    const el = listRef.value;
    if (el) el.scrollTop = el.scrollHeight;
});
</script>

<template>
  <div class="lg-page">
    <div class="lg-toolbar">
      <button v-if="!state.recording" type="button" class="lg-btn primary"
              :disabled="state.busy" @click="props.controller.start()">
        {{ t('logs.start') }}
      </button>
      <button v-else type="button" class="lg-btn danger"
              :disabled="state.busy" @click="props.controller.stop()">
        {{ t('logs.stop') }}
      </button>
      <button type="button" class="lg-btn ghost"
              :disabled="state.entries.length === 0" @click="props.controller.clear()">
        {{ t('logs.clear') }}
      </button>
      <span class="lg-status" :class="{ on: state.recording }">{{ statusText }}</span>
    </div>

    <p class="lg-hint">{{ t('logs.hint') }}</p>
    <p v-if="state.error" class="lg-error">{{ t('logs.unavailable') }}（{{ state.error }}）</p>

    <div ref="listRef" class="lg-list">
      <p v-if="state.entries.length === 0" class="lg-empty">{{ t('logs.empty') }}</p>
      <div v-for="entry in state.entries" :key="entry.key" class="lg-row" :class="entry.level">
        <span class="lg-time">{{ formatTime(entry.timestampMs) }}</span>
        <span class="lg-level">{{ entry.level }}</span>
        <span class="lg-source">{{ sourceLabel(entry) }}</span>
        <span class="lg-body">
          <span v-if="entry.target" class="lg-target">{{ entry.target }}</span>
          <span class="lg-message">{{ entry.message }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lg-page { display: flex; flex-direction: column; gap: 10px; width: 100%; min-height: 0; height: 100%; }

.lg-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.lg-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); background: transparent; color: inherit; cursor: pointer; font-size: 13px; }
.lg-btn.primary { background: var(--ttbd-accent, #58a6ff); border-color: var(--ttbd-accent, #58a6ff); color: #fff; }
.lg-btn.danger { background: #c94f4f; border-color: #c94f4f; color: #fff; }
.lg-btn.ghost { background: transparent; }
.lg-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.lg-status { margin-left: auto; font-size: 12px; opacity: 0.65; }
.lg-status.on { opacity: 1; color: #7ee787; font-weight: 600; }
.lg-status.on::before { content: '● '; }

.lg-hint { margin: 0; font-size: 11.5px; line-height: 1.6; opacity: 0.6; }
.lg-error { margin: 0; padding: 8px 10px; border-radius: 6px; background: var(--ttbd-accent-red-soft-bg, rgba(182,90,84,0.12)); color: var(--ttbd-accent-red-soft-text, #f1c2bc); font-size: 12px; }

.lg-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    border: 1px solid var(--ttbd-border, rgba(255,255,255,0.1));
    border-radius: 10px;
    background: var(--ttbd-bg-code, rgba(0,0,0,0.25));
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.lg-empty { margin: auto; font-size: 13px; opacity: 0.5; }

.lg-row {
    display: grid;
    grid-template-columns: 92px 52px 44px minmax(0, 1fr);
    gap: 8px;
    align-items: start;
    padding: 6px 8px;
    border-radius: 6px;
    background: var(--ttbd-chip-bg, rgba(255,255,255,0.04));
    font-size: 12px;
    line-height: 1.5;
}

.lg-time { font-family: var(--ttbd-font-mono); opacity: 0.6; white-space: nowrap; }
.lg-level { text-transform: uppercase; font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em; opacity: 0.85; }
.lg-source { font-size: 10.5px; opacity: 0.55; white-space: nowrap; }
.lg-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.lg-target { font-size: 10.5px; opacity: 0.5; word-break: break-all; }
.lg-message { white-space: pre-wrap; overflow-wrap: anywhere; }

.lg-row.warn .lg-level { color: #d7b378; }
.lg-row.error .lg-level { color: #f1c2bc; }
.lg-row.error { background: var(--ttbd-accent-red-soft-bg, rgba(182,90,84,0.12)); }
.lg-row.debug .lg-level { opacity: 0.5; }

/* 手机端：时间/级别/来源一行，正文换行到下一行 */
@media (max-width: 768px) {
    .lg-toolbar .lg-btn { flex: 1 1 auto; min-height: 44px; }
    .lg-status { flex: 1 1 100%; margin-left: 0; }
    .lg-hint { font-size: 12px; }

    .lg-row {
        grid-template-columns: 86px 48px minmax(0, 1fr);
        gap: 6px 8px;
        padding: 8px;
    }

    .lg-body { grid-column: 1 / -1; }
}
</style>