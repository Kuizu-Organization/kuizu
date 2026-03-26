import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Plus, Pencil, Trash2, User, Layers, BookOpen } from 'lucide-react';
import './FlashcardSetDetailsPage.css';
import { getFlashcardSetById, getFlashcardsBySetId, deleteFlashcard, reRequestFlashcardSetReview } from '@/api/flashcards';
import { getStudyProgress, resetStudyProgress } from '@/api/study';
import { Button, Card, Loader, ConfirmationModal, CelebrationModal } from '@/components/ui';
import { useModal } from '@/context/ModalContext';
import MainLayout from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const FlashcardSetDetailsPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success: toastSuccess, error: toastError } = useToast();
    const { openSetModal, openCardModal } = useModal();
    const [set, setSet] = useState(null);
    const [cards, setCards] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [isResetting, setIsResetting] = useState(false);
    const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
    const [isReRequesting, setIsReRequesting] = useState(false);

    useEffect(() => {
        fetchData();
        trackVisit(setId);
    }, [setId]);

    const trackVisit = (id) => {
        try {
            const recent = JSON.parse(localStorage.getItem('recent_sets') || '[]');
            // Convert to string to ensure comparison works if setId is string/number
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
            const [setData, cardsData, progressData] = await Promise.all([
                getFlashcardSetById(setId),
                getFlashcardsBySetId(setId),
                getStudyProgress(setId)
            ]);
            setSet(setData);
            setCards(cardsData);
            setProgress(progressData);
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
        // Refresh cards and progress
        try {
            const [cardsData, progressData] = await Promise.all([
                getFlashcardsBySetId(setId),
                getStudyProgress(setId)
            ]);
            setCards(cardsData);
            setProgress(progressData);
        } catch (err) {
            console.error('Error refreshing cards:', err);
        }
    };

    const handleAddCardClick = () => {
        openCardModal(setId, null, handleCardSuccess);
    };

    const handleEditCardClick = (cardId) => {
        openCardModal(setId, cardId, handleCardSuccess);
    };

    const handleDeleteCard = async () => {
        if (!cardToDelete) return;
        try {
            setIsDeleting(true);
            await deleteFlashcard(cardToDelete);
            setCards(cards.filter(c => c.cardId !== cardToDelete));
            setCardToDelete(null);
            // Update progress if needed
            const progressData = await getStudyProgress(setId);
            setProgress(progressData);
            toastSuccess('Flashcard deleted successfully.');
        } catch (err) {
            toastError('Failed to delete card.');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        if (progress?.progressPercentage === 100 && !loading) {
            // Only show if reached 100% and not triggered yet in this session
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
            // Clear the celebration flag so it can show again when 100% is reached
            sessionStorage.removeItem(`celebration_${setId}`);
            setIsResetModalOpen(false);
            toastSuccess('Study progress has been reset.');
        } catch (err) {
            toastError('Failed to reset progress.');
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
            toastSuccess('Review requested successfully.');
        } catch (err) {
            toastError('Failed to re-request review.');
        } finally {
            setIsReRequesting(false);
        }
    };

    if (loading) return <MainLayout><div className="loading-container"><Loader /></div></MainLayout>;
    if (error) return <MainLayout><div className="error-container">{error}</div></MainLayout>;

    const isOwner = user?.userId === set?.ownerId;

    return (
        <MainLayout>
            <div className="set-details-container">
                <button className="back-link" onClick={() => navigate('/flashcard-sets')}>
                    <ChevronLeft size={20} />
                    Back to sets
                </button>

                <div className="set-hero">
                    <div className="set-info-main">
                        <h1 className="set-title">
                            {set.title}
                            {set.status === 'PENDING' && (
                                <span style={{ fontSize: '1rem', backgroundColor: '#eab308', color: 'black', padding: '4px 8px', borderRadius: '4px', marginLeft: '12px', verticalAlign: 'middle', fontWeight: 600 }}>Pending Review</span>
                            )}
                            {set.status === 'REJECTED' && (
                                <span style={{ fontSize: '1rem', backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', marginLeft: '12px', verticalAlign: 'middle', fontWeight: 600 }}>Rejected</span>
                            )}
                            {set.status === 'APPROVED' && (
                                <span style={{ fontSize: '1rem', backgroundColor: '#22c55e', color: 'white', padding: '4px 8px', borderRadius: '4px', marginLeft: '12px', verticalAlign: 'middle', fontWeight: 600 }}>Approved</span>
                            )}
                        </h1>
                        {set.status === 'REJECTED' && set.moderationNotes && (
                            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                                <h4 style={{ color: '#991b1b', margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 700 }}>Moderator Feedback:</h4>
                                <p style={{ color: '#b91c1c', margin: 0, fontSize: '0.9rem' }}>{set.moderationNotes}</p>
                            </div>
                        )}
                        <p className="set-description">{set.description || 'No description provided.'}</p>

                        <div className="set-meta">
                            <div className="meta-item">
                                <User size={16} />
                                <span>Created by <strong>{set.ownerDisplayName}</strong></span>
                            </div>
                            <div className="meta-item">
                                <Layers size={16} />
                                <span>{cards.length} terms</span>
                            </div>
                        </div>
                    </div>

                    <div className="set-actions">
                        {isOwner && set.status === 'REJECTED' && (
                            <Button
                                variant="outline"
                                size="lg"
                                className="mr-2"
                                onClick={handleReRequestReview}
                                isLoading={isReRequesting}
                            >
                                Request Review Again
                            </Button>
                        )}
                        <Button
                            className="study-btn w-full"
                            size="lg"
                            variant="outline"
                            onClick={() => navigate(`/study/${setId}`, { state: { cards } })}
                            leftIcon={<BookOpen size={20} />}
                        >
                            Study
                        </Button>
                        <Button
                            className="play-btn w-full"
                            size="lg"
                            variant="outline"
                            onClick={() => navigate(`/quiz/${setId}`, { state: { cards } })}
                            disabled={cards.length < 2}
                            leftIcon={<Play size={20} fill="currentColor" />}
                        >
                            Take Quiz
                        </Button>
                        <Button
                            className="w-full"
                            variant="outline"
                            size="lg"
                            onClick={() => openSetModal(setId, handleSetUpdateSuccess)}
                            leftIcon={<Pencil size={20} />}
                        >
                            Edit Set
                        </Button>
                    </div>
                </div>

                {progress && (
                    <div className="progress-section">
                        <Card className="progress-card">
                            <Card.Body>
                                <div className="progress-summary">
                                    <div className="progress-text">
                                        <h3>Your Progress</h3>
                                        <div className="progress-stats">
                                            <span className="stat mastered">Mastered: {progress.masteredCards}</span>
                                            <span className="stat learning">Learning: {progress.learningCards}</span>
                                            <span className="stat new">New: {progress.newCards}</span>
                                        </div>
                                    </div>
                                    <div className="progress-action">
                                        <Button variant="ghost" size="sm" onClick={() => setIsResetModalOpen(true)}>
                                            <Trash2 size={16} />
                                            Reset Progress
                                        </Button>
                                    </div>
                                </div>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${progress.progressPercentage}%` }}
                                    ></div>
                                    <span className="progress-percentage">{Math.round(progress.progressPercentage)}%</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                )}

                <div className="cards-section">
                    <div className="section-header">
                        <h2>Terms in this set ({cards.length})</h2>
                        <Button
                            variant="ghost"
                            className="add-card-btn"
                            onClick={handleAddCardClick}
                            leftIcon={<Plus size={20} />}
                        >
                            Add Card
                        </Button>
                    </div>

                    <div className="cards-list">
                        {cards.length > 0 ? (
                            cards.map((card, index) => (
                                <Card key={card.cardId} className="flashcard-item">
                                    <Card.Body className="flashcard-item-body">
                                        <div className="card-index">{index + 1}</div>
                                        <div className="card-content">
                                            <div className="term-side">
                                                <div className="side-label">TERM</div>
                                                <div className="side-text">{card.term}</div>
                                            </div>
                                            <div className="divider"></div>
                                            <div className="definition-side">
                                                <div className="side-label">DEFINITION</div>
                                                <div className="side-text">{card.definition}</div>
                                            </div>
                                        </div>
                                        <div className="card-actions">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditCardClick(card.cardId)}
                                            >
                                                <Pencil size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="delete-btn"
                                                onClick={() => setCardToDelete(card.cardId)}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))
                        ) : (
                            <div className="empty-cards">
                                <p>No flashcards in this set yet.</p>
                                <Button onClick={handleAddCardClick}>
                                    Create first flashcard
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reset Progress Confirmation */}
                <ConfirmationModal
                    isOpen={isResetModalOpen}
                    onClose={() => setIsResetModalOpen(false)}
                    onConfirm={handleResetProgress}
                    title="Reset Study Progress"
                    message="Are you sure you want to reset your progress for this set? This will set all cards back to 'New' status."
                    confirmText="Reset Progress"
                    type="danger"
                    isLoading={isResetting}
                />

                {/* Delete Card Confirmation */}
                <ConfirmationModal
                    isOpen={!!cardToDelete}
                    onClose={() => setCardToDelete(null)}
                    onConfirm={handleDeleteCard}
                    title="Delete Flashcard"
                    message="Are you sure you want to delete this card? This action cannot be undone."
                    confirmText="Delete"
                    type="danger"
                    isLoading={isDeleting}
                />

                <CelebrationModal
                    isOpen={isCelebrationOpen}
                    onClose={() => setIsCelebrationOpen(false)}
                    setTitle={set?.title}
                />
            </div>
        </MainLayout>
    );
};

export default FlashcardSetDetailsPage;
