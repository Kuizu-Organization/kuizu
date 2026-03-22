import React from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

const Select = React.forwardRef(({
    label,
    error,
    helpText,
    className = '',
    style,
    children,
    ...props
}, ref) => {
    return (
        <div className={`select-container ${className}`} style={style}>
            {label && <label className="select-label">{label}</label>}
            <div className={`select-wrapper ${error ? 'has-error' : ''}`}>
                <select
                    ref={ref}
                    className="select-field"
                    {...props}
                >
                    {children}
                </select>
                <span className="select-icon">
                    <ChevronDown size={18} />
                </span>
            </div>
            {helpText && !error && <p className="select-help-text">{helpText}</p>}
            {error && <p className="select-error">{error}</p>}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
