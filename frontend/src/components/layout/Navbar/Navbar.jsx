import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, Menu, Book, Zap, Users, GraduationCap, Palette, Languages, Calculator, FlaskConical, Layout, BookOpen, Folder } from 'lucide-react';
import { Button, Dropdown, SearchBar } from '../../ui';
import './Navbar.css';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useModal } from '../../../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import { searchClasses } from '../../../api/class';


const Navbar = ({ isSidebarCollapsed, onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const { openSetModal } = useModal();
    const navigate = useNavigate();
    const toast = useToast();

    const handleSearchInput = async (query) => {
        const results = await searchClasses(query);
        return results.map(cls => ({
            id: cls.classId,
            title: cls.className,
            subtitle: `by ${cls.ownerDisplayName}`,
            original: cls
        }));
    };

    const handleLogout = () => {
        logout();
        toast.info('Logged out successfully', 6000);
        navigate('/auth');
    };

    const handleResultClick = (result) => {
        navigate(`/classes/${result.id}`);
    };

    const handleSearchEnter = (query) => {
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const studyToolsItems = [
        { label: 'Flashcard', icon: <Book size={16} /> },
        { label: 'Quiz', icon: <Zap size={16} /> },
        { label: 'Class', icon: <Users size={16} /> },
    ];

    const subjectItems = [
        { label: 'Exams', icon: <GraduationCap size={16} /> },
        { label: 'Arts and Humanities', icon: <Palette size={16} /> },
        { label: 'Languages', icon: <Languages size={16} /> },
        { label: 'Mathematics', icon: <Calculator size={16} /> },
        { label: 'Science', icon: <FlaskConical size={16} /> },
        { label: 'Others', icon: <Layout size={16} /> },
    ];

    const createItems = [
        { label: 'Flashcard Set', icon: <BookOpen size={16} />, type: 'flashcard-set' },
        { label: 'Folder', icon: <Folder size={16} />, path: '/create/folder' },
        { label: 'Class', icon: <GraduationCap size={16} />, path: '/create/class' },
    ];

    const handleDropdownItemClick = (item) => {
        if (item.type === 'flashcard-set') {
            openSetModal(null, (newSet) => {
                navigate(`/flashcard-sets/${newSet.setId}`);
            });
        } else if (item.path) {
            navigate(item.path);
        } else {
            navigate(`/search?q=${encodeURIComponent(item.label)}`);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-left">
                    <div className="navbar-logo" onClick={() => navigate('/dashboard')}>Kuizu</div>
                    <div className="navbar-links">
                        <Dropdown
                            label="Study Tools"
                            items={studyToolsItems}
                            onItemClick={handleDropdownItemClick}
                            variant="nav"
                        />
                        <Dropdown
                            label="Subjects"
                            items={subjectItems}
                            onItemClick={handleDropdownItemClick}
                            variant="nav"
                        />
                    </div>
                </div>

                <div className="navbar-center">
                    <SearchBar
                        onSearch={handleSearchInput}
                        onResultClick={handleResultClick}
                        onEnter={handleSearchEnter}
                        placeholder="Search for classes..."
                    />
                </div>

                <div className="navbar-right">
                    <Dropdown
                        items={createItems}
                        onItemClick={handleDropdownItemClick}
                        variant="create-pill"
                        showChevron={false}
                    >
                        <Plus size={20} strokeWidth={3} />
                        <span>Create</span>
                    </Dropdown>
                    {user ? (
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

                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            className="login-btn"
                            onClick={() => navigate('/auth')}
                        >
                            Log in
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
