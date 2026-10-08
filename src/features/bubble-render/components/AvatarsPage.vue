<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from '../../../i18n';
import type { BubblePageController } from '../modules';
import { nameFromFile, prepareAvatarBlob } from '../image-utils';
import LoadingHint from '../../../components/LoadingHint.vue';

const props = defineProps<{ controller: BubblePageController }>();
const i18n = useI18n();
const t = i18n.t.bind(i18n);

const runtime = props.controller.runtime;
const state = computed(() => runtime.state);
const busy = computed(() => state.value.busy);

const canUseCharacterMode = computed(() => state.value.hasCharacterCard);
const mode = computed(() => (canUseCharacterMode.value ? state.value.mode : 'global'));
/** 当前范围的可读名字（提示导入/导出作用在哪） */
const scopeLabel = computed(() =>
    mode.value === 'global' ? t('bubbleRender.scopeGlobal') : state.value.charName,
);
/** 导出文件名里用的范围标识（不本地化） */
const scopeIdForFile = computed(() =>
    mode.value === 'global' ? 'global' : String(state.value.charId ?? 'global'),
);

const search = ref('');
const names = computed(() => state.value.avatarNames);
const filtered = computed(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) return names.value;
    return names.value.filter((n) => n.toLowerCase().includes(q));
});

const selected = ref<string | null>(null);
/** 右侧大图当前展示的变体 */
const previewVariant = ref<string | null>(null);
/** 详情加载中：避免先闪一下「没有情绪差分」 */
const detailLoading = ref(false);
/** 每组最多预取多少张 CG 缩略图 */
const CG_PREVIEW_LIMIT = 12;
/** 后端不预取二进制时，回补预览图的并发上限 */
const PREVIEW_CONCURRENCY = 6;

type Variant = {
    moodId: string;
    mood: string;
    outfit: string;
    act: string;
    previewUrl: string | null;
};
const variants = ref<Variant[]>([]);

// ---- 缩略图缓存（blob URL 需回收）----
const thumbs = ref<Record<string, string>>({});
const requested = new Set<string>();
const cgThumbs = ref<Record<string, string>>({});
/** 头像列表缩略图是否还在补图 */
const thumbsLoading = ref(false);
/** CG 图库是否还在加载 */
const cgLoading = ref(false);

function revokeMap(map: Record<string, string>) {
    for (const url of Object.values(map)) {
        if (String(url).startsWith('blob:')) URL.revokeObjectURL(url);
    }
}
function revokeVariants(list: Variant[]) {
    for (const item of list) {
        if (item.previewUrl && item.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl);
    }
}

async function loadThumb(name: string) {
    if (requested.has(name) || thumbs.value[name]) return;
    requested.add(name);
    const url = await runtime.getAvatarPreviewUrl(name);
    if (url) thumbs.value = { ...thumbs.value, [name]: url };
}

async function loadVisibleThumbs() {
    const targets = filtered.value.filter((name) => !thumbs.value[name]);
    if (!targets.length) return;
    thumbsLoading.value = true;
    try {
        // 并发补图，避免多张缩略图串行等待
        const workers = Array.from({ length: Math.min(6, targets.length) }, async () => {
            while (targets.length) {
                const name = targets.shift();
                if (!name) break;
                await loadThumb(name);
            }
        });
        await Promise.all(workers);
    } finally {
        thumbsLoading.value = false;
    }
}

watch([filtered, () => state.value.avatarCount], () => {
    void loadVisibleThumbs();
}, { immediate: true });

// ---- 详情 ----

/** 详情面板使用的大图地址 */
const previewUrl = computed(() => {
    const hit = variants.value.find((v) => v.moodId === previewVariant.value);
    return hit?.previewUrl ?? null;
});

/**
 * 后端不预取二进制时（原生存储），按有限并发补图。
 * 早期实现是 for + await 串行回查，几十个变体就会「一张一张慢慢冒出来」。
 */
async function fillMissingPreviews(list: Variant[]) {
    const missing = list.filter((v) => !v.previewUrl);
    let cursor = 0;
    const workers = Array.from({ length: Math.min(PREVIEW_CONCURRENCY, missing.length) }, async () => {
        while (cursor < missing.length) {
            const item = missing[cursor];
            cursor += 1;
            try {
                const url = await runtime.getMoodVariantPreviewUrl(selected.value ?? '', item.moodId);
                if (url) {
                    item.previewUrl = url;
                    // 就地替换触发响应式刷新
                    variants.value = [...variants.value];
                }
            } catch {
                /* 单张失败不影响其它 */
            }
        }
    });
    await Promise.all(workers);
}

