import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyClasses } from '../../api/class';
import CreateClassModal from '../../components/Class/CreateClassModal';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Loader, ComingSoonModal } from '../../components/ui';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
    const [currentFeature, setCurrentFeature] = useState('');
    const navigate = useNavigate();

    const isTeacherOrAdmin = user?.role === 'ROLE_TEACHER' || user?.role === 'ROLE_ADMIN';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const classData = await getMyClasses();
                setClasses(classData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleClassClick = (classId) => {
        navigate(`/classes/${classId}`);
    };

    const handleClassCreated = (newClass) => {
        setClasses(prev => [newClass, ...prev]);
        setIsCreateModalOpen(false);
    };

    const toggleComingSoon = (feature = '') => {
        if (typeof feature === 'string') {
            setCurrentFeature(feature);
        } else {
            setCurrentFeature('');
        }
        setIsComingSoonOpen(!isComingSoonOpen);
    };

    if (isLoading) {
        return <Loader fullPage={true} />;
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Welcome back to Kuizu!</h1>

            {/* Flashcard Sets Section */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2>Recent Flashcard Sets</h2>
                    <div className="section-actions">
                        <Button variant="outline" size="sm" onClick={() => toggleComingSoon('Flashcard creation')}>Create Set</Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleComingSoon('Sets Library')}>View all</Button>
                    </div>
                </div>

                <div className="empty-state">
                    <p>No flashcard sets yet. Start creating your first set!</p>
                    <Button variant="primary" onClick={() => toggleComingSoon('Flashcard creation')}>Create Flashcard Set</Button>
                </div>
            </section>

            {/* Folders Section */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2>My Folders</h2>
                    <div className="section-actions">
                        <Button variant="outline" size="sm" onClick={() => toggleComingSoon('Folder creation')}>New Folder</Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleComingSoon('Folders Library')}>View all</Button>
                    </div>
                </div>

                <div className="empty-state">
                    <p>Organize your sets into folders for better study flow.</p>
                    <Button variant="outline" onClick={() => toggleComingSoon('Folder creation')}>Create Folder</Button>
                </div>
            </section>

            {/* Classes Section */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2>My Classes</h2>
                    <div className="section-actions">
                        {isTeacherOrAdmin && (
                            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(true)}>Create Class</Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => toggleComingSoon('Classes Library')}>View all</Button>
                    </div>
                </div>

                {classes.length > 0 ? (
                    <div className="dashboard-grid">
                        {classes.map(cls => (
                            <Card
                                key={cls.classId}
                                className="dashboard-item-card"
                                onClick={() => handleClassClick(cls.classId)}
                            >
                                <div className="card-header-custom">
                                    <h3 className="card-title-custom">{cls.className}</h3>
                                    <span className="badge-custom">Class</span>
                                </div>
                                <div className="card-body-custom">
                                    <p className="card-description-custom">{cls.description || 'No description provided.'}</p>
                                </div>
                                <div className="card-footer-custom">
                                    <span className="owner-text">by {cls.ownerDisplayName}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>You haven't joined any classes yet.</p>
                        <Button variant="primary" onClick={() => toggleComingSoon('Explore Classes')}>Explore Classes</Button>
                    </div>
                )}
            </section>

            <CreateClassModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateSuccess={handleClassCreated}
            />

            <ComingSoonModal
                isOpen={isComingSoonOpen}
                onClose={toggleComingSoon}
                featureName={currentFeature}
            />
        </div>
    );
};

export default DashboardPage;
