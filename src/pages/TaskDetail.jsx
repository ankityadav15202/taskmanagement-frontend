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
    onSuccess: () => { queryClient.invalidateQueries(['task', id]); queryClient.invalidateQueries(['tasks']); setShowEdit(false); toast.success('Task updated!'); },
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
    labels: task.labels?.join(', ') || '',
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
            <span key={label} className="badge bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">{label}</span>
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
        <CommentsSection taskId={id} />
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Task" size="lg">
        <TaskForm key={task._id} defaultValues={editDefaults} onSubmit={(data) => {
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

export default TaskDetail;
