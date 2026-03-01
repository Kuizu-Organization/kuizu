import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, Menu } from 'lucide-react';
import { Button } from '../../ui';
import './Navbar.css';

const Navbar = ({ isSidebarCollapsed, onToggleSidebar }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Initial check
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user from localStorage');
            }
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-left">
                    {onToggleSidebar && (
                        <button className="sidebar-toggle-nav" onClick={onToggleSidebar}>
                            <Menu size={24} />
                        </button>
                    )}
                    <div className="navbar-logo" onClick={() => window.location.href = '/dashboard'}>Kuizu</div>
                    <div className="navbar-links">
                        <div className="nav-dropdown">
                            <span>Study Tools</span>
                            <ChevronDown size={14} strokeWidth={3} />
                        </div>
                        <div className="nav-dropdown">
                            <span>Subjects</span>
                            <ChevronDown size={14} strokeWidth={3} />
                        </div>
                    </div>
                </div>

                <div className="navbar-center">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search for sets, textbooks, questions"
                            className="nav-search-input"
                        />
                    </div>
                </div>

                <div className="navbar-right">
                    <button className="create-btn" onClick={() => window.location.href = '/create'}>
                        <Plus size={20} strokeWidth={3} />
                        <span>Create</span>
                    </button>
                    {user ? (
                        <div className="nav-profile-section">
                            <img
                                src={user.profilePictureUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                                alt="Profile"
                                className="nav-avatar"
                                onClick={() => window.location.href = '/profile'}
                            />
                            <Button variant="ghost" size="sm" onClick={logout} className="logout-compact-btn">
                                Log Out
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            className="login-btn"
                            onClick={() => window.location.href = '/auth'}
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
