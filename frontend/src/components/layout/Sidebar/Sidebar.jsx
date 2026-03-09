import React, { useState } from 'react';
import {
    Home,
    Library,
    Bell,
    Users,
    BookOpen,
    Folder,
    GraduationCap,
    Menu,
    ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, ComingSoonModal } from '../../ui';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle, activePath = '/dashboard' }) => {
    const navigate = useNavigate();
    const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
    const [currentFeature, setCurrentFeature] = useState('');

    const implementedRoutes = ['/dashboard', '/profile', '/search', '/auth', '/'];

    const handleNavigation = (path, label) => {
        // Special check for dynamic class route
        if (implementedRoutes.includes(path) || path.startsWith('/classes/')) {
            navigate(path);
        } else {
            setCurrentFeature(label);
            setIsComingSoonOpen(true);
        }
    };

    const mainLinks = [
        { icon: <Home size={22} />, label: 'Home', path: '/dashboard' },
        { icon: <Library size={22} />, label: 'Library', path: '/library' },
    ];

    const quickStartLinks = [
        { icon: <BookOpen size={22} />, label: 'Flashcards', path: '/create/flashcards' },
        { icon: <Folder size={22} />, label: 'Folders', path: '/create/folder' },
        { icon: <GraduationCap size={22} />, label: 'Classes', path: '/create/class' },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-sections">
                <div className="sidebar-section">
                    {mainLinks.map((link, index) => (
                        <div
                            key={index}
                            className={`sidebar-item ${activePath === link.path ? 'active' : ''}`}
                            onClick={() => handleNavigation(link.path, link.label)}
                        >
                            <span className="sidebar-icon">{link.icon}</span>
                            {!isCollapsed && <span className="sidebar-label">{link.label}</span>}
                            {!isCollapsed && link.badge && <span className="sidebar-badge">{link.badge}</span>}
                            {!isCollapsed && link.count && <span className="sidebar-count">{link.count}</span>}
                            {isCollapsed && link.count && <span className="sidebar-count-dot"></span>}
                        </div>
                    ))}
                </div>

                <div className="sidebar-divider"></div>

                <div className="sidebar-section">
                    {!isCollapsed && <h6 className="sidebar-title">Get started</h6>}
                    {quickStartLinks.map((link, index) => (
                        <div key={index} className="sidebar-item" onClick={() => handleNavigation(link.path, link.label)}>
                            <span className="sidebar-icon">{link.icon}</span>
                            {!isCollapsed && <span className="sidebar-label">{link.label}</span>}
                        </div>
                    ))}
                </div>
            </div>

            <div className={`sidebar-footer ${isCollapsed ? 'collapsed' : ''}`}>
                <button className="collapse-tab" onClick={onToggle}>
                    {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    {!isCollapsed && <span>Collapse</span>}
                </button>
            </div>

            <ComingSoonModal
                isOpen={isComingSoonOpen}
                onClose={() => setIsComingSoonOpen(false)}
                featureName={currentFeature}
            />
        </aside>
    );
};

export default Sidebar;
