<script setup lang="ts">
import { computed } from 'vue';
import { useI18n, type Messages } from '../../../i18n';
import type { BubblePageController } from '../modules';
import LoadingHint from '../../../components/LoadingHint.vue';

const props = defineProps<{ controller: BubblePageController }>();
const i18n = useI18n();
const t = i18n.t.bind(i18n);

/** 动态键（滑杆/字体/形状标签）在编译期无法收窄，这里统一收口转型 */
function tk(key: string) {
    return t(key as keyof Messages);
}

const style = computed(() => props.controller.runtime.config.state.style);
/** 配置仍在读取：用于展示加载提示 */
const configLoading = computed(() => !props.controller.runtime.config.state.loaded);

/** 滑杆配置：key / 标签 / min / max / step / 单位 —— 与原版字段一一对应 */
const sliders = [
    { key: 'style_dialogueFontSize', label: 'dialogueFont', min: 12, max: 22, step: 0.5, unit: 'px' },
    { key: 'style_narrationFontSize', label: 'narrationFont', min: 12, max: 22, step: 0.5, unit: 'px' },
    { key: 'style_dialogueSpacing', label: 'dialogueSpacing', min: 4, max: 24, step: 1, unit: 'px' },
    { key: 'style_dialogueFontWeight', label: 'dialogueWeight', min: 100, max: 900, step: 10, unit: '' },
    { key: 'style_narrationFontWeight', label: 'narrationWeight', min: 100, max: 900, step: 10, unit: '' },
    { key: 'style_nameFontWeight', label: 'nameWeight', min: 100, max: 900, step: 10, unit: '' },
    { key: 'style_narrationBgOpacity', label: 'narrationBgOpacity', min: 0, max: 1, step: 0.01, unit: '' },
    { key: 'style_avatarSize', label: 'avatarSize', min: 32, max: 96, step: 2, unit: 'px' },
    { key: 'style_narrationIndent', label: 'narrationIndent', min: 0, max: 160, step: 2, unit: 'px' },
    { key: 'style_narrationBorderRadius', label: 'narrationRadius', min: 0, max: 24, step: 1, unit: 'px' },
    { key: 'style_narrationTextIndent', label: 'narrationTextIndent', min: 0, max: 80, step: 1, unit: 'px' },
    { key: 'style_narrationLineHeight', label: 'narrationLineHeight', min: 1, max: 2.6, step: 0.05, unit: '' },
    { key: 'style_narrationPaddingRight', label: 'narrationPaddingRight', min: 0, max: 60, step: 2, unit: 'px' },
    { key: 'style_thoughtSuffixGap', label: 'thoughtGap', min: 0, max: 30, step: 1, unit: 'px' },
    { key: 'style_thoughtSuffixOffsetY', label: 'thoughtOffsetY', min: 0, max: 30, step: 1, unit: 'px' },
    { key: 'style_imageCompressQuality', label: 'compressQuality', min: 0.3, max: 1, step: 0.02, unit: '' },
] as const;

const colorMode = computed({
    get: () => String(style.value.style_textColorMode ?? 'global'),
    set: (v: string) => props.controller.runtime.config.setStyle('style_textColorMode', v),
});
const globalColor = computed({
    get: () => String(style.value.style_globalTextColor ?? '#d9d9d9'),
    set: (v: string) => props.controller.runtime.config.setStyle('style_globalTextColor', v),
});
const narrationBg = computed({
    get: () => String(style.value.style_narrationBgColor ?? '#ffffff'),
    set: (v: string) => props.controller.runtime.config.setStyle('style_narrationBgColor', v),
});
const avatarShape = computed({
    get: () => String(style.value.style_avatarShape ?? 'rounded'),
    set: (v: string) => props.controller.runtime.config.setStyle('style_avatarShape', v),
});
const markdownMode = computed({
    get: () => String(style.value.style_markdownMode ?? 'basic'),
    set: (v: string) => props.controller.runtime.config.setStyle('style_markdownMode', v),
});
const compressEnabled = computed({
    get: () => Boolean(style.value.style_imageCompressEnabled),
    set: (v: boolean) => props.controller.runtime.config.setStyle('style_imageCompressEnabled', v),
});

