import React, { useState, useEffect } from 'react';
import { Save, Loader, AlertCircle } from 'lucide-react';
import { getFlashcardById, createFlashcard, updateFlashcard } from '@/api/flashcards';
import { Button, Input, Modal, Textarea } from '@/components/ui';
import './FlashcardModal.css';

const FlashcardModal = ({ isOpen, onClose, setId, cardId, onSuccess, existingCards = [] }) => {
    const isEdit = !!cardId;
    const [formData, setFormData] = useState({
        term: '',
        definition: '',
        orderNumber: '' // Use string to handle empty/human-friendly input (1-based)
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [duplicateError, setDuplicateError] = useState(null);

    useEffect(() => {
        if (isOpen && isEdit) {
            fetchCard();
        } else if (isOpen && !isEdit) {
            setFormData({
                term: '',
                definition: '',
                orderNumber: ''
            });
            setError(null);
            setDuplicateError(null);
        }
    }, [isOpen, cardId]);

    const fetchCard = async () => {
        try {
            setLoading(true);
            const data = await getFlashcardById(cardId);
            setFormData({
                term: data.term,
                definition: data.definition,
                // index 0 -> number 1
                orderNumber: (data.orderIndex !== null && data.orderIndex !== undefined) ? (data.orderIndex + 1).toString() : ''
            });
        } catch (err) {
            setError('Failed to load flashcard data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'orderNumber') {
            setDuplicateError(null);
            // Check for duplicate in existingCards (excluding current card if editing)
            if (value !== '') {
                const num = parseInt(value, 10);
                if (!isNaN(num)) {
                    const internalIndex = num - 1;
                    const isDuplicate = existingCards.some(card =>
                        card.orderIndex === internalIndex && card.cardId !== cardId
                    );
                    if (isDuplicate) {
                        setDuplicateError(`Card with order number ${num} already exists in this set.`);
                    }
                }
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (duplicateError) return;

        try {
            setSubmitting(true);
            setError(null);

            // Convert orderNumber (1-based) back to orderIndex (0-based) for API
            const orderIndex = formData.orderNumber !== '' ? parseInt(formData.orderNumber, 10) - 1 : null;

            const payload = {
                term: formData.term,
                definition: formData.definition,
                orderIndex: orderIndex
            };

            let result;
            if (isEdit) {
                result = await updateFlashcard(cardId, payload);
            } else {
                if (!setId) {
                    setError('Set ID is required to create a card.');
                    setSubmitting(false);
                    return;
                }
                result = await createFlashcard(setId, payload);
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
                disabled={submitting || loading || !!duplicateError}
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
                        <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Order (Optional)</label>
                        <Input
                            id="orderNumber"
                            name="orderNumber"
                            type="number"
                            min="1"
                            placeholder="Auto (next available)"
                            value={formData.orderNumber}
                            onChange={handleChange}
                            fullWidth
                            className={duplicateError ? 'border-red-500' : ''}
                        />
                        {duplicateError && (
                            <div className="order-field-info mt-2">
                                <div className="order-error-badge">
                                    <AlertCircle size={14} />
                                    <span>{duplicateError}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default FlashcardModal;
