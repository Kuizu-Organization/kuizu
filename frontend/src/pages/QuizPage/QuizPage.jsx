import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, XCircle, AlertCircle, ArrowLeftRight, Check, X } from 'lucide-react';
import { getFlashcardsBySetId } from '@/api/flashcards';
import { submitQuiz } from '@/api/study';
import { Button, Card, Loader, Modal, Input } from '@/components/ui';
import MainLayout from '@/components/layout';
import './QuizPage.css';
import { useToast } from '@/context/ToastContext';

const QuizPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const backPath = location.state?.from || `/flashcard-sets/${setId}`;
    const backLabel = location.state?.fromLabel || 'Back to Set';

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
    const toast = useToast();
    const writtenInputRef = useRef(null);

    // Auto-focus the input when a new WRITTEN question appears
    useEffect(() => {
        if (questions[currentQuestionIndex]?.type === 'WRITTEN' && !isFinished) {
            const timer = setTimeout(() => {
                if (writtenInputRef.current) {
                    writtenInputRef.current.focus();
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [currentQuestionIndex, questions, isFinished]);
    useEffect(() => {
        // Validation check for tampered settings
        const num = parseInt(settings.numQuestions);
        if (isNaN(num) || num < 1) {
            toast.error('Invalid quiz settings detected. Returning to set.');
            navigate(backPath);
            return;
        }

        if (cards.length > 0) {
            generateQuestions(cards, isSwapped);
        } else {
            fetchCards();
        }
    }, [setId, settings.numQuestions]);

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
        const normalizeString = (str) => {
            return str
                .normalize("NFC")           // Đồng nhất chuẩn Unicode tiếng Việt
                .trim()
                .toLowerCase()              // Không phân biệt hoa/thường
                .replace(/\s+/g, ' ')       // Xóa dư khoảng trắng
                .replace(/\s*,\s*/g, ',');  // Đồng nhất khoảng cách trước/sau dấu phẩy
        };
        const isCorrect = normalizeString(writtenAnswer) === normalizeString(currentQuestion.correctAnswer);
        
        setSelectedOption(isCorrect ? 'correct' : 'incorrect');
        handleAnswer(writtenAnswer, isCorrect);
    };

    const handleSkip = () => {
        if (selectedOption !== null) return;
        
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion.type === 'WRITTEN') {
            setWrittenAnswer(currentQuestion.correctAnswer);
        }
        
        setSelectedOption('skipped');
        handleAnswer('Skipped', false);
    };

    const handleSubmitQuiz = async () => {
        const isFolder = setId.startsWith('folder-');
        
        // Fill in remaining questions if finishing early
        const finalAnswers = [...answers];
        if (finalAnswers.length < questions.length) {
            for (let i = finalAnswers.length; i < questions.length; i++) {
                const q = questions[i];
                finalAnswers.push({
                    cardId: q.cardId,
                    term: q.term,
                    definition: q.type === 'TRUE_FALSE' ? q.originalDefinition : q.correctAnswer,
                    isCorrect: false,
                    userAnswer: 'Not answered',
                    questionType: q.type
                });
            }
        }

        const correctCount = finalAnswers.filter(a => a.isCorrect).length;
        
        try {
            setIsSubmitting(true);
            
            // Log submission for non-folder quizzes
            if (!isFolder) {
                await submitQuiz({
                    setId: parseInt(setId),
                    answers: finalAnswers.map(a => ({ cardId: a.cardId, isCorrect: a.isCorrect }))
                });
            }

            navigate(`/quiz/results/summary`, {
                state: {
                    result: {
                        setId: isFolder ? setId : parseInt(setId),
                        score: correctCount,
                        totalQuestions: questions.length,
                        items: finalAnswers
                    }
                }
            });
        } catch (err) {
            console.error('Failed to submit quiz:', err);
            // Even if submission fails, let user see their results
            navigate(`/quiz/results/summary`, {
                state: {
                    result: {
                        setId: isFolder ? setId : parseInt(setId),
                        score: correctCount,
                        totalQuestions: questions.length,
                        items: finalAnswers
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

    if (loading) return <MainLayout><div className="loading-container"><Loader /></div></MainLayout>;

    if (questions.length === 0) return (
        <MainLayout>
            <div className="error-container">
                <AlertCircle size={48} />
                <p>No questions could be generated. Try a different amount or different options.</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        </MainLayout>
    );

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
                        {currentQuestion.type === 'TRUE_FALSE' && 'True or False'}
                        {currentQuestion.type === 'WRITTEN' && 'Written'}
                        {currentQuestion.type === 'MULTIPLE_CHOICE' && 'Multiple Choice'}
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
                                    <span>True</span>
                                </button>
                                <button 
                                    className={`tf-btn false-btn ${selectedOption === 'FALSE' ? (currentQuestion.correctAnswer === 'FALSE' ? 'correct' : 'incorrect') : (selectedOption !== null && currentQuestion.correctAnswer === 'FALSE' ? 'correct' : '')}`}
                                    onClick={() => handleOptionSelect('FALSE')}
                                    disabled={selectedOption !== null}
                                >
                                    <X size={24} />
                                    <span>False</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {currentQuestion.type === 'WRITTEN' && (
                        <div className="written-content">
                            <form onSubmit={handleWrittenSubmit}>
                                <Input
                                    ref={writtenInputRef}
                                    placeholder="Enter your answer..."
                                    value={writtenAnswer}
                                    onChange={(e) => setWrittenAnswer(e.target.value)}
                                    autoFocus
                                    disabled={selectedOption !== null}
                                    className={selectedOption ? (selectedOption === 'correct' ? 'written-correct' : (selectedOption === 'skipped' ? 'written-skipped' : 'written-incorrect')) : ''}
                                />
                                {selectedOption !== null && (
                                    <div className={`written-feedback ${selectedOption}`}>
                                        {selectedOption === 'correct' ? (
                                            <p className="success-text"><Check size={16} /> Correct!</p>
                                        ) : selectedOption === 'skipped' ? (
                                            <p className="skipped-text">Question skipped</p>
                                        ) : (
                                            <div className="error-text">
                                                <p><X size={16} /> Wrong answer!</p>
                                                <p className="correct-display">Correct answer: <strong>{currentQuestion.correctAnswer}</strong></p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {selectedOption === null && (
                                    <div className="written-actions">
                                        <Button type="submit" variant="primary" className="written-submit-btn">
                                            Submit Answer
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    <div className="quiz-footer-actions">
                        <Button 
                            variant="ghost" 
                            className="skip-question-btn"
                            onClick={handleSkip}
                            disabled={selectedOption !== null}
                        >
                            I don't know (Skip)
                        </Button>
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