const fontOptions = ['', 'Noto Sans SC', 'Noto Serif SC', 'Source Han Sans SC', 'Source Han Serif SC', 'system-ui', 'serif'];
const narrationFont = computed({
    get: () => String(style.value.style_narrationFontFamily ?? ''),
    set: (v: string) => props.controller.runtime.config.setStyle('style_narrationFontFamily', v),
});
const dialogueFont = computed({
    get: () => String(style.value.style_dialogueFontFamily ?? ''),
    set: (v: string) => props.controller.runtime.config.setStyle('style_dialogueFontFamily', v),
});
const nameFont = computed({
    get: () => String(style.value.style_nameFontFamily ?? ''),
    set: (v: string) => props.controller.runtime.config.setStyle('style_nameFontFamily', v),
});

function num(key: string): number {
    return Number(style.value[key] ?? 0);
}

async function onSlider(key: string, event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    await props.controller.runtime.config.setStyle(key, value);
}

async function resetAll() {
    await props.controller.runtime.config.resetStyleAll();
}
</script>

<template>
  <div class="bd-tab">
    <div class="bd-loading-row">
      <LoadingHint :loading="configLoading" :loading-text="t('bubbleRender.loadingConfig')"
                   :done-text="t('common.loaded')" />
    </div>

    <section>
      <h4 class="bd-sec">{{ t('bubbleRender.secText') }}</h4>
      <div v-for="s in sliders.slice(0, 6)" :key="s.key" class="bd-slider">
        <div class="bd-slider-head">
          <span>{{ tk('bubbleRender.style_' + s.label) }}</span>
          <span class="bd-slider-val">{{ num(s.key) }}{{ s.unit }}</span>
        </div>
        <input type="range" :min="s.min" :max="s.max" :step="s.step" :value="num(s.key)" @input="onSlider(s.key, $event)" />
      </div>
    </section>

    <section>
      <h4 class="bd-sec">{{ t('bubbleRender.secColor') }}</h4>
      <label class="bd-radio">
        <input type="radio" value="global" v-model="colorMode" />
        <span>{{ t('bubbleRender.colorGlobal') }}</span>
        <input type="color" class="bd-color" v-model="globalColor" :disabled="colorMode !== 'global'" />
      </label>
      <label class="bd-radio">
        <input type="radio" value="character" v-model="colorMode" />
        <span>{{ t('bubbleRender.colorCharacter') }}</span>
      </label>
      <div class="bd-slider">
        <div class="bd-slider-head">
          <span>{{ t('bubbleRender.style_narrationBgOpacity') }}</span>
          <span class="bd-slider-val">{{ num('style_narrationBgOpacity') }}</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" :value="num('style_narrationBgOpacity')" @input="onSlider('style_narrationBgOpacity', $event)" />
      </div>
      <label class="bd-inline">
        <span>{{ t('bubbleRender.style_narrationBgColor') }}</span>
        <input type="color" class="bd-color" v-model="narrationBg" />
      </label>
    </section>

    <section>
      <h4 class="bd-sec">{{ t('bubbleRender.secLayout') }}</h4>
      <div class="bd-slider" v-for="s in sliders.slice(7, 15)" :key="s.key">
        <div class="bd-slider-head">
          <span>{{ tk('bubbleRender.style_' + s.label) }}</span>
          <span class="bd-slider-val">{{ num(s.key) }}{{ s.unit }}</span>
        </div>
        <input type="range" :min="s.min" :max="s.max" :step="s.step" :value="num(s.key)" @input="onSlider(s.key, $event)" />
      </div>
      <div class="bd-field-row">
        <span class="bd-field-label">{{ t('bubbleRender.style_avatarShape') }}</span>
        <div class="bd-segmented">
          <button v-for="shape in ['circle','rounded','square']" :key="shape" type="button"
                  class="bd-seg" :class="{ active: avatarShape === shape }"
                  @click="avatarShape = shape">{{ tk('bubbleRender.shape_' + shape) }}</button>
        </div>
      </div>
    </section>

    <section>
      <h4 class="bd-sec">{{ t('bubbleRender.secFont') }}</h4>
      <label class="bd-inline" v-for="f in [['narrationFont', narrationFont], ['dialogueFont', dialogueFont], ['nameFont', nameFont]]" :key="f[0]">
        <span>{{ tk('bubbleRender.style_' + f[0]) }}</span>
        <select class="bd-select" :value="f[1]" @change="props.controller.runtime.config.setStyle('style_' + f[0] + 'Family', ($event.target as HTMLSelectElement).value)">
          <option v-for="opt in fontOptions" :key="opt" :value="opt">{{ opt || t('bubbleRender.fontDefault') }}</option>
        </select>
      </label>
    </section>

    <section>
      <h4 class="bd-sec">{{ t('bubbleRender.secStorage') }}</h4>
      <label class="bd-radio">
        <input type="checkbox" v-model="compressEnabled" />
        <span>{{ t('bubbleRender.compressEnabled') }}</span>
      </label>
      <div class="bd-slider">
        <div class="bd-slider-head">
          <span>{{ t('bubbleRender.style_compressQuality') }}</span>
          <span class="bd-slider-val">{{ num('style_imageCompressQuality') }}</span>
        </div>
        <input type="range" min="0.3" max="1" step="0.02" :value="num('style_imageCompressQuality')" @input="onSlider('style_imageCompressQuality', $event)" />
      </div>
    </section>

    <section>
      <h4 class="bd-sec">{{ t('bubbleRender.secMarkdown') }}</h4>
      <div class="bd-segmented">
        <button type="button" class="bd-seg" :class="{ active: markdownMode === 'basic' }" @click="markdownMode = 'basic'">{{ t('bubbleRender.mdBasic') }}</button>
        <button type="button" class="bd-seg" :class="{ active: markdownMode === 'full' }" @click="markdownMode = 'full'">{{ t('bubbleRender.mdFull') }}</button>
      </div>
    </section>

    <div class="bd-actions">
      <button type="button" class="bd-btn" @click="resetAll">{{ t('bubbleRender.btnResetStyle') }}</button>
    </div>
  </div>
