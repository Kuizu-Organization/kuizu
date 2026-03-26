import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Pencil, Trash2 } from 'lucide-react';
import './FlashcardSetsPage.css';
import { getPublicFlashcardSets, getMyFlashcardSets, deleteFlashcardSet } from '@/api/flashcards';
import { Button, Card, Loader, ConfirmationModal } from '@/components/ui';
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
        if (existing) {
            setSets(sets.map(s => s.setId === updatedSet.setId ? updatedSet : s));
        } else {
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
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete set');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredSets = sets.filter(set =>
        set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (set.description && set.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
                                        <Card.Title className="set-title">{set.title}</Card.Title>
                                        <span className="card-count">{set.cardCount || 0} terms</span>
                                    </Card.Header>
                                    <Card.Body>
                                        <p className="set-description">{set.description || 'No description provided.'}</p>
                                    </Card.Body>
                                    <Card.Footer className="set-card-footer">
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                <User size={14} />
                                            </div>
                                            <span className="username">{activeTab === 'my' ? 'You' : set.ownerDisplayName}</span>
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
