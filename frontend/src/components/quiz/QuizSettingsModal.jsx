import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { Button, Modal } from '../ui';
import './QuizSettingsModal.css';

const QuizSettingsModal = ({ isOpen, onClose, onStart, totalCards }) => {
    const { setId } = useParams();
    const [numQuestions, setNumQuestions] = useState(Math.min(20, totalCards));
    const [starredOnly, setStarredOnly] = useState(false);
    const [starredCount, setStarredCount] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const savedStarred = localStorage.getItem(`starred_cards_${setId}`);
            if (savedStarred) {
                const count = JSON.parse(savedStarred).length;
                setStarredCount(count);
            } else {
                setStarredCount(0);
            }
        }
    }, [isOpen, setId]);

    const maxQuestions = starredOnly ? (starredCount || 1) : totalCards;

    useEffect(() => {
        if (starredOnly) {
            setNumQuestions(prev => Math.min(prev, starredCount || 1));
        }
    }, [starredOnly, starredCount]);
    const [modes, setModes] = useState({
        TRUE_FALSE: false,
        MULTIPLE_CHOICE: true, // Default
        WRITTEN: false
    });

    const [answerDirection, setAnswerDirection] = useState('DEFINITION'); // 'DEFINITION' or 'TERM'

    const toggleMode = (mode) => {
        setModes({
            ...modes,
            [mode]: !modes[mode]
        });
    };

    const handleStart = () => {
        // Find which modes are active
        const activeModes = Object.keys(modes).filter(m => modes[m]);
        
        if (activeModes.length === 0) {
            alert('Vui lòng chọn ít nhất một hình thức làm bài!');
            return;
        }

        onStart({
            numQuestions: parseInt(numQuestions),
            starredOnly,
            activeModes,
            answerDirection
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tùy chọn"
            className="quiz-settings-modal"
        >
            <div className="quiz-settings-content">
                <div className="setting-row">
                    <div className="setting-label">
                        <span>Câu hỏi</span>
                        <span className="sub-label">(Tối đa {maxQuestions})</span>
                    </div>
                    <div className="setting-input">
                        <input
                            type="number"
                            min="1"
                            max={maxQuestions}
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Math.min(maxQuestions, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="num-input"
                        />
                    </div>
                </div>

                <div className="setting-row toggle-row">
                    <div className="setting-label">
                        <span>Chỉ học thuật ngữ có gắn sao</span>
                        <span className="sub-label">({starredCount} thẻ đã gắn sao)</span>
                    </div>
                    <div className="setting-toggle">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={starredOnly}
                                onChange={() => setStarredOnly(!starredOnly)}
                                disabled={starredCount === 0}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <div className="settings-divider"></div>

                <div className="mode-options">
                    <div className="setting-row toggle-row">
                        <div className="setting-label">
                            <span>Đúng/Sai</span>
                        </div>
                        <div className="setting-toggle">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={modes.TRUE_FALSE}
                                    onChange={() => toggleMode('TRUE_FALSE')}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <div className="setting-row toggle-row">
                        <div className="setting-label">
                            <span>Trắc nghiệm</span>
                        </div>
                        <div className="setting-toggle">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={modes.MULTIPLE_CHOICE}
                                    onChange={() => toggleMode('MULTIPLE_CHOICE')}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <div className="setting-row toggle-row">
                        <div className="setting-label">
                            <span>Tự luận</span>
                        </div>
                        <div className="setting-toggle">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={modes.WRITTEN}
                                    onChange={() => toggleMode('WRITTEN')}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="settings-divider"></div>

                <div className="direction-options">
                    <div className="setting-label direction-title">
                        <span>Định dạng câu hỏi</span>
                    </div>
                    
                    <div className="setting-row toggle-row sub-row">
                        <div className="setting-label">
                            <span>Trả lời bằng Định nghĩa</span>
                        </div>
                        <div className="setting-toggle">
                            <input
                                type="radio"
                                name="direction"
                                checked={answerDirection === 'DEFINITION'}
                                onChange={() => setAnswerDirection('DEFINITION')}
                                className="styled-radio"
                            />
                        </div>
                    </div>

                    <div className="setting-row toggle-row sub-row">
                        <div className="setting-label">
                            <span>Trả lời bằng Thuật ngữ</span>
                        </div>
                        <div className="setting-toggle">
                            <input
                                type="radio"
                                name="direction"
                                checked={answerDirection === 'TERM'}
                                onChange={() => setAnswerDirection('TERM')}
                                className="styled-radio"
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <Button
                        variant="primary"
                        className="start-quiz-submit-btn"
                        onClick={handleStart}
                    >
                        Bắt đầu bài kiểm tra
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default QuizSettingsModal;
