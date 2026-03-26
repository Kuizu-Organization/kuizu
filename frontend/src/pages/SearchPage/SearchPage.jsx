import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchClasses, getSuggestedClasses } from '@/api/class';
import { searchFolders, getSuggestedFolders } from '@/api/folder';
import { searchFlashcardSets, getSuggestedSets } from '@/api/flashcardSet';
import { searchPublicUsers } from '@/api/user';
import { Search, BookOpen, Users, FolderOpen, Layers, User } from 'lucide-react';
import { Loader, EmptyState, Card } from '@/components/ui';
import PublicProfileModal from '@/pages/PublicProfilePage/PublicProfileModal';
import './SearchPage.css';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const navigate = useNavigate();

    const [results, setResults] = useState({ classes: [], folders: [], sets: [], users: [] });
    const [activeTab, setActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    const [limits, setLimits] = useState({ classes: 8, folders: 8, sets: 8, users: 8 });
    const [hasMore, setHasMore] = useState({ classes: false, folders: false, sets: false, users: false });

    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setIsLoading(true);
                if (!query) {
                    const [classes, folders, sets, usersRes] = await Promise.all([
                        getSuggestedClasses(limits.classes),
                        getSuggestedFolders(limits.folders),
                        getSuggestedSets(limits.sets),
                        searchPublicUsers('', 0, limits.users)
                    ]);
                    setResults({
                        classes: classes || [],
                        folders: folders || [],
                        sets: sets || [],
                        users: usersRes.content || []
                    });
                    setHasMore({
                        classes: (classes || []).length >= limits.classes,
                        folders: (folders || []).length >= limits.folders,
                        sets: (sets || []).length >= limits.sets,
                        users: (usersRes.content || []).length >= limits.users
                    });
                } else {
                    const resultsRaw = await Promise.allSettled([
                        searchClasses(query),
                        searchFolders(query),
                        searchFlashcardSets(query),
                        searchPublicUsers(query, 0, limits.users)
                    ]);

                    const classes = resultsRaw[0].status === 'fulfilled' ? resultsRaw[0].value : [];
                    const folders = resultsRaw[1].status === 'fulfilled' ? resultsRaw[1].value : [];
                    const sets = resultsRaw[2].status === 'fulfilled' ? resultsRaw[2].value : [];
                    const usersRes = resultsRaw[4]?.status === 'fulfilled' ? resultsRaw[4].value : (resultsRaw[3].status === 'fulfilled' ? resultsRaw[3].value : { content: [] });

                    const lowerQuery = query.toLowerCase();
                    const filterFn = (text) => {
                        if (!text) return false;
                        const words = text.toLowerCase().split(/[\s\-_]+/);
                        return words.some(word => word.startsWith(lowerQuery));
                    };

                    setResults({
                        classes: (classes || []).filter(c => filterFn(c.className)),
                        folders: (folders || []).filter(f => filterFn(f.name)),
                        sets: (sets || []).filter(s => filterFn(s.title)),
                        users: (usersRes.content || []).filter(u => filterFn(u.username) || filterFn(u.displayName))
                    });
                    setHasMore({ classes: false, folders: false, sets: false, users: false });
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query, limits]);

    const totalResults = results.classes.length + results.folders.length + results.sets.length + results.users.length;

    const handleShowMore = () => {
        if (activeTab === 'all') {
            setLimits(prev => ({
                classes: prev.classes + 8,
                folders: prev.folders + 8,
                sets: prev.sets + 8,
                users: prev.users + 8
            }));
        } else {
            setLimits(prev => ({
                ...prev,
                [activeTab]: prev[activeTab] + 8
            }));
        }
    };

    const showMoreButton = !query && (
        (activeTab === 'all' && (hasMore.classes || hasMore.folders || hasMore.sets || hasMore.users)) ||
        (hasMore[activeTab])
    );

    const renderResults = () => {
        const items = [];

        if (activeTab === 'all' || activeTab === 'sets') {
            results.sets.forEach(set => items.push({
                id: `set-${set.setId}`,
                className: "resource-card",
                onClick: () => navigate(`/flashcard-sets/${set.setId}`),
                content: (
                    <>
                        <div className="resource-card-header">
                            <h3 className="resource-card-title">{set.title}</h3>
                            <span className="resource-card-badge">
                                <BookOpen size={12} />
                                {set.cardCount} terms
                            </span>
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
                    </>
                )
            }));
        }

        if (activeTab === 'all' || activeTab === 'folders') {
            results.folders.forEach(folder => items.push({
                id: `folder-${folder.folderId}`,
                className: "resource-card",
                onClick: () => navigate(`/folders/${folder.folderId}`),
                content: (
                    <>
                        <div className="resource-card-header">
                            <h3 className="resource-card-title">{folder.name}</h3>
                            <span className="resource-card-badge">
                                <FolderOpen size={12} />
                                {folder.setCount} sets
                            </span>
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
                    </>
                )
            }));
        }

        if (activeTab === 'all' || activeTab === 'classes') {
            results.classes.forEach(cls => items.push({
                id: `class-${cls.classId}`,
                className: "resource-card",
                onClick: () => navigate(`/classes/${cls.classId}`),
                content: (
                    <>
                        <div className="resource-card-header">
                            <h3 className="resource-card-title">{cls.className}</h3>
                            <span className="resource-card-badge">
                                <Users size={12} />
                                Class
                            </span>
                        </div>
                        <div className="resource-card-body">
                            <p className="resource-card-description">{cls.description || 'No description provided.'}</p>
                        </div>
                        <div className="resource-card-footer">
                            <span className="resource-card-owner">by {cls.ownerDisplayName}</span>
                            <span className={`resource-card-visibility public`}>
                                🌐 Public
                            </span>
                        </div>
                    </>
                )
            }));
        }

        if (activeTab === 'all' || activeTab === 'users') {
            results.users.forEach(user => items.push({
                id: `user-${user.username}`,
                className: "resource-card user-card",
                onClick: () => {
                    setSelectedUser(user.username);
                    setIsUserModalOpen(true);
                },
                content: (
                    <>
                        <div className="resource-card-header">
                            <div className="user-profile-info">
                                <img 
                                    src={user.profilePictureUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username} 
                                    className="user-card-avatar"
                                    alt={user.username}
                                />
                                <h3 className="resource-card-title">{user.displayName || user.username}</h3>
                            </div>
                            <span className="resource-card-badge">
                                <User size={12} />
                                {user.role ? (user.role.charAt(5).toUpperCase() + user.role.slice(6).toLowerCase()) : 'User'}
                            </span>
                        </div>
                        <div className="resource-card-body">
                            <p className="resource-card-description">{user.bio || 'This user hasn\'t provided a bio yet.'}</p>
                        </div>
                        <div className="resource-card-footer">
                            <span className="resource-card-owner">@{user.username}</span>
                            <span className="resource-card-visibility public">🌐 Global</span>
                        </div>
                    </>
                )
            }));
        }


        if (items.length === 0) {
            return (
                <EmptyState
                    icon={BookOpen}
                    title={query ? "No results found" : "No public resources available"}
                    description={query
                        ? `We couldn't find any ${activeTab === 'all' ? '' : activeTab} matching "${query}". Try adjusting your search keywords.`
                        : `There are currently no public ${activeTab === 'all' ? '' : activeTab} to explore.`}
                />
            );
        }

        return (
            <>
                <div className="search-results-grid">
                    {items.map(item => (
                        <Card
                            key={item.id}
                            className={item.className}
                            onClick={item.onClick}
                        >
                            {item.content}
                        </Card>
                    ))}
                </div>
                {showMoreButton && (
                    <div className="search-show-more-container">
                        <button className="btn-show-more" onClick={handleShowMore}>
                            Show More
                        </button>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="search-page-container">
            <header className="search-page-header">
                <div className="search-page-title">
                    <Search size={28} className="search-page-icon" />
                    <h1>{query ? `Search Results for "${query}"` : "Explore Kuizu"}</h1>
                </div>
                <div className="search-tabs">
                    <button
                        className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All ({totalResults})
                    </button>
                    <button
                        className={`search-tab ${activeTab === 'sets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sets')}
                    >
                        Sets ({results.sets.length})
                    </button>
                    <button
                        className={`search-tab ${activeTab === 'folders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('folders')}
                    >
                        Folders ({results.folders.length})
                    </button>
                    <button
                        className={`search-tab ${activeTab === 'classes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('classes')}
                    >
                        Classes ({results.classes.length})
                    </button>
                    <button
                        className={`search-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users ({results.users.length})
                    </button>
                </div>
            </header>

            <main className="search-results-section">
                {isLoading ? (
                    <div className="search-loading-container">
                        <Loader fullPage={false} />
                        <p>Searching for resources...</p>
                    </div>
                ) : renderResults()}
            </main>

            <PublicProfileModal
                username={selectedUser}
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
            />
        </div>
    );
};

export default SearchPage;
