import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyClasses } from '../../api/class';
import CreateClassModal from '../../components/Class/CreateClassModal';
import { useAuth } from '../../context/AuthContext';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();

    const isTeacherOrAdmin = user?.role === 'ROLE_TEACHER' || user?.role === 'ROLE_ADMIN';

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await getMyClasses();
                setClasses(data);
            } catch (error) {
                console.error("Failed to fetch classes:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClasses();
    }, []);

    const handleClassClick = (classId) => {
        navigate(`/classes/${classId}`);
    };

    const handleClassCreated = (newClass) => {
        setClasses(prev => [newClass, ...prev]);
        setIsCreateModalOpen(false);
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Welcome back to Kuizu!</h1>

            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2>My Classes</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {isTeacherOrAdmin && (
                            <button className="primary-button" style={{ padding: '6px 16px' }} onClick={() => setIsCreateModalOpen(true)}>Create Class</button>
                        )}
                        <button className="primary-link" onClick={() => navigate('/classes')}>View all</button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-state">Loading your classes...</div>
                ) : classes.length > 0 ? (
                    <div className="classes-grid">
                        {classes.map(cls => (
                            <div
                                key={cls.classId}
                                className="class-card"
                                onClick={() => handleClassClick(cls.classId)}
                            >
                                <div className="class-card-header">
                                    <h3 className="class-card-title">{cls.className}</h3>
                                    <span className="class-card-badge">Class</span>
                                </div>
                                <div className="class-card-body">
                                    <p className="class-card-description">{cls.description || 'No description provided.'}</p>
                                </div>
                                <div className="class-card-footer">
                                    <span className="class-owner-tag">by {cls.ownerDisplayName}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>You haven't joined any classes yet.</p>
                        <button className="primary-button" onClick={() => navigate('/classes/explore')}>Explore Classes</button>
                    </div>
                )}
            </section>

            <CreateClassModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateSuccess={handleClassCreated}
            />
        </div>
    );
};

export default DashboardPage;
