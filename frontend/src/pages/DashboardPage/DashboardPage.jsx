import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyClasses, getSuggestedClasses } from '../../api/class';
import { getMyFolders, getSuggestedFolders } from '../../api/folder';
import { getMyFlashcardSets, getSuggestedSets } from '../../api/flashcardSet';
import CreateClassModal from '../../components/Class/CreateClassModal';
import CreateFolderModal from '../../components/Folder/CreateFolderModal';
import { useAuth } from '../../context/AuthContext';
import { FolderOpen, Layers, BookOpen, Users } from 'lucide-react';
import { Button, Card, Loader, EmptyState, ItemCard } from '../../components/ui';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user, isAuthenticated } = useAuth();
    const [classes, setClasses] = useState([]);
    const [folders, setFolders] = useState([]);
    const [myFlashcardSets, setMyFlashcardSets] = useState([]);
    const [suggestedSets, setSuggestedSets] = useState([]);
    const [suggestedFolders, setSuggestedFolders] = useState([]);
    const [suggestedClasses, setSuggestedClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const navigate = useNavigate();

    const isTeacherOrAdmin = user?.role === 'ROLE_TEACHER' || user?.role === 'ROLE_ADMIN';

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!isAuthenticated) {
                setIsLoading(false);
                return;
            }

            if (!isAuthenticated) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const [myClasses, myFolders, mySets, suggSets, suggFolders, suggClasses] = await Promise.all([
                    getMyClasses(),
                    getMyFolders(),
                    getMyFlashcardSets(),
                    getSuggestedSets(4),
                    getSuggestedFolders(4),
                    getSuggestedClasses(4)
                ]);

                setClasses(myClasses);
                setFolders(myFolders);
                setMyFlashcardSets(mySets);
                setSuggestedSets(suggSets);
                setSuggestedFolders(suggFolders);
                setSuggestedClasses(suggClasses);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [isAuthenticated]);
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

    if (!isAuthenticated) {
        navigate('/');
        return null;
    }

    if (!isAuthenticated) {
        navigate('/');
        return null;
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">
                Welcome back, {user?.displayName || 'Student'}!
            </h1>

            {/* Recent Flashcard Sets */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2>Recent Flashcard Sets</h2>
                    <div className="section-actions">
                        <Button variant="outline" size="sm" onClick={() => navigate('/flashcard-sets/create')}>New Flashcard Set</Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/flashcard-sets')}>View all</Button>
                    </div>
                </div>
                {myFlashcardSets.length > 0 ? (
                    <div className="dashboard-grid">
                        {myFlashcardSets.slice(0, 3).map(set => (
                            <ItemCard
                                key={set.setId}
                                onClick={() => navigate(`/flashcard-sets/${set.setId}`)}
                                title={set.title}
                                badge="Flashcards"
                                description={set.description || 'No description provided.'}
                                footerText={`${set.flashcardCount} cards • by ${set.ownerDisplayName}`}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        description="No flashcard sets yet. Start creating your first set!"
                        action={<Button variant="primary" onClick={() => triggerComingSoon('Flashcard creation')}>Create Flashcard Set</Button>}
                    />
                )}
            </section>

            {/* My Flashcard Sets */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2>My Flashcard Sets</h2>
                    <Button variant="ghost" size="sm" onClick={() => triggerComingSoon('My Sets')}>View all</Button>
                </div>
                {myFlashcardSets.length > 0 ? (
                    <div className="dashboard-grid">
                        {myFlashcardSets.map(set => (
                            <ItemCard
                                key={set.setId}
                                onClick={() => navigate(`/flashcard-sets/${set.setId}`)}
                                title={set.title}
                                badge="Flashcards"
                                description={set.description || 'No description provided.'}
                                footerText={`${set.flashcardCount} cards • by ${set.ownerDisplayName}`}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>You haven't created any flashcard sets yet.</p>
                        <Button variant="outline" onClick={() => triggerComingSoon('Flashcard creation')}>Create Set</Button>
                    </div>
                )}

            </section>

            {/* Suggested Flashcard Sets */}
            {suggestedSets.length > 0 && (
                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2>Suggested Flashcard Sets</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/search?q=')}>Explore all</Button>
                    </div>
                    <div className="dashboard-grid">
                        {suggestedSets.map(set => (
                            <ItemCard
                                key={set.setId}
                                onClick={() => navigate(`/flashcard-sets/${set.setId}`)}
                                title={set.title}
                                badge="Flashcards"
                                description={set.description || 'No description provided.'}
                                footerText={`${set.flashcardCount} cards • by ${set.ownerDisplayName}`}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* My Folders */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2>My Folders</h2>
                    <div className="section-actions">
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

            {/* Suggested Folders */}
            {suggestedFolders.length > 0 && (
                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2>Suggested Folders</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/search?q=')}>Explore all</Button>
                    </div>
                    <div className="dashboard-grid">
                        {suggestedFolders.map(folder => (
                            <ItemCard
                                key={folder.folderId}
                                onClick={() => navigate(`/folders/${folder.folderId}`)}
                                title={folder.name}
                                badge="Folder"
                                description={folder.description || 'No description provided.'}
                                footerText={`${folder.setCount} sets • by ${folder.ownerDisplayName}`}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* My Classes */}
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

            {/* Suggested Classes */}
            {suggestedClasses.length > 0 && (
                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2>Suggested Classes</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/search?q=')}>Explore all</Button>
                    </div>
                    <div className="dashboard-grid">
                        {suggestedClasses.map(cls => (
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
                </section>
            )}

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
