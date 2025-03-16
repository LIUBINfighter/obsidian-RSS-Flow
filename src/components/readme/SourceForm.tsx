import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface RSSSource {
    name: string;
    url: string;
    folder: string;
}

interface SourceFormProps {
    initialData?: RSSSource;
    onSubmit: (data: RSSSource) => void;
    onCancel: () => void;
}

export const SourceForm: React.FC<SourceFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<RSSSource>(initialData || {
        name: '',
        url: '',
        folder: ''
    });

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    }, [formData, onSubmit]);

    return (
        <div className="source-form-container">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">{t('rss.sources.name', '名称')}</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('rss.sources.namePlaceholder', '请输入订阅源名称')}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="url">{t('rss.sources.url', 'URL')}</label>
                    <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        placeholder={t('rss.sources.urlPlaceholder', '请输入订阅源URL')}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="folder">{t('rss.sources.folder', '分类')}</label>
                    <input
                        type="text"
                        id="folder"
                        name="folder"
                        value={formData.folder}
                        onChange={handleChange}
                        placeholder={t('rss.sources.folderPlaceholder', '请输入分类')}
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" className="form-submit-btn">{t('rss.sources.confirm', '确认')}</button>
                    <button type="button" className="form-cancel-btn" onClick={onCancel}>{t('rss.sources.cancel', '取消')}</button>
                </div>
            </form>
        </div>
    );
};