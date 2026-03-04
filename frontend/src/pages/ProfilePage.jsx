import React, { useState, useEffect } from 'react';
import { Camera, ChevronDown, Plus, Pencil, User as UserIcon, Mail, ShieldCheck, Palette, Lock } from 'lucide-react';
import './ProfilePage.css';
import { updateProfile, changePassword } from '../api/user';
import { Button, Card, Input, Modal } from '../components/ui';
import MainLayout from '../components/layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';


const ProfilePage = () => {
    const { user, checkAuth, loading: authLoading } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'Light');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingField, setEditingField] = useState('');
    const [editValue, setEditValue] = useState('');

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const fieldLabels = {
        displayName: 'Display Name',
        bio: 'Bio',
        locale: 'Location',
        timezone: 'Timezone'
    };

    const handleUpdateAvatar = async (url) => {
        try {
            setLoading(true);
            await updateProfile({ profilePictureUrl: url });
            await checkAuth(); // Sync global state
            toast.success('Avatar updated successfully');
        } catch (err) {
            toast.error('Failed to update avatar');
        } finally {

            setLoading(false);
        }
    };

    const handleEditField = (field) => {
        setEditingField(field);
        setEditValue(user[field] || '');
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (editValue !== user[editingField]) {
            await performUpdate({ [editingField]: editValue });
        }
        setIsEditModalOpen(false);
    };

    const performUpdate = async (data) => {
        try {
            setLoading(true);
            await updateProfile(data);
            await checkAuth(); // Sync global state
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error('Update failed');
        } finally {

            setLoading(false);
        }
    };

    const handlePasswordSubmit = async () => {
        if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('Please fill in all password fields');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/;
        if (!passwordRegex.test(passwordData.newPassword)) {
            toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one special character (@#$%^&+=!)');
            return;
        }

        try {
            setLoading(true);
            await changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully');
            setIsPasswordModalOpen(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleThemeChange = () => {
        const newTheme = theme === 'Light' ? 'Dark' : 'Light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        // Sync theme to backend preferences
        performUpdate({ preferences: JSON.stringify({ theme: newTheme }) });
    };

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

    return (
        <MainLayout isLoading={authLoading || loading}>
            {error ? (
                <div className="profile-container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <p style={{ color: 'var(--error)', fontSize: '1.2rem', fontWeight: '600' }}>{error}</p>
                    <Button variant="outline" onClick={checkAuth} style={{ marginTop: '20px' }}>Try Again</Button>
                </div>
            ) : (
                <div className="profile-container">
                    <h1 className="profile-title">Settings</h1>

                    <div className="profile-section">
                        <span className="section-label">Personal Information</span>
                        <Card className="settings-card">
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

                            {/* Username */}
                            <div className="settings-group">
                                <div className="field-row">
                                    <div className="field-info">
                                        <h4>Username</h4>
                                        <p>{user?.username}</p>
                                    </div>
                                    {/* Read-only */}
                                </div>
                            </div>

                            {/* Locale (Location) */}
                            <div className="settings-group">
                                <div className="field-row">
                                    <div className="field-info">
                                        <h4>Location</h4>
                                        <p>{user?.locale || 'Set your location'}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleEditField('locale')}>Edit</Button>
                                </div>
                            </div>

                            {/* Timezone */}
                            <div className="settings-group">
                                <div className="field-row">
                                    <div className="field-info">
                                        <h4>Timezone</h4>
                                        <p>Your current time zone settings</p>
                                    </div>
                                    <select
                                        className="timezone-select"
                                        value={user?.timezone || 'UTC'}
                                        onChange={(e) => performUpdate({ timezone: e.target.value })}
                                        disabled={loading}
                                    >
                                        <option value="UTC">UTC (GMT+0)</option>
                                        <option value="Asia/Ho_Chi_Minh">Vietnam (GMT+7)</option>
                                        <option value="Asia/Tokyo">Japan (GMT+9)</option>
                                        <option value="Asia/Singapore">Singapore (GMT+8)</option>
                                        <option value="Europe/London">London (GMT+0/1)</option>
                                        <option value="Europe/Paris">Paris (GMT+1/2)</option>
                                        <option value="America/New_York">New York (GMT-5/4)</option>
                                        <option value="America/Los_Angeles">Los Angeles (GMT-8/7)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Account Type */}
                            <div className="settings-group">
                                <div className="field-row">
                                    <div className="field-info">
                                        <h4>Account Type</h4>
                                    </div>
                                    <div className="account-type-badge">
                                        {user?.role === 'ROLE_ADMIN' ? 'Admin' : user?.role === 'ROLE_TEACHER' ? 'Teacher' : 'Student'}
                                    </div>
                                </div>
                            </div>

                            {/* Account Status */}
                            <div className="settings-group">
                                <div className="field-row">
                                    <div className="field-info">
                                        <h4>Account Status</h4>
                                        <p style={{ color: user?.status === 'ACTIVE' ? 'var(--primary)' : 'var(--error)' }}>
                                            {user?.status || 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Last Login */}
                            <div className="settings-group">
                                <div className="field-row">
                                    <div className="field-info">
                                        <h4>Last Login</h4>
                                        <p>{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'Never'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Joined Date */}
                            <div className="settings-group">
                                <div className="field-row">
                                    <div className="field-info">
                                        <h4>Joined On</h4>
                                        <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="profile-section">
                        <span className="section-label">Security</span>
                        <Card className="profile-card">
                            <div className="settings-group">
                                <div className="field-row">
                                    <div className="field-info">
                                        <h4>Password</h4>
                                        <p>Change your account password to keep it secure</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                                    >
                                        Change Password
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Edit Modal */}
                    <Modal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        title={`Edit ${fieldLabels[editingField]}`}
                        footer={
                            <>
                                <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleEditSubmit}>Save Changes</Button>
                            </>
                        }
                    >
                        <div className="edit-modal-content">
                            {editingField === 'bio' ? (
                                <textarea
                                    className="edit-textarea"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder={`Enter your ${fieldLabels[editingField]}`}
                                    rows={4}
                                />
                            ) : (
                                <Input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder={`Enter your ${fieldLabels[editingField]}`}
                                    autoFocus
                                />
                            )}
                        </div>
                    </Modal>

                    {/* Change Password Modal */}
                    <Modal
                        isOpen={isPasswordModalOpen}
                        onClose={() => setIsPasswordModalOpen(false)}
                        title="Change Password"
                        footer={
                            <>
                                <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handlePasswordSubmit}>Update Password</Button>
                            </>
                        }
                    >
                        <div className="edit-modal-content">
                            <div className="password-input-group">
                                <label className="input-label">Current Password</label>
                                <Input
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="password-input-group" style={{ marginTop: '16px' }}>
                                <label className="input-label">New Password</label>
                                <Input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Enter new password (min 8 chars, 1 upper, 1 lower, 1 special)"
                                />
                            </div>
                            <div className="password-input-group" style={{ marginTop: '16px' }}>
                                <label className="input-label">Confirm New Password</label>
                                <Input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </Modal>
                </div>
            )}
        </MainLayout>
    );
};


export default ProfilePage;
