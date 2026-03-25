import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, MoreVertical, Trash2, FlaskConical, Sigma, Languages, Brain, FunctionSquare, Calculator, Lightbulb, Binary, Atom, BookOpen, Microscope } from 'lucide-react';
import { Button, Card } from '../ui';
import './StudyBulletin.css';

const StudyBulletin = () => {
    const [history, setHistory] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMenu, setShowMenu] = useState(null); // setId of open menu
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const iconPool = [
        { icon: FlaskConical, color: 'science' },
        { icon: Sigma, color: 'math' },
        { icon: FunctionSquare, color: 'math' },
        { icon: Languages, color: 'lang' },
        { icon: Brain, color: 'brain' },
        { icon: Lightbulb, color: 'bulb' },
        { icon: Binary, color: 'math' },
        { icon: Atom, color: 'science' },
        { icon: Microscope, color: 'science' },
        { icon: Calculator, color: 'math' }
    ];

    const getVisualsForSet = (setId) => {
        // Use setId as seed for consistent randomness per set
        const seed = parseInt(String(setId).replace(/\D/g, '')) || 0;
        
        // Pick 3 unique icons from the pool
        const selected = [];
        const pool = [...iconPool];
        
        for (let i = 0; i < 3; i++) {
            const index = (seed + i * 7) % pool.length;
            selected.push(pool[index]);
            pool.splice(index, 1);
        }

        // Floating icon
        const floatIcon = iconPool[(seed + 13) % iconPool.length].icon;
        
        return { icons: selected, floatIcon };
    };

    useEffect(() => {
        const loadHistory = () => {
            const saved = JSON.parse(localStorage.getItem('study_history') || '[]');
            setHistory(saved);
        };

        loadHistory();
        window.addEventListener('storage', loadHistory);
        return () => window.removeEventListener('storage', loadHistory);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (history.length <= 1 || showMenu !== null) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % history.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [history.length, showMenu]);

    if (history.length === 0) return null;

    const handleDeleteProgress = (e, setId) => {
        e.stopPropagation();
        const updated = history.filter(h => String(h.setId) !== String(setId));
        localStorage.setItem('study_history', JSON.stringify(updated));
        setHistory(updated);
        setShowMenu(null);
        if (currentIndex >= updated.length && updated.length > 0) {
            setCurrentIndex(updated.length - 1);
        }
    };

    const current = history[currentIndex];
    const percentage = Math.round(((current.currentIndex + 1) / current.totalCards) * 100);

    const handleContinue = () => {
        navigate(`/study/${current.setId}`, { 
            state: { 
                startIndex: current.currentIndex,
                setTitle: current.title
            } 
        });
    };

    return (
        <section className="study-bulletin-section">
            <h2 className="bulletin-title">Jump back in</h2>
            
            <div className="bulletin-container">
                <div className="bulletin-carousel">
                    {history.map((item, idx) => {
                        const { icons, floatIcon: FloatIcon } = getVisualsForSet(item.setId);
                        
                        return (
                            <Card 
                                key={item.setId} 
                                className={`bulletin-card ${idx === currentIndex ? 'active' : ''} ${idx < currentIndex ? 'prev' : ''} ${idx > currentIndex ? 'next' : ''}`}
                            >
                                <div className="bulletin-card-content">
                                    <div className="bulletin-main-info">
                                        <div className="bulletin-set-header">
                                            <h3>{item.title}</h3>
                                            <div className="menu-container" ref={item.setId === showMenu ? menuRef : null}>
                                                <button 
                                                    className="bulletin-more"
                                                    onClick={(e) => { e.stopPropagation(); setShowMenu(showMenu === item.setId ? null : item.setId); }}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {showMenu === item.setId && (
                                                    <div className="bulletin-dropdown">
                                                        <button onClick={(e) => handleDeleteProgress(e, item.setId)} className="delete-action">
                                                            <Trash2 size={14} />
                                                            Xoá tiến trình
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="bulletin-progress-info">
                                            <div className="bulletin-progress-bar-container">
                                                <div 
                                                    className="bulletin-progress-bar-fill" 
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="bulletin-progress-stats">
                                                <span>{item.currentIndex + 1}/{item.totalCards} cards reviewed</span>
                                                <span className="bulletin-percentage">{percentage}%</span>
                                            </div>
                                        </div>

                                        <Button 
                                            className="bulletin-continue-btn"
                                            onClick={handleContinue}
                                        >
                                            Continue
                                        </Button>
                                    </div>

                                    <div className="bulletin-visual">
                                        {icons.map((visual, i) => {
                                            const IconComp = visual.icon;
                                            return (
                                                <div key={i} className={`visual-card visual-card-${i + 1}`}>
                                                    <div className={`visual-icon-wrapper ${visual.color}`}>
                                                        <IconComp size={i === 0 ? 42 : i === 1 ? 36 : 30} strokeWidth={2.5} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="visual-floating-icon">
                                            <FloatIcon size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    {history.length > 1 && (
                        <>
                            {currentIndex > 0 && (
                                <button 
                                    className="bulletin-nav-btn prev" 
                                    onClick={() => setCurrentIndex(prev => prev - 1)}
                                >
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                            <button 
                                className="bulletin-nav-btn next" 
                                onClick={() => setCurrentIndex(prev => (prev + 1) % history.length)}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>

                {history.length > 1 && (
                    <div className="bulletin-dots">
                        {history.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`bulletin-dot ${idx === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(idx)}
                            ></div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default StudyBulletin;
