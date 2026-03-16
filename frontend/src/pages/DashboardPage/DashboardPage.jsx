import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyClasses } from '../../api/class';
import { getMyFolders, getPublicFolders } from '../../api/folder';
import CreateClassModal from '../../components/Class/CreateClassModal';
import CreateFolderModal from '../../components/Folder/CreateFolderModal';
import { useAuth } from '../../context/AuthContext';
import { FolderOpen, Globe } from 'lucide-react';
import { Button, Card, Loader, EmptyState, ItemCard } from '../../components/ui';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [folders, setFolders] = useState([]);
    const [publicFolders, setPublicFolders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const navigate = useNavigate();

    const isTeacherOrAdmin = user?.role === 'ROLE_TEACHER' || user?.role === 'ROLE_ADMIN';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [classData, folderData, pubFolderData] = await Promise.all([
                    getMyClasses(),
                    getMyFolders(),
                    getPublicFolders()
                ]);
                setClasses(classData);
                setFolders(folderData);
                setPublicFolders(pubFolderData);
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
        setIsCreateClassOpen(false);
    };

    const handleFolderCreated = (newFolder) => {
        setFolders(prev => [newFolder, ...prev]);
        setIsCreateFolderOpen(false);
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
                    <div className="section-actions">
                        <Button variant="outline" size="sm" onClick={() => setIsCreateFolderOpen(true)}>New Folder</Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/folders')}>View all</Button>
                    </div>
                </div>

                {folders.length > 0 ? (
                    <div className="dashboard-grid">
                        {folders.map(folder => (
                            <Card
                                key={folder.folderId}
                                className="dashboard-item-card"
                                onClick={() => navigate(`/folders/${folder.folderId}`)}
                            >
                                <div className="card-header-custom">
                                    <h3 className="card-title-custom">{folder.name}</h3>
                                    <span className="badge-custom">
                                        <FolderOpen size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                        {folder.setCount} sets
                                    </span>
                                </div>
                                <div className="card-body-custom">
                                    <p className="card-description-custom">{folder.description || 'No description provided.'}</p>
                                </div>
                                <div className="card-footer-custom">
                                    <span className="owner-text">by {folder.ownerDisplayName}</span>
                                    <span className={`visibility-tag ${folder.visibility?.toLowerCase()}`}>
                                        {folder.visibility === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>Organize your sets into folders for better study flow.</p>
                        <Button variant="primary" onClick={() => setIsCreateFolderOpen(true)}>Create Folder</Button>
                    </div>
                )}
            </section>

            {/* Suggested Public Folders */}
            {publicFolders.length > 0 && (
                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2>
                            <Globe size={20} style={{ marginRight: 8, verticalAlign: 'middle', color: '#10b981' }} />
                            Suggested Folders
                        </h2>
                        <div className="section-actions">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/folders')}>View all</Button>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        {publicFolders.slice(0, 4).map(folder => (
                            <Card
                                key={folder.folderId}
                                className="dashboard-item-card"
                                onClick={() => navigate(`/folders/${folder.folderId}`)}
                            >
                                <div className="card-header-custom">
                                    <h3 className="card-title-custom">{folder.name}</h3>
                                    <span className="badge-custom badge-green">
                                        <Globe size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                        {folder.setCount} sets
                                    </span>
                                </div>
                                <div className="card-body-custom">
                                    <p className="card-description-custom">{folder.description || 'No description provided.'}</p>
                                </div>
                                <div className="card-footer-custom">
                                    <span className="owner-text">by {folder.ownerDisplayName}</span>
                                    <span className="visibility-tag public">🌐 Public</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Classes Section */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2>My Classes</h2>
                    <div className="section-actions">
                        {isTeacherOrAdmin && (
                            <Button variant="outline" size="sm" onClick={() => setIsCreateClassOpen(true)}>Create Class</Button>
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
                isOpen={isCreateClassOpen}
                onClose={() => setIsCreateClassOpen(false)}
                onCreateSuccess={handleClassCreated}
            />

            <CreateFolderModal
                isOpen={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
                onCreateSuccess={handleFolderCreated}
            />
        </div>
    );
};

export default DashboardPage;
