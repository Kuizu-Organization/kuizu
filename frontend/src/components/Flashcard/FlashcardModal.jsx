import React, { useState, useEffect } from 'react';
import { Save, Loader } from 'lucide-react';
import { getFlashcardById, createFlashcard, updateFlashcard } from '@/api/flashcards';
import { Button, Input, Modal, Textarea } from '../ui';
import './FlashcardModal.css';

const FlashcardModal = ({ isOpen, onClose, setId, cardId, onSuccess }) => {
    const isEdit = !!cardId;
    const [formData, setFormData] = useState({
        term: '',
        definition: '',
        orderIndex: 0
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && isEdit) {
            fetchCard();
        } else if (isOpen && !isEdit) {
            setFormData({
                term: '',
                definition: '',
                orderIndex: 0
            });
            setError(null);
        }
    }, [isOpen, cardId]);

    const fetchCard = async () => {
        try {
            setLoading(true);
            const data = await getFlashcardById(cardId);
            setFormData({
                term: data.term,
                definition: data.definition,
                orderIndex: data.orderIndex || 0
            });
        } catch (err) {
            setError('Failed to load flashcard data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);

            let result;
            if (isEdit) {
                result = await updateFlashcard(cardId, formData);
            } else {
                if (!setId) {
                    setError('Set ID is required to create a card.');
                    setSubmitting(false);
                    return;
                }
                result = await createFlashcard(setId, formData);
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
                form="flashcard-card-form"
                disabled={submitting || loading}
                className="submit-btn"
            >
                {submitting ? <Loader size={18} className="animate-spin" /> : <><Save size={18} /> {isEdit ? 'Save Changes' : 'Add Card'}</>}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Flashcard' : 'Add New Flashcard'}
            footer={footer}
            size="md"
        >
            {loading ? (
                <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>
            ) : (
                <form id="flashcard-card-form" onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="error-msg mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

                    <div className="form-group mb-4">
                        <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                        <Input
                            id="term"
                            name="term"
                            placeholder="Enter the concept or word..."
                            value={formData.term}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                    </div>

                    <div className="form-group mb-4">
                        <Textarea
                            id="definition"
                            name="definition"
                            label="Definition"
                            rows="4"
                            placeholder="Enter the explanation..."
                            value={formData.definition}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                    </div>

                    <div className="form-group mb-2">
                        <label htmlFor="orderIndex" className="block text-sm font-medium text-gray-700 mb-1">Order Index (Optional)</label>
                        <Input
                            id="orderIndex"
                            name="orderIndex"
                            type="number"
                            value={formData.orderIndex}
                            onChange={handleChange}
                            fullWidth
                        />
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default FlashcardModal;
