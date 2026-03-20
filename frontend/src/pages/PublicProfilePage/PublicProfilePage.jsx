import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicUserByUsername } from '../../api/user';
import MainLayout from '../../components/layout';
import { Loader, Card, Button } from '../../components/ui';
import { Calendar, MapPin, Clock } from 'lucide-react';
import '../ProfilePage.css';

const PublicProfilePage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const data = await getPublicUserByUsername(username);
                setUser(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load user profile');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [username]);

    if (isLoading) {
        return (
            <MainLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <Loader />
                </div>
            </MainLayout>
        );
    }

    if (error || !user) {
        return (
            <MainLayout>
                <div className="profile-container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <p style={{ color: 'var(--error)', fontSize: '1.2rem', fontWeight: '600' }}>{error || 'User not found'}</p>
                    <Button variant="outline" onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>Go Back</Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="profile-container">
                <h1 className="profile-title">{user.displayName || user.username}'s Profile</h1>

                <div className="profile-section">
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                            <img
                                src={user.profilePictureUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username}
                                alt="Profile"
                                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{user.displayName || user.username}</h2>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>@{user.username}</p>
                                <div className="account-type-badge" style={{ display: 'inline-block', marginTop: '8px' }}>
                                    {user.role === 'ROLE_ADMIN' ? 'Admin' : user.role === 'ROLE_TEACHER' ? 'Teacher' : 'Student'}
                                </div>
                            </div>
                        </div>

                        {user.bio && (
                            <div className="settings-group">
                                <div className="field-info">
                                    <h4>About</h4>
                                    <p className="bio-text" style={{ whiteSpace: 'pre-wrap' }}>{user.bio}</p>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px', maxWidth: '600px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                <MapPin size={16} />
                                <span>{user.locale || 'Location not specified'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                <Clock size={16} />
                                <span>{user.timezone || 'Timezone not specified'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                <Calendar size={16} />
                                <span>Joined on {new Date(user.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};

export default PublicProfilePage;
