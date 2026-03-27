import React, { useState, useEffect } from 'react';
import { Save, Loader, Globe, Lock, Link } from 'lucide-react';
import { getFlashcardSetById, createFlashcardSet, updateFlashcardSet } from '@/api/flashcards';
import { Button, Input, Modal, Textarea, Dropdown } from '@/components/ui';
import { useModal } from '@/context/ModalContext';
import { useToast } from '@/context/ToastContext';
import './FlashcardModal.css';

const FlashcardSetModal = ({ isOpen, onClose, setId, onSuccess }) => {
    const isEdit = !!setId;
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'PUBLIC'
    });
    const { openShareModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const toast = useToast();

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
        if (name === 'title' && value.length > 50) return; // Prevent typing more than 50 chars
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
            toast.success(`Flashcard set ${isEdit ? 'updated' : 'created'} successfully!`);
            onClose();

            if (formData.visibility === 'UNLISTED') {
                setTimeout(() => openShareModal(result), 300);
            }
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
                isLoading={submitting}
                disabled={loading}
                className="submit-btn"
            >
                {isEdit ? 'Save Changes' : 'Create Set'}
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
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}><Loader className="animate-spin" style={{ color: 'var(--primary)' }} size={32} /></div>
            ) : (
                <form id="flashcard-set-form" onSubmit={handleSubmit} className="modal-form" style={{ padding: '0 4px' }}>
                    {error && (
                        <div className="custom-alert-box">
                            <span className="alert-dot" />
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label htmlFor="title" className="form-label-custom">
                                Set Title <span className="required-asterisk">*</span>
                            </label>
                            <Input
                                id="title"
                                name="title"
                                placeholder='e.g. "Biology 101: Cell Structure"'
                                value={formData.title}
                                onChange={handleChange}
                                required
                                fullWidth
                                maxLength={50}
                                style={{ marginBottom: 0 }}
                                rightIcon={
                                    <div className={`char-counter-badge ${
                                        formData.title.length >= 50 
                                        ? 'error' 
                                        : formData.title.length >= 40
                                        ? 'warning'
                                        : 'default'
                                    }`}>
                                        {formData.title.length} <span style={{ opacity: 0.3, margin: '0 2px' }}>/</span> 50
                                    </div>
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label-custom" >
                                Description
                            </label>
                            <Textarea
                                id="description"
                                name="description"
                                rows="3"
                                placeholder="What is this set about? Add some context for study buddies..."
                                value={formData.description}
                                onChange={handleChange}
                                fullWidth
                                style={{ marginBottom: 0 }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label-custom" >
                                Visibility & Privacy
                            </label>
                            <Dropdown
                                variant="select"
                                label={
                                    <div className="visibility-label-wrapper">
                                        <div className="visibility-icon-container">
                                            {React.cloneElement(currentVisibility.icon, { size: 18 })}
                                        </div>
                                        <div className="visibility-text-container">
                                            <span className="visibility-title">{currentVisibility.label.split(' (')[0]}</span>
                                            <span className="visibility-desc">
                                                {currentVisibility.label.includes('(') ? currentVisibility.label.split('(')[1].replace(')', '') : ''}
                                            </span>
                                        </div>
                                    </div>
                                }
                                items={visibilityItems.map(item => ({
                                    ...item,
                                    label: (
                                        <div style={{ display: 'flex', flexDirection: 'column', padding: '2px 0' }}>
                                            <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{item.label.split(' (')[0]}</span>
                                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '400' }}>{item.label.split('(')[1]?.replace(')', '')}</span>
                                        </div>
                                    )
                                }))}
                                onItemClick={handleVisibilityChange}
                                className="w-full"
                            />
                        </div>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default FlashcardSetModal;
