import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import { useToast } from '../../context/ToastContext';
import { getMyFolders } from '../../api/folder';
import { getMyFlashcardSets } from '../../api/flashcards';
import { addClassMaterial } from '../../api/class';
import { Folder, Layers, CheckCircle } from 'lucide-react';
import './AddClassMaterialModal.css';

const AddClassMaterialModal = ({ isOpen, onClose, classId, onMaterialAdded }) => {
    const toast = useToast();
    const [materialType, setMaterialType] = useState('FOLDER'); // 'FOLDER' or 'FLASHCARD_SET'
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMaterialId, setSelectedMaterialId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMaterials(materialType);
            setSelectedMaterialId(null);
        }
    }, [isOpen, materialType]);

    const fetchMaterials = async (type) => {
        setIsLoading(true);
        try {
            let data = [];
            if (type === 'FOLDER') {
                data = await getMyFolders();
            } else {
                data = await getMyFlashcardSets();
            }
            setMaterials(data);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
            toast.error('Failed to load your materials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedMaterialId) return;

        setIsSubmitting(true);
        try {
            const requestData = {
                materialType,
                materialRefId: selectedMaterialId
            };
            
            const newMaterial = await addClassMaterial(classId, requestData);
            toast.success('Material added successfully!');
            
            if (onMaterialAdded) {
                // To display optimistic names, we can pass the title we have
                const sel = materials.find(m => (m.folderId || m.setId) === selectedMaterialId);
                const materialName = materialType === 'FOLDER' ? sel?.name : sel?.title;
                onMaterialAdded({ ...newMaterial, materialName });
            }
            onClose();
        } catch (error) {
            console.error('Failed to add material:', error);
            toast.error(error.response?.data?.message || 'Failed to add material to class');
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <div className="join-modal-actions">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedMaterialId}
                isLoading={isSubmitting}
            >
                Add Material
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Material to Class"
            size="md"
            footer={footer}
        >
            <div className="add-material-content">
                <div className="material-type-selector">
                    <button 
                        className={`type-btn ${materialType === 'FOLDER' ? 'active' : ''}`}
                        onClick={() => setMaterialType('FOLDER')}
                    >
                        Folders
                    </button>
                    <button 
                        className={`type-btn ${materialType === 'FLASHCARD_SET' ? 'active' : ''}`}
                        onClick={() => setMaterialType('FLASHCARD_SET')}
                    >
                        Flashcard Sets
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="spinner"></div>
                    </div>
                ) : materials.length > 0 ? (
                    <div className="material-list">
                        {materials.map(item => {
                            const id = materialType === 'FOLDER' ? item.folderId : item.setId;
                            const title = materialType === 'FOLDER' ? item.name : item.title;
                            const desc = item.description || 'No description';
                            const isSelected = selectedMaterialId === id;

                            return (
                                <div 
                                    key={id} 
                                    className={`material-list-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => setSelectedMaterialId(id)}
                                >
                                    <div className="material-item-info">
                                        <div className="material-item-icon">
                                            {materialType === 'FOLDER' ? <Folder size={20} /> : <Layers size={20} />}
                                        </div>
                                        <div className="material-item-details">
                                            <h4>{title}</h4>
                                            <p>{desc}</p>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="text-primary-600">
                                            <CheckCircle size={20} className="text-blue-500"/>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-materials-msg">
                        <p>You don't have any {materialType === 'FOLDER' ? 'folders' : 'flashcard sets'} yet.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AddClassMaterialModal;
