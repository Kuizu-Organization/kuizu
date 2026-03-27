import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Pencil, Trash2, Heart, Book } from 'lucide-react';
import './FlashcardSetsPage.css';
import { getPublicFlashcardSets, getMyFlashcardSets, deleteFlashcardSet } from '@/api/flashcards';
import { saveFlashcardSet, unsaveFlashcardSet } from '@/api/savedSets';
import { Button, Card, Loader, ConfirmationModal } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useModal } from '@/context/ModalContext';
import MainLayout from '@/components/layout';
import { useNavigate } from 'react-router-dom';

const FlashcardSetsPage = () => {
    const { openSetModal } = useModal();
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('public');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSets();
    }, [activeTab]);

    const fetchSets = async () => {
        try {
            setLoading(true);
            const data = activeTab === 'public'
                ? await getPublicFlashcardSets()
                : await getMyFlashcardSets();
            setSets(data);
        } catch (err) {
            console.error('Error fetching sets:', err);
            setError('Could not load flashcard sets.');
        } finally {
            setLoading(false);
        }
    };

    const handleSetSuccess = (updatedSet) => {
        const existing = sets.find(s => s.setId === updatedSet.setId);
        
        // Rules for visibility in current tab
        const shouldBeInMy = true; // My sets tab shows everything I own
        const shouldBeInPublic = updatedSet.visibility === 'PUBLIC';
        const shouldBeVisible = activeTab === 'my' ? shouldBeInMy : shouldBeInPublic;

        if (existing) {
            if (shouldBeVisible) {
                setSets(sets.map(s => s.setId === updatedSet.setId ? updatedSet : s));
            } else {
                // If it was visible but now isn't (e.g. changed from Public to Private in Public tab)
                setSets(sets.filter(s => s.setId !== updatedSet.setId));
            }
        } else if (shouldBeVisible) {
            setSets([updatedSet, ...sets]);
        }
    };

    const handleCreateClick = () => {
        openSetModal(null, handleSetSuccess);
    };

    const handleEditClick = (e, setId) => {
        e.stopPropagation();
        openSetModal(setId, handleSetSuccess);
    };

    const handleDelete = (e, setId) => {
        e.stopPropagation();
        setSetToDelete(setId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteSet = async () => {
        if (!setToDelete) return;
        try {
            setIsDeleting(true);
            await deleteFlashcardSet(setToDelete);
            setSets(sets.filter(s => s.setId !== setToDelete));
            setIsDeleteModalOpen(false);
            setSetToDelete(null);
            toast.success('Set deleted successfully');
        } catch (err) {
            console.error('Delete failed:', err);
            toast.error('Failed to delete set');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleFavorite = async (e, setId, isFavorite) => {
        e.stopPropagation();
        if (!user) {
            toast.error('Please log in to favorite sets');
            return;
        }

        try {
            if (isFavorite) {
                await unsaveFlashcardSet(setId);
                setSets(sets.map(s => s.setId === setId ? { ...s, isFavorite: false } : s));
                toast.success('Removed from favorites');
            } else {
                await saveFlashcardSet(setId);
                setSets(sets.map(s => s.setId === setId ? { ...s, isFavorite: true } : s));
                toast.success('Added to favorites');
            }
        } catch (err) {
            toast.error('Failed to update favorite status');
        }
    };

    const filteredSets = sets.filter(set => {
        if (!searchQuery.trim()) return true;
        const lowerQuery = searchQuery.toLowerCase();
        const titleWords = set.title.toLowerCase().split(/[\s\-_]+/);
        return titleWords.some(word => word.startsWith(lowerQuery));
    });

    return (
        <MainLayout>
            <div className="sets-container">
                <div className="sets-header">
                    <div className="header-top">
                        <h1 className="sets-title">Flashcard Sets</h1>
                        <Button
                            className="create-btn"
                            onClick={handleCreateClick}
                        >
                            <Plus size={20} />
                            Create Set
                        </Button>
                    </div>

                    <div className="header-filters">
                        <div className="search-bar">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search sets..."
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
                                My Sets
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <Loader />
                        <p>Loading sets...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                        <Button variant="outline" onClick={fetchSets}>Try Again</Button>
                    </div>
                ) : (
                    <div className="sets-grid">
                        {filteredSets.length > 0 ? (
                            filteredSets.map(set => (
                                <Card
                                    key={set.setId}
                                    className="set-card"
                                    onClick={() => navigate(`/flashcard-sets/${set.setId}`)}
                                >
                                    <Card.Header className="set-card-header">
                                        <div className="set-title-container">
                                            <h3 className="set-title">
                                                {set.title}
                                            </h3>
                                            <div className="set-status-badges">
                                                {set.status === 'PENDING' && (
                                                    <span className="status-badge pending">Pending</span>
                                                )}
                                                {set.status === 'REJECTED' && (
                                                    <span className="status-badge rejected">Rejected</span>
                                                )}
                                                {set.status === 'APPROVED' && activeTab === 'my' && (
                                                    <span className="status-badge approved">Approved</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="card-header-actions">
                                            {user && user.userId !== set.ownerId && (
                                                <button 
                                                    className={`card-favorite-btn ${set.isFavorite ? 'active' : ''}`}
                                                    onClick={(e) => handleToggleFavorite(e, set.setId, set.isFavorite)}
                                                    title={set.isFavorite ? "Remove from favorites" : "Add to favorites"}
                                                >
                                                    <Heart size={20} fill={set.isFavorite ? "currentColor" : "none"} />
                                                </button>
                                            )}
                                            <div className="card-count-badge">
                                                <div className="count-main">
                                                    <Book size={14} />
                                                    <span>{set.cardCount || 0}</span>
                                                </div>
                                                <span className="count-label">TERMS</span>
                                            </div>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <p className="set-description">{set.description || 'No description provided.'}</p>
                                    </Card.Body>
                                    <Card.Footer className="set-card-footer">
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                <User size={14} />
                                            </div>
                                            <span className="username">{user?.userId === set.ownerId ? 'You' : set.ownerDisplayName}</span>
                                        </div>
                                        {activeTab === 'my' && (
                                            <div className="set-actions">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => handleEditClick(e, set.setId)}
                                                >
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="delete-btn"
                                                    onClick={(e) => handleDelete(e, set.setId)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        )}
                                    </Card.Footer>
                                </Card>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>No flashcard sets found.</p>
                                {searchQuery && <p>Try a different search term.</p>}
                            </div>
                        )}
                    </div>
                )}

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDeleteSet}
                    title="Delete Flashcard Set"
                    message="Are you sure you want to delete this set? This action cannot be undone and all cards inside will be permanently removed."
                    confirmText="Delete Set"
                    type="danger"
                    isLoading={isDeleting}
                />
            </div>
        </MainLayout>
    );
};

export default FlashcardSetsPage;
