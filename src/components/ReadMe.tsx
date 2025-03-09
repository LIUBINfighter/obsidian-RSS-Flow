import React from 'react';
import { useTranslation } from 'react-i18next';
import { Namespace } from 'i18next';
import { App } from 'obsidian';
import { Sidebar } from './Sidebar';
import { Introdcution } from './Introdcution';
interface ReadMeProps {
    onLocaleChange?: (locale: string) => void;
    app: App;
}

export const ReadMe: React.FC<ReadMeProps> = ({ onLocaleChange, app }) => {
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
		
        <div className={`readme-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className={`content ${isSidebarOpen ? 'with-sidebar' : ''}`}>
                <div className="language-selector">
                    <select 
                        value={i18n.language} 
                        onChange={handleLanguageChange}
                    >
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                    </select>
                </div>
                <div className="rss-flow-container">
                    <Introdcution app={app}/>
                </div>
            </div>
        </div>
    );
};