</template>

<style scoped>
.bd-loading-row { display: flex; align-items: center; min-height: 16px; }
.bd-tab { display: flex; flex-direction: column; gap: 18px; }
section { display: flex; flex-direction: column; gap: 12px; }
.bd-sec { margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.55; border-bottom: 1px solid var(--ttbd-border, rgba(255,255,255,0.08)); padding-bottom: 6px; }

.bd-slider { display: flex; flex-direction: column; gap: 6px; }
.bd-slider-head { display: flex; justify-content: space-between; font-size: 13px; }
.bd-slider-val { opacity: 0.6; font-size: 12px; }
input[type="range"] { width: 100%; accent-color: var(--ttbd-accent, #58a6ff); cursor: pointer; }

.bd-radio { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
.bd-inline { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 13px; }
.bd-color { width: 30px; height: 30px; border: none; background: none; cursor: pointer; padding: 0; }

.bd-field-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.bd-field-label { font-size: 13px; }
.bd-segmented { display: inline-flex; border-radius: 8px; overflow: hidden; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); }
.bd-seg { padding: 6px 14px; background: transparent; color: inherit; border: none; cursor: pointer; font-size: 13px; }
.bd-seg.active { background: var(--ttbd-accent, #58a6ff); color: #fff; }

.bd-select { padding: 6px 10px; border-radius: 6px; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); background: transparent; color: inherit; font-size: 13px; min-width: 160px; }

.bd-actions { display: flex; justify-content: center; }
.bd-btn { padding: 8px 22px; border-radius: 8px; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); background: var(--ttbd-surface-2, rgba(255,255,255,0.06)); color: inherit; cursor: pointer; font-size: 13px; }

/* ---------- 手机端：标签与控件竖向排布，触控目标放大 ---------- */
@media (max-width: 768px) {
    .bd-tab { gap: 16px; }

    .bd-inline {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
    }

    .bd-select {
        width: 100%;
        min-width: 0;
        min-height: 40px;
    }

    .bd-field-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }

    .bd-segmented { width: 100%; }

    .bd-seg {
        flex: 1 1 0;
        min-height: 40px;
        padding: 8px 10px;
    }

    .bd-radio { min-height: 40px; gap: 10px; }
    .bd-color { width: 40px; height: 40px; }

    .bd-slider-head { font-size: 14px; }

    .bd-actions .bd-btn { width: 100%; min-height: 44px; }
}
</style>
