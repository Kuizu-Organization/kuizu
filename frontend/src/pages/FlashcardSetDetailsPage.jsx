import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Plus, Pencil, Trash2, User, Layers } from 'lucide-react';
import './FlashcardSetDetailsPage.css';
import { getFlashcardSetById, getFlashcardsBySetId, deleteFlashcard } from '../api/flashcards';
import { getStudyProgress, resetStudyProgress } from '../api/study';
import { Button, Card, Loader } from '../components/ui';
import MainLayout from '../components/layout';

const FlashcardSetDetailsPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();
    const [set, setSet] = useState(null);
    const [cards, setCards] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [setId]);

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

    const handleDeleteCard = async (cardId) => {
        if (window.confirm('Are you sure you want to delete this flashcard?')) {
            try {
                await deleteFlashcard(cardId);
                setCards(cards.filter(c => c.cardId !== cardId));
            } catch (err) {
                alert('Failed to delete card');
            }
        }
    };

    const handleResetProgress = async () => {
        if (window.confirm('Are you sure you want to reset your study progress for this set?')) {
            try {
                await resetStudyProgress(setId);
                const progressData = await getStudyProgress(setId);
                setProgress(progressData);
                alert('Progress reset successfully');
            } catch (err) {
                alert('Failed to reset progress');
            }
        }
    };

    if (loading) return <MainLayout><div className="loading-container"><Loader /></div></MainLayout>;
    if (error) return <MainLayout><div className="error-container">{error}</div></MainLayout>;

    return (
        <MainLayout>
            <div className="set-details-container">
                <button className="back-link" onClick={() => navigate('/flashcard-sets')}>
                    <ChevronLeft size={20} />
                    Back to sets
                </button>

                <div className="set-hero">
                    <div className="set-info-main">
                        <h1 className="set-title">{set.title}</h1>
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
                        <Button
                            className="play-btn"
                            size="lg"
                            onClick={() => navigate(`/quiz/${setId}`, { state: { cards } })}
                            disabled={cards.length < 2}
                        >
                            <Play size={20} fill="currentColor" />
                            Take Quiz
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate(`/flashcard-sets/edit/${set.setId}`)}
                        >
                            <Pencil size={20} />
                            Edit Set
                        </Button>
                    </div>
                </div>

                {progress && (
                    <div className="progress-section">
                        <Card className="progress-card">
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
                                    <Button variant="ghost" size="sm" onClick={handleResetProgress}>
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
                        </Card>
                    </div>
                )}

                <div className="cards-section">
                    <div className="section-header">
                        <h2>Terms in this set ({cards.length})</h2>
                        <Button
                            variant="ghost"
                            className="add-card-btn"
                            onClick={() => navigate(`/flashcards/create?setId=${setId}`)}
                        >
                            <Plus size={20} />
                            Add Card
                        </Button>
                    </div>

                    <div className="cards-list">
                        {cards.length > 0 ? (
                            cards.map((card, index) => (
                                <Card key={card.cardId} className="flashcard-item">
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
                                            onClick={() => navigate(`/flashcards/edit/${card.cardId}`)}
                                        >
                                            <Pencil size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="delete-btn"
                                            onClick={() => handleDeleteCard(card.cardId)}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="empty-cards">
                                <p>No flashcards in this set yet.</p>
                                <Button onClick={() => navigate(`/flashcards/create?setId=${setId}`)}>
                                    Create first flashcard
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default FlashcardSetDetailsPage;
