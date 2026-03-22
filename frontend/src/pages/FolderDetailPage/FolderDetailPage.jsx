import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFolderDetail, removeSetFromFolder, deleteFolder } from '../../api/folder';
import { Loader, Modal, Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AddSetToFolderModal from '../../components/Folder/AddSetToFolderModal';
import EditFolderModal from '../../components/Folder/EditFolderModal';
import { ArrowLeft, BookOpen, FolderOpen, User, Eye, Calendar, Layers, Hash, ChevronDown, ChevronUp, Plus, Trash2, Pencil, AlertTriangle } from 'lucide-react';
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
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [removingSetId, setRemovingSetId] = useState(null);
    const [removeConfirmSetId, setRemoveConfirmSetId] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);

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

    const deleteFooter = (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="danger" onClick={confirmDeleteFolder} isLoading={isDeleting}>Delete Folder</Button>
        </div>
    );

    const isOwner = user && folder && folder.ownerUsername === user.username;
    const allExpanded = folder?.sets?.every(s => expandedSets[s.setId]);

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
            <button className="fd-back" onClick={() => navigate('/folders')}>
                <ArrowLeft size={18} />
                <span>Back to folders</span>
            </button>

            {/* ====== FOLDER INFO SECTION ====== */}
            <div className="fd-info-card">
                <div className="fd-info-header">
                    <div className="fd-info-header-main">
                        <div className="fd-info-icon">
                            <FolderOpen size={28} />
                        </div>
                        <div className="fd-info-header-text">
                            <h1 className="fd-name">{folder.name}</h1>
                            {folder.description && (
                                <p className="fd-description">{folder.description}</p>
                            )}
                        </div>
                    </div>
                    {isOwner && (
                        <div className="fd-info-header-actions">
                            <button className="fd-action-btn edit-btn" onClick={() => setIsEditOpen(true)}>
                                <Pencil size={16} />
                                <span>Edit</span>
                            </button>
                            <button className="fd-action-btn delete-btn" onClick={() => setIsDeleteOpen(true)}>
                                <Trash2 size={16} />
                                <span>Delete</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="fd-info-grid">
                    <div className="fd-info-item">
                        <User size={16} />
                        <div>
                            <span className="fd-info-label">Creator</span>
                            <span className="fd-info-value">{folder.ownerDisplayName}</span>
                        </div>
                    </div>
                    <div className="fd-info-item">
                        <Layers size={16} />
                        <div>
                            <span className="fd-info-label">Sets</span>
                            <span className="fd-info-value">{folder.sets?.length || 0} sets</span>
                        </div>
                    </div>
                    <div className="fd-info-item">
                        <Hash size={16} />
                        <div>
                            <span className="fd-info-label">Total terms</span>
                            <span className="fd-info-value">{getTotalTerms()} terms</span>
                        </div>
                    </div>
                    <div className="fd-info-item">
                        <Eye size={16} />
                        <div>
                            <span className="fd-info-label">Visibility</span>
                            <span className="fd-info-value">
                                {folder.visibility === 'PUBLIC' ? 'Public' : 'Private'}
                            </span>
                        </div>
                    </div>
                    <div className="fd-info-item">
                        <Calendar size={16} />
                        <div>
                            <span className="fd-info-label">Created on</span>
                            <span className="fd-info-value">{formatDate(folder.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ====== TERMS LIST SECTION ====== */}
            <div className="fd-terms-section">
                <div className="fd-terms-header">
                    <h2>Sets in folder</h2>
                    <div className="fd-terms-header-actions">
                        {isOwner && (
                            <button
                                className="fd-add-set-btn"
                                onClick={() => setIsAddSetOpen(true)}
                            >
                                <Plus size={16} />
                                Add set
                            </button>
                        )}
                        {folder.sets && folder.sets.length > 0 && (
                            <button
                                className="fd-toggle-all-btn"
                                onClick={allExpanded ? collapseAll : expandAll}
                            >
                                {allExpanded ? (
                                    <><ChevronUp size={14} /> Collapse</>
                                ) : (
                                    <><ChevronDown size={14} /> Expand</>
                                )}
                            </button>
                        )}
                        <span className="fd-terms-badge">{getTotalTerms()} terms</span>
                    </div>
                </div>

                {folder.sets && folder.sets.length > 0 ? (
                    <div className="fd-terms-groups">
                        {folder.sets.map(set => {
                            const isExpanded = expandedSets[set.setId];
                            return (
                                <div key={set.setId} className={`fd-set-group ${isExpanded ? 'expanded' : ''}`}>
                                    <div
                                        className="fd-set-title-bar"
                                        onClick={() => navigate(`/flashcard-sets/${set.setId}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="fd-set-title-left">
                                            <BookOpen size={18} />
                                            <h3>{set.title}</h3>
                                            <span className="fd-set-count-chip">{set.termCount} terms</span>
                                        </div>
                                        <div className="fd-set-title-right">
                                            <div className="fd-set-owner-chip">
                                                <div className="fd-set-avatar">
                                                    {getInitials(set.ownerDisplayName)}
                                                </div>
                                                <span>{set.ownerDisplayName}</span>
                                            </div>
                                            {isOwner && (
                                                <button
                                                    className="fd-remove-set-btn"
                                                    onClick={(e) => handleRemoveSet(e, set.setId)}
                                                    disabled={isRemoving && removeConfirmSetId === set.setId}
                                                    title="Remove from folder"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                            <div
                                                className="fd-set-toggle"
                                                onClick={(e) => { e.stopPropagation(); toggleSetExpand(set.setId); }}
                                            >
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="fd-set-content">
                                            {set.description && (
                                                <p className="fd-set-desc">{set.description}</p>
                                            )}

                                            {set.flashcards && set.flashcards.length > 0 && (
                                                <div className="fd-terms-table">
                                                    <div className="fd-terms-table-header">
                                                        <div className="fd-th-num">#</div>
                                                        <div className="fd-th-term">Term</div>
                                                        <div className="fd-th-def">Definition</div>
                                                    </div>
                                                    {set.flashcards.map((card, index) => (
                                                        <div key={card.cardId} className="fd-terms-row">
                                                            <div className="fd-td-num">{index + 1}</div>
                                                            <div className="fd-td-term">{card.term}</div>
                                                            <div className="fd-td-def">{card.definition}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="fd-empty">
                        <BookOpen size={32} color="var(--text-light)" />
                        <p>This folder has no sets yet</p>
                        {isOwner && (
                            <button
                                className="fd-add-set-btn primary"
                                onClick={() => setIsAddSetOpen(true)}
                            >
                                <Plus size={16} />
                                Add your first set
                            </button>
                        )}
                    </div>
                )}
            </div>

            <AddSetToFolderModal
                isOpen={isAddSetOpen}
                onClose={() => setIsAddSetOpen(false)}
                folderId={folderId}
                onSetAdded={fetchFolder}
            />

            <EditFolderModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                folder={folder}
                onUpdateSuccess={handleFolderUpdated}
            />

            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Delete folder"
                size="sm"
                footer={deleteFooter}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px' }}>
                        Delete this folder?
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.5' }}>
                        This action will permanently delete the folder <strong>"{folder.name}"</strong>. 
                        The flashcard sets inside this folder <strong>WILL NOT</strong> be deleted. Are you sure you want to proceed?
                    </p>
                </div>
            </Modal>

            {/* Remove set confirmation modal */}
            <Modal
                isOpen={!!removeConfirmSetId}
                onClose={() => setRemoveConfirmSetId(null)}
                title="Remove set from folder"
                size="sm"
                footer={
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
                        <Button variant="outline" onClick={() => setRemoveConfirmSetId(null)} disabled={isRemoving}>Cancel</Button>
                        <Button variant="danger" onClick={confirmRemoveSet} isLoading={isRemoving}>Remove</Button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px' }}>
                        Remove this set?
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.5' }}>
                        Are you sure you want to remove this set from the folder? The set itself will not be deleted.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default FolderDetailPage;
