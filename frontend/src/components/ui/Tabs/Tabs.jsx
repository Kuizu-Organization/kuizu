import React, { useState } from 'react';
import './Tabs.css';

const Tabs = ({ tabs, defaultActiveIndex = 0, activeIndex: propsActiveIndex, onTabChange }) => {
    const [internalActiveIndex, setInternalActiveIndex] = useState(defaultActiveIndex);

    const isControlled = propsActiveIndex !== undefined;
    const activeIndex = isControlled ? propsActiveIndex : internalActiveIndex;

    const handleTabClick = (index) => {
        if (!isControlled) {
            setInternalActiveIndex(index);
        }
        if (onTabChange) {
            onTabChange(index);
        }
    };

    return (
        <div className="tabs-container">
            <div className="tabs-header">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`tab-btn ${activeIndex === index ? 'active' : ''}`}
                        onClick={() => handleTabClick(index)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="tabs-content">
                {tabs[activeIndex].content}
            </div>
        </div>
    );
};

export default Tabs;
