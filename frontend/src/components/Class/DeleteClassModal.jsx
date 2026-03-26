import React from 'react';
import { Modal, Button } from '../ui';
import './DeleteClassModal.css';

const DeleteClassModal = ({ isOpen, onClose, onConfirm, isDeleting, className }) => {
    const footer = (
        <div className="delete-modal-actions">
            <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={onConfirm}
                disabled={isDeleting}
                className="delete-confirm-btn"
            >
                {isDeleting ? 'Deleting...' : 'Delete Class'}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Class"
            size="sm"
            footer={footer}
        >
            <div className="delete-class-content">
                <p>Are you sure you want to delete <strong>{className}</strong>?</p>
                <p className="delete-warning-text">This action is permanent and cannot be undone. All materials, members, and progress will be lost forever.</p>
            </div>
        </Modal>
    );
};

export default DeleteClassModal;
