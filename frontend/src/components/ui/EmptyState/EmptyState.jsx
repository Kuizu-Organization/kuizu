import React from 'react';
import './EmptyState.css';

const EmptyState = ({
    title,
    description,
    icon: Icon,
    action,
    className = ''
}) => {
    return (
        <div className={`empty-state ${className}`}>
            {Icon && <Icon className="empty-state-icon" size={48} />}
            {title && <h3>{title}</h3>}
            {description && <p>{description}</p>}
            {action && <div className="empty-state-action">{action}</div>}
        </div>
    );
};

export default EmptyState;
