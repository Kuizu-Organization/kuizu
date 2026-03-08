import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchClasses } from '../../api/class';
import { Search, BookOpen, Users } from 'lucide-react';
import './SearchPage.css';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults([]);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const data = await searchClasses(query);
                setResults(data);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <div className="search-page-container">
            <header className="search-page-header">
                <div className="search-page-title">
                    <Search size={28} className="search-page-icon" />
                    <h1>Search Results for "{query}"</h1>
                </div>
                <p className="search-page-subtitle">Found {results.length} classes matching your search.</p>
            </header>

            <main className="search-results-section">
                {isLoading ? (
                    <div className="search-loading">
                        <div className="spinner"></div>
                        <p>Searching for classes...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="search-results-grid">
                        {results.map(cls => (
                            <div 
                                key={cls.classId} 
                                className="search-result-card"
                                onClick={() => navigate(`/classes/${cls.classId}`)}
                            >
                                <div className="result-card-header">
                                    <h3 className="result-card-title">{cls.className}</h3>
                                    <span className="result-card-badge">Class</span>
                                </div>
                                <p className="result-card-description">{cls.description || 'No description provided.'}</p>
                                <div className="result-card-footer">
                                    <div className="result-meta">
                                        <Users size={14} />
                                        <span>Owner: {cls.ownerDisplayName}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-search-state">
                        <BookOpen size={48} className="empty-search-icon" />
                        <h2>No classes found</h2>
                        <p>We couldn't find any classes matching "{query}". Try adjusting your search keywords.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SearchPage;
