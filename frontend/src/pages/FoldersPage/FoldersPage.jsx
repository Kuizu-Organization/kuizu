import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, Globe, Lock, FolderOpen } from 'lucide-react';
import { getMyFolders, getPublicFolders } from '../../api/folder';
import { Loader, Button, Card } from '../../components/ui';
import CreateFolderModal from '../../components/Folder/CreateFolderModal';
import './FoldersPage.css';

const FoldersPage = () => {
    const [myFolders, setMyFolders] = useState([]);
    const [publicFolders, setPublicFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my'); // 'my' or 'public'
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const navigate = useNavigate();

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const [my, pub] = await Promise.all([
                getMyFolders(),
                getPublicFolders()
            ]);
            
            const myWithFlag = (Array.isArray(my) ? my : []).map(f => ({ ...f, isMine: true }));
            const pubWithFlag = (Array.isArray(pub) ? pub : []).map(f => ({ 
                ...f, 
                isMine: myWithFlag.some(mf => mf.folderId === f.folderId) 
            }));
            
            setMyFolders(myWithFlag);
            setPublicFolders(pubWithFlag);
        } catch (error) {
            console.error("Failed to fetch folders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    const handleFolderClick = (folderId) => {
        navigate(`/folders/${folderId}`);
    };

    const handleFolderCreated = (newFolder) => {
        const folderWithFlag = { ...newFolder, isMine: true };
        setMyFolders(prev => [folderWithFlag, ...prev]);
        if (newFolder.visibility === 'PUBLIC') {
            setPublicFolders(prev => [folderWithFlag, ...prev]);
        }
        setIsCreateOpen(false);
    };

    const activeFolders = searchQuery 
        ? [...myFolders, ...publicFolders.filter(pf => !myFolders.some(mf => mf.folderId === pf.folderId))]
        : (activeTab === 'my' ? myFolders : publicFolders);

    const filteredFolders = activeFolders.filter(folder =>
        folder.name && folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (folder.description && folder.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="folders-container">
                <div className="folders-header">
                    <div className="header-top">
                        <h1 className="folders-title">My Folders</h1>
                        <Button
                            className="create-btn"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus size={20} />
                            Create Folder
                        </Button>
                    </div>

                    <div className="header-filters">
                        <div className="search-bar">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search folders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="tabs">
                            <button
                                className={`tab-item ${activeTab === 'public' ? 'active' : ''}`}
                                onClick={() => setActiveTab('public')}
                            >
                                Public
                            </button>
                            <button
                                className={`tab-item ${activeTab === 'my' ? 'active' : ''}`}
                                onClick={() => setActiveTab('my')}
                            >
                                My Folders
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <Loader />
                        <p>Loading folders...</p>
                    </div>
                ) : (
                    <div className="folders-grid">
                        {filteredFolders.length > 0 ? (
                            filteredFolders.map(folder => (
                                <Card
                                    key={folder.folderId}
                                    className="folder-card"
                                    onClick={() => handleFolderClick(folder.folderId)}
                                >
                                    <div className="folder-card-header">
                                        <h3 className="folder-title">{folder.name}</h3>
                                        <span className="card-count">
                                            <FolderOpen size={14} />
                                            {folder.setCount || 0} Sets
                                        </span>
                                    </div>
                                    <div className="folder-card-body">
                                        <p className="folder-description">
                                            {folder.description || 'No description provided.'}
                                        </p>
                                    </div>
                                    <div className="folder-card-footer">
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                <User size={14} />
                                            </div>
                                            <span className="username">
                                                {folder.isMine ? 'You' : folder.ownerDisplayName}
                                            </span>
                                        </div>
                                        <div className={`visibility-indicator ${folder.visibility?.toLowerCase()}`}>
                                            {folder.visibility === 'PUBLIC' ? (
                                                <><Globe size={14} /> Public</>
                                            ) : (
                                                <><Lock size={14} /> Private</>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>No folders found.</p>
                                {searchQuery && <p>Try a different search term.</p>}
                                {!searchQuery && activeTab === 'my' && (
                                    <Button variant="outline" onClick={() => setIsCreateOpen(true)} style={{ marginTop: '1rem' }}>
                                        Create your first folder
                                    </Button>
                                )}
                            </div>
                        )}
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
