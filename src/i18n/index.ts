import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import zh from './locales/zh';

const resources = {
    en,
    zh
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        defaultNS: 'translation',
        ns: ['translation'],
        interpolation: {
            escapeValue: false,
            skipOnVariables: false  // 添加这个配置以确保嵌套变量能够正确解析
        }
    });

export { i18n };