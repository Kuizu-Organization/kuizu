import React, { useState } from 'react';
import { X, Plus, Lightbulb } from 'lucide-react';
import { Button } from '../ui';
import './CreateSetInFolderModal.css';

const SUGGESTIONS = [
    'Exam 1',
    'Exam 2',
    'Midterm',
    'Final Exam',
    'Quiz 1',
    'Unit 1'
];

const CreateSetInFolderModal = ({ isOpen, onClose, onCreateSuccess, folderId }) => {
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Please enter a set title');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await onCreateSuccess(title);
            setTitle('');
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create set');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setTitle(suggestion);
        setError('');
    };

    return (
        <div className="cs-modal-overlay">
            <div className="cs-modal-content">
                <div className="cs-modal-header">
                    <h2>New Set</h2>
                    <button className="cs-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="cs-modal-body">
                    <div className="cs-input-group">
                        <input
                            type="text"
                            placeholder="Set Name"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (error) setError('');
                            }}
                            autoFocus
                        />
                        {error && <p className="cs-error-msg">{error}</p>}
                    </div>

                    <div className="cs-suggestions-section">
                        <div className="cs-suggestions-title">
                            <Lightbulb size={16} />
                            <span>Recommended</span>
                        </div>
                        <div className="cs-suggestions-list">
                            {SUGGESTIONS.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    className={`cs-suggestion-chip ${title === suggestion ? 'active' : ''}`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="cs-modal-footer">
                        <Button 
                            type="submit" 
                            variant="primary" 
                            isLoading={isLoading}
                            fullWidth
                        >
                            Create
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSetInFolderModal;
