import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../../services/taskService';

const TaskFilters = ({ filters, onChange }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const latestOnChange = useRef(onChange);
  const latestFilters = useRef(filters);

  // Sync ref values on every render
  useEffect(() => {
    latestOnChange.current = onChange;
    latestFilters.current = filters;
  }, [onChange, filters]);

  // Sync local search term with parent prop (e.g. when filters are cleared)
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  // Debounce effect using refs
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if ((latestFilters.current.search || '') !== searchTerm) {
        latestOnChange.current({ ...latestFilters.current, search: searchTerm });
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userAPI.getAll().then((r) => r.data.data.users),
  });

  const handleChange = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="input pl-9"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>



      {/* Priority */}
      <select className="input w-36" value={filters.priority || ''} onChange={(e) => handleChange('priority', e.target.value)}>
        <option value="">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      {/* Assignee */}
      <select className="input w-40" value={filters.assignee || ''} onChange={(e) => handleChange('assignee', e.target.value)}>
        <option value="">All Assignees</option>
        {usersData?.map((u) => (
          <option key={u._id} value={u._id}>{u.name}</option>
        ))}
      </select>

      {/* Sort */}
      <select className="input w-40" value={filters.sortBy || ''} onChange={(e) => handleChange('sortBy', e.target.value)}>
        <option value="">Sort: Newest</option>
        <option value="dueDate">Due Date ↑</option>
        <option value="dueDate_desc">Due Date ↓</option>
        <option value="priority">Priority</option>
      </select>

      {/* Clear */}
      {Object.values(filters).some(Boolean) && (
        <button className="btn-ghost text-slate-500 text-xs" onClick={() => onChange({})}>
          Clear filters
        </button>
      )}
    </div>
  );
};

export default TaskFilters;
