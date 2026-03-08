import React from 'react';
import { Modal, Button } from '../ui';
import './LeaveClassModal.css';

const LeaveClassModal = ({ isOpen, onClose, onConfirm, isLeaving }) => {
    const footer = (
        <div className="leave-modal-actions">
            <Button variant="outline" onClick={onClose} disabled={isLeaving}>
                Cancel
            </Button>
            <Button 
                variant="primary" 
                onClick={onConfirm} 
                disabled={isLeaving}
                className="leave-confirm-btn"
            >
                {isLeaving ? 'Leaving...' : 'Leave Class'}
            </Button>
        </div>
    );

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Leave Class" 
            size="sm"
            footer={footer}
        >
            <div className="leave-class-content">
                <p>Are you sure you want to leave this class?</p>
                <p className="leave-warning-text">You will lose access to all materials and need to join again.</p>
            </div>
        </Modal>
    );
};

export default LeaveClassModal;
