import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyClasses } from '../../api/class';
import CreateClassModal from '../../components/Class/CreateClassModal';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Loader, EmptyState, ItemCard } from '../../components/ui';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

    const triggerComingSoon = (feature = '') => {
        const query = feature ? `?feature=${encodeURIComponent(feature)}` : '';
        navigate(`/coming-soon${query}`);
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
                </div>
                <EmptyState
                    description="No flashcard sets yet. Start creating your first set!"
                    action={<Button variant="primary" onClick={() => triggerComingSoon('Flashcard creation')}>Create Flashcard Set</Button>}
                />
            </section>

            {/* Folders Section */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2>My Folders</h2>
                </div>
                <EmptyState
                    description="Organize your sets into folders for better study flow."
                    action={<Button variant="outline" onClick={() => triggerComingSoon('Folder creation')}>Create Folder</Button>}
                />
            </section>

            {/* Classes Section */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2>My Classes</h2>
                    <div className="section-actions">
                        {isTeacherOrAdmin && (
                            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(true)}>Create Class</Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => triggerComingSoon('Classes Library')}>View all</Button>
                    </div>
                </div>

                {classes.length > 0 ? (
                    <div className="dashboard-grid">
                        {classes.map(cls => (
                            <ItemCard
                                key={cls.classId}
                                onClick={() => handleClassClick(cls.classId)}
                                title={cls.className}
                                badge="Class"
                                description={cls.description || 'No description provided.'}
                                footerText={`by ${cls.ownerDisplayName}`}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        description="You haven't joined any classes yet."
                        action={<Button variant="primary" onClick={() => triggerComingSoon('Explore Classes')}>Explore Classes</Button>}
                    />
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
