import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { getFlashcardsBySetId } from '../api/flashcards';
import { submitQuiz } from '../api/study';
import { Button, Card, Loader } from '../components/ui';
import MainLayout from '../components/layout';
import './QuizPage.css';

const QuizPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [cards, setCards] = useState(location.state?.cards || []);
    const [loading, setLoading] = useState(!location.state?.cards);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        try {
            setIsSubmitting(true);
            await submitQuiz({
                setId: parseInt(setId),
                answers: answers.map(a => ({ cardId: a.cardId, isCorrect: a.isCorrect }))
            });

            const correctCount = answers.filter(a => a.isCorrect).length;
            navigate(`/quiz/results/summary`, {
                state: {
                    result: {
                        setId: parseInt(setId),
                        score: correctCount,
                        totalQuestions: questions.length,
                        items: answers
                    }
                }
            });
        } catch (err) {
            alert('Failed to update progress');
            const correctCount = answers.filter(a => a.isCorrect).length;
            navigate(`/quiz/results/summary`, {
                state: {
                    result: {
                        setId: parseInt(setId),
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
                    <button className="back-link" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} />
                        Exit Quiz
                    </button>
                    <div className="quiz-progress">
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <div className="progress-bar-bg">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>
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
        </MainLayout>
    );
};

export default QuizPage;
