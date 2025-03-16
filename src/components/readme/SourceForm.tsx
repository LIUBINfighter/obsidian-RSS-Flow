import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ensureString } from '../../utils/i18n-utils';

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
    // 修改这一行，添加明确的泛型参数以防止过深类型推断
    const { t } = useTranslation<"translation">();
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
                    <label htmlFor="name">{ensureString(t, 'rss.sources.name', '名称')}</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={ensureString(t, 'rss.sources.namePlaceholder', '请输入订阅源名称')}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="url">{ensureString(t, 'rss.sources.url', 'URL')}</label>
                    <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        placeholder={ensureString(t, 'rss.sources.urlPlaceholder', '请输入订阅源URL')}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="folder">{ensureString(t, 'rss.sources.folder', '分类')}</label>
                    <input
                        type="text"
                        id="folder"
                        name="folder"
                        value={formData.folder}
                        onChange={handleChange}
                        placeholder={ensureString(t, 'rss.sources.folderPlaceholder', '请输入分类')}
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" className="form-submit-btn">{ensureString(t, 'rss.sources.confirm', '确认')}</button>
                    <button type="button" className="form-cancel-btn" onClick={onCancel}>{ensureString(t, 'rss.sources.cancel', '取消')}</button>
                </div>
            </form>
        </div>
    );
};
