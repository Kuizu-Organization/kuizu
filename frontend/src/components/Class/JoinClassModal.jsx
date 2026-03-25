import React, { useState } from 'react';
import { Modal, Button, Input, Textarea } from '../ui';
import { joinClass, joinByCode } from '@/api/class';

import { useToast } from '@/context/ToastContext';
import './JoinClassModal.css';

const JoinClassModal = ({ isOpen, onClose, classId, onJoinSuccess }) => {
    const toast = useToast();
    const [joinOption, setJoinOption] = useState('code'); // 'code' or 'request'
    const [joinCode, setJoinCode] = useState('');
    const [requestMessage, setRequestMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    React.useEffect(() => {
        if (isOpen) {
            setJoinOption('code');
            setJoinCode('');
            setRequestMessage('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            const requestData = {
                joinCode: joinOption === 'code' ? joinCode : null,
                message: joinOption === 'request' ? requestMessage : null
            };

            if (classId) {
                await joinClass(classId, requestData);
            } else if (joinOption === 'code') {
                await joinByCode(joinCode);
            } else {
                throw new Error("Cannot send join request without selecting a class first.");
            }

            if (joinOption === 'code') {
                toast.success('Successfully joined the class!');
                onJoinSuccess(true);
            } else {
                toast.success('Join request sent successfully!');
                onJoinSuccess(false);
            }

            onClose();

        } catch (error) {
            console.error('Failed to join class:', error);
            toast.error(error.response?.data?.message || 'Failed to join class');
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
                disabled={isSubmitting || (joinOption === 'code' && !joinCode.trim()) || (joinOption === 'request' && !requestMessage.trim())}
                isLoading={isSubmitting}
            >
                {joinOption === 'code' ? 'Join Class' : 'Send Request'}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Join Class"
            size="md"
            footer={footer}
        >
            <div className="join-class-content">
                <div className="join-options">
                    <div
                        className={`join-option-card ${joinOption === 'code' ? 'active' : ''}`}
                        onClick={() => setJoinOption('code')}
                    >
                        <div className="option-radio">
                            <div className="radio-inner"></div>
                        </div>
                        <div className="option-info">
                            <h4>Join with Code</h4>
                            <p>Enter the class join code to get instant access.</p>
                        </div>
                    </div>

                    {classId && (
                        <div
                            className={`join-option-card ${joinOption === 'request' ? 'active' : ''}`}
                            onClick={() => setJoinOption('request')}
                        >
                            <div className="option-radio">
                                <div className="radio-inner"></div>
                            </div>
                            <div className="option-info">
                                <h4>Send Join Request</h4>
                                <p>Ask the owner for permission to join this class.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="join-form-area">
                    {joinOption === 'code' ? (
                        <Input
                            className="slide-in"
                            label="Class Code"
                            placeholder="Enter join code (e.g. jf8h3k)"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            autoFocus
                        />
                    ) : (
                        <Textarea
                            className="slide-in"
                            label="Request Message"
                            placeholder="Hi, I'd like to join this class..."
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            rows={4}
                            autoFocus
                            helpText="This message will be sent to the class owner."
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default JoinClassModal;
