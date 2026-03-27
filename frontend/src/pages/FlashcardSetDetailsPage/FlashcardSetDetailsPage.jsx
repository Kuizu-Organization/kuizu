import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Play, Plus, Pencil, Trash2, User, Layers, BookOpen, Clock, Sparkles, Book, CheckCircle, Star } from 'lucide-react';
import './FlashcardSetDetailsPage.css';
import { getFlashcardSetById, getFlashcardsBySetId, deleteFlashcard, reRequestFlashcardSetReview } from '@/api/flashcards';
import { getStudyProgress, resetStudyProgress } from '@/api/study';
import { Button, Card, Badge, Loader, ConfirmationModal, CelebrationModal } from '@/components/ui';
import { useModal } from '@/context/ModalContext';
import MainLayout from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import QuizSettingsModal from '@/components/quiz/QuizSettingsModal';

const FlashcardSetDetailsPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const toast = useToast();
    const { openSetModal, openCardModal } = useModal();
    const [set, setSet] = useState(null);
    const [cards, setCards] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isDeleteSetModalOpen, setIsDeleteSetModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [isResetting, setIsResetting] = useState(false);
    const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
    const [isReRequesting, setIsReRequesting] = useState(false);
    const [isQuizSettingsOpen, setIsQuizSettingsOpen] = useState(false);
    const [starredCardIds, setStarredCardIds] = useState(() => {
        const saved = localStorage.getItem(`starred_cards_${setId}`);
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    useEffect(() => {
        fetchData();
        trackVisit(setId);
        
        if (location.state?.openQuizModal) {
            setIsQuizSettingsOpen(true);
        }
    }, [setId, location.state]);

    useEffect(() => {
        localStorage.setItem(`starred_cards_${setId}`, JSON.stringify(Array.from(starredCardIds)));
    }, [starredCardIds, setId]);

    const trackVisit = (id) => {
        try {
            const recent = JSON.parse(localStorage.getItem('recent_sets') || '[]');
            const stringId = String(id);
            const filtered = recent.filter(existingId => String(existingId) !== stringId);
            const updated = [stringId, ...filtered].slice(0, 8);
            localStorage.setItem('recent_sets', JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to track visit:', e);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [setData, cardsData] = await Promise.all([
                getFlashcardSetById(setId),
                getFlashcardsBySetId(setId)
            ]);
            setSet(setData);
            setCards(cardsData);

            if (user) {
                try {
                    const progressData = await getStudyProgress(setId);
                    setProgress(progressData);
                } catch (pErr) {
                    console.error('Error fetching progress:', pErr);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Could not load set details.');
        } finally {
            setLoading(false);
        }
    };

    const handleSetUpdateSuccess = (updatedSet) => {
        setSet(updatedSet);
    };

    const handleCardSuccess = async () => {
        try {
            const [cardsData, progressData] = await Promise.all([
                getFlashcardsBySetId(setId),
                getStudyProgress(setId)
            ]);
            setCards(cardsData);
            setProgress(progressData);
        } catch (err) {
            toast.error('Failed to refresh data');
        }
    };

    const handleAddCardClick = () => {
        openCardModal(setId, null, handleCardSuccess, cards);
    };

    const handleEditCardClick = (cardId) => {
        openCardModal(setId, cardId, handleCardSuccess, cards);
    };

    const handleDeleteCard = async () => {
        if (!cardToDelete) return;
        try {
            setIsDeleting(true);
            await deleteFlashcard(cardToDelete);
            setCards(cards.filter(c => c.cardId !== cardToDelete));
            setCardToDelete(null);
            const progressData = await getStudyProgress(setId);
            setProgress(progressData);
            toast.success('Flashcard deleted successfully.');
        } catch (err) {
            toast.error('Failed to delete card.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteSet = async () => {
        try {
            setIsDeleting(true);
            const { deleteFlashcardSet } = await import('@/api/flashcards');
            await deleteFlashcardSet(setId);
            toast.success('Flashcard set deleted successfully.');
            navigate('/flashcard-sets');
        } catch (err) {
            toast.error('Failed to delete flashcard set.');
        } finally {
            setIsDeleting(false);
            setIsDeleteSetModalOpen(false);
        }
    };

    useEffect(() => {
        if (progress?.progressPercentage === 100 && !loading) {
            const hasSeenCelebration = sessionStorage.getItem(`celebration_${setId}`);
            if (!hasSeenCelebration) {
                setIsCelebrationOpen(true);
                sessionStorage.setItem(`celebration_${setId}`, 'true');
            }
        }
    }, [progress?.progressPercentage, loading, setId]);

    const handleResetProgress = async () => {
        try {
            setIsResetting(true);
            await resetStudyProgress(setId);
            const progressData = await getStudyProgress(setId);
            setProgress(progressData);
            sessionStorage.removeItem(`celebration_${setId}`);
            setIsResetModalOpen(false);
            toast.success('Study progress has been reset.');
        } catch (err) {
            toast.error('Failed to reset progress.');
        } finally {
            setIsResetting(false);
        }
    };

    const handleReRequestReview = async () => {
        if (isReRequesting) return;
        try {
            setIsReRequesting(true);
            await reRequestFlashcardSetReview(setId);
            const setData = await getFlashcardSetById(setId);
            setSet(setData);
            toast.success('Review requested successfully.');
        } catch (err) {
            toast.error('Failed to re-request review.');
        } finally {
            setIsReRequesting(false);
        }
    };

    const toggleStar = (cardId) => {
        setStarredCardIds(prev => {
            const next = new Set(prev);
            if (next.has(cardId)) {
                next.delete(cardId);
            } else {
                next.add(cardId);
            }
            return next;
        });
    };

    const handleStartQuiz = (settings) => {
        setIsQuizSettingsOpen(false);
        navigate(`/quiz/${setId}`, {
            state: {
                cards,
                settings
            }
        });
    };

    if (loading) return <MainLayout><div className="loading-container"><Loader /></div></MainLayout>;
    if (error) return <MainLayout><div className="error-container">{error}</div></MainLayout>;
    if (!set) return <MainLayout><div className="error-container">Set not found.</div></MainLayout>;

    const isOwner = user?.userId === set?.ownerId;

    return (
        <MainLayout>
            <div className="set-details-container">
                <button className="back-link" onClick={() => navigate('/flashcard-sets')}>
                    <ChevronLeft size={18} />
                    Back to all sets
                </button>

                <div className="set-hero">
                    <div className="set-info-main">
                        <div className="set-title-row">
                            <h1 className="set-title">{set.title}</h1>
                            {set.status && (
                                <Badge variant={
                                    set.status === 'APPROVED' ? 'success' :
                                        set.status === 'REJECTED' ? 'error' : 'warning'
                                }>
                                    {set.status.charAt(0) + set.status.slice(1).toLowerCase()}
                                </Badge>
                            )}
                        </div>

                        {set.status === 'REJECTED' && set.moderationNotes && (
                            <div className="moderator-feedback">
                                <strong>Moderator Feedback:</strong>
                                <p>{set.moderationNotes}</p>
                            </div>
                        )}

                        <p className="set-description">{set.description || 'No description provided.'}</p>

                        <div className="set-meta">
                            <div className="meta-item">
                                <div className="meta-icon-bg">
                                    <User size={16} />
                                </div>
                                <span>Created by <strong>{user?.userId === set.ownerId ? 'You' : set.ownerDisplayName}</strong></span>
                            </div>
                            <div className="meta-item">
                                <div className="meta-icon-bg">
                                    <Layers size={16} />
                                </div>
                                <span>{cards.length} terms</span>
                            </div>
                        </div>
                    </div>

                    <div className="set-actions-sidebar">
                        <div className="actions-card">
                            {user ? (
                                <>
                                    <Button
                                        className="action-btn study-btn-main"
                                        size="lg"
                                        onClick={() => navigate(`/study/${setId}`, { state: { cards, setTitle: set.title } })}
                                        leftIcon={
                                            <div className="book-state-container">
                                                <Book size={20} className="book-closed" />
                                                <div className="animated-book-wrapper">
                                                    <BookOpen size={20} className="book-open" />
                                                    <div className="book-page second"></div>
                                                    <div className="book-page third"></div>
                                                </div>
                                            </div>
                                        }
                                    >
                                        Study Now
                                    </Button>
                                    <Button
                                        className="action-btn play-btn-main"
                                        size="lg"
                                        variant="outline"
                                        onClick={() => setIsQuizSettingsOpen(true)}
                                        disabled={cards.length < 2}
                                        leftIcon={<Play size={20} fill="currentColor" />}
                                    >
                                        Take Quiz
                                    </Button>
                                </>
                            ) : (
                                <div className="guest-notice-card">
                                    <p>Log in to study this set and track your progress!</p>
                                    <Button 
                                        variant="primary" 
                                        onClick={() => navigate('/auth', { state: { from: location.pathname } })}
                                        fullWidth
                                    >
                                        Log In / Sign Up
                                    </Button>
                                </div>
                            )}
                            
                            {isOwner && (
                                <>
                                    <Button
                                        className="action-btn edit-btn-main"
                                        variant="outline"
                                        size="lg"
                                        onClick={() => openSetModal(setId, handleSetUpdateSuccess)}
                                        leftIcon={<Pencil size={20} />}
                                    >
                                        Edit Set
                                    </Button>
                                    <Button
                                        className="action-btn delete-btn-main"
                                        variant="danger"
                                        size="lg"
                                        onClick={() => setIsDeleteSetModalOpen(true)}
                                        leftIcon={<Trash2 size={20} />}
                                    >
                                        Delete Set
                                    </Button>
                                </>
                            )}

                            {isOwner && set.status === 'REJECTED' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="re-request-btn"
                                    onClick={handleReRequestReview}
                                    isLoading={isReRequesting}
                                >
                                    Resubmit for Review
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {progress && (
                    <div className="progress-section">
                        <Card className="progress-card">
                            <div className="progress-card-content">
                                <div className="prog-header">
                                    <div className="prog-title-group">
                                        <h3>Your Progress</h3>
                                        <div className="prog-percentage-badge">
                                            {Math.round(progress.progressPercentage)}% Complete
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="btn reset-btn"
                                        onClick={() => setIsResetModalOpen(true)}
                                    >
                                        <Trash2 size={16} />
                                        Reset Progress
                                    </Button>
                                </div>

                                <div className="prog-body">
                                    <div className="prog-bar-wrapper">
                                        <div
                                            className="prog-bar-fill"
                                            style={{ width: `${progress.progressPercentage}%` }}
                                        />
                                    </div>
                                    <div className="prog-stats-grid">
                                        <div className="prog-stat mastered">
                                            <div className="stat-dot"></div>
                                            <span>Mastered: <strong>{progress.masteredCards}</strong></span>
                                        </div>
                                        <div className="prog-stat learning">
                                            <div className="stat-dot"></div>
                                            <span>Learning: <strong>{progress.learningCards}</strong></span>
                                        </div>
                                        <div className="prog-stat new">
                                            <div className="stat-dot"></div>
                                            <span>New: <strong>{progress.newCards}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                <div className="cards-section">
                    <div className="section-header">
                        <div className="section-placeholder"></div>
                        <div className="section-title-group">
                            <h2>Terms in this set</h2>
                            <span className="terms-count">{cards.length} cards</span>
                        </div>
                        {isOwner && (
                            <Button
                                size="md"
                                className="add-card-header-btn"
                                onClick={handleAddCardClick}
                                leftIcon={<Plus size={20} />}
                            >
                                Add Card
                            </Button>
                        )}
                        {!isOwner && <div className="section-placeholder"></div>}
                    </div>

                    <div className="cards-list">
                        {cards.length > 0 ? (
                            cards.map((card, index) => (
                                <Card key={card.cardId} className="flashcard-item-v2">
                                    <div className="v2-card-body">
                                        <div className="v2-index-col">
                                            <span>{index + 1}</span>
                                        </div>
                                        <div className="v2-content-col">
                                            <div className="v2-term">
                                                <label>TERM</label>
                                                <p>{card.term}</p>
                                            </div>
                                            <div className="v2-divider"></div>
                                            <div className="v2-definition">
                                                <label>DEFINITION</label>
                                                <p>{card.definition}</p>
                                            </div>
                                        </div>
                                        <div className="v2-actions-col">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`action-minor-btn star ${starredCardIds.has(card.cardId) ? 'starred' : ''}`}
                                                onClick={() => toggleStar(card.cardId)}
                                                title={starredCardIds.has(card.cardId) ? "Unstar" : "Star"}
                                            >
                                                <Star size={18} fill={starredCardIds.has(card.cardId) ? "currentColor" : "none"} />
                                            </Button>
                                            {isOwner && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="action-minor-btn edit"
                                                        onClick={() => handleEditCardClick(card.cardId)}
                                                    >
                                                        < Pencil size={18} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="action-minor-btn delete"
                                                        onClick={() => setCardToDelete(card.cardId)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="premium-empty-state">
                                <div className="empty-icon-box">
                                    <Layers size={48} />
                                </div>
                                <h3>Empty Flashcard Set</h3>
                                <p>This set doesn't have any cards yet. Start adding terms to begin studying!</p>
                                {isOwner && (
                                    <Button size="lg" onClick={handleAddCardClick} leftIcon={<Plus size={20} />}>
                                        Create First Card
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modals */}
                <ConfirmationModal
                    isOpen={isDeleteSetModalOpen}
                    onClose={() => setIsDeleteSetModalOpen(false)}
                    onConfirm={handleDeleteSet}
                    title="Delete Flashcard Set"
                    message={`Are you sure you want to delete "${set.title}"? This action cannot be undone.`}
                    confirmText="Delete Set"
                    type="danger"
                    isLoading={isDeleting}
                />
                <ConfirmationModal
                    isOpen={isResetModalOpen}
                    onClose={() => setIsResetModalOpen(false)}
                    onConfirm={handleResetProgress}
                    title="Reset Progress"
                    message="Are you sure you want to reset your progress? All cards will move back to 'New' status."
                    confirmText="Reset"
                    type="danger"
                    isLoading={isResetting}
                />

                <ConfirmationModal
                    isOpen={!!cardToDelete}
                    onClose={() => setCardToDelete(null)}
                    onConfirm={handleDeleteCard}
                    title="Delete Card"
                    message="Permanent action: This card will be removed from your set forever."
                    confirmText="Delete"
                    type="danger"
                    isLoading={isDeleting}
                />

                <CelebrationModal
                    isOpen={isCelebrationOpen}
                    onClose={() => setIsCelebrationOpen(false)}
                    setTitle={set?.title}
                />

                <QuizSettingsModal
                    isOpen={isQuizSettingsOpen}
                    onClose={() => setIsQuizSettingsOpen(false)}
                    onStart={handleStartQuiz}
                    totalCards={cards.length}
                />
            </div>
        </MainLayout>
    );
};

export default FlashcardSetDetailsPage;
