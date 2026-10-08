<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '../../../i18n';
import type { BubblePageController } from '../modules';
import LoadingHint from '../../../components/LoadingHint.vue';

const props = defineProps<{ controller: BubblePageController }>();
const i18n = useI18n();
const t = i18n.t.bind(i18n);

const state = computed(() => props.controller.runtime.config.state);
/** 配置仍在读取：用于展示加载提示 */
const configLoading = computed(() => !state.value.loaded);

// 格式规则草稿：编辑中不落盘，点保存才写
const ruleDraft = ref('');
const dirty = computed(() => ruleDraft.value !== '' && ruleDraft.value !== state.value.formatRule);

function syncRuleDraft() {
    ruleDraft.value = state.value.formatRule;
}
syncRuleDraft();

const addWordInput = ref<Record<string, string>>({});

async function saveRule() {
    await props.controller.runtime.config.setFormatRule(ruleDraft.value);
    syncRuleDraft();
}

async function resetRule() {
    await props.controller.runtime.config.resetFormatRule();
    syncRuleDraft();
}

async function addWord(groupId: string) {
    const text = (addWordInput.value[groupId] ?? '').trim();
    if (!text) return;
    await props.controller.runtime.config.addMoodWord(groupId, text);
    addWordInput.value = { ...addWordInput.value, [groupId]: '' };
}

async function removeWord(groupId: string, word: string) {
    await props.controller.runtime.config.removeMoodWord(groupId, word);
}

async function setColor(groupId: string, event: Event) {
    await props.controller.runtime.config.setMoodColor(groupId, (event.target as HTMLInputElement).value);
}

async function resetGroups() {
    await props.controller.runtime.config.resetMoodGroups();
}
</script>

<template>
  <div class="bd-tab">
    <div class="bd-loading-row">
      <LoadingHint :loading="configLoading" :loading-text="t('bubbleRender.loadingConfig')"
                   :done-text="t('common.loaded')" />
    </div>

    <section>
      <h4 class="bd-sec">{{ t('bubbleRender.secFormatRule') }}</h4>
      <div class="bd-warn">⚠ {{ t('bubbleRender.formatRuleWarn') }}</div>
      <textarea v-model="ruleDraft" class="bd-textarea" spellcheck="false" />
      <div class="bd-actions">
        <button type="button" class="bd-btn ghost" @click="resetRule">{{ t('bubbleRender.btnResetFormat') }}</button>
        <button type="button" class="bd-btn" :disabled="!dirty" @click="saveRule">{{ t('bubbleRender.btnSave') }}</button>
      </div>
    </section>

    <section>
      <h4 class="bd-sec">{{ t('bubbleRender.secMoodWords') }}</h4>
      <div v-for="group in state.moodGroups" :key="group.id" class="bd-group">
        <div class="bd-group-head">
          <span class="bd-group-dot" :style="{ background: group.color }" />
          <span class="bd-group-label">{{ group.label }}</span>
          <span class="bd-group-count">{{ group.words.length }}</span>
          <input type="color" class="bd-color" :value="group.color" @input="setColor(group.id, $event)" />
        </div>
        <div class="bd-words">
          <span v-for="word in group.words" :key="word" class="bd-word">
            {{ word }}
            <button type="button" class="bd-word-del" @click="removeWord(group.id, word)">×</button>
          </span>
        </div>
        <div class="bd-add-row">
          <input class="bd-input" v-model="addWordInput[group.id]" :placeholder="t('bubbleRender.addWordPlaceholder')"
                 @keyup.enter="addWord(group.id)" />
          <button type="button" class="bd-btn small" @click="addWord(group.id)">＋</button>
        </div>
      </div>
      <div class="bd-actions">
        <button type="button" class="bd-btn ghost" @click="resetGroups">{{ t('bubbleRender.btnResetMoods') }}</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bd-loading-row { display: flex; align-items: center; min-height: 16px; }
.bd-tab { display: flex; flex-direction: column; gap: 18px; }
section { display: flex; flex-direction: column; gap: 10px; }
.bd-sec { margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.55; border-bottom: 1px solid var(--ttbd-border, rgba(255,255,255,0.08)); padding-bottom: 6px; }

.bd-warn { font-size: 11px; line-height: 1.6; padding: 7px 10px; border-radius: 6px; background: rgba(176,138,58,0.12); color: #d0a955; }
.bd-textarea { width: 100%; min-height: 200px; max-height: 320px; resize: vertical; padding: 10px; border-radius: 8px; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); background: rgba(0,0,0,0.25); color: inherit; font-family: 'Fira Code', 'Source Code Pro', monospace; font-size: 12px; line-height: 1.5; outline: none; box-sizing: border-box; }

.bd-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 6px; }
.bd-group-head { display: flex; align-items: center; gap: 8px; }
.bd-group-dot { width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0; }
.bd-group-label { font-size: 13px; font-weight: 600; }
.bd-group-count { font-size: 11px; opacity: 0.5; }
.bd-color { width: 26px; height: 26px; border: none; background: none; cursor: pointer; padding: 0; margin-left: auto; }

.bd-words { display: flex; flex-wrap: wrap; gap: 6px; padding: 9px 10px; border-radius: 8px; background: var(--ttbd-surface-2, rgba(255,255,255,0.04)); }
.bd-word { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 5px; background: rgba(255,255,255,0.07); font-size: 12px; }
.bd-word-del { border: none; background: none; color: inherit; opacity: 0.5; cursor: pointer; font-size: 13px; line-height: 1; padding: 0; }
.bd-word-del:hover { opacity: 1; color: #e55; }

.bd-add-row { display: flex; gap: 8px; }
.bd-input { flex: 1; padding: 7px 11px; border-radius: 7px; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); background: transparent; color: inherit; font-size: 12px; outline: none; }

.bd-actions { display: flex; justify-content: flex-end; gap: 8px; }
.bd-btn { padding: 8px 18px; border-radius: 8px; border: 1px solid var(--ttbd-border, rgba(255,255,255,0.12)); background: var(--ttbd-accent, #58a6ff); color: #fff; cursor: pointer; font-size: 13px; }
.bd-btn.ghost { background: transparent; color: inherit; }
.bd-btn.small { padding: 6px 12px; }
.bd-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ---------- 手机端：词条更好点，按钮更好按 ---------- */
@media (max-width: 768px) {
    .bd-tab { gap: 16px; }

    .bd-textarea {
        min-height: 160px;
        max-height: 45vh;
    }

    .bd-group-head { gap: 10px; }
    .bd-color { width: 40px; height: 40px; }

    .bd-words { gap: 8px; padding: 10px; }
    .bd-word { padding: 5px 6px 5px 10px; gap: 6px; font-size: 13px; }

    .bd-word-del {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        min-width: 32px;
        min-height: 32px;
        height: 32px;
        padding: 0;
        border-radius: 6px;
        font-size: 16px;
        line-height: 1;
        opacity: 0.7;
    }

    .bd-add-row { gap: 10px; }
    .bd-add-row .bd-btn.small { min-width: 56px; font-size: 16px; }

    .bd-actions { flex-direction: column-reverse; gap: 10px; }
    .bd-actions .bd-btn { width: 100%; min-height: 44px; }
}
</style>
