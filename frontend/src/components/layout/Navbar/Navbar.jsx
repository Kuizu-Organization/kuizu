import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, Menu, Book, Zap, Users, GraduationCap, Palette, Languages, Calculator, FlaskConical, Layout, BookOpen, Folder } from 'lucide-react';
import { Button, Dropdown, SearchBar } from '@/components/ui';
import './Navbar.css';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useModal } from '@/context/ModalContext';
import { useNavigate } from 'react-router-dom';
import { searchClasses } from '@/api/class';
import { searchFolders } from '@/api/folder';
import { searchFlashcardSets } from '@/api/flashcardSet';
import { searchPublicUsers } from '@/api/user';


const Navbar = ({ isSidebarCollapsed, onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const { openSetModal } = useModal();
    const navigate = useNavigate();
    const toast = useToast();

    const handleSearchInput = async (query) => {
        const lowerQuery = query.toLowerCase();
        try {
            const resultsRaw = await Promise.allSettled([
                searchClasses(query),
                searchFolders(query),
                searchFlashcardSets(query),
                searchPublicUsers(query, 0, 10)
            ]);

            const classes = resultsRaw[0].status === 'fulfilled' ? resultsRaw[0].value : [];
            const folders = resultsRaw[1].status === 'fulfilled' ? resultsRaw[1].value : [];
            const sets = resultsRaw[2].status === 'fulfilled' ? resultsRaw[2].value : [];
            const usersRes = resultsRaw[3].status === 'fulfilled' ? resultsRaw[3].value : { content: [] };

            const filterFn = (text) => {
                if (!text) return false;
                // Split by whitespace or punctuation like hyphens to capture sub-words
                const words = text.toLowerCase().split(/[\s\-_]+/);
                return words.some(word => word.startsWith(lowerQuery));
            };

            const classResults = (classes || [])
                .filter(cls => filterFn(cls.className))
                .map(cls => ({
                    id: cls.classId,
                    type: 'class',
                    title: cls.className,
                    subtitle: `Class • by ${cls.ownerDisplayName}`,
                    original: cls
                }));

            const folderResults = (folders || [])
                .filter(f => filterFn(f.name))
                .map(folder => ({
                    id: folder.folderId,
                    type: 'folder',
                    title: folder.name,
                    subtitle: `Folder • ${folder.setCount} sets • by ${folder.ownerDisplayName}`,
                    original: folder
                }));

            const userResults = (usersRes.content || [])
                .filter(u => filterFn(u.username) || filterFn(u.displayName))
                .map(u => ({
                    id: u.username,
                    type: 'user',
                    title: u.displayName || u.username,
                    subtitle: u.role ? `User • ${u.role.replace('ROLE_', '').toLowerCase()}` : 'User',
                    original: u
                }));

            const setResults = (sets || [])
                .filter(s => filterFn(s.title))
                .map(set => ({
                    id: set.setId,
                    type: 'set',
                    title: set.title,
                    subtitle: `Set • ${set.cardCount || set.flashcardCount || set.cards?.length || 0} terms • by ${set.ownerDisplayName}`,
                    original: set
                }));

            return {
                "Flashcard Sets": setResults.slice(0, 5),
                "Folders": folderResults.slice(0, 5),
                "Classes": classResults.slice(0, 5),
                "Users": userResults.slice(0, 5)
            };
        } catch (error) {
            console.error('Search input failed:', error);
            return {
                "Flashcard Sets": [],
                "Folders": [],
                "Classes": [],
                "Users": []
            };
        }
    };

    const handleLogout = () => {
        logout();
        toast.info('Logged out successfully', 6000);
        navigate('/auth');
    };

    const handleResultClick = (result) => {
        if (result.type === 'class') {
            navigate(`/classes/${result.id}`);
        } else if (result.type === 'folder') {
            navigate(`/folders/${result.id}`);
        } else if (result.type === 'set') {
            navigate(`/flashcard-sets/${result.id}`);
        } else if (result.type === 'user') {
            navigate(`/users/${result.id}`);
        }
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
                    <div className="navbar-logo" onClick={() => navigate(user ? '/dashboard' : '/')}>Kuizu</div>
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
                        placeholder="Search for study guides"
                    />
                </div>

                <div className="navbar-right">
                    {user && (
                        <Dropdown
                            items={createItems}
                            onItemClick={handleDropdownItemClick}
                            variant="create-pill"
                            showChevron={false}
                        >
                            <Plus size={20} strokeWidth={3} />
                            <span>Create</span>
                        </Dropdown>
                    )}
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
