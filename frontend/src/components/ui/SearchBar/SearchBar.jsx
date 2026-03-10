import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({
    onSearch,
    onResultClick,
    onEnter,
    placeholder = "Search...",
    className = ''
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                setIsSearching(true);
                try {
                    const results = await onSearch(searchQuery);
                    setSearchResults(results || []);
                    setShowDropdown(true);
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, onSearch]);

    const handleResultClick = (result) => {
        setShowDropdown(false);
        setSearchQuery('');
        if (onResultClick) {
            onResultClick(result);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim().length > 0) {
            setShowDropdown(false);
            if (onEnter) {
                onEnter(searchQuery.trim());
            }
        }
    };

    return (
        <div className={`search-wrapper ${className}`}>
            <Search size={18} className="search-icon" />
            <input
                type="text"
                placeholder={placeholder}
                className="nav-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {showDropdown && (
                <div className="search-dropdown">
                    {isSearching ? (
                        <div className="search-dropdown-item search-dropdown-message">Searching...</div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((result, idx) => (
                            <div
                                key={result.id || idx}
                                className="search-dropdown-item"
                                onClick={() => handleResultClick(result)}
                            >
                                <div className="search-item-title">{result.title}</div>
                                {result.subtitle && <div className="search-item-owner">{result.subtitle}</div>}
                            </div>
                        ))
                    ) : (
                        <div className="search-dropdown-item search-dropdown-message">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
