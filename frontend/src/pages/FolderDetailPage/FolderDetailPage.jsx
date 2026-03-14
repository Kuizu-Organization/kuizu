import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFolderDetail } from '../../api/folder';
import { Loader } from '../../components/ui';
import { ArrowLeft, BookOpen } from 'lucide-react';
import './FolderDetailPage.css';

const FolderDetailPage = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [folder, setFolder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFolder = async () => {
            try {
                setIsLoading(true);
                const data = await getFolderDetail(folderId);
                setFolder(data);
            } catch (error) {
                console.error("Failed to fetch folder detail:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFolder();
    }, [folderId]);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (isLoading) {
        return <Loader fullPage={true} />;
    }

    if (!folder) {
        return (
            <div className="folder-detail-container">
                <p>Không tìm thấy thư mục.</p>
            </div>
        );
    }

    return (
        <div className="folder-detail-container">
            <button className="folder-detail-back" onClick={() => navigate('/folders')}>
                <ArrowLeft size={18} />
                <span>Quay lại thư mục</span>
            </button>

            <div className="folder-detail-header">
                <div className="folder-detail-meta">
                    <span className="folder-detail-set-count">
                        {folder.sets?.length || 0} học phần
                    </span>
                    <div className="folder-detail-owner">
                        <div className="folder-detail-avatar">
                            {getInitials(folder.ownerDisplayName)}
                        </div>
                        <span className="folder-detail-owner-name">
                            {folder.ownerDisplayName}
                        </span>
                    </div>
                </div>
                <h1 className="folder-detail-title">{folder.name}</h1>
                {folder.description && (
                    <p className="folder-detail-description">{folder.description}</p>
                )}
            </div>

            <div className="folder-sets-section">
                <div className="folder-sets-header">
                    <h2>Học phần trong thư mục</h2>
                    <span className="folder-sets-count-badge">
                        {folder.sets?.length || 0} học phần
                    </span>
                </div>

                {folder.sets && folder.sets.length > 0 ? (
                    <div className="folder-sets-list">
                        {folder.sets.map(set => (
                            <div key={set.setId} className="folder-set-card">
                                <div className="folder-set-card-top">
                                    <span className="folder-set-term-count">
                                        {set.termCount} thuật ngữ
                                    </span>
                                    <div className="folder-set-card-owner">
                                        <div className="folder-set-card-avatar">
                                            {getInitials(set.ownerDisplayName)}
                                        </div>
                                        <span className="folder-set-card-owner-name">
                                            {set.ownerDisplayName}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="folder-set-title">{set.title}</h3>
                                {set.description && (
                                    <p className="folder-set-description">{set.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="folder-sets-empty">
                        <BookOpen size={32} color="var(--text-light)" />
                        <p>Thư mục này chưa có học phần nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FolderDetailPage;
