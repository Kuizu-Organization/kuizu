import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, RotateCcw, CheckCircle2, XCircle, Trophy, Keyboard, Shuffle, Star, ArrowLeftRight } from 'lucide-react';
import { getFlashcardsBySetId, getFlashcardSetById } from '@/api/flashcards';
import { updateStudyProgress } from '@/api/study';
import { useToast } from '@/context/ToastContext';
import { Button, Card, Loader } from '@/components/ui';
import MainLayout from '@/components/layout';
import './StudyPage.css';

const StudyPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    const [allCards, setAllCards] = useState(location.state?.cards || []);
    const [cards, setCards] = useState(location.state?.cards || []);
    const [setTitle, setSetTitle] = useState(location.state?.setTitle || '');
    const [loading, setLoading] = useState(!location.state?.cards);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [hasTriggeredFinish, setHasTriggeredFinish] = useState(false);
    const [progressRestored, setProgressRestored] = useState(false);
    const [starredCardIds, setStarredCardIds] = useState(() => {
        const saved = localStorage.getItem(`starred_cards_${setId}`);
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const backPath = location.state?.from || `/flashcard-sets/${setId}`;
    const backLabel = location.state?.fromLabel || 'Back to Set';
    const studyTitle = location.state?.folderName || '';

    useEffect(() => {
        localStorage.setItem(`starred_cards_${setId}`, JSON.stringify(Array.from(starredCardIds)));
    }, [starredCardIds, setId]);
    
    const [isSwapped, setIsSwapped] = useState(false);
    const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

    useEffect(() => {
        if (progress === 100 && !hasTriggeredFinish && !loading && cards.length > 0) {
            toast.success('Amazing! You reached 100%!', 5000);
            setHasTriggeredFinish(true);
        }
    }, [progress, hasTriggeredFinish, toast, loading, cards.length]);

    useEffect(() => {
        if (cards.length === 0 || !setTitle) {
            fetchData();
        }
    }, [setId]);

    // Handle Start Index from State (Bulletin Continue)
    useEffect(() => {
        if (!loading && cards.length > 0 && location.state?.startIndex !== undefined && !progressRestored) {
            setCurrentIndex(location.state.startIndex);
            setProgressRestored(true);
            toast.success(`Resumed from card ${location.state.startIndex + 1}`);
        }
    }, [loading, cards.length, location.state, progressRestored]);

    const seededShuffle = (array, seed) => {
        const shuffled = [...array];
        let m = shuffled.length, t, i;
        // Use setId as seed
        let s = parseInt(String(seed).replace(/\D/g, '')) || 0;
        
        const random = () => {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };

        while (m) {
            i = Math.floor(random() * m--);
            t = shuffled[m];
            shuffled[m] = shuffled[i];
            shuffled[i] = t;
        }
        return shuffled;
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            
            let fetchedCards = [];
            let fetchedTitle = setTitle;

            if (allCards.length === 0) {
                fetchedCards = await getFlashcardsBySetId(setId);
            } else {
                fetchedCards = allCards;
            }
            
            if (!setTitle) {
                const setData = await getFlashcardSetById(setId);
                fetchedTitle = setData.title;
            }

            setAllCards(fetchedCards);
            setSetTitle(fetchedTitle);
            
            // Use seeded shuffle so the order is consistent across "Continue" sessions
            setCards(seededShuffle(fetchedCards, setId));
        } catch (err) {
            console.error('Failed to load study data:', err);
            toast.error('Failed to load study data');
        } finally {
            setLoading(false);
        }
    };

    // Save progress to study history
    useEffect(() => {
        if (loading || isFinished || cards.length === 0 || !setTitle) return;

        const saveProgress = () => {
            const history = JSON.parse(localStorage.getItem('study_history') || '[]');
            const currentSession = {
                setId: setId,
                title: setTitle,
                currentIndex: currentIndex,
                totalCards: cards.length,
                lastUpdated: new Date().getTime()
            };

            const filtered = history.filter(h => String(h.setId) !== String(setId));
            const updated = [currentSession, ...filtered].slice(0, 5); // Keep last 5
            localStorage.setItem('study_history', JSON.stringify(updated));
        };

        const timer = setTimeout(saveProgress, 500); // Debounce
        return () => clearTimeout(timer);
    }, [currentIndex, setId, setTitle, cards.length, loading, isFinished]);

    // Clear progress if finished
    useEffect(() => {
        if (isFinished) {
            const history = JSON.parse(localStorage.getItem('study_history') || '[]');
            const updated = history.filter(h => String(h.setId) !== String(setId));
            localStorage.setItem('study_history', JSON.stringify(updated));
        }
    }, [isFinished, setId]);

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };


    const handleShuffle = () => {
        const shuffled = shuffleArray(cards);
        setCards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleSwap = () => {
        setIsSwapped(!isSwapped);
        setIsFlipped(false);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isFinished) return;

            if (e.code === 'Space') {
                e.preventDefault();
                handleFlip();
            } else if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
                e.preventDefault();
                handleNext();
            } else if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
                e.preventDefault();
                handlePrevious();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, isFlipped, isFinished, cards.length]);

    if (loading) return <MainLayout><div className="loading-container"><Loader /></div></MainLayout>;

    if (cards.length === 0) return (
        <MainLayout>
            <div className="error-container">
                <p>No cards found in this set.</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        </MainLayout>
    );

    if (isFinished) {
        const starredCards = allCards.filter(c => starredCardIds.has(c.cardId));
        return (
            <MainLayout>
                <div className="study-finished-container">
                    <Card className="finish-card">
                        <Trophy size={64} className="finish-icon" />
                        <h2>Congratulations!</h2>
                        <p>You've completed this study session. All {cards.length} cards reviewed!</p>

                        <div className="finish-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                            <Button
                                onClick={() => {
                                    setCards(shuffleArray(allCards));
                                    setCurrentIndex(0);
                                    setIsFlipped(false);
                                    setIsFinished(false);
                                    setHasTriggeredFinish(false);
                                }}
                            >
                                <RotateCcw size={18} />
                                Study All Again
                            </Button>
                            {starredCards.length > 0 && (
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setCards(shuffleArray(starredCards));
                                        setCurrentIndex(0);
                                        setIsFlipped(false);
                                        setIsFinished(false);
                                        setHasTriggeredFinish(false);
                                    }}
                                    style={{ backgroundColor: '#ffce3a', color: '#1a1a1a', borderColor: '#ffce3a', fontWeight: 'bold' }}
                                >
                                    <Star size={18} fill="currentColor" />
                                    Study Starred ({starredCards.length})
                                </Button>
                            )}
                             <Button variant="outline" onClick={() => navigate(backPath)} className="return-btn">
                                {backLabel}
                            </Button>
                        </div>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    const currentCard = cards[currentIndex];
    if (!currentCard) return null; // Safety check

    const toggleStar = (e) => {
        e.stopPropagation();
        const currentCardId = currentCard.cardId;
        setStarredCardIds(prev => {
            const next = new Set(prev);
            if (next.has(currentCardId)) {
                next.delete(currentCardId);
            } else {
                next.add(currentCardId);
            }
            return next;
        });
    };

    return (
        <MainLayout>
            <div className="study-page-container">
                <div className="study-header">
                    <div className="study-header-left">
                         <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(backPath)}
                            leftIcon={<ChevronLeft size={20} />}
                            className="back-set-btn"
                        >
                            {backLabel}
                        </Button>
                    </div>

                    <div className="study-header-right">
                        <div className="progress-text">
                            Card <span className="current">{currentIndex + 1}</span> of <span className="total">{cards.length}</span>
                        </div>
                        <div className="header-actions">
                            <button
                                className="shuffle-btn"
                                onClick={handleShuffle}
                                title="Shuffle cards"
                            >
                                <Shuffle size={18} />
                            </button>
                            <button
                                className={`shuffle-btn ${isSwapped ? 'active' : ''}`}
                                onClick={handleSwap}
                                title="Swap Term/Definition"
                            >
                                <ArrowLeftRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="study-progress-bar">
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="study-card-area">
                    <div
                        className={`flashcard-wrapper ${isFlipped ? 'flipped' : ''}`}
                        onClick={handleFlip}
                    >
                        {/* Front Face */}
                        <div className="flashcard-face flashcard-front">
                            <button
                                className={`star-btn ${starredCardIds.has(currentCard.cardId) ? 'starred' : ''}`}
                                onClick={toggleStar}
                                title={starredCardIds.has(currentCard.cardId) ? "Unstar" : "Star"}
                            >
                                <Star size={24} fill={starredCardIds.has(currentCard.cardId) ? "currentColor" : "none"} />
                            </button>
                            <span className="face-label">{isSwapped ? 'Definition' : 'Term'}</span>
                            <div className="card-text">{isSwapped ? currentCard.definition : currentCard.term}</div>
                            <span className="card-hint">Click or press Space to flip</span>
                        </div>

                        {/* Back Face */}
                        <div className="flashcard-face flashcard-back">
                            <button
                                className={`star-btn ${starredCardIds.has(currentCard.cardId) ? 'starred' : ''}`}
                                onClick={toggleStar}
                                title={starredCardIds.has(currentCard.cardId) ? "Unstar" : "Star"}
                            >
                                <Star size={24} fill={starredCardIds.has(currentCard.cardId) ? "currentColor" : "none"} />
                            </button>
                            <span className="face-label">{isSwapped ? 'Term' : 'Definition'}</span>
                            <div className="card-text">{isSwapped ? currentCard.term : currentCard.definition}</div>
                            <span className="card-hint">Click or press Space to flip back</span>
                        </div>
                    </div>

                    <div className="study-controls">
                        <div className="control-btn">
                            <Button
                                variant="outline"
                                size="lg"
                                className="nav-btn"
                                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeft size={24} />
                                Previous
                            </Button>
                            <span className="btn-label">Press ←</span>
                        </div>

                        <div className="control-btn">
                            <Button
                                size="lg"
                                className="nav-btn"
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            >
                                {currentIndex === cards.length - 1 ? 'Finish' : (
                                    <>
                                        Next
                                        <ChevronLeft size={24} style={{ transform: 'rotate(180deg)' }} />
                                    </>
                                )}
                            </Button>
                            <span className="btn-label">Press →</span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default StudyPage;
