import React from 'react';
import './Loader.css';

const Loader = ({ fullPage = true, size = 'md' }) => {
    return (
        <div className={`loader-overlay ${fullPage ? 'full-page' : 'inline'} loader-${size}`}>
            <div className="pinwheel-container">
                <svg viewBox="0 0 100 100" className="pinwheel-svg">
                    {/* Yellow segment */}
                    <path d="M50 50 L50 5 A45 45 0 0 1 89 27.5 Z" fill="#FFD200" />
                    {/* Orange segment */}
                    <path d="M50 50 L89 27.5 A45 45 0 0 1 89 72.5 Z" fill="#FF9800" />
                    {/* Red segment */}
                    <path d="M50 50 L89 72.5 A45 45 0 0 1 50 95 Z" fill="#FF4A4A" />
                    {/* Purple segment */}
                    <path d="M50 50 L50 95 A45 45 0 0 1 11 72.5 Z" fill="#A854DD" />
                    {/* Blue segment */}
                    <path d="M50 50 L11 72.5 A45 45 0 0 1 11 27.5 Z" fill="#00A6F9" />
                    {/* Green segment */}
                    <path d="M50 50 L11 27.5 A45 45 0 0 1 50 5 Z" fill="#32D032" />
                </svg>
                {/* Overlay for inner shading/glow effect to match macOS aesthetic */}
                <div className="pinwheel-effect"></div>
            </div>
        </div>
    );
};

export default Loader;
