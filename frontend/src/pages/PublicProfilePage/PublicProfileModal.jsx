import React, { useState, useEffect } from 'react';
import { getPublicUserByUsername } from '@/api/user';
import { Loader, Card, Button, Modal } from '@/components/ui';
import { Calendar, MapPin, Clock } from 'lucide-react';
import '@/pages/ProfilePage/ProfilePage.css';

const PublicProfileModal = ({ username, isOpen, onClose }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !username) return;

        const fetchUser = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getPublicUserByUsername(username);
                setUser(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load user profile');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [username, isOpen]);

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isLoading ? 'Loading...' : (user ? `${user.displayName || user.username}'s Profile` : 'User Profile')}
            size="md"
        >
            <div className="public-profile-modal-content">
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                        <Loader />
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: 'var(--error)', fontSize: '1.1rem', fontWeight: '600' }}>{error}</p>
                        <Button variant="outline" onClick={onClose} style={{ marginTop: '20px' }}>Close</Button>
                    </div>
                ) : user && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Header Section: Avatar + Info + Stats */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'auto 1fr', 
                            gap: '32px',
                            alignItems: 'start'
                        }}>
                            {/* Left: Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <img
                                    src={user.profilePictureUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username}
                                    alt="Profile"
                                    style={{ 
                                        width: '120px', 
                                        height: '120px', 
                                        borderRadius: '24px', 
                                        objectFit: 'cover', 
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                                        border: '4px solid var(--white)'
                                    }}
                                />
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '-8px', 
                                    right: '-8px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    boxShadow: '0 4px 10px rgba(66, 85, 255, 0.3)'
                                }}>
                                    {user.role === 'ROLE_ADMIN' ? 'Admin' : user.role === 'ROLE_TEACHER' ? 'Teacher' : 'Student'}
                                </div>
                            </div>

                            {/* Right: Info & Stats Grid */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: '800', lineHeight: 1.2 }}>
                                        {user.displayName || user.username}
                                    </h2>
                                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500' }}>
                                        @{user.username}
                                    </p>
                                </div>

                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(3, 1fr)', 
                                    gap: '16px' 
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ 
                                            width: '36px', height: '36px', borderRadius: '10px', 
                                            background: 'var(--primary-light)', color: 'var(--primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <MapPin size={18} />
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase' }}>Location</p>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {user.locale || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ 
                                            width: '36px', height: '36px', borderRadius: '10px', 
                                            background: '#fef3c7', color: '#d97706',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase' }}>Joined</p>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '500' }}>
                                                {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ 
                                            width: '36px', height: '36px', borderRadius: '10px', 
                                            background: '#e0f2fe', color: '#0284c7',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Clock size={18} />
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase' }}>Timezone</p>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {user.timezone || 'UTC'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio / About Section */}
                        <div style={{ 
                            background: 'var(--input-bg)', 
                            padding: '24px', 
                            borderRadius: '18px',
                            border: '1px solid var(--border-color)',
                            marginTop: '8px'
                        }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Bio</h4>
                            <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                                {user.bio || 'This user hasn\'t added a bio yet.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PublicProfileModal;
