import React, { useState, useCallback } from 'react';

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
                    <label htmlFor="name">名称</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="请输入订阅源名称"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="url">URL</label>
                    <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        placeholder="请输入订阅源URL"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="folder">分类</label>
                    <input
                        type="text"
                        id="folder"
                        name="folder"
                        value={formData.folder}
                        onChange={handleChange}
                        placeholder="请输入分类"
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" className="form-submit-btn">确认</button>
                    <button type="button" className="form-cancel-btn" onClick={onCancel}>取消</button>
                </div>
            </form>
        </div>
    );
};