async function loadDetail(name: string) {
    // 先回收上一批 URL，再清空，避免短暂显示上一个头像的图
    revokeVariants(variants.value);
    variants.value = [];
    previewVariant.value = null;
    detailLoading.value = true;
    try {
        const list = await runtime.getAvatarVariants(name);
        // 选中项可能已经切走，丢弃过期结果
        if (selected.value !== name) {
            revokeVariants(list);
            return;
        }
        variants.value = list;
        previewVariant.value = list[0]?.moodId ?? null;
        if (list.length && list.some((v) => !v.previewUrl)) {
            await fillMissingPreviews(list);
        }
    } catch (error) {
        console.error('[BubbleDialogue] load variants failed.', error);
    } finally {
        if (selected.value === name) detailLoading.value = false;
    }
}

async function selectAvatar(name: string) {
    selected.value = name;
    await loadDetail(name);
}

/** 手机端详情是整页视图，需要一个显式返回列表的入口 */
function backToList() {
    revokeVariants(variants.value);
    variants.value = [];
    previewVariant.value = null;
    selected.value = null;
}

watch(() => state.value.avatarCount, () => {
    if (selected.value && !names.value.includes(selected.value)) {
        revokeVariants(variants.value);
        variants.value = [];
        previewVariant.value = null;
        selected.value = null;
    }
});

// ---- CG ----
const cgGroups = ref<Array<{ group: string; count: number; imageUrls: string[]; albumUrl: string }>>([]);
const cgImages = ref<Record<string, Array<{ index: number }>>>({});

async function loadCg() {
    cgLoading.value = true;
    revokeMap(cgThumbs.value);
    cgThumbs.value = {};
    const groups = await runtime.listCgGroups();
    cgGroups.value = groups.map((g) => ({
        group: String(g.group ?? ''),
        count: Number(g.count ?? 0),
        imageUrls: Array.isArray(g.imageUrls) ? g.imageUrls : [],
        albumUrl: String(g.albumUrl ?? ''),
    }));
    const images: Record<string, Array<{ index: number }>> = {};
    for (const group of cgGroups.value) {
        images[group.group] = await runtime.listCgImages(group.group);
    }
    cgImages.value = images;
    const jobs: Array<{ group: string; index: number }> = [];
    for (const group of cgGroups.value) {
        for (const image of images[group.group].slice(0, CG_PREVIEW_LIMIT)) {
            jobs.push({ group: group.group, index: image.index });
        }
    }
    // 并发补图，避免逐张串行
    const workers = Array.from({ length: Math.min(6, jobs.length) }, async () => {
        while (jobs.length) {
            const job = jobs.shift();
            if (!job) break;
            await loadCgThumb(job.group, job.index);
        }
    });
    await Promise.all(workers);
    cgLoading.value = false;
}

async function loadCgThumb(group: string, index: number) {
    const key = `${group}__${index}`;
    if (cgThumbs.value[key]) return;
    const url = await runtime.getCgImagePreviewUrl(group, index);
    if (url) cgThumbs.value = { ...cgThumbs.value, [key]: url };
}

function visibleCg(group: string): Array<{ index: number }> {
    return (cgImages.value[group] ?? []).slice(0, CG_PREVIEW_LIMIT);
}

// ---- 上传 ----
interface PendingUpload { file: File; name: string; previewUrl: string; }
const pending = ref<PendingUpload | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const error = ref<string | null>(null);
const dragActive = ref(false);

// ---- 每行的三个操作：改颜色 / 换默认图 / 重命名 ----
/** 隐藏的取色器与文件选择器（整页共用一个，避免每行塞一个 input） */
const colorInput = ref<HTMLInputElement | null>(null);
const replaceInput = ref<HTMLInputElement | null>(null);
const colorTarget = ref<string | null>(null);
const replaceTarget = ref<string | null>(null);
/** 正在重命名的行 */
const renaming = ref<string | null>(null);
const renameDraft = ref('');

function colorOf(name: string): string {
    return state.value.avatarColors[name.trim().toLowerCase()] ?? '';
}

/** 清掉缩略图缓存并重新补图（改名/换图后原 blob URL 已失效） */
function resetThumbs() {
    revokeMap(thumbs.value);
    thumbs.value = {};
    requested.clear();
}

