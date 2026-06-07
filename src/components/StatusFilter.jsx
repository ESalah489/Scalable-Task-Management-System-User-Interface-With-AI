import React from 'react';

const StatusFilter = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { value: 'all', label: '📋 All Tasks' },
    { value: 'pending', label: '🟡 Pending' },
    { value: 'in-progress', label: '🔵 In Progress' },
    { value: 'completed', label: '✅ Completed' },
  ];

  return (
    <div className="status-filter">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`filter-btn ${currentFilter === filter.value ? 'active' : ''}`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default StatusFilter;