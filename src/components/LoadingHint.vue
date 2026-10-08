<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

/**
 * 统一加载提示：加载中显示转圈 + 文案，完成后短暂显示完成文案再自动隐藏。
 *
 * 用 phase 而不是直接绑 loading，是为了让「完成」这一帧有机会被看到——
 * 直接绑 boolean 的话，加载一结束提示就瞬间消失，用户感知不到「已加载完」。
 */
const props = withDefaults(
    defineProps<{
        loading: boolean;
        loadingText: string;
        doneText?: string;
        /** 完成提示保留时长（毫秒）；<=0 表示一直保留 */
        doneHoldMs?: number;
    }>(),
    { doneText: '', doneHoldMs: 1200 },
);

const phase = ref<'idle' | 'loading' | 'done'>(props.loading ? 'loading' : 'idle');
let timer: number | null = null;

function clearTimer() {
    if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
    }
}

watch(
    () => props.loading,
    (now) => {
        clearTimer();
        if (now) {
            phase.value = 'loading';
            return;
        }
        // 只有从「加载中」切过来才提示完成，避免初始状态误报
        if (phase.value !== 'loading') return;
        if (!props.doneText) {
            phase.value = 'idle';
            return;
        }
        phase.value = 'done';
        if (props.doneHoldMs > 0) {
            timer = window.setTimeout(() => {
                timer = null;
                phase.value = 'idle';
            }, props.doneHoldMs);
        }
    },
    { immediate: true },
);

onBeforeUnmount(clearTimer);
</script>

<template>
  <div v-if="phase !== 'idle'" class="ttbd-loading" :class="phase">
    <span class="ttbd-spinner" aria-hidden="true" />
    <span class="ttbd-loading-text">{{ phase === 'loading' ? loadingText : doneText }}</span>
  </div>
</template>

<style scoped>
.ttbd-loading {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    line-height: 1.5;
    opacity: 0.75;
}

.ttbd-spinner {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid currentColor;
    border-top-color: transparent;
    animation: ttbd-spin 0.7s linear infinite;
    flex-shrink: 0;
}

.ttbd-loading.done {
    color: #7ee787;
    opacity: 0.9;
}

.ttbd-loading.done .ttbd-spinner {
    animation: none;
    border-color: currentColor;
    border-top-color: currentColor;
    /* 完成后变成实心点，和转圈的语义区分开 */
    background: currentColor;
}

.ttbd-loading-text {
    white-space: nowrap;
}

@keyframes ttbd-spin {
    to { transform: rotate(360deg); }
}
</style>
