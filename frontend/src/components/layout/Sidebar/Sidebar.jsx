import React, { useState, useEffect } from 'react';
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
import { Button, ComingSoonModal } from '../../ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getPendingCount } from '@/api/moderation';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle, activePath = '/dashboard' }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
    const [currentFeature, setCurrentFeature] = useState('');
    const [pendingCount, setPendingCount] = useState(0);

    const isAdmin = user?.role === 'ROLE_ADMIN';

    const handleLogout = () => {
        logout();
        toast.info('Logged out successfully', 6000);
        navigate('/auth');
    };

    const implementedRoutes = [
        '/dashboard',
        '/admin/users',
        '/admin/submissions/flashcards',
        '/admin/submissions/classes',
        '/admin/history',
        '/admin/stats/flashcards',
        '/admin/stats/users',
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
        { icon: <BookOpen size={22} />, label: 'Set Submissions', path: '/admin/submissions/flashcards' },
        { icon: <GraduationCap size={22} />, label: 'Class Submissions', path: '/admin/submissions/classes' },
        { icon: <HistoryIcon size={22} />, label: 'Moderation History', path: '/admin/history' },
        { icon: <BarChart3 size={22} />, label: 'Statistics', path: '/admin/stats/users' },
    ];

    const quickStartLinks = [
        { icon: <Folder size={22} />, label: 'Folders', path: '/folders' },
        { icon: <BookOpen size={22} />, label: 'Flashcards', path: '/flashcard-sets' },
        { icon: <GraduationCap size={22} />, label: 'Classes', path: '/create/class' },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isAdmin ? 'admin-sidebar' : ''}`}>
            <div className="sidebar-sections">
                {!isAdmin && (
                    <div className="sidebar-section">
                        {mainLinks.map((link, index) => (
                            <div
                                key={index}
                                className={`sidebar-item ${activePath.startsWith(link.path) ? 'active' : ''}`}
                                onClick={() => handleNavigation(link.path, link.label)}
                            >
                                <span className="sidebar-icon">{link.icon}</span>
                                {!isCollapsed && <span className="sidebar-label">{link.label}</span>}
                            </div>
                        ))}
                    </div>
                )}

                {isAdmin && (
                    <div className="sidebar-section">
                        {!isCollapsed && <h6 className="sidebar-title">Administration</h6>}
                        {adminLinks.map((link, index) => (
                            <div
                                key={index}
                                className={`sidebar-item ${activePath.startsWith(link.path) ? 'active' : ''}`}
                                onClick={() => handleNavigation(link.path, link.label)}
                            >
                                <span className="sidebar-icon">{link.icon}</span>
                                {!isCollapsed && <span className="sidebar-label">{link.label}</span>}
                            </div>
                        ))}
                    </div>
                )}

                {!isAdmin && (
                    <>
                        <div className="sidebar-divider"></div>
                        <div className="sidebar-section">
                            {!isCollapsed && <h6 className="sidebar-title">Get started</h6>}
                            {quickStartLinks.map((link, index) => (
                                <div 
                                    key={index} 
                                    className={`sidebar-item ${activePath.startsWith(link.path) ? 'active' : ''}`} 
                                    onClick={() => handleNavigation(link.path, link.label)}
                                >
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

                {isAdmin && user && (
                    <div className="nav-profile-section">
                        <img
                            src={user.profilePictureUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                            alt="Profile"
                            className="nav-avatar"
                            onClick={() => navigate('/profile')}
                        />
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="logout-compact-btn">
                            Log Out
                        </Button>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
