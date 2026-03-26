import React from 'react';
import { Modal, Button } from '../ui';
import './RemoveMaterialModal.css';

const RemoveMaterialModal = ({ isOpen, onClose, onConfirm, isRemoving, materialName }) => {
    const footer = (
        <div className="remove-material-modal-actions">
            <Button variant="outline" onClick={onClose} disabled={isRemoving}>
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={onConfirm}
                disabled={isRemoving}
                className="remove-material-confirm-btn"
            >
                {isRemoving ? 'Removing...' : 'Remove'}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Remove Material"
            size="sm"
            footer={footer}
        >
            <div className="remove-material-content">
                <p>Are you sure you want to remove <strong>{materialName}</strong> from this class?</p>
                <p className="remove-material-warning-text">It will no longer be accessible to class members.</p>
            </div>
        </Modal>
    );
};

export default RemoveMaterialModal;
