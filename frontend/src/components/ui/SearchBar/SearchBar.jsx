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
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults(null);
            setShowDropdown(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await onSearch(searchQuery);
                setSearchResults(results || []);
                if (isFocused) {
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, onSearch, isFocused]);

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

    const renderGroupedResults = () => {
        if (!searchResults) return null;

        // If results is a grouped object
        if (!Array.isArray(searchResults)) {
            const visibleGroups = Object.entries(searchResults).filter(([_, items]) => items && items.length > 0);
            
            if (visibleGroups.length === 0) {
                return <div className="search-dropdown-item search-dropdown-message">No results found</div>;
            }

            return visibleGroups.map(([group, items]) => (
                <div key={group} className="search-group">
                    <div className="search-group-header">{group}</div>
                    {items.map((result, idx) => (
                        <div
                            key={result.id || `${group}-${idx}`}
                            className="search-dropdown-item"
                            onClick={() => handleResultClick(result)}
                        >
                            <div className="search-item-title">{result.title}</div>
                            {result.subtitle && <div className="search-item-owner">{result.subtitle}</div>}
                        </div>
                    ))}
                </div>
            ));
        }

        // If results is a flat array
        if (searchResults.length === 0) {
            return <div className="search-dropdown-item search-dropdown-message">No results found</div>;
        }

        return searchResults.map((result, idx) => (
            <div
                key={result.id || idx}
                className="search-dropdown-item"
                onClick={() => handleResultClick(result)}
            >
                <div className="search-item-title">{result.title}</div>
                {result.subtitle && <div className="search-item-owner">{result.subtitle}</div>}
            </div>
        ));
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
                onFocus={() => {
                    setIsFocused(true);
                    if (searchResults && (Array.isArray(searchResults) ? searchResults.length > 0 : Object.values(searchResults).some(v => v.length > 0))) {
                        setShowDropdown(true);
                    }
                }}
                onBlur={() => {
                    setTimeout(() => {
                        setShowDropdown(false);
                        setIsFocused(false);
                    }, 200);
                }}
            />
            {showDropdown && (
                <div className="search-dropdown">
                    {isSearching && (
                       <div className="search-loading-bar-container">
                           <div className="search-loading-bar"></div>
                       </div>
                    )}
                    {renderGroupedResults()}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
