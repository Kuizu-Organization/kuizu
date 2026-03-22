import React from 'react';
import './Card.css';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`card ${className}`} {...props}>
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '', ...props }) => (
    <div className={`card-header ${className}`} {...props}>
        {children}
    </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
    <h3 className={`card-title ${className}`} {...props}>
        {children}
    </h3>
);

const CardBody = ({ children, className = '', ...props }) => (
    <div className={`card-body ${className}`} {...props}>
        {children}
    </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
    <div className={`card-footer ${className}`} {...props}>
        {children}
    </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

