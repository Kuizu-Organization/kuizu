import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    leftIcon,
    rightIcon,
    isLoading,
    disabled,
    ...props
}) => {
    const classes = `btn btn-${variant} btn-${size} ${className} ${isLoading ? 'is-loading' : ''}`;

    return (
        <button className={classes} disabled={disabled || isLoading} {...props}>
            {isLoading && <span className="btn-spinner" />}
            {!isLoading && leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
            <span className="btn-content">{children}</span>
            {!isLoading && rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
        </button>
    );
};

export default Button;
