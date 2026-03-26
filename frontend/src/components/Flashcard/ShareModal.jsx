import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, set }) => {
    const [copied, setCopied] = useState(false);
    
    if (!set) return null;

    const shareUrl = `${window.location.host === 'localhost:5173' ? 'http://localhost:5173' : window.location.origin}/flashcard-sets/${set.setId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const socialLinks = [
        { 
            icon: 'fa-facebook', 
            bgClass: 'bg-facebook', 
            label: 'Facebook',
            href: `https://www.facebook.com/login.php?next=https%3A%2F%2Fwww.facebook.com%2Findex.php%2F%3Flang%3Dvn`
        },
        { 
            icon: 'fa-x-twitter', 
            bgClass: 'bg-x', 
            label: 'X (Twitter)',
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`
        },
        { 
            icon: 'fa-whatsapp', 
            bgClass: 'bg-whatsapp', 
            label: 'WhatsApp',
            href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`
        },
        { 
            icon: 'fa-envelope', 
            bgClass: 'bg-email', 
            label: 'Email',
            isSolid: true,
            href: `mailto:?subject=Study this set!&body=${encodeURIComponent(shareUrl)}`
        }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Share Flashcard Set"
            size="md"
        >
            <div className="share-modal-p6">
                <div className="share-status-card">
                    <div className="share-status-icon-box">
                        <i className="fa-solid fa-link" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <div className="share-status-info">
                        <h4>Link Sharing Active</h4>
                        <p>Anyone with this link can study your set.</p>
                    </div>
                </div>

                <div className="share-url-section">
                    <label className="share-label-caps">Shareable URL</label>
                    <div className="share-url-input-container">
                        <input
                            value={shareUrl}
                            readOnly
                            className="share-url-input"
                        />
                        <Button 
                            variant={copied ? "success" : "primary"} 
                            onClick={handleCopy}
                            size="md"
                        >
                            {copied ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-check"></i> <span>Copied</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-copy"></i> <span>Copy link</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="share-social-section">
                    <div className="share-social-header">
                        <div className="line"></div>
                        <span>Instantly Share To</span>
                        <div className="line"></div>
                    </div>

                    <div className="share-social-grid">
                        {socialLinks.map((social, i) => (
                            <a 
                                key={i}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="share-social-item"
                                title={social.label}
                            >
                                <div className={`share-social-icon-wrapper ${social.bgClass}`}>
                                    <i className={`${social.isSolid ? 'fa-solid' : 'fa-brands'} ${social.icon}`}></i>
                                </div>
                                <span className="share-social-label">{social.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
                
                <div className="share-footer">
                    <button onClick={onClose} className="share-close-btn">
                        Close Share Center
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ShareModal;
