import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, XCircle, RefreshCcw, Home } from 'lucide-react';
import { Button, Card } from '../components/ui';
import MainLayout from '../components/layout';
import './QuizResultPage.css';

const QuizResultPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Luôn lấy kết quả từ State truyền tới
    const result = location.state?.result;

    if (!result) {
        return (
            <MainLayout>
                <div className="error-container" style={{ padding: '100px', textAlign: 'center' }}>
                    <p>No result data found.</p>
                    <Button onClick={() => navigate('/flashcard-sets')}>Go to My Sets</Button>
                </div>
            </MainLayout>
        );
    }

    const percentage = Math.round((result.score / result.totalQuestions) * 100);

    return (
        <MainLayout>
            <div className="result-page-container">
                <div className="result-header">
                    <button className="back-link" onClick={() => navigate(`/flashcard-sets/${result.setId}`)}>
                        <ChevronLeft size={20} />
                        Back to set
                    </button>
                    <h1>Quiz Results</h1>
                </div>

                <div className="result-summary-section">
                    <Card className="summary-card">
                        <div className="circular-progress" style={{ '--progress': `${percentage}%` }}>
                            <div className="inner-circle">
                                <span className="percentage">{percentage}%</span>
                                <span className="fraction">{result.score}/{result.totalQuestions}</span>
                            </div>
                        </div>
                        <div className="summary-info">
                            <h2>{percentage >= 80 ? 'Excellent Work!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}</h2>
                            <p>You answered {result.score} out of {result.totalQuestions} questions correctly.</p>
                            <div className="result-actions">
                                <Button onClick={() => navigate(`/quiz/${result.setId}`)}>
                                    <RefreshCcw size={18} />
                                    Try Again
                                </Button>
                                <Button variant="outline" onClick={() => navigate(`/flashcard-sets/${result.setId}`)}>
                                    <Home size={18} />
                                    Return to Set
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="items-breakdown">
                    <h2>Review your answers</h2>
                    <div className="items-list">
                        {result.items.map((item, idx) => (
                            <Card key={idx} className={`review-item ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                                <div className="status-marker">
                                    {item.isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                </div>
                                <div className="item-content">
                                    <div className="item-term">{item.term}</div>
                                    <div className="item-definition">
                                        <span className="label">{item.isCorrect ? 'Correct Answer:' : 'The definition was:'}</span>
                                        {item.definition}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default QuizResultPage;
