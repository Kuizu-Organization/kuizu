import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyFolders, getPublicFolders } from '../../api/folder';
import { Loader, Button } from '../../components/ui';
import CreateFolderModal from '../../components/Folder/CreateFolderModal';
import { Folder, FolderOpen, Plus, Globe } from 'lucide-react';
import './FoldersPage.css';

const FoldersPage = () => {
    const [folders, setFolders] = useState([]);
    const [publicFolders, setPublicFolders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [myData, pubData] = await Promise.all([
                getMyFolders(),
                getPublicFolders()
            ]);
            setFolders(myData);
            setPublicFolders(pubData);
        } catch (error) {
            console.error("Failed to fetch folders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFolderClick = (folderId) => {
        navigate(`/folders/${folderId}`);
    };

    const handleFolderCreated = (newFolder) => {
        setFolders(prev => [newFolder, ...prev]);
        setIsCreateOpen(false);
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
            {/* My Folders Section */}
            <div className="folders-header">
                <div>
                    <h1>My Folders</h1>
                    <p>Manage and organize your flashcard sets</p>
                </div>
                <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
                    <Plus size={16} style={{ marginRight: 6 }} />
                    Create Folder
                </Button>
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
                                        {folder.setCount} sets
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
                                    <span>Folder</span>
                                </div>
                                <span className={`folder-visibility ${folder.visibility?.toLowerCase()}`}>
                                    {folder.visibility === 'PUBLIC' ? 'Public' : 'Private'}
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
                    <h3>No folders yet</h3>
                    <p>Create a folder to organize your flashcard sets</p>
                    <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
                        <Plus size={16} style={{ marginRight: 6 }} />
                        Create your first folder
                    </Button>
                </div>
            )}

            {/* Public Folder Suggestions */}
            {publicFolders.length > 0 && (
                <div className="public-folders-section">
                    <div className="public-folders-header">
                        <Globe size={20} />
                        <h2>Suggested Folders</h2>
                        <span className="public-folders-badge">{publicFolders.length} public folders</span>
                    </div>
                    <div className="folders-grid">
                        {publicFolders.map(folder => (
                            <div
                                key={folder.folderId}
                                className="folder-card public-card"
                                onClick={() => handleFolderClick(folder.folderId)}
                            >
                                <div className="folder-card-body">
                                    <div className="folder-card-meta">
                                        <span className="folder-set-count">
                                            {folder.setCount} sets
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
                                        <Globe size={14} />
                                        <span>Public</span>
                                    </div>
                                    <span className="folder-visibility public">
                                        Public
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <CreateFolderModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreateSuccess={handleFolderCreated}
            />
        </div>
    );
};

export default FoldersPage;
