import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, Menu } from 'lucide-react';
import { Button } from '../../ui';
import './Navbar.css';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';


const Navbar = ({ isSidebarCollapsed, onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleLogout = () => {
        logout();
        toast.info('Logged out successfully');
        navigate('/auth');
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
                    <div className="navbar-logo" onClick={() => navigate('/dashboard')}>Kuizu</div>
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
                    <button className="create-btn" onClick={() => navigate('/create')}>
                        <Plus size={20} strokeWidth={3} />
                        <span>Create</span>
                    </button>
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
