import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { taskAPI } from '../services/taskService';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { PageLoader } from '../components/common/Spinner';
import { format } from 'date-fns';

const Tasks = () => {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filters, page],
    queryFn: () => taskAPI.getAll({ ...filters, page, limit: 12 }).then((r) => r.data.data),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (formData) => taskAPI.create({ ...formData, dueDate: formData.dueDate || undefined, assignee: formData.assignee || undefined }),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); queryClient.invalidateQueries(['dashboard']); setShowCreate(false); toast.success('Task created!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create task.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => taskAPI.update(id, { ...data, dueDate: data.dueDate || undefined, assignee: data.assignee || undefined }),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); queryClient.invalidateQueries(['dashboard']); setEditTask(null); toast.success('Task updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update task.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => taskAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); queryClient.invalidateQueries(['dashboard']); setDeleteTask(null); toast.success('Task deleted.'); },
    onError: () => toast.error('Failed to delete task.'),
  });

  const editDefaults = editTask ? {
    ...editTask,
    assignee: editTask.assignee?._id || '',
    dueDate: editTask.dueDate ? format(new Date(editTask.dueDate), 'yyyy-MM-dd') : '',
    labels: editTask.labels?.join(', ') || '',
  } : {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{data?.pagination?.total ?? 0} tasks total</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      <TaskFilters filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />

      {isLoading ? (
        <PageLoader />
      ) : data?.tasks?.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No tasks found"
          description="Create your first task or adjust your filters."
          action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Create task</button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.tasks.map((task) => (
              <TaskCard key={task._id} task={task} onEdit={setEditTask} onDelete={setDeleteTask} />
            ))}
          </div>

          {data?.pagination?.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button className="btn-secondary" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>← Prev</button>
              <span className="text-sm text-slate-500 dark:text-slate-400">Page {page} of {data.pagination.totalPages}</span>
              <button className="btn-secondary" onClick={() => setPage((p) => p + 1)} disabled={page === data.pagination.totalPages}>Next →</button>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Task" size="lg">
        <TaskForm onSubmit={(data) => createMutation.mutate(data)} isLoading={createMutation.isPending} submitLabel="Create Task" />
      </Modal>

      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        <TaskForm key={editTask?._id} defaultValues={editDefaults} onSubmit={(data) => updateMutation.mutate({ id: editTask._id, ...data })} isLoading={updateMutation.isPending} submitLabel="Save Changes" />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={() => deleteMutation.mutate(deleteTask._id)}
        isLoading={deleteMutation.isPending}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTask?.title}"? This cannot be undone.`}
      />
    </div>
  );
};

export default Tasks;
