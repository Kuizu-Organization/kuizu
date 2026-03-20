import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Pencil, Trash2 } from 'lucide-react';
import './FlashcardSetsPage.css';
import { getPublicFlashcardSets, getMyFlashcardSets, deleteFlashcardSet } from '../api/flashcards';
import { Button, Card, Loader } from '../components/ui';
import MainLayout from '../components/layout';
import { useNavigate } from 'react-router-dom';

const FlashcardSetsPage = () => {
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('public');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSets();
    }, [activeTab]);

    const fetchSets = async () => {
        try {
            setLoading(true);
            const data = activeTab === 'public'
                ? await getPublicFlashcardSets()
                : await getMyFlashcardSets();
            setSets(data);
        } catch (err) {
            console.error('Error fetching sets:', err);
            setError('Could not load flashcard sets.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, setId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this set?')) {
            try {
                await deleteFlashcardSet(setId);
                setSets(sets.filter(s => s.setId !== setId));
            } catch (err) {
                alert('Failed to delete set');
            }
        }
    };

    const filteredSets = sets.filter(set =>
        set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (set.description && set.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <MainLayout>
            <div className="sets-container">
                <div className="sets-header">
                    <div className="header-top">
                        <h1 className="sets-title">Flashcard Sets</h1>
                        <Button
                            className="create-btn"
                            onClick={() => navigate('/flashcard-sets/create')}
                        >
                            <Plus size={20} />
                            Create Set
                        </Button>
                    </div>

                    <div className="header-filters">
                        <div className="search-bar">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search sets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="tabs">
                            <button
                                className={`tab-item ${activeTab === 'public' ? 'active' : ''}`}
                                onClick={() => setActiveTab('public')}
                            >
                                Public
                            </button>
                            <button
                                className={`tab-item ${activeTab === 'my' ? 'active' : ''}`}
                                onClick={() => setActiveTab('my')}
                            >
                                My Sets
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <Loader />
                        <p>Loading sets...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                        <Button variant="outline" onClick={fetchSets}>Try Again</Button>
                    </div>
                ) : (
                    <div className="sets-grid">
                        {filteredSets.length > 0 ? (
                            filteredSets.map(set => (
                                <Card
                                    key={set.setId}
                                    className="set-card"
                                    onClick={() => navigate(`/flashcard-sets/${set.setId}`)}
                                >
                                    <div className="set-card-header">
                                        <h3 className="set-title">
                                            {set.title}
                                            {set.status === 'PENDING' && (
                                                <span style={{ fontSize: '0.75rem', backgroundColor: '#eab308', color: 'black', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', verticalAlign: 'middle', fontWeight: 600 }}>Pending Review</span>
                                            )}
                                            {set.status === 'REJECTED' && (
                                                <span style={{ fontSize: '0.75rem', backgroundColor: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', verticalAlign: 'middle', fontWeight: 600 }}>Rejected</span>
                                            )}
                                            {set.status === 'APPROVED' && activeTab === 'my' && (
                                                <span style={{ fontSize: '0.75rem', backgroundColor: '#22c55e', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', verticalAlign: 'middle', fontWeight: 600 }}>Approved</span>
                                            )}
                                        </h3>
                                        <span className="card-count">{set.cardCount || 0} terms</span>
                                    </div>
                                    <p className="set-description">{set.description || 'No description provided.'}</p>
                                    <div className="set-card-footer">
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                <User size={14} />
                                            </div>
                                            <span className="username">{activeTab === 'my' ? 'You' : set.ownerDisplayName}</span>
                                        </div>
                                        {activeTab === 'my' && (
                                            <div className="set-actions">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/flashcard-sets/edit/${set.setId}`);
                                                    }}
                                                >
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="delete-btn"
                                                    onClick={(e) => handleDelete(e, set.setId)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>No flashcard sets found.</p>
                                {searchQuery && <p>Try a different search term.</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default FlashcardSetsPage;
