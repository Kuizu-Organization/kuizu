import React, { useState, useEffect } from 'react';
import { Search, Heart, User, Trash2, Book } from 'lucide-react';
import './SavedSetsPage.css';
import { getSavedFlashcardSets, unsaveFlashcardSet } from '../api/savedSets';
import { Button, Card, Loader, ConfirmationModal } from '../components/ui';
import MainLayout from '../components/layout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const SavedSetsPage = () => {
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUnsaveModalOpen, setIsUnsaveModalOpen] = useState(false);
    const [settoUnFavorite, setSetToUnFavorite] = useState(null);
    const [isUnsaving, setIsUnsaving] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        fetchSavedSets();
    }, []);

    const fetchSavedSets = async () => {
        try {
            setLoading(true);
            const data = await getSavedFlashcardSets();
            setSets(data);
        } catch (err) {
            console.error('Error fetching saved sets:', err);
            setError('Could not load your saved sets.');
        } finally {
            setLoading(false);
        }
    };

    const handleUnsaveClick = (e, setId) => {
        e.stopPropagation();
        setSetToUnFavorite(setId);
        setIsUnsaveModalOpen(true);
    };

    const confirmUnsaveSet = async () => {
        if (!settoUnFavorite) return;
        try {
            setIsUnsaving(true);
            await unsaveFlashcardSet(settoUnFavorite);
            setSets(sets.filter(s => s.setId !== settoUnFavorite));
            setIsUnsaveModalOpen(false);
            setSetToUnFavorite(null);
            toast.success('Set removed from favorites');
        } catch (err) {
            console.error('Unfavorite failed:', err);
            toast.error('Failed to remove set from favorites');
        } finally {
            setIsUnsaving(false);
        }
    };

    const filteredSets = sets.filter(set => {
        if (!searchQuery.trim()) return true;
        const lowerQuery = searchQuery.toLowerCase();
        return set.title.toLowerCase().includes(lowerQuery) || 
               (set.description && set.description.toLowerCase().includes(lowerQuery));
    });

    return (
        <MainLayout>
            <div className="saved-sets-container">
                <div className="saved-sets-header">
                    <div className="header-top">
                        <div className="title-group">
                            <Heart className="header-heart-icon" size={32} fill="#f43f5e" color="#f43f5e" />
                            <h1 className="favorite-sets-title">Favorite Flashcard Sets</h1>
                        </div>
                    </div>

                    <div className="header-filters">
                        <div className="search-bar">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search favorite sets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <Loader />
                        <p>Loading your saved sets...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                        <Button variant="outline" onClick={fetchSavedSets}>Try Again</Button>
                    </div>
                ) : (
                    <div className="saved-sets-grid">
                        {filteredSets.length > 0 ? (
                            filteredSets.map(set => (
                                <Card
                                    key={set.setId}
                                    className="saved-set-card"
                                    onClick={() => navigate(`/flashcard-sets/${set.setId}`)}
                                >
                                    <div className="saved-card-glow"></div>
                                    <Card.Header className="set-card-header">
                                        <div className="set-title-container">
                                            <h3 className="set-title">
                                                {set.title}
                                            </h3>
                                        </div>
                                        <div className="card-header-actions">
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
                                    <Card.Footer className="saved-card-footer">
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                <User size={14} />
                                            </div>
                                            <span className="username">{set.ownerDisplayName}</span>
                                        </div>
                                        <div className="saved-set-actions">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="unsave-btn"
                                                onClick={(e) => handleUnsaveClick(e, set.setId)}
                                                title="Remove from saved"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            ))
                        ) : (
                            <div className="saved-empty-state">
                                <div className="heart-circle">
                                    <Heart size={48} />
                                </div>
                                <h3>No favorite sets yet</h3>
                                <p>Browse public flashcard sets and click the heart icon to add them to your favorites.</p>
                                <Button size="lg" onClick={() => navigate('/flashcard-sets')}>
                                    Explore Sets
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <ConfirmationModal
                    isOpen={isUnsaveModalOpen}
                    onClose={() => setIsUnsaveModalOpen(false)}
                    onConfirm={confirmUnsaveSet}
                    title="Remove from Favorite"
                    message="Are you sure you want to remove this flashcard set from your favorite items?"
                    confirmText="Remove"
                    type="danger"
                    isLoading={isUnsaving}
                />
            </div>
        </MainLayout>
    );
};

export default SavedSetsPage;
