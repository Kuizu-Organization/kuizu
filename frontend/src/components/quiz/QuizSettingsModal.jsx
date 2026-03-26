import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { Button, Modal } from '../ui';
import './QuizSettingsModal.css';

const QuizSettingsModal = ({ isOpen, onClose, onStart, totalCards, isLoading = false }) => {
    const { setId } = useParams();
    const [numQuestions, setNumQuestions] = useState(Math.min(20, totalCards));
    const numInputRef = useRef(null);
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
        // Read directly from DOM to capture F12 tampering
        const inputDom = document.querySelector('.setting-input input') || numInputRef.current;

        const propValue = inputDom ? inputDom.value : numQuestions;
        const attrValue = inputDom ? inputDom.getAttribute('value') : null;

        let finalValue = propValue;
        if (attrValue && attrValue !== String(propValue)) {
            finalValue = attrValue;
        }

        const questionsCount = parseInt(finalValue);

        // Chặn sớm nếu rỗng hoặc 0 để Backend xử lý thông qua onStart (giúp đóng modal và hiện toast)
        if (!finalValue || isNaN(questionsCount) || questionsCount < 1) {
            onStart({
                numQuestions: finalValue,
                starredOnly,
                activeModes: Object.keys(modes).filter(m => modes[m]),
                answerDirection
            });
            return;
        }

        if (questionsCount > maxQuestions) {
            alert(`Maximum number of questions is ${maxQuestions}!`);
            return;
        }

        const activeModes = Object.keys(modes).filter(m => modes[m]);

        if (activeModes.length === 0) {
            alert('Please select at least one quiz mode!');
            return;
        }

        onStart({
            numQuestions: finalValue,
            starredOnly,
            activeModes,
            answerDirection
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Options"
            className="quiz-settings-modal"
        >
            <div className="quiz-settings-content">
                <div className="setting-row">
                    <div className="setting-label">
                        <span>Questions</span>
                        <span className="sub-label">(Max {maxQuestions})</span>
                    </div>
                    <div className="setting-input">
                        <input
                            ref={numInputRef}
                            type="number"
                            min="1"
                            max={maxQuestions}
                            value={numQuestions || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                    setNumQuestions('');
                                    return;
                                }
                                const num = parseInt(val);
                                if (!isNaN(num)) {
                                    // Tự động giới hạn số lượng tối đa khi nhập quá
                                    setNumQuestions(Math.min(maxQuestions, num));
                                }
                            }}
                            className="num-input"
                        />
                    </div>
                </div>

                <div className="setting-row toggle-row">
                    <div className="setting-label">
                        <span>Study starred terms only</span>
                        <span className="sub-label">({starredCount} starred cards)</span>
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
                            <span>True/False</span>
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
                            <span>Multiple Choice</span>
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
                            <span>Written</span>
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
                        <span>Question Options</span>
                    </div>

                    <div className="setting-row toggle-row sub-row">
                        <div className="setting-label">
                            <span>Answer with Definitions</span>
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
                            <span>Answer with Terms</span>
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
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        Start Learning
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default QuizSettingsModal;
