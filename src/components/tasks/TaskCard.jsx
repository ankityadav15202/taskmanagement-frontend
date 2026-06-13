import { useNavigate } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import Avatar from '../common/Avatar';
import { formatDate, isOverdue } from '../../utils/helpers';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      className="card p-4 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => navigate(`/tasks/${task._id}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
          {task.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-md transition-colors"
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
            onClick={(e) => { e.stopPropagation(); onDelete(task); }}
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((label) => (
            <span key={label} className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs rounded-md font-medium">
              {label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded-md">+{task.labels.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={task.assignee.name} size="sm" />
            <span className="text-xs text-slate-500 dark:text-slate-400">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Unassigned</span>
        )}
        {task.dueDate && (
          <span className={`text-xs font-medium ${overdue ? 'text-red-500' : 'text-slate-400'}`}>
            {overdue ? '⚠ ' : ''}Due {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
