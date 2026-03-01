import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Accordion.css';

const AccordionItem = ({ title, children, isOpen, onClick }) => {
    return (
        <div className={`accordion-item ${isOpen ? 'active' : ''}`}>
            <div className="accordion-header" onClick={onClick}>
                <h4 className="accordion-title">{title}</h4>
                <ChevronDown size={18} className={`accordion-icon ${isOpen ? 'rotate' : ''}`} />
            </div>
            <div className="accordion-body-wrapper" style={{ maxHeight: isOpen ? '1000px' : '0' }}>
                <div className="accordion-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Accordion = ({ items }) => {
    const [activeIndex, setActiveIndex] = useState(null);

    const handleClick = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="accordion-container">
            {items.map((item, index) => (
                <AccordionItem
                    key={index}
                    title={item.title}
                    isOpen={activeIndex === index}
                    onClick={() => handleClick(index)}
                >
                    {item.content}
                </AccordionItem>
            ))}
        </div>
    );
};

export default Accordion;
