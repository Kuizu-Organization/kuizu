import React from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import './ComingSoonModal.css';

const ComingSoonModal = ({ isOpen, onClose, featureName }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Coming Soon!"
            footer={
                <Button variant="primary" onClick={onClose}>Got it</Button>
            }
        >
            <div className="coming-soon-container">
                <div className="coming-soon-icon">🚀</div>
                <h4 className="coming-soon-feature">
                    {featureName ? `${featureName}` : 'This feature'} is on its way!
                </h4>
                <p className="coming-soon-text">
                    We're working hard to build the best experience for you.
                    This section will be available in a future update.
                </p>
            </div>
        </Modal>
    );
};

export default ComingSoonModal;
