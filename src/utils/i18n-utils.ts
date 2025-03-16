import type { TFunction as I18nTFunction } from 'i18next';

type TFunction = I18nTFunction;

/**
 * 确保i18n翻译函数返回string类型
 */
export function ensureString(t: TFunction, key: string, defaultValue?: string | Record<string, any>): string {
    const translation = t(key, defaultValue);
    return translation?.toString() || (typeof defaultValue === 'string' ? defaultValue : key);
}