import React, { useState } from 'react';
import { Modal, Button, Input, Dropdown, Textarea } from '../ui';
import { createClass } from '../../api/class';
import { useToast } from '../../context/ToastContext';
import './CreateClassModal.css';

const CreateClassModal = ({ isOpen, onClose, onCreateSuccess }) => {
    const toast = useToast();
    const [className, setClassName] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('PUBLIC');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const visibilityOptions = [
        { label: 'Public', value: 'PUBLIC' },
        { label: 'Private', value: 'PRIVATE' },
    ];

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (isSubmitting) return;

        if (!className.trim()) {
            showToast('Class name is required', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const classData = {
                className,
                description,
                visibility
            };

            const newClass = await createClass(classData);

            toast.success('Class created successfully!');

            // Success cleanup
            setClassName('');
            setDescription('');
            setVisibility('PUBLIC');

            // Notify parent and CLOSE modal
            if (onCreateSuccess) {
                onCreateSuccess(newClass);
            }
            onClose();

        } catch (error) {
            console.error('Failed to create class:', error);
            showToast(error.response?.data?.message || 'Failed to create class', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <div className="create-class-actions">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !className.trim()}
                isLoading={isSubmitting}
            >
                Create Class
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create a New Class"
            size="md"
            footer={footer}
        >
            <div className="create-class-content">
                <form onSubmit={handleSubmit}>
                    <Input
                        className="slide-in"
                        label="Class Name *"
                        placeholder="e.g. Introduction to Computer Science"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        autoFocus
                        required
                    />

                    <Textarea
                        className="slide-in"
                        style={{ animationDelay: '0.1s' }}
                        label="Description (Optional)"
                        placeholder="What is this class about?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />

                    <Dropdown
                        className="slide-in w-full"
                        style={{ animationDelay: '0.2s' }}
                        formLabel="Visibility"
                        variant="select"
                        label={visibilityOptions.find(opt => opt.value === visibility).label}
                        items={visibilityOptions}
                        onItemClick={(item) => setVisibility(item.value)}
                        helpText={visibility === 'PUBLIC'
                            ? 'Anyone can find and request to join this class.'
                            : 'Only people with the join code can find and join this class.'}
                    />
                </form>
            </div>
        </Modal>
    );
};

export default CreateClassModal;
