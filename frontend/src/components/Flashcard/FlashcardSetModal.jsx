import React, { useState, useEffect } from 'react';
import { Save, Loader, Globe, Lock, Link } from 'lucide-react';
import { getFlashcardSetById, createFlashcardSet, updateFlashcardSet } from '../../api/flashcards';
import { Button, Input, Modal, Textarea, Dropdown } from '../ui';
import './FlashcardModal.css';

const FlashcardSetModal = ({ isOpen, onClose, setId, onSuccess }) => {
    const isEdit = !!setId;
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'PUBLIC'
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && isEdit) {
            fetchSet();
        } else if (isOpen && !isEdit) {
            setFormData({
                title: '',
                description: '',
                visibility: 'PUBLIC'
            });
            setError(null);
        }
    }, [isOpen, setId]);

    const visibilityItems = [
        { label: 'Public (Everyone can see)', value: 'PUBLIC', icon: <Globe size={16} /> },
        { label: 'Private (Only you can see)', value: 'PRIVATE', icon: <Lock size={16} /> },
        { label: 'Unlisted (Anyone with the link can see)', value: 'UNLISTED', icon: <Link size={16} /> }
    ];

    const currentVisibility = visibilityItems.find(item => item.value === formData.visibility) || visibilityItems[0];

    const fetchSet = async () => {
        try {
            setLoading(true);
            const data = await getFlashcardSetById(setId);
            setFormData({
                title: data.title,
                description: data.description || '',
                visibility: data.visibility || 'PUBLIC'
            });
        } catch (err) {
            setError('Failed to load set data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVisibilityChange = (item) => {
        setFormData(prev => ({ ...prev, visibility: item.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);

            let result;
            if (isEdit) {
                result = await updateFlashcardSet(setId, formData);
            } else {
                result = await createFlashcardSet(formData);
            }
            
            if (onSuccess) onSuccess(result);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const footer = (
        <div className="modal-actions-custom">
            <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={submitting}
            >
                Cancel
            </Button>
            <Button
                type="submit"
                form="flashcard-set-form"
                disabled={submitting || loading}
                className="submit-btn"
            >
                {submitting ? <Loader size={18} className="animate-spin" /> : <><Save size={18} /> {isEdit ? 'Save Changes' : 'Create Set'}</>}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Flashcard Set' : 'Create New Set'}
            footer={footer}
            size="md"
        >
            {loading ? (
                <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>
            ) : (
                <form id="flashcard-set-form" onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="error-msg mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

                    <div className="form-group mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <Input
                            id="title"
                            name="title"
                            placeholder='e.g. "Biology 101: Cell Structure"'
                            value={formData.title}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                    </div>

                    <div className="form-group mb-4">
                        <Textarea
                            id="description"
                            name="description"
                            label="Description (Optional)"
                            rows="4"
                            placeholder="What is this set about?"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                        />
                    </div>

                    <div className="form-group mb-2">
                        <Dropdown
                            formLabel="Visibility"
                            variant="select"
                            label={
                                <div className="flex items-center gap-2">
                                    {currentVisibility.icon}
                                    <span>{currentVisibility.label}</span>
                                </div>
                            }
                            items={visibilityItems}
                            onItemClick={handleVisibilityChange}
                            className="w-full"
                        />
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default FlashcardSetModal;
