import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyFolders } from '../../api/folder';
import { Loader } from '../../components/ui';
import { Folder, FolderOpen } from 'lucide-react';
import './FoldersPage.css';

const FoldersPage = () => {
    const [folders, setFolders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                setIsLoading(true);
                const data = await getMyFolders();
                setFolders(data);
            } catch (error) {
                console.error("Failed to fetch folders:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFolders();
    }, []);

    const handleFolderClick = (folderId) => {
        navigate(`/folders/${folderId}`);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (isLoading) {
        return <Loader fullPage={true} />;
    }

    return (
        <div className="folders-container">
            <div className="folders-header">
                <h1>Thư mục của bạn</h1>
                <p>Quản lý và tổ chức các bộ thẻ ghi nhớ của bạn</p>
            </div>

            {folders.length > 0 ? (
                <div className="folders-grid">
                    {folders.map(folder => (
                        <div
                            key={folder.folderId}
                            className="folder-card"
                            onClick={() => handleFolderClick(folder.folderId)}
                        >
                            <div className="folder-card-body">
                                <div className="folder-card-meta">
                                    <span className="folder-set-count">
                                        {folder.setCount} học phần
                                    </span>
                                    <div className="folder-owner-info">
                                        <div className="folder-owner-avatar">
                                            {getInitials(folder.ownerDisplayName)}
                                        </div>
                                        <span className="folder-owner-name">
                                            {folder.ownerDisplayName}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="folder-card-title">{folder.name}</h3>
                                {folder.description && (
                                    <p className="folder-card-description">{folder.description}</p>
                                )}
                            </div>
                            <div className="folder-card-footer">
                                <div className="folder-icon-wrapper">
                                    <FolderOpen size={16} />
                                    <span>Thư mục</span>
                                </div>
                                <span className={`folder-visibility ${folder.visibility?.toLowerCase()}`}>
                                    {folder.visibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="folders-empty">
                    <div className="folders-empty-icon">
                        <Folder size={32} />
                    </div>
                    <h3>Chưa có thư mục nào</h3>
                    <p>Tạo thư mục để tổ chức các bộ thẻ ghi nhớ của bạn</p>
                </div>
            )}
        </div>
    );
};

export default FoldersPage;
