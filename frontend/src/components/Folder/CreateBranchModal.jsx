import React, { useState } from 'react';
import { X, Plus, Lightbulb, GitBranch } from 'lucide-react';
import { Button } from '../ui';
import './CreateBranchModal.css';

const SUGGESTIONS = [
    'Unit 1',
    'Unit 2',
    'Chapter 1',
    'Midterm Exam',
    'Final Exam',
    'Vocabulary'
];

const CreateBranchModal = ({ isOpen, onClose, onCreateSuccess }) => {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter a branch name');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await onCreateSuccess(name);
            setName('');
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create branch');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cb-modal-overlay">
            <div className="cb-modal-content">
                <div className="cb-modal-header">
                    <h2>New Branch</h2>
                    <button className="cb-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="cb-modal-body">
                    <div className="cb-input-group">
                        <input
                            type="text"
                            placeholder="Branch Name (e.g. Unit 1)"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError('');
                            }}
                            autoFocus
                        />
                        {error && <p className="cb-error-msg">{error}</p>}
                    </div>

                    <div className="cb-suggestions-section">
                        <div className="cb-suggestions-title">
                            <Lightbulb size={16} />
                            <span>Suggestions</span>
                        </div>
                        <div className="cb-suggestions-list">
                            {SUGGESTIONS.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    className={`cb-suggestion-chip ${name === suggestion ? 'active' : ''}`}
                                    onClick={() => setName(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="cb-modal-footer">
                        <Button 
                            type="submit" 
                            variant="primary" 
                            isLoading={isLoading}
                            fullWidth
                        >
                            Create Branch
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBranchModal;
