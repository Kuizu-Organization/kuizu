import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Dropdown, Textarea } from '../ui';
import { createClass } from '../../api/class';
import { getMyFolders } from '../../api/folder';
import { getMyFlashcardSets } from '../../api/flashcards';
import { useToast } from '../../context/ToastContext';
import { Folder, Layers, Check, ChevronDown, ChevronUp } from 'lucide-react';
import './CreateClassModal.css';
const CreateClassModal = ({ isOpen, onClose, onCreateSuccess }) => {
    const toast = useToast();
    const [className, setClassName] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('PUBLIC');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [folders, setFolders] = useState([]);
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [showMaterials, setShowMaterials] = useState(false);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMaterials();
            setClassName('');
            setDescription('');
            setVisibility('PUBLIC');
            setSelectedMaterials([]);
            setShowMaterials(false);
        }
    }, [isOpen]);

    const fetchMaterials = async () => {
        setIsLoadingMaterials(true);
        try {
            const [foldersData, setsData] = await Promise.all([
                getMyFolders(),
                getMyFlashcardSets()
            ]);
            setFolders(foldersData);
            setFlashcardSets(setsData);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
        } finally {
            setIsLoadingMaterials(false);
        }
    };

    const toggleMaterial = (type, id) => {
        const isSelected = selectedMaterials.some(m => m.materialType === type && m.materialRefId === id);
        if (isSelected) {
            setSelectedMaterials(selectedMaterials.filter(m => !(m.materialType === type && m.materialRefId === id)));
        } else {
            setSelectedMaterials([...selectedMaterials, { materialType: type, materialRefId: id }]);
        }
    };

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
                visibility,
                materials: selectedMaterials
            };

            const newClass = await createClass(classData);

            toast.success('Class created successfully!');

            // Success cleanup
            setClassName('');
            setDescription('');
            setVisibility('PUBLIC');
            setSelectedMaterials([]);
            setShowMaterials(false);

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

                    <div className="form-group slide-in" style={{ animationDelay: '0.3s' }}>
                        <label>Include Materials (Optional)</label>
                        <div className="suggested-materials-list">
                            {isLoadingMaterials ? (
                                <div className="loading-sets">Loading materials...</div>
                            ) : folders.length === 0 && flashcardSets.length === 0 ? (
                                <div className="empty-sets-msg">You don't have any materials yet.</div>
                            ) : (
                                <>
                                    {folders.map(folder => {
                                        const isSelected = selectedMaterials.some(m => m.materialType === 'FOLDER' && m.materialRefId === folder.folderId);
                                        return (
                                            <div 
                                                key={`folder-${folder.folderId}`} 
                                                className={`suggested-material-item ${isSelected ? 'selected' : ''}`}
                                                onClick={() => toggleMaterial('FOLDER', folder.folderId)}
                                            >
                                                <div className="material-item-main">
                                                    <Folder size={16} className="material-icon folder-icon" />
                                                    <div className="material-info-minimal">
                                                        <div className="material-title">{folder.name}</div>
                                                        <div className="material-desc">Folder</div>
                                                    </div>
                                                </div>
                                                <div className="material-checkbox">
                                                    {isSelected && <Check size={14} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {flashcardSets.map(set => {
                                        const isSelected = selectedMaterials.some(m => m.materialType === 'FLASHCARD_SET' && m.materialRefId === set.setId);
                                        return (
                                            <div 
                                                key={`set-${set.setId}`} 
                                                className={`suggested-material-item ${isSelected ? 'selected' : ''}`}
                                                onClick={() => toggleMaterial('FLASHCARD_SET', set.setId)}
                                            >
                                                <div className="material-item-main">
                                                    <Layers size={16} className="material-icon set-icon" />
                                                    <div className="material-info-minimal">
                                                        <div className="material-title">{set.title}</div>
                                                        <div className="material-desc">{set.termCount} terms</div>
                                                    </div>
                                                </div>
                                                <div className="material-checkbox">
                                                    {isSelected && <Check size={14} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CreateClassModal;
