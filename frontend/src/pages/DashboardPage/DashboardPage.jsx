import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyClasses, getSuggestedClasses } from '@/api/class';
import { getMyFolders, getPublicFolders, getSuggestedFolders } from '@/api/folder';
import { getMyFlashcardSets, getFlashcardSetById, getPublicFlashcardSets } from '@/api/flashcards';
import { saveFlashcardSet, unsaveFlashcardSet } from '@/api/savedSets';
import CreateClassModal from '@/components/Class/CreateClassModal';
import CreateFolderModal from '@/components/Folder/CreateFolderModal';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { FolderOpen, Globe, BookOpen, Heart, Book } from 'lucide-react';
import { Button, Card, Loader, EmptyState, ItemCard } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import StudyBulletin from '@/components/dashboard/StudyBulletin';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user, isAuthenticated } = useAuth();
    const { openSetModal } = useModal();
    const [classes, setClasses] = useState([]);
    const [suggestedClasses, setSuggestedClasses] = useState([]);
    const [folders, setFolders] = useState([]);
    const [suggestedFolders, setSuggestedFolders] = useState([]);
    const [publicFolders, setPublicFolders] = useState([]);
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [publicFlashcardSets, setPublicFlashcardSets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const isTeacherOrAdmin = user?.role === 'ROLE_TEACHER' || user?.role === 'ROLE_ADMIN';

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const [
                classData,
                sugClassData,
                folderData,
                pubFolderData,
                sugFolderData,
                mySetsData,
                publicSetsData
            ] = await Promise.all([
                getMyClasses(),
                getSuggestedClasses(4),
                getMyFolders(),
                getPublicFolders(),
                getSuggestedFolders(4),
                getMyFlashcardSets(),
                getPublicFlashcardSets()
            ]);
            
            // Get recent sets from localStorage
            const recentIds = JSON.parse(localStorage.getItem('recent_sets') || '[]');
            let recentSets = [];
            
            if (recentIds.length > 0) {
                // Fetch the content of these sets
                const results = await Promise.allSettled(
                    recentIds.map(id => {
                        const existing = mySetsData.find(s => String(s.setId) === String(id));
                        if (existing) return Promise.resolve(existing);
                        return getFlashcardSetById(id);
                    })
                );
                recentSets = results
                    .filter(r => r.status === 'fulfilled')
                    .map(r => r.value);
            }
            
            // Use history if available, otherwise fallback to my sets
            const displaySets = recentSets.length > 0 ? recentSets : mySetsData;

            setClasses(classData);
            setSuggestedClasses(sugClassData || []);
            setFolders(folderData);
            setPublicFolders(pubFolderData);
            setSuggestedFolders(sugFolderData || []);
            setFlashcardSets(displaySets);
            setPublicFlashcardSets(publicSetsData);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchDashboardData();
        }
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

    const handleNewSetClick = () => {
        openSetModal(null, (newSet) => {
            setFlashcardSets(prev => [newSet, ...prev]);
        });
    };

    const handleToggleFavorite = async (e, setId, isFavorite) => {
        e.stopPropagation();
        if (!user) {
            toast.error('Please log in to favorite sets');
            return;
        }

        try {
            if (isFavorite) {
                await unsaveFlashcardSet(setId);
                setFlashcardSets(flashcardSets.map(s => s.setId === setId ? { ...s, isFavorite: false } : s));
                setPublicFlashcardSets(publicFlashcardSets.map(s => s.setId === setId ? { ...s, isFavorite: false } : s));
                toast.success('Removed from favorites');
            } else {
                await saveFlashcardSet(setId);
                setFlashcardSets(flashcardSets.map(s => s.setId === setId ? { ...s, isFavorite: true } : s));
                setPublicFlashcardSets(publicFlashcardSets.map(s => s.setId === setId ? { ...s, isFavorite: true } : s));
                toast.success('Added to favorites');
            }
        } catch (err) {
            toast.error('Failed to update favorite status');
        }
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

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">
                Welcome back, {user?.displayName || 'Student'}!
            </h1>

            {/* Study Progress Bulletin */}
            <StudyBulletin />

            {/* Recent Flashcard Sets */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2>Recent Flashcard Sets</h2>
                    <div className="section-actions">
                        <Button variant="outline" size="sm" onClick={handleNewSetClick}>New Flashcard Set</Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/flashcard-sets')}>View all</Button>
                    </div>
                </div>

                {flashcardSets.length > 0 ? (
                    <div className="dashboard-grid">
                        {flashcardSets.slice(0, 4).map(set => (
                            <Card
                                key={set.setId}
                                className="resource-card"
                                onClick={() => navigate(`/flashcard-sets/${set.setId}`)}
                            >
                                <div className="card-header-custom">
                                    <h3 className="card-title-custom" title={set.title}>{set.title}</h3>
                                    <div className="card-header-actions">
                                        {user && user.userId !== set.ownerId && (
                                            <button 
                                                className={`card-favorite-btn ${set.isFavorite ? 'active' : ''}`}
                                                onClick={(e) => handleToggleFavorite(e, set.setId, set.isFavorite)}
                                            >
                                                <Heart size={16} fill={set.isFavorite ? "currentColor" : "none"} />
                                            </button>
                                        )}
                                        <div className="card-count-badge">
                                            <div className="count-main">
                                                <Book size={12} />
                                                <span>{set.cardCount || 0}</span>
                                            </div>
                                            <span className="count-label">TERMS</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="resource-card-body">
                                    <p className="resource-card-description">{set.description || 'No description provided.'}</p>
                                </div>
                                <div className="resource-card-footer">
                                    <span className="resource-card-owner">by {set.ownerDisplayName}</span>
                                    <span className={`resource-card-visibility ${set.visibility?.toLowerCase()}`}>
                                        {set.visibility === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        description="No flashcard sets yet. Start creating your first set!"
                        action={<Button variant="primary" onClick={handleNewSetClick}>Create Flashcard Set</Button>}
                    />
                )}
            </section>

            {/* Suggested Flashcard Sets */}
            {publicFlashcardSets.length > 0 && (
                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2>
                            <Globe size={20} style={{ marginRight: 8, verticalAlign: 'middle', color: '#10b981' }} />
                            Suggested Flashcard Sets
                        </h2>
                        <div className="section-actions">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/flashcard-sets')}>View all</Button>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        {publicFlashcardSets.slice(0, 4).map(set => (
                            <Card
                                key={set.setId}
                                className="resource-card"
                                onClick={() => navigate(`/flashcard-sets/${set.setId}`)}
                            >
                                <div className="card-header-custom">
                                    <h3 className="card-title-custom" title={set.title}>{set.title}</h3>
                                    <div className="card-header-actions">
                                        {user && user.userId !== set.ownerId && (
                                            <button 
                                                className={`card-favorite-btn ${set.isFavorite ? 'active' : ''}`}
                                                onClick={(e) => handleToggleFavorite(e, set.setId, set.isFavorite)}
                                            >
                                                <Heart size={16} fill={set.isFavorite ? "currentColor" : "none"} />
                                            </button>
                                        )}
                                        <div className="card-count-badge badge-green">
                                            <div className="count-main">
                                                <Book size={12} />
                                                <span>{set.cardCount || 0}</span>
                                            </div>
                                            <span className="count-label">TERMS</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="resource-card-body">
                                    <p className="resource-card-description">{set.description || 'No description provided.'}</p>
                                </div>
                                <div className="resource-card-footer">
                                    <span className="resource-card-owner">by {set.ownerDisplayName}</span>
                                    <span className="resource-card-visibility public">🌐 Public</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Folders Section and other sections... */}
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
                                className="resource-card"
                                onClick={() => navigate(`/folders/${folder.folderId}`)}
                            >
                                <div className="card-header-custom">
                                    <h3 className="card-title-custom" title={folder.name}>{folder.name}</h3>
                                    <div className="card-count-badge badge-purple">
                                        <div className="count-main">
                                            <FolderOpen size={12} />
                                            <span>{folder.setCount}</span>
                                        </div>
                                        <span className="count-label">SETS</span>
                                    </div>
                                </div>
                                <div className="resource-card-body">
                                    <p className="resource-card-description">{folder.description || 'No description provided.'}</p>
                                </div>
                                <div className="resource-card-footer">
                                    <span className="resource-card-owner">by {folder.ownerDisplayName}</span>
                                    <span className={`resource-card-visibility ${folder.visibility?.toLowerCase()}`}>
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
                                badge={cls.status === 'PENDING' ? 'Pending Review' : (cls.status === 'REJECTED' ? 'Rejected' : 'Class')}
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
