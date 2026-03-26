import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import { useToast } from '@/context/ToastContext';
import { getMyFolders } from '@/api/folder';
import { getMyFlashcardSets } from '@/api/flashcards';
import { addClassMaterial } from '@/api/class';
import { Folder, Layers, Plus, Loader2 } from 'lucide-react';
import './AddClassMaterialModal.css';

const AddClassMaterialModal = ({ isOpen, onClose, classId, onMaterialAdded }) => {
    const toast = useToast();
    const [materialType, setMaterialType] = useState('FOLDER'); // 'FOLDER' or 'FLASHCARD_SET'
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [addingMaterialId, setAddingMaterialId] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchMaterials(materialType);
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

    const handleAddMaterial = async (id) => {
        setAddingMaterialId(id);
        try {
            const requestData = {
                materialType,
                materialRefId: id
            };

            const newMaterial = await addClassMaterial(classId, requestData);
            toast.success('Material added successfully!');

            setMaterials(prev => prev.filter(m => (materialType === 'FOLDER' ? m.folderId : m.setId) !== id));

            if (onMaterialAdded) {
                // To display optimistic names, we can pass the title we have
                const sel = materials.find(m => (m.folderId || m.setId) === id);
                const materialName = materialType === 'FOLDER' ? sel?.name : sel?.title;
                onMaterialAdded({ ...newMaterial, materialName });
            }
        } catch (error) {
            console.error('Failed to add material:', error);
            toast.error(error.response?.data?.message || 'Failed to add material to class');
        } finally {
            setAddingMaterialId(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Material to Class"
            size="md"
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

                            return (
                                <div
                                    key={id}
                                    className="material-list-item"
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
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleAddMaterial(id)}
                                        disabled={addingMaterialId === id}
                                        isLoading={addingMaterialId === id}
                                    >
                                        <Plus size={14} style={{ marginRight: 4 }} />
                                        Add
                                    </Button>
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
