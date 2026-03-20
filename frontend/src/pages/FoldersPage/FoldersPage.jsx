import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyFolders, getPublicFolders } from '../../api/folder';
import { Loader, Button, Card } from '../../components/ui';
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
                        <Card
                            key={folder.folderId}
                            className="folder-item-card"
                            onClick={() => handleFolderClick(folder.folderId)}
                        >
                            <div className="card-header-custom">
                                <h3 className="card-title-custom">{folder.name}</h3>
                                <span className="badge-custom">
                                    <FolderOpen size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                    {folder.setCount} sets
                                </span>
                            </div>
                            <div className="card-body-custom">
                                <p className="card-description-custom">{folder.description || 'No description provided.'}</p>
                            </div>
                            <div className="card-footer-custom">
                                <span className="owner-text">by {folder.ownerDisplayName}</span>
                                <span className={`visibility-tag ${folder.visibility?.toLowerCase()}`}>
                                    {folder.visibility === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
                                </span>
                            </div>
                        </Card>
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
                            <Card
                                key={folder.folderId}
                                className="folder-item-card"
                                onClick={() => handleFolderClick(folder.folderId)}
                            >
                                <div className="card-header-custom">
                                    <h3 className="card-title-custom">{folder.name}</h3>
                                    <span className="badge-custom badge-green">
                                        <Globe size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                        {folder.setCount} sets
                                    </span>
                                </div>
                                <div className="card-body-custom">
                                    <p className="card-description-custom">{folder.description || 'No description provided.'}</p>
                                </div>
                                <div className="card-footer-custom">
                                    <span className="owner-text">by {folder.ownerDisplayName}</span>
                                    <span className="visibility-tag public">🌐 Public</span>
                                </div>
                            </Card>
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
