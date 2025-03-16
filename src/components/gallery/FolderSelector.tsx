import React, { useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';
import { useTranslation } from 'react-i18next';
import { ensureString } from '../../utils/i18n-utils';

interface FolderSelectorProps {
    folders: string[];
    selectedFolder: string;
    onChange: (folder: string) => void;
}

export const FolderSelector: React.FC<FolderSelectorProps> = ({ 
    folders, 
    selectedFolder, 
    onChange 
}) => {
    const { t } = useTranslation();
    const folderIconRef = useRef<HTMLSpanElement>(null);
    
    useEffect(() => {
        if (folderIconRef.current) {
            setIcon(folderIconRef.current, 'folder');
        }
    }, []);
    
    return (
        <div className="folder-selector">
            <span className="folder-icon" ref={folderIconRef}></span>
            <select 
                value={selectedFolder} 
                onChange={(e) => onChange(e.target.value)}
                className="folder-select"
                title={ensureString(t, 'gallery.folder.select', '按文件夹筛选')}
            >
                {folders.map(folder => (
                    <option key={folder} value={folder}>
                        {folder === 'all' ? ensureString(t, 'gallery.folder.all', '全部文件夹') : folder}
                    </option>
                ))}
            </select>
        </div>
    );
};
