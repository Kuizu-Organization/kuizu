import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import { getAvailableSets, addSetToFolder } from '@/api/folder';
import { useToast } from '@/context/ToastContext';
import { BookOpen, Plus, Loader2 } from 'lucide-react';
import './AddSetToFolderModal.css';

const AddSetToFolderModal = ({ isOpen, onClose, folderId, onSetAdded, category }) => {
    const toast = useToast();
    const [availableSets, setAvailableSets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [addingSetId, setAddingSetId] = useState(null);

    useEffect(() => {
        if (isOpen && folderId) {
            fetchAvailableSets();
        }
    }, [isOpen, folderId]);

    const fetchAvailableSets = async () => {
        try {
            setIsLoading(true);
            const data = await getAvailableSets(folderId);
            setAvailableSets(data);
        } catch (error) {
            console.error("Failed to fetch available sets:", error);
            toast.error("Failed to load sets");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSet = async (setId) => {
        try {
            setAddingSetId(setId);
            await addSetToFolder(folderId, setId, category);
            toast.success("Set added to folder!");
            setAvailableSets(prev => prev.filter(s => s.setId !== setId));
            if (onSetAdded) {
                onSetAdded();
            }
        } catch (error) {
            console.error("Failed to add set:", error);
            toast.error(error.response?.data?.message || "Failed to add set");
        } finally {
            setAddingSetId(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add set to folder"
            size="md"
        >
            <div className="add-set-content">
                {isLoading ? (
                    <div className="add-set-loading">
                        <Loader2 size={24} className="spin" />
                        <p>Loading...</p>
                    </div>
                ) : availableSets.length > 0 ? (
                    <div className="add-set-list">
                        {availableSets.map(set => (
                            <div key={set.setId} className="add-set-item">
                                <div className="add-set-item-info">
                                    <BookOpen size={18} className="add-set-icon" />
                                    <div className="add-set-item-text">
                                        <h4>{set.title}</h4>
                                        <span className="add-set-meta">
                                            {set.termCount} terms
                                            {set.description && ` · ${set.description}`}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleAddSet(set.setId)}
                                    disabled={addingSetId === set.setId}
                                    isLoading={addingSetId === set.setId}
                                >
                                    <Plus size={14} style={{ marginRight: 4 }} />
                                    Add
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="add-set-empty">
                        <BookOpen size={32} color="var(--text-light)" />
                        <p>No available sets</p>
                        <span className="add-set-empty-hint">
                            All your sets have been added to this folder
                        </span>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AddSetToFolderModal;
