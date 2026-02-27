import React, { useState, useEffect } from 'react';
import { Camera, ChevronDown, Plus, Pencil, User as UserIcon, Mail, ShieldCheck, Palette } from 'lucide-react';
import './ProfilePage.css';
import { getCurrentUser, updateProfile } from '../api/user';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock avatars (as seen in the design)
    const avatars = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Bear',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Tiger',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Bunny',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Panda',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Fox',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Koala',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Penguin',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Owl',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Cat',
    ];

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'Light');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const userData = await getCurrentUser();
            setUser(userData);

            // Sync with local storage if needed
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Could not load profile. Please try again.');

            // Fallback to localStorage if API fails
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAvatar = async (url) => {
        try {
            const updatedUser = await updateProfile({ profilePictureUrl: url });
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
            alert('Failed to update avatar');
        }
    };

    const handleEditField = (field) => {
        const labels = {
            displayName: 'Display Name',
            bio: 'Bio',
            locale: 'Language',
            timezone: 'Timezone'
        };
        const fieldLabel = labels[field] || field;
        const newValue = prompt(`Enter new ${fieldLabel}:`, user[field] || '');
        if (newValue !== null && newValue !== user[field]) {
            performUpdate({ [field]: newValue });
        }
    };

    const performUpdate = async (data) => {
        try {
            const updatedUser = await updateProfile(data);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleThemeChange = () => {
        const newTheme = theme === 'Light' ? 'Dark' : 'Light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        // Sync theme to backend preferences
        performUpdate({ preferences: JSON.stringify({ theme: newTheme }) });
    };

    if (loading && !user) return <div className="profile-container">Loading...</div>;
    if (error) return <div className="profile-container">{error}</div>;

    return (
        <div className="profile-container">
            <h1 className="profile-title">Settings</h1>

            <div className="profile-section">
                <span className="section-label">Personal Information</span>
                <div className="settings-card">
                    {/* Profile Picture */}
                    <div className="settings-group">
                        <h3 className="group-title">Profile Picture</h3>
                        <div className="avatar-selection">
                            <img
                                src={user?.profilePictureUrl || avatars[0]}
                                alt="Profile"
                                className="avatar-main"
                            />
                            {avatars.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`Option ${index}`}
                                    className={`avatar-option ${user?.profilePictureUrl === url ? 'selected' : ''}`}
                                    onClick={() => handleUpdateAvatar(url)}
                                />
                            ))}
                            <div className="avatar-add">
                                <Plus size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Display Name */}
                    <div className="settings-group">
                        <div className="field-row">
                            <div className="field-info">
                                <h4>Display Name</h4>
                                <p>{user?.displayName || 'Set your display name'}</p>
                            </div>
                            <button className="edit-btn" onClick={() => handleEditField('displayName')}>Edit</button>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="settings-group">
                        <div className="field-row">
                            <div className="field-info">
                                <h4>Bio</h4>
                                <p className="bio-text">{user?.bio || 'Add a bio to your profile'}</p>
                            </div>
                            <button className="edit-btn" onClick={() => handleEditField('bio')}>Edit</button>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="settings-group">
                        <div className="field-row">
                            <div className="field-info">
                                <h4>Email</h4>
                                <p>{user?.email}</p>
                            </div>
                            {/* Read-only */}
                        </div>
                    </div>

                    {/* Locale */}
                    <div className="settings-group">
                        <div className="field-row">
                            <div className="field-info">
                                <h4>Language</h4>
                                <p>{user?.locale || 'English'}</p>
                            </div>
                            <button className="edit-btn" onClick={() => handleEditField('locale')}>Edit</button>
                        </div>
                    </div>

                    {/* Timezone */}
                    <div className="settings-group">
                        <div className="field-row">
                            <div className="field-info">
                                <h4>Timezone</h4>
                                <p>{user?.timezone || 'UTC'}</p>
                            </div>
                            <button className="edit-btn" onClick={() => handleEditField('timezone')}>Edit</button>
                        </div>
                    </div>

                    {/* Account Type */}
                    <div className="settings-group">
                        <div className="field-row">
                            <div className="field-info">
                                <h4>Account Type</h4>
                            </div>
                            <div className="account-type-badge">
                                {user?.role === 'ROLE_ADMIN' ? 'Admin' : user?.role === 'ROLE_MODERATOR' ? 'Teacher' : 'Student'}
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-section">
                <span className="section-label">Appearance</span>
                <div className="settings-card">
                    <div className="settings-group theme-selector">
                        <div className="field-info">
                            <h4>Theme</h4>
                        </div>
                        <div className="dropdown-container" onClick={handleThemeChange}>
                            {theme}
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
