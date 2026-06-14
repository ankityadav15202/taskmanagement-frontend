import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../../services/taskService';
import Spinner from '../common/Spinner';

const TaskForm = ({ onSubmit, defaultValues = {}, isLoading, submitLabel = 'Save Task' }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

  const [labels, setLabels] = useState(() => {
    if (Array.isArray(defaultValues.labels)) {
      return defaultValues.labels;
    }
    if (typeof defaultValues.labels === 'string' && defaultValues.labels) {
      return defaultValues.labels.split(',').map((l) => l.trim()).filter(Boolean);
    }
    return [];
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userAPI.getAll().then((r) => r.data.data.users),
  });

  useEffect(() => {
    if (usersData) {
      reset(defaultValues);
      if (Array.isArray(defaultValues.labels)) {
        setLabels(defaultValues.labels);
      } else if (typeof defaultValues.labels === 'string' && defaultValues.labels) {
        setLabels(defaultValues.labels.split(',').map((l) => l.trim()).filter(Boolean));
      } else {
        setLabels([]);
      }
    }
  }, [usersData, reset, defaultValues]);

  const handleAddLabel = (val) => {
    const trimmed = val.trim().replace(/,$/, ''); // strip trailing comma if typed
    if (trimmed && !labels.includes(trimmed)) {
      setLabels((prev) => [...prev, trimmed]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLabel(e.target.value);
      e.target.value = '';
    } else if (e.key === ',') {
      e.preventDefault();
      handleAddLabel(e.target.value);
      e.target.value = '';
    } else if (e.key === 'Backspace' && !e.target.value && labels.length > 0) {
      setLabels((prev) => prev.slice(0, -1));
    }
  };

  const handleBlur = (e) => {
    handleAddLabel(e.target.value);
    e.target.value = '';
  };

  const handleRemoveLabel = (labelToRemove) => {
    setLabels((prev) => prev.filter((l) => l !== labelToRemove));
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, labels }))} className="space-y-4">
      <div>
        <label className="label">Title *</label>
        <input className="input" placeholder="Task title..."
          {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Min 3 characters' } })} />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea className="input resize-none h-24" placeholder="Describe the task..."
          {...register('description')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="input" {...register('status')}>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Assignee</label>
          <select className="input" {...register('assignee')}>
            <option value="">Unassigned</option>
            {usersData?.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input className="input" type="date" {...register('dueDate')} />
        </div>
      </div>

      <div>
        <label className="label">Labels</label>
        <div className="input flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent min-h-[42px] py-1.5 px-3">
          {labels.map((label, index) => (
            <span key={index} className="chip flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-700/20 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-700/30">
              {label}
              <button
                type="button"
                className="hover:bg-brand-100 dark:hover:bg-brand-800 rounded-full p-0.5 text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                onClick={() => handleRemoveLabel(label)}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={labels.length === 0 ? "Type a label and press Enter or comma..." : ""}
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? <><Spinner size="sm" />Saving...</> : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
