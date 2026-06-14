import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { taskAPI } from '../services/taskService';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import CommentsSection from '../components/comments/CommentsSection';
import Modal from '../components/common/Modal';
import TaskForm from '../components/tasks/TaskForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Avatar from '../components/common/Avatar';
import { PageLoader } from '../components/common/Spinner';
import { formatDate, isOverdue } from '../utils/helpers';
import { format } from 'date-fns';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => taskAPI.getById(id).then((r) => r.data.data.task),
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      taskAPI.update(id, {
        ...data,
        assignee: data.assignee !== undefined ? (data.assignee || null) : undefined,
        dueDate: data.dueDate !== undefined ? (data.dueDate || null) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', id]);
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['taskHistory', id]);
      setShowEdit(false);
      toast.success('Task updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => taskAPI.delete(id),
    onSuccess: () => { toast.success('Task deleted.'); navigate('/tasks'); },
    onError: () => toast.error('Failed to delete.'),
  });

  if (isLoading) return <PageLoader />;
  if (!task) return <div className="text-center py-16 text-slate-500">Task not found.</div>;

  const overdue = isOverdue(task.dueDate, task.status);
  const editDefaults = {
    ...task,
    assignee: task.assignee?._id || '',
    dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    labels: task.labels || [],
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button className="btn-ghost text-sm" onClick={() => navigate(-1)}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tasks
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-snug">{task.title}</h1>
          <div className="flex gap-2 flex-shrink-0">
            <button className="btn-secondary text-xs" onClick={() => setShowEdit(true)}>Edit</button>
            <button className="btn-danger text-xs" onClick={() => setShowDelete(true)}>Delete</button>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed break-words whitespace-pre-wrap">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {task.labels?.map((label) => (
            <span key={label} className="chip">{label}</span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div>
            <p className="text-xs text-slate-400 mb-1">Assignee</p>
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar name={task.assignee.name} size="sm" />
                <span className="text-sm text-slate-700 dark:text-slate-200">{task.assignee.name}</span>
              </div>
            ) : <span className="text-sm text-slate-400">Unassigned</span>}
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Created by</p>
            <div className="flex items-center gap-2">
              <Avatar name={task.createdBy?.name} size="sm" />
              <span className="text-sm text-slate-700 dark:text-slate-200">{task.createdBy?.name}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Due Date</p>
            <span className={`text-sm font-medium ${overdue ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
              {task.dueDate ? `${overdue ? '⚠ Overdue — ' : ''}${formatDate(task.dueDate)}` : '—'}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Created</p>
            <span className="text-sm text-slate-700 dark:text-slate-200">{formatDate(task.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
          <button
            className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors ${
              activeTab === 'comments'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
            onClick={() => setActiveTab('comments')}
          >
            Comments
          </button>
          <button
            className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors ${
              activeTab === 'history'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {activeTab === 'comments' ? (
          <CommentsSection taskId={id} />
        ) : (
          <TaskHistorySection taskId={id} />
        )}
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Task" size="lg">
        <TaskForm key={task._id} defaultValues={editDefaults} onSubmit={(data) => {
          if (task.status !== data.status && !data.assignee) {
            toast.error('Task must be assigned to someone before changing its status.');
            return;
          }
          updateMutation.mutate(data);
        }} isLoading={updateMutation.isPending} submitLabel="Save Changes" />
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?`}
      />
    </div>
  );
};

const getFieldName = (field) => {
  switch (field) {
    case 'title': return 'Title';
    case 'description': return 'Description';
    case 'status': return 'Status';
    case 'priority': return 'Priority';
    case 'assignee': return 'Assignee';
    case 'dueDate': return 'Due Date';
    case 'labels': return 'Labels';
    default: return field;
  }
};

const formatValue = (field, value) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (field === 'status') {
    if (value === 'todo') return 'To Do';
    if (value === 'in-progress') return 'In Progress';
    if (value === 'review') return 'Review';
    if (value === 'done') return 'Done';
  }
  if (field === 'priority') {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  return value;
};

const TaskHistorySection = ({ taskId }) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['taskHistory', taskId],
    queryFn: () => taskAPI.getHistory(taskId).then((r) => r.data.data.history),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return <div className="text-center py-6 text-slate-400 text-sm">No history recorded yet.</div>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((entry, entryIdx) => (
          <li key={entry._id}>
            <div className="relative pb-8">
              {entryIdx !== history.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div className="relative flex-shrink-0">
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-900 ${
                    entry.action === 'create'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {entry.action === 'create' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    )}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {entry.user?.name || 'Unknown User'}
                      </span>{' '}
                      {entry.action === 'create' ? 'created this task' : 'updated this task'}
                    </p>
                    {entry.action === 'update' && entry.changes && (
                      <div className="mt-2 space-y-1 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                        {entry.changes.map((change, idx) => (
                          <div key={idx} className="text-xs text-slate-500 dark:text-slate-400 break-words leading-relaxed">
                            Changed <span className="font-medium text-slate-600 dark:text-slate-300">{getFieldName(change.field)}</span> from <span className="font-medium line-through text-red-500 bg-red-50 dark:bg-red-950/20 px-1 rounded break-all whitespace-pre-wrap">{formatValue(change.field, change.oldValue)}</span> to <span className="font-medium text-green-600 bg-green-50 dark:bg-green-950/20 px-1 rounded break-all whitespace-pre-wrap">{formatValue(change.field, change.newValue)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-slate-400 pt-0.5">
                    {formatDate(entry.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskDetail;
