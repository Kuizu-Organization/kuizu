import React from 'react';
import { Modal, Button } from '../ui';
import './RemoveMemberModal.css';

const RemoveMemberModal = ({ isOpen, onClose, onConfirm, isRemoving, memberName }) => {
    const footer = (
        <div className="remove-member-modal-actions">
            <Button variant="outline" onClick={onClose} disabled={isRemoving}>
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={onConfirm}
                disabled={isRemoving}
                className="remove-confirm-btn"
            >
                {isRemoving ? 'Removing...' : 'Remove Member'}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Remove Member"
            size="sm"
            footer={footer}
        >
            <div className="remove-member-content">
                <p>Are you sure you want to remove <strong>{memberName}</strong> from this class?</p>
                <p className="remove-warning-text">They will no longer have access to class materials and members.</p>
            </div>
        </Modal>
    );
};

export default RemoveMemberModal;
