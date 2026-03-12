import React from 'react';
import './Input.css';

const Input = React.forwardRef(({
    label,
    error,
    helpText,
    className = '',
    style,
    leftIcon,
    rightIcon,
    ...props
}, ref) => {
    return (
        <div className={`input-container ${className}`} style={style}>
            {label && <label className="input-label">{label}</label>}
            <div className={`input-wrapper ${error ? 'has-error' : ''} ${leftIcon ? 'has-left-icon' : ''} ${rightIcon ? 'has-right-icon' : ''}`}>
                {leftIcon && <span className="input-icon input-icon-left">{leftIcon}</span>}
                <input
                    ref={ref}
                    className="input-field"
                    {...props}
                />
                {rightIcon && <span className="input-icon input-icon-right">{rightIcon}</span>}
            </div>
            {helpText && !error && <p className="input-help-text">{helpText}</p>}
            {error && <p className="input-error">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
