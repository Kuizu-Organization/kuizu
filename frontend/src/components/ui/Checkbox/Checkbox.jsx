import React from 'react';
import './Checkbox.css';

const Checkbox = ({ label, id, className = '', ...props }) => {
    return (
        <div className={`checkbox-container ${className}`}>
            <label className="checkbox-wrapper">
                <input
                    type="checkbox"
                    id={id}
                    className="checkbox-input"
                    {...props}
                />
                <span className="checkbox-checkmark"></span>
                {label && <span className="checkbox-label">{label}</span>}
            </label>
        </div>
    );
};

export default Checkbox;
