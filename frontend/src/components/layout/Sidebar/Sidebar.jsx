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
    ChevronLeft,
    Shield,
    History as HistoryIcon,
    BarChart3,
    Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button, ComingSoonModal } from '../../ui';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle, activePath = '/dashboard' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
    const [currentFeature, setCurrentFeature] = useState('');

    const implementedRoutes = [
        '/dashboard',
        '/admin/users',
        '/admin/submissions/flashcards',
        '/admin/submissions/classes',
        '/admin/history',
        '/admin/stats/flashcards',
        '/admin/stats/system',
        '/profile',
        '/search',
        '/auth',
        '/'
    ];

    const handleNavigation = (path, label) => {
        // If the path is not implemented, our catch-all route will handle it
        navigate(path);
    };

    const mainLinks = [
        { icon: <Home size={22} />, label: 'Home', path: '/dashboard' },
        { icon: <Library size={22} />, label: 'Library', path: '/library' },
    ];

    const adminLinks = [
        { icon: <Shield size={22} />, label: 'User Management', path: '/admin/users' },
        { icon: <BookOpen size={22} />, label: 'Flashcard Submissions', path: '/admin/submissions/flashcards' },
        { icon: <GraduationCap size={22} />, label: 'Class Submissions', path: '/admin/submissions/classes' },
        { icon: <HistoryIcon size={22} />, label: 'Moderation History', path: '/admin/history' },
        { icon: <BarChart3 size={22} />, label: 'Flashcard Statistics', path: '/admin/stats/flashcards' },
        { icon: <Activity size={22} />, label: 'System Statistics', path: '/admin/stats/system' },
    ];

    const quickStartLinks = [
        { icon: <BookOpen size={22} />, label: 'Flashcards', path: '/create/flashcards' },
        { icon: <Folder size={22} />, label: 'Folders', path: '/folders' },
        { icon: <GraduationCap size={22} />, label: 'Classes', path: '/create/class' },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-sections">
                {user?.role !== 'ROLE_ADMIN' && (
                    <div className="sidebar-section">
                        {mainLinks.map((link, index) => (
                            <div
                                key={index}
                                className={`sidebar-item ${activePath === link.path ? 'active' : ''}`}
                                onClick={() => handleNavigation(link.path, link.label)}
                            >
                                <span className="sidebar-icon">{link.icon}</span>
                                {!isCollapsed && <span className="sidebar-label">{link.label}</span>}
                            </div>
                        ))}
                    </div>
                )}

                {user?.role === 'ROLE_ADMIN' && (
                    <div className="sidebar-section">
                        {!isCollapsed && <h6 className="sidebar-title">Administration</h6>}
                        {adminLinks.map((link, index) => (
                            <div
                                key={index}
                                className={`sidebar-item ${activePath === link.path ? 'active' : ''}`}
                                onClick={() => handleNavigation(link.path, link.label)}
                            >
                                <span className="sidebar-icon">{link.icon}</span>
                                {!isCollapsed && <span className="sidebar-label">{link.label}</span>}
                            </div>
                        ))}
                    </div>
                )}

                {user?.role !== 'ROLE_ADMIN' && (
                    <>
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
                    </>
                )}
            </div>

            <div className={`sidebar-footer ${isCollapsed ? 'collapsed' : ''}`}>
                <button className="collapse-tab" onClick={onToggle}>
                    {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    {!isCollapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
