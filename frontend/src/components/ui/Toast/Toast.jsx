import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match CSS transition
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={18} />;
            case 'error':
                return <AlertCircle size={18} />;
            case 'info':
            default:
                return <Info size={18} />;
        }
    };

    return (
        <div className={`toast toast-${type} ${isExiting ? 'toast-exiting' : ''}`}>
            <div className="toast-icon">
                {getIcon()}
            </div>
            <div className="toast-content">
                {message}
            </div>
            <button className="toast-close" onClick={handleClose}>
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
