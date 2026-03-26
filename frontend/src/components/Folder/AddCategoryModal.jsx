import React, { useState } from 'react';
import { Modal, Button, Input } from '../ui';
import { addFolderCategory } from '../../api/folder';
import { useToast } from '../../context/ToastContext';
import './AddCategoryModal.css';

const AddCategoryModal = ({ isOpen, onClose, folderId, onCategoryAdded, currentCategories = [] }) => {
    const [categoryName, setCategoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const recommendedTags = [
        "Exam 1", "Midterm", "Final Exam", "Quiz 1", "Unit 1", "Homework", "Review"
    ];

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        const trimmedName = categoryName.trim();
        if (!trimmedName) {
            toast.error("Please enter a tag name");
            return;
        }

        if (currentCategories.includes(trimmedName)) {
            toast.error("This tag already exists in this folder");
            return;
        }

        setIsSubmitting(true);
        try {
            await addFolderCategory(folderId, trimmedName);
            toast.success(`Tag "${trimmedName}" added`);
            setCategoryName('');
            onCategoryAdded();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add tag");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTagClick = (tag) => {
        setCategoryName(tag);
    };

    const footer = (
        <div className="ac-modal-footer">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button 
                variant="primary" 
                onClick={handleSubmit} 
                isLoading={isSubmitting}
                disabled={!categoryName.trim()}
            >
                Add
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="New Tag"
            size="sm"
            footer={footer}
        >
            <div className="ac-modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="ac-form-group">
                        <Input 
                            placeholder="Tag name"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            autoFocus
                        />
                    </div>
                </form>

                {currentCategories.length > 0 && (
                    <div className="ac-section">
                        <label className="ac-section-label">Current Tags</label>
                        <div className="ac-tags-list">
                            {currentCategories.map(cat => (
                                <span key={cat} className="ac-tag-pill active">{cat}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="ac-section">
                    <label className="ac-section-label">Recommended</label>
                    <div className="ac-tags-list">
                        {recommendedTags
                            .filter(tag => !currentCategories.includes(tag))
                            .map(tag => (
                                <button 
                                    key={tag} 
                                    className="ac-tag-pill" 
                                    onClick={() => handleTagClick(tag)}
                                    type="button"
                                >
                                    {tag}
                                </button>
                            ))
                        }
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddCategoryModal;
