import { inject, type InjectionKey } from 'vue';
import type { Locale, Messages } from './types';
import { en } from './en';
import { zhHans } from './zh-hans';
import { zhHant } from './zh-hant';

export type { Locale, Messages };

export interface I18nContext {
    locale: Locale;
    t(key: keyof Messages, params?: Record<string, string | number>): string;
}

const dictionaries: Record<Locale, Messages> = {
    'en': en,
    'zh-Hans': zhHans,
    'zh-Hant': zhHant,
};

export function resolveLocale(): Locale {
    const lang = navigator.language;
    if (lang.startsWith('zh')) {
        return /^zh-(TW|HK|MO)/i.test(lang) ? 'zh-Hant' : 'zh-Hans';
    }
    return 'en';
}

export function createI18n(locale: Locale = resolveLocale()): I18nContext {
    const messages = dictionaries[locale];

    return {
        locale,
        t(key: keyof Messages, params?: Record<string, string | number>): string {
            let text = messages[key];
            if (params) {
                for (const [name, value] of Object.entries(params)) {
                    text = text.replace(`{${name}}`, String(value));
                }
            }
            return text;
        },
    };
}

export const I18N_KEY: InjectionKey<I18nContext> = Symbol('i18n');

export function useI18n(): I18nContext {
    const context = inject(I18N_KEY);
    if (!context) {
        throw new Error('I18n context is unavailable.');
    }
    return context;
}
