import React from 'react';
import './Textarea.css';

const Textarea = React.forwardRef(({
    label,
    error,
    helpText,
    className = '',
    style,
    ...props
}, ref) => {
    return (
        <div className={`textarea-container ${className}`} style={style}>
            {label && <label className="textarea-label">{label}</label>}
            <div className={`textarea-wrapper ${error ? 'has-error' : ''}`}>
                <textarea
                    ref={ref}
                    className="textarea-field"
                    {...props}
                />
            </div>
            {helpText && !error && <p className="textarea-help-text">{helpText}</p>}
            {error && <p className="textarea-error">{error}</p>}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;
