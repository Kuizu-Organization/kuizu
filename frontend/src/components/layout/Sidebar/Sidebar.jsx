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
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle, activePath = '/dashboard' }) => {
    const navigate = useNavigate();
    const mainLinks = [
        { icon: <Home size={22} />, label: 'Home', path: '/dashboard' },
        { icon: <Library size={22} />, label: 'Library', path: '/library' },
        // { icon: <Users size={22} />, label: 'Expert solutions', path: '/solutions', badge: 'New' },
        // { icon: <Bell size={22} />, label: 'Notifications', path: '/notifications', count: 1 },
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
                            onClick={() => navigate(link.path)}
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
                        <div key={index} className="sidebar-item" onClick={() => navigate(link.path)}>
                            <span className="sidebar-icon">{link.icon}</span>
                            {!isCollapsed && <span className="sidebar-label">{link.label}</span>}
                        </div>
                    ))}
                </div>
            </div>

            {!isCollapsed && (
                <div className="sidebar-footer">
                    <button className="collapse-tab" onClick={onToggle}>
                        <ChevronLeft size={20} />
                        <span>Collapse</span>
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
