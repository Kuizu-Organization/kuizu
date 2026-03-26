import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import { createFolder, getMySets } from '../../api/folder';
import { useToast } from '../../context/ToastContext';
import { BookOpen, Check, Plus } from 'lucide-react';
import './CreateFolderModal.css';

const CreateFolderModal = ({ isOpen, onClose, onCreateSuccess }) => {
    const toast = useToast();
    const [folderName, setFolderName] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('PUBLIC');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [mySets, setMySets] = useState([]);
    const [selectedSetIds, setSelectedSetIds] = useState([]);
    const [isLoadingSets, setIsLoadingSets] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setFolderName('');
            setDescription('');
            setVisibility('PUBLIC');
            setSelectedSetIds([]);
            setError(null);
            const fetchSets = async () => {
                setIsLoadingSets(true);
                try {
                    const data = await getMySets();
                    setMySets(data);
                } catch (error) {
                    console.error('Failed to fetch user sets:', error);
                } finally {
                    setIsLoadingSets(false);
                }
            };
            fetchSets();
        }
    }, [isOpen]);

    const toggleSetSelection = (setId) => {
        setSelectedSetIds(prev =>
            prev.includes(setId)
                ? prev.filter(id => id !== setId)
                : [...prev, setId]
        );
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (isSubmitting) return;

        if (!folderName.trim()) {
            toast.error('Folder name is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const folderData = {
                name: folderName,
                description,
                visibility,
                setIds: selectedSetIds
            };

            const newFolder = await createFolder(folderData);
            toast.success('Folder created successfully!');

            if (onCreateSuccess) {
                onCreateSuccess(newFolder);
            }
            onClose();

        } catch (error) {
            console.error('Failed to create folder:', error);
            const message = error.response?.data?.message || 'Failed to create folder';
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <div className="create-folder-actions">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !folderName.trim()}
                isLoading={isSubmitting}
            >
                Create Folder
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create new folder"
            size="md"
            footer={footer}
        >
            <div className="create-folder-content">
                {error && (
                    <div className="modal-error-message">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className={`form-group slide-in ${error ? 'error-input' : ''}`}>
                        <label>Folder name *</label>
                        <Input
                            placeholder="e.g., Semester 1 Materials"
                            value={folderName}
                            onChange={(e) => {
                                setFolderName(e.target.value);
                                if (error) setError(null);
                            }}
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-group slide-in" style={{ animationDelay: '0.1s' }}>
                        <label>Description (Optional)</label>
                        <textarea
                            className="create-folder-textarea"
                            placeholder="Describe the folder contents..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                        ></textarea>
                    </div>

                    <div className="form-group slide-in" style={{ animationDelay: '0.15s' }}>
                        <label>Suggested sets (Optional)</label>
                        <div className="suggested-sets-list">
                            {isLoadingSets ? (
                                <div className="loading-sets">Loading sets...</div>
                            ) : mySets.length === 0 ? (
                                <div className="empty-sets-msg">You don't have any sets yet.</div>
                            ) : (
                                mySets.map(set => (
                                    <div
                                        key={set.setId}
                                        className={`suggested-set-item ${selectedSetIds.includes(set.setId) ? 'selected' : ''}`}
                                    >
                                        <div className="set-item-left">
                                            <BookOpen size={16} className="set-icon" />
                                            <div className="set-info">
                                                <div className="suggested-set-title">{set.title}</div>
                                                <div className="suggested-set-subtitle">
                                                    {set.termCount} terms {set.ownerDisplayName && ` · by ${set.ownerDisplayName}`}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            className={`set-add-btn ${selectedSetIds.includes(set.setId) ? 'added' : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleSetSelection(set.setId);
                                            }}
                                        >
                                            {selectedSetIds.includes(set.setId) ? (
                                                <><Check size={14} /> Added</>
                                            ) : (
                                                <><Plus size={14} /> Add</>
                                            )}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="form-group slide-in" style={{ animationDelay: '0.2s' }}>
                        <label>Visibility</label>
                        <div className="visibility-options">
                            <div
                                className={`visibility-option ${visibility === 'PUBLIC' ? 'active' : ''}`}
                                onClick={() => setVisibility('PUBLIC')}
                            >
                                <div className="visibility-radio">
                                    <div className={`radio-dot ${visibility === 'PUBLIC' ? 'checked' : ''}`}></div>
                                </div>
                                <div className="visibility-text">
                                    <span className="visibility-label">🌐 Public</span>
                                    <span className="visibility-desc">Anyone can view this folder</span>
                                </div>
                            </div>
                            <div
                                className={`visibility-option ${visibility === 'PRIVATE' ? 'active' : ''}`}
                                onClick={() => setVisibility('PRIVATE')}
                            >
                                <div className="visibility-radio">
                                    <div className={`radio-dot ${visibility === 'PRIVATE' ? 'checked' : ''}`}></div>
                                </div>
                                <div className="visibility-text">
                                    <span className="visibility-label">🔒 Private</span>
                                    <span className="visibility-desc">Only you can view this folder</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CreateFolderModal;
