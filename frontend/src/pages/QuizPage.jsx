import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, XCircle, AlertCircle, ArrowLeftRight, Check, X } from 'lucide-react';
import { getFlashcardsBySetId } from '../api/flashcards';
import { submitQuiz } from '../api/study';
import { Button, Card, Loader, Modal, Input } from '../components/ui';
import MainLayout from '../components/layout';
import './QuizPage.css';

const QuizPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [cards, setCards] = useState(location.state?.cards || []);
    const settings = location.state?.settings || {
        numQuestions: 20,
        activeModes: ['MULTIPLE_CHOICE'],
        answerDirection: 'DEFINITION'
    };

    const [loading, setLoading] = useState(!location.state?.cards);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [writtenAnswer, setWrittenAnswer] = useState('');
    const [isFinished, setIsFinished] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [isSwapped, setIsSwapped] = useState(settings.answerDirection === 'TERM');

    useEffect(() => {
        if (cards.length > 0) {
            generateQuestions(cards, isSwapped);
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
            generateQuestions(data, isSwapped);
        } catch (err) {
            setError('Failed to load cards for quiz.');
        } finally {
            setLoading(false);
        }
    };

    const generateQuestions = (cardsData, swapped) => {
        let pool = [...cardsData];
        
        if (settings.starredOnly) {
            const savedStarred = localStorage.getItem(`starred_cards_${setId}`);
            if (savedStarred) {
                const starredIds = new Set(JSON.parse(savedStarred));
                pool = pool.filter(c => starredIds.has(c.cardId));
            }
        }
        
        // Final safety check if pool is empty after filtering
        if (pool.length === 0) {
            pool = [...cardsData];
        }

        const shuffled = pool.sort(() => 0.5 - Math.random());
        const limitedPool = shuffled.slice(0, settings.numQuestions);
        
        const activeModes = settings.activeModes;

        const generated = limitedPool.map((card, index) => {
            const mode = activeModes[index % activeModes.length];
            const questionTerm = swapped ? card.definition : card.term;
            const correctAnswer = swapped ? card.term : card.definition;

            if (mode === 'TRUE_FALSE') {
                const isCorrectPair = Math.random() > 0.5;
                let displayDefinition = correctAnswer;
                
                if (!isCorrectPair) {
                    const distractors = cardsData.filter(c => c.cardId !== card.cardId);
                    const randomDistractor = distractors[Math.floor(Math.random() * distractors.length)];
                    displayDefinition = swapped ? randomDistractor.term : randomDistractor.definition;
                }

                return {
                    type: 'TRUE_FALSE',
                    cardId: card.cardId,
                    term: questionTerm,
                    displayDefinition: displayDefinition,
                    correctAnswer: isCorrectPair ? 'TRUE' : 'FALSE',
                    originalDefinition: correctAnswer
                };
            } else if (mode === 'WRITTEN') {
                return {
                    type: 'WRITTEN',
                    cardId: card.cardId,
                    term: questionTerm,
                    correctAnswer: correctAnswer
                };
            } else {
                // MULTIPLE_CHOICE
                const otherAnswers = cardsData
                    .filter(c => c.cardId !== card.cardId)
                    .map(c => swapped ? c.term : c.definition);

                const distractors = [...otherAnswers]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);

                const options = [...distractors, correctAnswer].sort(() => 0.5 - Math.random());

                return {
                    type: 'MULTIPLE_CHOICE',
                    cardId: card.cardId,
                    term: questionTerm,
                    correctAnswer: correctAnswer,
                    options
                };
            }
        });

        setQuestions(generated);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setSelectedOption(null);
        setWrittenAnswer('');
    };

    const handleAnswer = (answer, isCorrect) => {
        const currentQuestion = questions[currentQuestionIndex];
        
        const newAnswer = {
            cardId: currentQuestion.cardId,
            term: currentQuestion.term,
            definition: currentQuestion.type === 'TRUE_FALSE' ? currentQuestion.originalDefinition : currentQuestion.correctAnswer,
            isCorrect,
            userAnswer: answer,
            questionType: currentQuestion.type
        };

        setAnswers(prev => [...prev, newAnswer]);

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
                setWrittenAnswer('');
            } else {
                setIsFinished(true);
            }
        }, 1000);
    };

    const handleOptionSelect = (option) => {
        if (selectedOption !== null) return;
        setSelectedOption(option);
        
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = option === currentQuestion.correctAnswer;
        
        handleAnswer(option, isCorrect);
    };

    const handleWrittenSubmit = (e) => {
        if (e) e.preventDefault();
        if (selectedOption !== null || !writtenAnswer.trim()) return;
        
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = writtenAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
        
        setSelectedOption(isCorrect ? 'correct' : 'incorrect');
        handleAnswer(writtenAnswer, isCorrect);
    };

    const handleSubmitQuiz = async () => {
        try {
            setIsSubmitting(true);
            
            // Ensure all questions are included in results, even if unanswered
            const answeredMap = new Map(answers.map(a => [a.cardId, a]));
            const completeAnswers = questions.map(q => {
                if (answeredMap.has(q.cardId)) {
                    return answeredMap.get(q.cardId);
                }
                return {
                    cardId: q.cardId,
                    term: q.term,
                    definition: q.type === 'TRUE_FALSE' ? q.originalDefinition : q.correctAnswer,
                    isCorrect: false,
                    userAnswer: '(Bỏ qua)',
                    questionType: q.type
                };
            });

            await submitQuiz({
                setId: parseInt(setId),
                answers: completeAnswers.map(a => ({ cardId: a.cardId, isCorrect: a.isCorrect }))
            });

            const correctCount = completeAnswers.filter(a => a.isCorrect).length;
            navigate(`/quiz/results/summary`, {
                state: {
                    result: {
                        setId: parseInt(setId),
                        score: correctCount,
                        totalQuestions: questions.length,
                        items: completeAnswers
                    }
                }
            });
        } catch (err) {
            console.error('Failed to update progress:', err);
            // Even on error, show the results with all questions
            const answeredMap = new Map(answers.map(a => [a.cardId, a]));
            const completeAnswers = questions.map(q => {
                if (answeredMap.has(q.cardId)) {
                    return answeredMap.get(q.cardId);
                }
                return {
                    cardId: q.cardId,
                    term: q.term,
                    definition: q.type === 'TRUE_FALSE' ? q.originalDefinition : q.correctAnswer,
                    isCorrect: false,
                    userAnswer: '(Bỏ qua)',
                    questionType: q.type
                };
            });
            const correctCount = completeAnswers.filter(a => a.isCorrect).length;
            navigate(`/quiz/results/summary`, {
                state: {
                    result: {
                        setId: parseInt(setId),
                        score: correctCount,
                        totalQuestions: questions.length,
                        items: completeAnswers
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
                        onClick={() => navigate(`/flashcard-sets/${setId}`)}
                        leftIcon={<ChevronLeft size={20} />}
                        className="back-set-btn"
                    >
                        Back to Set
                    </Button>
                    <div className="quiz-header-right">
                        <div className="quiz-progress-text">
                            Question <span className="current">{currentQuestionIndex + 1}</span> of <span className="total">{questions.length}</span>
                        </div>
                        <button
                            className={`shuffle-btn ${isSwapped ? 'active' : ''}`}
                            onClick={() => {
                                const newSwapped = !isSwapped;
                                setIsSwapped(newSwapped);
                                generateQuestions(cards, newSwapped);
                            }}
                            title="Swap Question/Answer"
                        >
                            <ArrowLeftRight size={18} />
                        </button>
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
                    <div className="question-type-badge">
                        {currentQuestion.type === 'TRUE_FALSE' && 'Đúng hoặc Sai'}
                        {currentQuestion.type === 'WRITTEN' && 'Tự luận'}
                        {currentQuestion.type === 'MULTIPLE_CHOICE' && 'Trắc nghiệm'}
                    </div>
                    
                    <h1 className="question-term">{currentQuestion.term}</h1>

                    {currentQuestion.type === 'MULTIPLE_CHOICE' && (
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
                    )}

                    {currentQuestion.type === 'TRUE_FALSE' && (
                        <div className="tf-content">
                            <div className="tf-definition-card">
                                <p>{currentQuestion.displayDefinition}</p>
                            </div>
                            <div className="tf-actions">
                                <button 
                                    className={`tf-btn true-btn ${selectedOption === 'TRUE' ? (currentQuestion.correctAnswer === 'TRUE' ? 'correct' : 'incorrect') : (selectedOption !== null && currentQuestion.correctAnswer === 'TRUE' ? 'correct' : '')}`}
                                    onClick={() => handleOptionSelect('TRUE')}
                                    disabled={selectedOption !== null}
                                >
                                    <Check size={24} />
                                    <span>Đúng</span>
                                </button>
                                <button 
                                    className={`tf-btn false-btn ${selectedOption === 'FALSE' ? (currentQuestion.correctAnswer === 'FALSE' ? 'correct' : 'incorrect') : (selectedOption !== null && currentQuestion.correctAnswer === 'FALSE' ? 'correct' : '')}`}
                                    onClick={() => handleOptionSelect('FALSE')}
                                    disabled={selectedOption !== null}
                                >
                                    <X size={24} />
                                    <span>Sai</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {currentQuestion.type === 'WRITTEN' && (
                        <div className="written-content">
                            <form onSubmit={handleWrittenSubmit}>
                                <Input
                                    placeholder="Nhập câu trả lời của bạn..."
                                    value={writtenAnswer}
                                    onChange={(e) => setWrittenAnswer(e.target.value)}
                                    autoFocus
                                    disabled={selectedOption !== null}
                                    className={selectedOption ? (selectedOption === 'correct' ? 'written-correct' : 'written-incorrect') : ''}
                                />
                                {selectedOption !== null && (
                                    <div className={`written-feedback ${selectedOption}`}>
                                        {selectedOption === 'correct' ? (
                                            <p className="success-text"><Check size={16} /> Chính xác!</p>
                                        ) : (
                                            <div className="error-text">
                                                <p><X size={16} /> Sai rồi!</p>
                                                <p className="correct-display">Đáp án đúng: <strong>{currentQuestion.correctAnswer}</strong></p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {selectedOption === null && (
                                    <Button type="submit" variant="primary" className="written-submit-btn">
                                        Gửi câu trả lời
                                    </Button>
                                )}
                            </form>
                        </div>
                    )}
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
