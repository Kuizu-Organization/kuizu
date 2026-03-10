import React from 'react';
import Card from '../Card/Card';
import './ItemCard.css';

const ItemCard = ({
    title,
    badge,
    description,
    footerText,
    onClick,
    className = ''
}) => {
    return (
        <Card
            className={`item-card ${className}`}
            onClick={onClick}
        >
            <div className="item-card-header">
                <h3 className="item-card-title">{title}</h3>
                {badge && <span className="item-card-badge">{badge}</span>}
            </div>
            <div className="item-card-body">
                <p className="item-card-description">{description}</p>
            </div>
            {footerText && (
                <div className="item-card-footer">
                    <span className="item-card-footer-text">{footerText}</span>
                </div>
            )}
        </Card>
    );
};

export default ItemCard;
