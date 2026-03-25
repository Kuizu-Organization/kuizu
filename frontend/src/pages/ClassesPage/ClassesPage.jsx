import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyClasses, searchClasses } from '@/api/class';
import { Loader, Button, Card, Input } from '@/components/ui';
import CreateClassModal from '@/components/Class/CreateClassModal';
import JoinClassModal from '@/components/Class/JoinClassModal';
import { GraduationCap, Plus, Search, Users, Shield, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import './ClassesPage.css';

const ClassesPage = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [selectedJoinClassId, setSelectedJoinClassId] = useState(null);
    const navigate = useNavigate();

    const fetchMyClasses = async () => {
        try {
            setIsLoading(true);
            const data = await getMyClasses();
            setClasses(data);
        } catch (error) {
            console.error("Failed to fetch classes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyClasses();
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const data = await searchClasses(query);
            // Filter out classes the user is already in
            const myClassIds = new Set(classes.map(c => c.classId));
            setSearchResults(data.filter(c => !myClassIds.has(c.classId)));
        } catch (error) {
            console.error("Failed to search classes:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleClassClick = (classId) => {
        navigate(`/classes/${classId}`);
    };

    const handleClassCreated = (newClass) => {
        setClasses(prev => [newClass, ...prev]);
    };

    const handleJoinClick = (classId) => {
        setSelectedJoinClassId(classId);
        setIsJoinOpen(true);
    };

    const handleJoinSuccess = (joinedInstantly) => {
        if (joinedInstantly) {
            fetchMyClasses();
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const isTeacher = user?.role === 'ROLE_TEACHER' || user?.role === 'ROLE_ADMIN';

    if (isLoading && classes.length === 0) {
        return <Loader fullPage={true} />;
    }

    return (
        <div className="classes-container">
            <div className="classes-header">
                <div className="header-info">
                    <h1>Classes</h1>
                    <p>Connect with others and study together</p>
                </div>
                <div className="header-actions">
                    <Button variant="outline" onClick={() => setIsJoinOpen(true)}>
                        <Users size={18} style={{ marginRight: 8 }} />
                        Join Class
                    </Button>
                    {isTeacher && (
                        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
                            <Plus size={18} style={{ marginRight: 8 }} />
                            Create Class
                        </Button>
                    )}
                </div>
            </div>

            <div className="classes-search-section">
                <div className="search-bar-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search for public classes to join..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="class-search-input"
                    />
                    {isSearching && <div className="search-spinner"></div>}
                </div>

                {searchResults.length > 0 && (
                    <div className="search-results-overlay">
                        <h3>Found {searchResults.length} classes</h3>
                        <div className="results-grid">
                            {searchResults.map(cls => (
                                <div key={cls.classId} className="search-result-card">
                                    <div className="result-info">
                                        <h4>{cls.className}</h4>
                                        <p>by {cls.ownerDisplayName}</p>
                                    </div>
                                    <Button size="sm" onClick={() => handleJoinClick(cls.classId)}>Join</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <section className="my-classes-section">
                <div className="section-header">
                    <h2>My Classes</h2>
                    <span className="count-badge">{classes.length}</span>
                </div>

                {classes.length > 0 ? (
                    <div className="classes-grid">
                        {classes.map(cls => (
                            <Card
                                key={cls.classId}
                                className={`class-item-card ${cls.status === 'PENDING' ? 'pending' : ''}`}
                                onClick={() => handleClassClick(cls.classId)}
                            >
                                <div className="card-top">
                                    <div className="class-icon-wrapper">
                                        <GraduationCap size={24} />
                                    </div>
                                    <div className="class-status-badges">
                                        {cls.isOwner && <span className="badge owner"><Shield size={12} /> Owner</span>}
                                        {cls.status === 'PENDING' && <span className="badge pending"><Clock size={12} /> Pending Review</span>}
                                        {cls.status === 'REJECTED' && <span className="badge rejected"><AlertCircle size={12} /> Rejected</span>}
                                    </div>
                                </div>
                                <div className="card-body-custom">
                                    <h3 className="class-name-text">{cls.className}</h3>
                                    <p className="class-desc-text line-clamp-2">{cls.description || 'No description provided.'}</p>
                                </div>
                                <div className="card-footer-custom">
                                    <span className="owner-name text-sm text-gray-500">by {cls.ownerDisplayName}</span>
                                    <div className="class-stats">
                                        <Users size={14} />
                                        <span>View Details</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="classes-empty-state">
                        <div className="empty-icon-container">
                            <GraduationCap size={48} />
                        </div>
                        <h3>No classes yet</h3>
                        <p>Join a class or create your own to start studying with others.</p>
                        <div className="empty-actions">
                            <Button variant="outline" onClick={() => setIsJoinOpen(true)}>Join a Class</Button>
                            {isTeacher && <Button variant="primary" onClick={() => setIsCreateOpen(true)}>Create a Class</Button>}
                        </div>
                    </div>
                )}
            </section>

            <CreateClassModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreateSuccess={handleClassCreated}
            />

            <JoinClassModal
                isOpen={isJoinOpen}
                onClose={() => {
                    setIsJoinOpen(false);
                    setSelectedJoinClassId(null);
                }}
                classId={selectedJoinClassId}
                onJoinSuccess={handleJoinSuccess}
            />
        </div>
    );
};

export default ClassesPage;
