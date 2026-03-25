import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { getFlashcardsBySetId } from '@/api/flashcards';
import { submitQuiz } from '@/api/study';
import { Button, Card, Loader, Modal } from '@/components/ui';
import MainLayout from '@/components/layout';
import './QuizPage.css';

const QuizPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const backPath = location.state?.from || `/flashcard-sets/${setId}`;
    const backLabel = location.state?.fromLabel || 'Back to Set';

    const [cards, setCards] = useState(location.state?.cards || []);
    const [loading, setLoading] = useState(!location.state?.cards);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFinishModal, setShowFinishModal] = useState(false);

    useEffect(() => {
        if (cards.length > 0) {
            generateQuestions(cards);
        } else {
            fetchCards();
        }
    }, [setId]);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const data = await getFlashcardsBySetId(setId);
            if (data.length < 2) {
                setError('You need at least 2 cards to take a quiz.');
                return;
            }
            setCards(data);
            generateQuestions(data);
        } catch (err) {
            setError('Failed to load cards for quiz.');
        } finally {
            setLoading(false);
        }
    };

    const generateQuestions = (cardsData) => {
        const shuffled = [...cardsData].sort(() => 0.5 - Math.random());
        const generated = shuffled.map(card => {
            const correctAnswer = card.definition;
            const otherDefinitions = cardsData
                .filter(c => c.cardId !== card.cardId)
                .map(c => c.definition);

            const distractors = [...otherDefinitions]
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            const options = [...distractors, correctAnswer].sort(() => 0.5 - Math.random());

            return {
                cardId: card.cardId,
                term: card.term,
                correctAnswer,
                options
            };
        });
        setQuestions(generated);
    };

    const handleOptionSelect = (option) => {
        if (selectedOption !== null) return;
        setSelectedOption(option);

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = option === currentQuestion.correctAnswer;

        const newAnswer = {
            cardId: currentQuestion.cardId,
            term: currentQuestion.term,
            definition: currentQuestion.correctAnswer,
            isCorrect
        };

        setAnswers(prev => [...prev, newAnswer]);

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
            } else {
                setIsFinished(true);
            }
        }, 1000);
    };

    const handleSubmitQuiz = async () => {
        const isFolder = setId.startsWith('folder-');
        try {
            setIsSubmitting(true);
            
            if (!isFolder) {
                await submitQuiz({
                    setId: parseInt(setId),
                    answers: answers.map(a => ({ cardId: a.cardId, isCorrect: a.isCorrect }))
                });
            }

            const correctCount = answers.filter(a => a.isCorrect).length;
            navigate(`/quiz/results/summary`, {
                state: {
                    result: {
                        setId: isFolder ? setId : parseInt(setId),
                        score: correctCount,
                        totalQuestions: questions.length,
                        items: answers
                    }
                }
            });
        } catch (err) {
            console.error('Failed to submit quiz:', err);
            const correctCount = answers.filter(a => a.isCorrect).length;
            navigate(`/quiz/results/summary`, {
                state: {
                    result: {
                        setId: isFolder ? setId : parseInt(setId),
                        score: correctCount,
                        totalQuestions: questions.length,
                        items: answers
                    }
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error) return (
        <MainLayout>
            <div className="error-container">
                <AlertCircle size={48} />
                <p>{error}</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        </MainLayout>
    );

    if (isFinished) {
        const correctCount = answers.filter(a => a.isCorrect).length;
        return (
            <MainLayout>
                <div className="quiz-finished-container">
                    <Card className="finish-card">
                        <h2>Quiz Finished!</h2>
                        <div className="score-summary">
                            <span className="score-big">{correctCount} / {questions.length}</span>
                            <p>You've completed the quiz.</p>
                        </div>
                        <Button
                            className="submit-btn"
                            size="lg"
                            onClick={handleSubmitQuiz}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving Progress...' : 'View Results'}
                        </Button>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    if (loading || questions.length === 0) return <MainLayout><div className="loading-container"><Loader /></div></MainLayout>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <MainLayout>
            <div className="quiz-container">
                <div className="quiz-header">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(backPath)}
                        leftIcon={<ChevronLeft size={20} />}
                        className="back-set-btn"
                    >
                        {backLabel}
                    </Button>
                    <div className="quiz-header-right">
                        <div className="quiz-progress-text">
                            Question <span className="current">{currentQuestionIndex + 1}</span> of <span className="total">{questions.length}</span>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            className="finish-quiz-btn"
                            onClick={() => setShowFinishModal(true)}
                        >
                            Finish
                        </Button>
                    </div>
                </div>

                <div className="quiz-progress-bar">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="question-content">
                    <h1 className="question-term">{currentQuestion.term}</h1>
                    <div className="options-grid">
                        {currentQuestion.options.map((option, idx) => {
                            let optionClass = 'option-btn';
                            if (selectedOption === option) {
                                optionClass += option === currentQuestion.correctAnswer ? ' correct' : ' incorrect';
                            } else if (selectedOption !== null && option === currentQuestion.correctAnswer) {
                                optionClass += ' correct';
                            }

                            return (
                                <button
                                    key={idx}
                                    className={optionClass}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={selectedOption !== null}
                                >
                                    <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                                    <span className="option-text">{option}</span>
                                    {selectedOption === option && (
                                        option === currentQuestion.correctAnswer ?
                                            <CheckCircle2 className="status-icon" size={20} /> :
                                            <XCircle className="status-icon" size={20} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showFinishModal}
                onClose={() => setShowFinishModal(false)}
                title="Finish Quiz Early?"
                footer={
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <Button
                            variant="secondary"
                            onClick={() => setShowFinishModal(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setShowFinishModal(false);
                                handleSubmitQuiz();
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Confirm Finish'}
                        </Button>
                    </div>
                }
            >
                <p>Are you sure you want to finish this quiz early? Your progress so far will be saved and calculated.</p>
            </Modal>
        </MainLayout>
    );
};

export default QuizPage;
