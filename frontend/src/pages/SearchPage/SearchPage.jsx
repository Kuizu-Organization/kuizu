import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchClasses } from '@/api/class';
import { Search, BookOpen, Users } from 'lucide-react';
import { Loader, EmptyState, ItemCard } from '@/components/ui';
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
                    <div className="search-loading-container">
                        <Loader fullPage={false} />
                        <p>Searching for classes...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="search-results-grid">
                        {results.map(cls => (
                            <ItemCard
                                key={cls.classId}
                                onClick={() => navigate(`/classes/${cls.classId}`)}
                                title={cls.className}
                                badge="Class"
                                description={cls.description || 'No description provided.'}
                                footerText={
                                    <div className="result-meta">
                                        <Users size={14} />
                                        <span>Owner: {cls.ownerDisplayName}</span>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={BookOpen}
                        title="No classes found"
                        description={`We couldn't find any classes matching "${query}". Try adjusting your search keywords.`}
                    />
                )}
            </main>
        </div>
    );
};

export default SearchPage;