// ---- 导入 / 导出（作用在「当前库范围」上，与上面的范围选择器一致）----
const importInput = ref<HTMLInputElement | null>(null);

async function onImportFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
        const data = new Uint8Array(await file.arrayBuffer());
        await runtime.importZip(data);
        // 导入后原来的缩略图 URL 已经失效
        resetThumbs();
        void loadVisibleThumbs();
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
    } finally {
        input.value = '';
    }
}

async function onExport() {
    try {
        const data = await runtime.exportZip();
        const name = scopeIdForFile.value.replace(/[\\/:*?"<>|]/g, '_');
        const bytes = new Uint8Array(data.byteLength);
        bytes.set(data);
        const blob = new Blob([bytes.buffer], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `bubble-character-${name}-${new Date().toISOString().slice(0, 10)}.zip`;
        anchor.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
    }
}

function pickColor(name: string) {
    colorTarget.value = name;
    const input = colorInput.value;
    if (!input) return;
    input.value = colorOf(name) || '#d9d9d9';
    input.click();
}

async function onColorPicked(event: Event) {
    const name = colorTarget.value;
    colorTarget.value = null;
    if (!name) return;
    const value = (event.target as HTMLInputElement).value;
    await props.controller.runtime.setAvatarColor(name, value);
}

function pickReplace(name: string) {
    replaceTarget.value = name;
    replaceInput.value?.click();
}

async function onReplacePicked(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const name = replaceTarget.value;
    replaceTarget.value = null;
    input.value = '';
    if (!file || !name) return;
    if (!file.type.startsWith('image/')) {
        error.value = t('bubbleRender.errNotImage');
        return;
    }
    try {
        const style = runtime.config.state.style;
        const blob = await prepareAvatarBlob(file, {
            enabled: Boolean(style.style_imageCompressEnabled),
            quality: Number(style.style_imageCompressQuality ?? 0.82),
        });
        await runtime.replaceAvatar(name, blob);
        resetThumbs();
        void loadVisibleThumbs();
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
    }
}

/** 重命名输入框挂载后自动聚焦（用鸭子类型判断，避免依赖全局 HTMLInputElement） */
function focusRename(el: unknown) {
    const input = el as HTMLInputElement | null;
    if (input && typeof input.focus === "function") queueMicrotask(() => input.focus());
}

function startRename(name: string) {
    renaming.value = name;
    renameDraft.value = name;
}

function cancelRename() {
    renaming.value = null;
    renameDraft.value = '';
}

async function confirmRename(name: string) {
    const next = renameDraft.value.trim();
    if (!next || next === name) {
        cancelRename();
        return;
    }
    try {
        await props.controller.runtime.renameAvatar(name, next);
        // 名字变了，缩略图缓存键也得跟着换
        resetThumbs();
        void loadVisibleThumbs();
        if (selected.value === name) selected.value = next;
        error.value = null;
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
    } finally {
        cancelRename();
    }
}

function acceptFile(file: File) {
    error.value = null;
    if (!file.type.startsWith('image/')) {
        error.value = t('bubbleRender.errNotImage');
        return;
    }
    if (pending.value) URL.revokeObjectURL(pending.value.previewUrl);
    pending.value = { file, name: nameFromFile(file.name), previewUrl: URL.createObjectURL(file) };
}

function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) acceptFile(file);
    input.value = '';
}

function onDrop(event: DragEvent) {
    dragActive.value = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) acceptFile(file);
}

function cancelPending() {
    if (pending.value) URL.revokeObjectURL(pending.value.previewUrl);
    pending.value = null;
    error.value = null;
}

async function confirmUpload() {
    const item = pending.value;
    if (!item) return;
    const name = item.name.trim();
    if (!name) {
        error.value = t('bubbleRender.errNoName');
        return;
    }
    try {
        const style = runtime.config.state.style;
        const blob = await prepareAvatarBlob(item.file, {
            enabled: Boolean(style.style_imageCompressEnabled),
            quality: Number(style.style_imageCompressQuality ?? 0.82),
        });
        await runtime.addAvatar(name, blob);
        cancelPending();
        revokeMap(thumbs.value);
        thumbs.value = {};
        requested.clear();
        void loadThumb(name);
        await selectAvatar(name);
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
    }
}

async function removeAvatar(name: string) {
    await runtime.deleteAvatar(name);
    const url = thumbs.value[name];
    if (url && String(url).startsWith('blob:')) URL.revokeObjectURL(url);
    const next = { ...thumbs.value };
    delete next[name];
    thumbs.value = next;
    requested.delete(name);
    if (selected.value === name) {
        revokeVariants(variants.value);
        variants.value = [];
        previewVariant.value = null;
        selected.value = null;
    }
}

