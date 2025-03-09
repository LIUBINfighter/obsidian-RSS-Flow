import React from 'react';
import { useTranslation, UseTranslationResponse } from 'react-i18next';
import { Namespace } from 'i18next';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Sidebar } from './Sidebar';

interface ReadMeProps {
    onLocaleChange?: (locale: string) => void;
}

export const ReadMe: React.FC<ReadMeProps> = ({ onLocaleChange }) => {
    const { t, i18n } = useTranslation<Namespace>('translation');
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLocale = e.target.value;
        i18n.changeLanguage(newLocale);
        onLocaleChange?.(newLocale);
    };

    // 使用插值来解析嵌套的翻译键
    const markdownContent = t('readme.content', {
        welcome: t('welcome'),
        'settings.title': t('settings.title'),
        'settings.content': t('settings.content'),
        'readme.features.title': t('readme.features.title'),
        'readme.features.markdown': t('readme.features.markdown'),
        'readme.features.internalLinks': t('readme.features.internalLinks'),
        'readme.features.math': t('readme.features.math'),
        'readme.features.mermaid': t('readme.features.mermaid')
    });



    return (
        <div className="readme-container">
            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className="language-selector">
                <select 
                    value={i18n.language} 
                    onChange={handleLanguageChange}
                >
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                </select>
            </div>
            <div className="content">
                <MarkdownRenderer 
                    content={markdownContent} 
                    // customComponents={customComponents}
                />
            </div>
        </div>
    );
};
