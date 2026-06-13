import { format, isAfter, isPast } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy');
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  return isPast(new Date(dueDate));
};

export const STATUS_CONFIG = {
  'todo':        { label: 'To Do',       color: 'bg-slate-100 text-slate-600' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  'review':      { label: 'Review',      color: 'bg-purple-100 text-purple-700' },
  'done':        { label: 'Done',        color: 'bg-green-100 text-green-700' },
};

export const PRIORITY_CONFIG = {
  'low':      { label: 'Low',      color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
  'medium':   { label: 'Medium',   color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  'high':     { label: 'High',     color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  'critical': { label: 'Critical', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getAvatarColor = (name) => {
  const colors = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500',
    'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500',
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};
