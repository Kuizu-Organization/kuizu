import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddSetToFolderModal from '../../components/Folder/AddSetToFolderModal';
import EditFolderModal from '../../components/Folder/EditFolderModal';
import CreateSetInFolderModal from '../../components/Folder/CreateSetInFolderModal';
import AddCategoryModal from '../../components/Folder/AddCategoryModal';
import { ChevronLeft, ChevronRight, ArrowLeft, BookOpen, FolderOpen, User, Eye, Calendar, Layers, Hash, ChevronDown, ChevronUp, Plus, Trash2, Pencil, AlertTriangle, MoreVertical, Search, Filter, FolderPlus, Play, X } from 'lucide-react';
import { Dropdown, Button, Modal, Loader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getFolderDetail, removeSetFromFolder, createSetInFolder, deleteFolder, deleteFolderCategory } from '../../api/folder';
import './FolderDetailPage.css';

const FolderDetailPage = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const [folder, setFolder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSets, setExpandedSets] = useState({});
    const [isAddSetOpen, setIsAddSetOpen] = useState(false);
    const [isCreateSetOpen, setIsCreateSetOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [removingSetId, setRemovingSetId] = useState(null);
    const [removeConfirmSetId, setRemoveConfirmSetId] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

    const fetchFolder = async () => {
        try {
            setIsLoading(true);
            const data = await getFolderDetail(folderId);
            setFolder(data);
            if (data?.sets) {
                const expanded = {};
                data.sets.forEach(s => { expanded[s.setId] = true; });
                setExpandedSets(expanded);
            }
        } catch (error) {
            console.error("Failed to fetch folder detail:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFolder();
    }, [folderId]);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getTotalTerms = () => {
        if (!folder?.sets) return 0;
        return folder.sets.reduce((sum, set) => sum + (set.termCount || 0), 0);
    };

    const toggleSetExpand = (setId) => {
        setExpandedSets(prev => ({
            ...prev,
            [setId]: !prev[setId]
        }));
    };

    const expandAll = () => {
        if (!folder?.sets) return;
        const expanded = {};
        folder.sets.forEach(s => { expanded[s.setId] = true; });
        setExpandedSets(expanded);
    };

    const collapseAll = () => {
        setExpandedSets({});
    };

    const handleRemoveSet = (e, setId) => {
        e.stopPropagation();
        setRemoveConfirmSetId(setId);
    };

    const confirmRemoveSet = async () => {
        try {
            setIsRemoving(true);
            await removeSetFromFolder(folderId, removeConfirmSetId);
            toast.success('Set removed from folder');
            setRemoveConfirmSetId(null);
            fetchFolder();
        } catch (error) {
            toast.error('Failed to remove set');
        } finally {
            setIsRemoving(false);
        }
    };

    const handleFolderUpdated = (updatedFolder) => {
        setFolder(updatedFolder);
        setIsEditOpen(false);
    };

    const handleCreateSet = async (title) => {
        try {
            await createSetInFolder(folderId, { 
                title, 
                description: '', 
                visibility: folder.visibility 
            });
            toast.success('Set created and added to folder');
            fetchFolder();
        } catch (error) {
            console.error('Failed to create set:', error);
            throw error;
        }
    };

    const handleStudyAll = (mode = 'study') => {
        // Collect all cards from all sets in the current view (filtered by category)
        const allCards = filteredSets.reduce((acc, set) => {
            const setCards = set.flashcards || [];
            return [...acc, ...setCards];
        }, []);

        if (allCards.length === 0) {
            toast.info("No sets with terms found in this view");
            return;
        }

        navigate(`/${mode}/folder-${folderId}`, { 
            state: { 
                cards: allCards, 
                from: `/folders/${folderId}`, 
                fromLabel: 'Back to Folder',
                folderName: folder.name
            } 
        });
    };

    const confirmDeleteFolder = async () => {
        try {
            setIsDeleting(true);
            await deleteFolder(folderId);
            toast.success('Folder deleted successfully');
            navigate('/folders'); // Navigate back to folders list
        } catch (error) {
            console.error('Failed to delete folder:', error);
            toast.error(error.response?.data?.message || 'Failed to delete folder');
            setIsDeleting(false);
            setIsDeleteOpen(false);
        }
    };

    const handleDeleteCategory = async (e, categoryName) => {
        e.stopPropagation();
        if (window.confirm(`Delete category "${categoryName}"?`)) {
            try {
                await deleteFolderCategory(folderId, categoryName);
                toast.success(`Category "${categoryName}" deleted`);
                if (activeTab === categoryName) setActiveTab('all');
                fetchFolder();
            } catch (error) {
                toast.error("Failed to delete category");
            }
        }
    };

    const deleteFooter = (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="danger" onClick={confirmDeleteFolder} isLoading={isDeleting}>Delete Folder</Button>
        </div>
    );

    const isOwner = user && folder && folder.ownerUsername === user.username;
    const allExpanded = folder?.sets?.every(s => expandedSets[s.setId]);

    const getCurrentSets = () => {
        if (!folder) return [];
        if (activeTab === 'all') return folder.sets || [];
        const categoryData = folder.categories?.find(c => c.name === activeTab);
        return categoryData ? categoryData.sets || [] : [];
    };

    const filteredSets = getCurrentSets()
        .filter(set => set.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
            return 0;
        });

    const activeCategoryName = activeTab !== 'all' ? activeTab : null;

    if (isLoading) {
        return <Loader fullPage={true} />;
    }

    if (!folder) {
        return (
            <div className="fd-container">
                <p>Folder not found.</p>
            </div>
        );
    }

    return (
        <div className="fd-container">
            {/* Header with Search and Profile is handled by MainLayout's Navbar */}
            
            <div className="fd-main-content">
                <div className="fd-folder-header">
                    <div className="fd-folder-header-left">
                        <div className="fd-folder-icon-large">
                            <FolderOpen size={40} strokeWidth={1.5} />
                        </div>
                        <div className="fd-folder-info">
                            <h1 className="fd-folder-title">{folder.name}</h1>
                            <div className="fd-folder-subtitle">
                                <span>{folder.sets?.length || 0} sets</span>
                                <span className="fd-dot"></span>
                                <span>Created on {formatDate(folder.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="fd-folder-header-right">
                        {isOwner && (
                            <Dropdown
                                items={[
                                    { label: 'Edit', icon: <Pencil size={18} />, action: 'edit' },
                                    { label: 'Delete folder', icon: <Trash2 size={18} />, action: 'delete' }
                                ]}
                                onItemClick={(item) => {
                                    if (item.action === 'edit') setIsEditOpen(true);
                                    if (item.action === 'delete') setIsDeleteOpen(true);
                                }}
                                variant="ghost"
                                showChevron={false}
                            >
                                <button className="fd-more-btn">
                                    <MoreVertical size={24} />
                                </button>
                            </Dropdown>
                        )}
                    </div>
                </div>

                <div className="fd-tabs-container">
                    <div className="fd-tabs">
                        <button 
                            className={`fd-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All
                        </button>
                        {folder.categories?.map(category => (
                            <div key={category.name} className={`fd-tab-wrapper ${activeTab === category.name ? 'active' : ''}`}>
                                <button 
                                    className={`fd-tab-btn ${activeTab === category.name ? 'active' : ''}`}
                                    onClick={() => setActiveTab(category.name)}
                                >
                                    {category.name}
                                </button>
                                {isOwner && (
                                    <button 
                                        className="fd-tab-delete-btn"
                                        onClick={(e) => handleDeleteCategory(e, category.name)}
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {isOwner && (
                            <button 
                                className="fd-add-tab-btn"
                                onClick={() => setIsAddCategoryOpen(true)}
                                title="Add Tag"
                            >
                                <Plus size={16} />
                                <span>Tag</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="fd-list-controls">
                    <div className="fd-sort-container">
                        <Dropdown
                            items={[
                                { label: 'Recent items', value: 'recent' },
                                { label: 'Alphabetical', value: 'alphabetical' }
                            ]}
                            onItemClick={(item) => setSortBy(item.value)}
                            variant="ghost"
                            className="fd-sort-dropdown"
                        >
                            <div className="fd-sort-trigger">
                                <span>{sortBy === 'recent' ? 'Recent items' : 'Alphabetical'}</span>
                                <ChevronDown size={14} />
                            </div>
                        </Dropdown>
                    </div>

                    <div className="fd-search-container">
                        <Search size={18} className="fd-search-icon" />
                        <input 
                            type="text" 
                            className="fd-search-input" 
                            placeholder="Search this folder"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="fd-sets-list">
                    {filteredSets.length > 0 ? (
                        filteredSets.map(set => (
                            <div key={set.setId} className="fd-set-card-modern" onClick={() => navigate(`/flashcard-sets/${set.setId}`)}>
                                <div className="fd-set-card-left">
                                    <div className="fd-set-icon-modern">
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="fd-set-text">
                                        <h3 className="fd-set-title">{set.title}</h3>
                                        <div className="fd-set-subtitle">
                                            <span>Study set</span>
                                            <span className="fd-dot"></span>
                                            <span>{set.termCount} terms</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="fd-set-card-right">
                                    {isOwner && (
                                        <button 
                                            className="fd-set-more-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveSet(e, set.setId);
                                            }}
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="fd-empty-state">
                            {activeCategoryName ? (
                                <>
                                    <div className="fd-empty-illustrations">
                                        <img src="https://assets.quizlet.com/a/j/dist/app/i/folder/empty_state_1.06642ba5ba1860e.svg" alt="" />
                                    </div>
                                    <p className="fd-empty-text-category">Add study material for <strong>{activeCategoryName}</strong></p>
                                    {isOwner && (
                                        <Button variant="primary" onClick={() => setIsAddSetOpen(true)} className="fd-empty-cta">
                                            <Plus size={18} />
                                            Add study set
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <BookOpen size={48} className="fd-empty-icon" />
                                    <p>{searchQuery ? 'No sets match your search' : 'This folder is empty'}</p>
                                    {isOwner && !searchQuery && (
                                        <Button variant="primary" onClick={() => setIsAddSetOpen(true)}>
                                            <Plus size={18} />
                                            Add study set
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Bar */}
            <div className="fd-bottom-toolbar-container">
                <div className="fd-bottom-toolbar">
                    <div className="fd-toolbar-content">
                        <Dropdown
                            items={[
                                { label: 'Flashcards', icon: <BookOpen size={18} />, mode: 'study' },
                                { label: 'Take Quiz', icon: <Play size={18} strokeWidth={3} fill="currentColor" />, mode: 'quiz' }
                            ]}
                            onItemClick={(item) => handleStudyAll(item.mode)}
                            variant="ghost"
                            showChevron={true}
                            triggerClassName="fd-study-dropdown-trigger"
                            className="fd-study-dropdown-field"
                        >
                            <button 
                                className="fd-study-btn" 
                                onClick={(e) => {
                                    // Let dropdown toggle handle it unless it's a direct click on something else
                                }}
                            >
                                <BookOpen size={22} />
                                Study
                            </button>
                        </Dropdown>
                        {isOwner && (
                            <button className="fd-add-set-toolbar-btn" onClick={() => setIsAddSetOpen(true)}>
                                <Plus size={20} />
                                Add study set
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddSetToFolderModal
                isOpen={isAddSetOpen}
                onClose={() => setIsAddSetOpen(false)}
                folderId={folderId}
                onSetAdded={fetchFolder}
                category={activeTab}
            />

            <EditFolderModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                folder={folder}
                onUpdateSuccess={handleFolderUpdated}
            />

            <CreateSetInFolderModal
                isOpen={isCreateSetOpen}
                onClose={() => setIsCreateSetOpen(false)}
                onCreateSuccess={handleCreateSet}
                folderId={folderId}
            />

            <AddCategoryModal 
                isOpen={isAddCategoryOpen}
                onClose={() => setIsAddCategoryOpen(false)}
                folderId={folderId}
                onCategoryAdded={fetchFolder}
                currentCategories={folder.categories?.map(c => c.name) || []}
            />

            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Delete folder"
                size="sm"
                footer={deleteFooter}
            >
                <div className="fd-modal-content">
                    <div className="fd-modal-alert-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <h3>Delete this folder?</h3>
                    <p>
                        This action will permanently delete the folder <strong>"{folder.name}"</strong>. 
                        The flashcard sets inside this folder <strong>WILL NOT</strong> be deleted.
                    </p>
                </div>
            </Modal>

            <Modal
                isOpen={!!removeConfirmSetId}
                onClose={() => setRemoveConfirmSetId(null)}
                title="Remove set from folder"
                size="sm"
                footer={
                    <div className="fd-modal-footer">
                        <Button variant="outline" onClick={() => setRemoveConfirmSetId(null)} disabled={isRemoving}>Cancel</Button>
                        <Button variant="danger" onClick={confirmRemoveSet} isLoading={isRemoving}>Remove</Button>
                    </div>
                }
            >
                <div className="fd-modal-content">
                    <div className="fd-modal-alert-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <h3>Remove this set?</h3>
                    <p>Are you sure you want to remove this set from the folder? The set itself will not be deleted.</p>
                </div>
            </Modal>
        </div>
    );
};

export default FolderDetailPage;