onMounted(() => {
    void loadCg();
});

onBeforeUnmount(() => {
    revokeMap(thumbs.value);
    revokeMap(cgThumbs.value);
    revokeVariants(variants.value);
    if (pending.value) URL.revokeObjectURL(pending.value.previewUrl);
});

function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
}

function moodLabel(moodId: string): string {
    const group = runtime.config.state.moodGroups.find((g) => g.id === moodId);
    return group ? group.label : moodId;
}
</script>

<template>
  <div class="bd-page" :class="{ 'is-detail': !!selected }">
    <!-- 左栏：列表 -->
    <div class="bd-col-left">
      <div class="bd-row">
        <span class="bd-label">{{ t('bubbleRender.currentChar') }}：</span>
        <span class="bd-value">{{ state.charName }}</span>
        <span v-if="!canUseCharacterMode" class="bd-tag">{{ t('bubbleRender.noCardTag') }}</span>
      </div>

      <div class="bd-loading-row">
        <LoadingHint :loading="state.statsLoading" :loading-text="t('bubbleRender.loadingStats')"
                     :done-text="t('common.loaded')" />
        <button type="button" class="bd-mini" :disabled="state.statsLoading"
                @click="runtime.refreshScopeStats()">{{ t('bubbleRender.btnRefreshScopeStats') }}</button>
      </div>

      <div class="bd-stats-row">
        <div class="bd-stat"><span class="bd-stat-label">{{ t('bubbleRender.avatarCount') }}</span><span class="bd-stat-value">{{ state.avatarCount }}</span></div>
        <div class="bd-stat"><span class="bd-stat-label">{{ t('bubbleRender.moodCount') }}</span><span class="bd-stat-value">{{ state.moodCount }}</span></div>
        <div class="bd-stat"><span class="bd-stat-label">{{ t('bubbleRender.totalSize') }}</span><span class="bd-stat-value">{{ formatBytes(state.totalBytes) }}</span></div>
      </div>

      <div class="bd-field">
        <span class="bd-field-label">{{ t('bubbleRender.mode') }}</span>
        <div class="bd-mode-row">
          <div class="bd-segmented">
            <button type="button" class="bd-seg" :class="{ active: mode === 'global' }" :disabled="busy"
                    @click="runtime.setMode('global')">{{ t('bubbleRender.modeGlobal') }}</button>
            <button type="button" class="bd-seg" :class="{ active: mode === 'character' }"
                    :disabled="busy || !canUseCharacterMode"
                    :title="canUseCharacterMode ? '' : t('bubbleRender.noCardHint')"
                    @click="runtime.setMode('character')">{{ t('bubbleRender.modeCharacter') }}</button>
          </div>
          <!-- 导入/导出就作用在左边选中的范围上 -->
          <button type="button" class="bd-mini" :disabled="busy"
                  :title="t('bubbleRender.ioScope', { scope: scopeLabel })"
                  @click="importInput?.click()">{{ t('bubbleRender.btnImport') }}</button>
          <button type="button" class="bd-mini" :disabled="busy"
                  :title="t('bubbleRender.ioScope', { scope: scopeLabel })"
                  @click="onExport()">{{ t('bubbleRender.btnExport') }}</button>
        </div>
        <p class="bd-io-hint">{{ t('bubbleRender.ioScope', { scope: scopeLabel }) }}</p>
        <div v-if="state.busy" class="bd-loading-row">
          <LoadingHint :loading="state.busy" :loading-text="t('bubbleRender.transferring')"
                       :done-text="t('common.loaded')" />
          <span v-if="state.progress" class="bd-progress">{{ state.progress.done }} / {{ state.progress.total }}</span>
        </div>
        <p v-if="state.lastResult" class="bd-result">{{ state.lastResult }}</p>
        <input ref="importInput" type="file" accept=".zip,application/zip" class="bd-file" @change="onImportFile" />
      </div>

      <div v-if="!pending"
           class="bd-drop" :class="{ active: dragActive }"
           @click="fileInput?.click()"
           @dragover.prevent="dragActive = true"
           @dragleave.prevent="dragActive = false"
           @drop.prevent="onDrop">
        <div class="bd-drop-plus">＋</div>
        <div class="bd-drop-main">{{ t('bubbleRender.uploadHint') }}</div>
        <div class="bd-drop-sub">{{ t('bubbleRender.uploadSub') }}</div>
      </div>

      <div v-else class="bd-pending">
        <img class="bd-pending-img" :src="pending.previewUrl" alt="" />
        <div class="bd-pending-body">
          <input v-model="pending.name" class="bd-input" :placeholder="t('bubbleRender.namePlaceholder')" />
          <div class="bd-pending-actions">
            <button type="button" class="bd-btn ghost" @click="cancelPending">{{ t('bubbleRender.btnCancel') }}</button>
            <button type="button" class="bd-btn" :disabled="busy" @click="confirmUpload">{{ t('bubbleRender.btnConfirmAdd') }}</button>
          </div>
        </div>
      </div>

      <p v-if="error" class="bd-error">{{ error }}</p>
      <input ref="fileInput" type="file" accept="image/*" class="bd-file" @change="onFileChange" />

      <input v-model="search" class="bd-input" :placeholder="t('bubbleRender.searchPlaceholder')" />

      <div class="bd-loading-row">
        <LoadingHint :loading="thumbsLoading" :loading-text="t('bubbleRender.loadingThumbs')"
                     :done-text="t('common.loaded')" />
      </div>

      <!-- 整页共用的隐藏控件：取色器 / 换图文件选择 -->
      <input ref="colorInput" type="color" class="bd-hidden-input" @input="onColorPicked" />
      <input ref="replaceInput" type="file" accept="image/*" class="bd-hidden-input" @change="onReplacePicked" />

      <div v-if="filtered.length === 0" class="bd-empty">{{ t('bubbleRender.emptyAvatars') }}</div>
      <div v-else class="bd-list">
        <button v-for="name in filtered" :key="name" type="button"
                class="bd-item" :class="{ active: selected === name }"
                @click="selectAvatar(name)">
          <span class="bd-item-main">
            <img v-if="thumbs[name]" class="bd-thumb" :src="thumbs[name]" alt="" />
            <span v-else class="bd-thumb-fallback">{{ name.slice(0, 1) }}</span>

            <input v-if="renaming === name" class="bd-rename" v-model="renameDraft"
                   :ref="focusRename" @click.stop
                   @keydown.enter.stop="confirmRename(name)"
                   @keydown.esc.stop="cancelRename()"
                   @blur="confirmRename(name)" />
            <span v-else class="bd-item-name">{{ name }}</span>
          </span>

          <!-- 行内操作：改正文颜色 / 替换默认头像 / 重命名 / 删除 -->
          <span class="bd-item-actions">
          <span class="bd-icon" :class="{ on: !!colorOf(name) }"
                :style="colorOf(name) ? { color: colorOf(name) } : undefined"
                :title="t('bubbleRender.btnColor')" @click.stop="pickColor(name)">
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <circle cx="8" cy="8" r="5.2" fill="currentColor" fill-opacity="0.45"
                      stroke="currentColor" stroke-width="1.6" />
            </svg>
          </span>
          <span class="bd-icon" :title="t('bubbleRender.btnReplace')" @click.stop="pickReplace(name)">
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <rect x="1.8" y="3" width="12.4" height="10" rx="2" fill="none"
                    stroke="currentColor" stroke-width="1.5" />
              <path d="M3.6 11.4l3-3 2.2 2.2 3-3.2" fill="none" stroke="currentColor"
                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="bd-icon" :title="t('bubbleRender.btnRename')" @click.stop="startRename(name)">
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <path d="M11.2 2.4l2.4 2.4-8 8-3 .6.6-3 8-8z" fill="none"
                    stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
          </span>

            <span class="bd-item-del" :class="{ busy: state.deletingName === name }"
                  :title="state.deletingName === name ? t('bubbleRender.deleting') : t('bubbleRender.btnDelete')"
                  @click.stop="removeAvatar(name)">{{ state.deletingName === name ? '…' : '×' }}</span>
          </span>
        </button>
      </div>
    </div>

    <!-- 右栏：详情 -->
    <div class="bd-col-right">
      <div v-if="!selected" class="bd-detail-empty">{{ t('bubbleRender.detailEmpty') }}</div>

      <template v-else>
        <section class="bd-detail-head">
          <button type="button" class="bd-back" @click="backToList">
            <span aria-hidden="true">←</span>
            {{ t('bubbleRender.backToList') }}
          </button>
          <h3>{{ selected }}</h3>
          <span class="bd-detail-meta">
            <template v-if="detailLoading">{{ t('bubbleRender.loading') }}</template>
            <template v-else>{{ t('bubbleRender.variantCount', { n: variants.length }) }}</template>
          </span>
          <div class="bd-loading-row">
            <LoadingHint :loading="detailLoading" :loading-text="t('bubbleRender.loadingVariants')"
                         :done-text="t('common.loaded')" />
          </div>
        </section>

        <section class="bd-variants-block">
          <h4 class="bd-sec">{{ t('bubbleRender.secVariants') }}</h4>
          <div class="bd-variants-layout">
            <div class="bd-variant-col">
              <div v-if="detailLoading" class="bd-detail-empty small">{{ t('bubbleRender.loading') }}</div>
              <div v-else-if="variants.length === 0" class="bd-detail-empty small">{{ t('bubbleRender.noVariants') }}</div>
              <div v-else class="bd-variants">
                <button v-for="variant in variants" :key="variant.moodId + variant.outfit + variant.act"
                        type="button"
                        class="bd-variant" :class="{ active: previewVariant === variant.moodId }"
                        @click="previewVariant = variant.moodId">
                  <img v-if="variant.previewUrl" class="bd-variant-img" :src="variant.previewUrl" alt="" loading="lazy" />
                  <span v-else class="bd-variant-fallback">{{ moodLabel(variant.mood).slice(0, 1) }}</span>
                  <div class="bd-variant-info">
                    <span class="bd-variant-mood">{{ moodLabel(variant.mood) }}</span>
                    <span class="bd-variant-tags">{{ variant.outfit }} · {{ variant.act }}</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- 大图预览 -->
            <div class="bd-preview">
              <img v-if="previewUrl" class="bd-preview-img" :src="previewUrl" alt="" />
              <div v-else class="bd-preview-hint">{{ t('bubbleRender.previewHint') }}</div>
            </div>
          </div>
        </section>

        <section>
          <h4 class="bd-sec">
            {{ t('bubbleRender.secCg') }}
            <button type="button" class="bd-mini" @click="loadCg">{{ t('bubbleRender.btnLoadCg') }}</button>
          </h4>
          <div class="bd-loading-row">
            <LoadingHint :loading="cgLoading" :loading-text="t('bubbleRender.loadingCg')"
                         :done-text="t('common.loaded')" />
          </div>
          <div v-if="!cgLoading && cgGroups.length === 0" class="bd-detail-empty small">{{ t('bubbleRender.noCg') }}</div>
          <div v-else class="bd-cg-groups">
            <div v-for="group in cgGroups" :key="group.group" class="bd-cg-group">
              <div class="bd-cg-head">
                <span class="bd-cg-name">{{ group.group }}</span>
                <span class="bd-cg-count">{{ (cgImages[group.group] || []).length }}</span>
              </div>
              <div class="bd-cg-grid">
                <img v-for="image in visibleCg(group.group)" :key="image.index"
                     class="bd-cg-img"
                     :src="cgThumbs[group.group + '__' + image.index] || ''"
                     alt="" />
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.bd-page { display: grid; grid-template-columns: minmax(280px, 380px) 1fr; gap: 18px; height: 100%; min-height: 0; }
.bd-col-left { display: flex; flex-direction: column; gap: 12px; min-height: 0; overflow-y: auto; padding-right: 4px; }
.bd-col-right { display: flex; flex-direction: column; gap: 16px; min-height: 0; overflow-y: auto; border-left: 1px solid var(--ttbd-border, rgba(255,255,255,0.08)); padding-left: 18px; }

