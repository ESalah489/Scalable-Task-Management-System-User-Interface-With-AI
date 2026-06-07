import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Search only when there is text
  useEffect(() => {
    if (debouncedQuery.trim() !== '') {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  // Clear search manually
  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    onSearch('');
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="🔍 Search tasks by title..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
        disabled={isLoading}
      />

      {query && (
        <button
          onClick={handleClear}
          className="clear-btn"
          type="button"
        >
          ✖
        </button>
      )}
    </div>
  );
};

export default SearchBar;