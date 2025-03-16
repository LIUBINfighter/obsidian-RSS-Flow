import type { TFunction as I18nTFunction } from 'i18next';

type TFunction = I18nTFunction<'translation', string, string>;

/**
 * 确保i18n翻译函数返回string类型
 */
export function ensureString(t: TFunction, key: string, defaultValue?: string | Record<string, any>): string {
    const translation = t(key, { defaultValue: typeof defaultValue === 'string' ? defaultValue : key });
    return translation?.toString() || key;
}

/**
 * 确保i18n翻译函数返回DocumentFragment类型
 */
export function ensureDocumentFragment(t: TFunction, key: string, defaultValue?: string | Record<string, any>): DocumentFragment {
    const translation = t(key, { defaultValue: typeof defaultValue === 'string' ? defaultValue : key });
    const fragment = document.createDocumentFragment();
    const text = translation?.toString() || key;
    fragment.textContent = text;
    return fragment;
}