.bd-row { display: flex; gap: 6px; font-size: 13px; align-items: center; flex-wrap: wrap; }
.bd-label { opacity: 0.65; }
.bd-value { font-weight: 600; }
.bd-tag { font-size: 11px; padding: 1px 7px; border-radius: 999px; background: rgba(88,166,255,0.14); color: #8ab4f8; }

.bd-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.bd-stat { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border-radius: 8px; background: var(--ttbd-surface-2, rgba(255,255,255,0.04)); }
.bd-stat-label { font-size: 10px; opacity: 0.6; }
.bd-stat-value { font-size: 14px; font-weight: 600; }

.bd-field { display: flex; flex-direction: column; gap: 5px; }
.bd-mode-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.bd-io-hint { margin: 0; font-size: 11px; opacity: 0.5; }
.bd-progress { font-size: 12px; opacity: 0.7; }
.bd-result { margin: 0; padding: 6px 9px; border-radius: 6px; background: var(--ttbd-surface-2, rgba(255,255,255,0.04)); font-size: 12px; }
.bd-file { display: none; }
.bd-field-label { font-size: 12px; opacity: 0.7; }
.bd-segmented { display: inline-flex; border-radius: 8px; overflow: hidden; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); width: fit-content; }
.bd-seg { padding: 6px 14px; background: transparent; color: inherit; border: none; cursor: pointer; font-size: 13px; }
.bd-seg.active { background: var(--ttbd-accent, #58a6ff); color: #fff; }
.bd-seg:disabled { opacity: 0.4; cursor: not-allowed; }

.bd-drop { border: 2px dashed var(--ttbd-border, rgba(255,255,255,0.14)); border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; }
.bd-drop.active { border-color: var(--ttbd-accent, #58a6ff); background: rgba(88,166,255,0.06); }
.bd-drop-plus { font-size: 22px; margin-bottom: 4px; opacity: 0.7; }
.bd-drop-main { font-size: 12.5px; }
.bd-drop-sub { font-size: 11px; opacity: 0.5; margin-top: 4px; }

.bd-pending { display: flex; gap: 12px; padding: 10px; border-radius: 10px; background: var(--ttbd-surface-2, rgba(255,255,255,0.04)); }
.bd-pending-img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.bd-pending-body { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.bd-pending-actions { display: flex; justify-content: flex-end; gap: 8px; }

.bd-input { width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); background: transparent; color: inherit; font-size: 13px; outline: none; box-sizing: border-box; }
.bd-error { margin: 0; font-size: 12px; color: #e57373; }
.bd-empty { text-align: center; padding: 20px 0; opacity: 0.55; font-size: 13px; }

.bd-list { display: flex; flex-direction: column; gap: 5px; }
.bd-item { display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 8px; background: var(--ttbd-surface-2, rgba(255,255,255,0.04)); border: 1px solid transparent; cursor: pointer; color: inherit; text-align: left; width: 100%; }
.bd-item.active { border-color: var(--ttbd-accent, #58a6ff); background: rgba(88,166,255,0.1); }
.bd-item-main { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.bd-item-actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
/* 手机端专用的「返回列表」，桌面端隐藏 */
.bd-back { display: none; }
.bd-thumb { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.bd-thumb-fallback { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); font-size: 13px; opacity: 0.7; }
.bd-item-name { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bd-item-del { width: 24px; height: 24px; border-radius: 6px; background: rgba(255,80,80,0.1); color: #e55; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.bd-item-del.busy { opacity: 0.45; cursor: default; }
.bd-icon { width: 22px; height: 22px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; opacity: 0.5; cursor: pointer; flex-shrink: 0; }
.bd-icon:hover { opacity: 1; background: var(--ttbd-surface-hover, rgba(255,255,255,0.08)); }
.bd-icon.on { opacity: 0.95; }
.bd-rename { flex: 1; min-width: 0; font-size: 13px; padding: 3px 6px; border-radius: 5px; border: 1px solid var(--ttbd-accent, #58a6ff); background: rgba(0,0,0,0.25); color: inherit; }
.bd-hidden-input { display: none; }

.bd-detail-empty { display: flex; align-items: center; justify-content: center; height: 100%; min-height: 180px; opacity: 0.45; font-size: 13px; text-align: center; padding: 0 20px; }
.bd-detail-empty.small { min-height: 0; padding: 16px 0; }

.bd-detail-head { display: flex; flex-direction: column; gap: 4px; }
.bd-detail-head h3 { margin: 0; font-size: 16px; }
.bd-loading-row { display: flex; align-items: center; min-height: 16px; }
.bd-detail-meta { font-size: 12px; opacity: 0.6; }

.bd-sec { display: flex; align-items: center; gap: 10px; margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.55; border-bottom: 1px solid var(--ttbd-border, rgba(255,255,255,0.08)); padding-bottom: 6px; }
.bd-mini { margin-left: auto; padding: 3px 10px; border-radius: 6px; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); background: transparent; color: inherit; cursor: pointer; font-size: 11px; }

/* 变体列表 + 大图并排 */
.bd-variants-block { display: flex; flex-direction: column; min-height: 0; }
.bd-variants-layout { display: grid; grid-template-columns: minmax(200px, 1fr) minmax(220px, 340px); gap: 14px; min-height: 0; }
.bd-variant-col { min-height: 0; max-height: 420px; overflow-y: auto; padding-right: 4px; }

.bd-variants { display: flex; flex-direction: column; gap: 6px; }
.bd-variant { display: flex; align-items: center; gap: 9px; padding: 6px 8px; border-radius: 8px; background: var(--ttbd-surface-2, rgba(255,255,255,0.04)); border: 1px solid transparent; cursor: pointer; color: inherit; text-align: left; width: 100%; }
.bd-variant.active { border-color: var(--ttbd-accent, #58a6ff); background: rgba(88,166,255,0.1); }
.bd-variant-img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.bd-variant-fallback { width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); font-size: 14px; }
.bd-variant-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.bd-variant-mood { font-size: 13px; }
.bd-variant-tags { font-size: 11px; opacity: 0.55; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.bd-preview { display: flex; align-items: center; justify-content: center; min-height: 260px; border-radius: 10px; background: rgba(0,0,0,0.22); overflow: hidden; }
.bd-preview-img { max-width: 100%; max-height: 420px; object-fit: contain; display: block; }
.bd-preview-hint { font-size: 12px; opacity: 0.45; text-align: center; padding: 0 16px; }

.bd-cg-groups { display: flex; flex-direction: column; gap: 14px; }
.bd-cg-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.bd-cg-name { font-size: 13px; font-weight: 600; }
.bd-cg-count { font-size: 11px; opacity: 0.55; }
.bd-cg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 6px; }
.bd-cg-img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px; background: rgba(255,255,255,0.05); }

.bd-file { display: none; }
.bd-btn { padding: 7px 14px; border-radius: 8px; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); background: var(--ttbd-accent, #58a6ff); color: #fff; cursor: pointer; font-size: 13px; }
.bd-btn.ghost { background: transparent; color: inherit; }
.bd-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ---------- 手机端：列表与详情分成两级视图 + 放大触控目标 ---------- */
@media (max-width: 768px) {
    .bd-page {
        display: block;
        height: auto;
    }

    .bd-col-left {
        overflow: visible;
        padding-right: 0;
    }

    .bd-col-right {
        display: none;
    }

    /* 选中头像后详情作为整页视图，避免用户要往下滚很久才看到 */
    .bd-page.is-detail .bd-col-left {
        display: none;
    }

    .bd-page.is-detail .bd-col-right {
        display: flex;
        overflow: visible;
        border-left: none;
        padding-left: 0;
    }

    .bd-back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        align-self: flex-start;
        min-height: 40px;
        padding: 6px 12px;
        border: 1px solid var(--ttbd-border, rgba(255,255,255,0.14));
        border-radius: 8px;
        background: transparent;
        color: inherit;
        font-size: 13px;
        cursor: pointer;
    }

    .bd-stats-row { gap: 6px; }
    .bd-stat { padding: 8px; }
    .bd-stat-value { font-size: 15px; }

    .bd-mode-row { gap: 10px; }
    .bd-mode-row .bd-segmented { flex: 1 1 100%; }
    .bd-mode-row .bd-seg { flex: 1 1 0; min-height: 40px; }
    .bd-mode-row .bd-mini { flex: 1 1 0; min-height: 40px; padding: 6px 10px; font-size: 12px; }

    .bd-drop { padding: 18px 14px; }
    .bd-input { min-height: 40px; }

    /* 头像行改成上下两段：上排「头像 + 名字」，下排四个操作按钮 */
    .bd-list { gap: 8px; }
    .bd-item {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        padding: 10px;
    }

    .bd-item-main { gap: 12px; }
    .bd-thumb, .bd-thumb-fallback { width: 40px; height: 40px; }
    .bd-item-name { font-size: 14px; }

    .bd-item-actions { justify-content: flex-end; gap: 8px; }

    .bd-icon, .bd-item-del {
        width: 40px;
        height: 40px;
        opacity: 0.8;
    }

    .bd-item-del { font-size: 18px; }
    .bd-rename { min-height: 36px; font-size: 15px; }

    /* 差分列表 + 大图改成上下排布 */
    .bd-variants-layout { grid-template-columns: 1fr; gap: 12px; }
    .bd-variant-col { max-height: none; overflow: visible; padding-right: 0; }
    .bd-variant { min-height: 56px; }
    .bd-variant-mood { font-size: 14px; }
    .bd-preview { min-height: 200px; }
    .bd-preview-img { max-height: 56vh; }

    .bd-cg-grid { grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 8px; }
    .bd-detail-empty { min-height: 120px; }
}
</style>
