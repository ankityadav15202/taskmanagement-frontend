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

const COLUMNS = [
  { id: 'todo', title: 'To Do', bg: 'bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60' },
  { id: 'in-progress', title: 'In Progress', bg: 'bg-blue-50/40 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30' },
  { id: 'review', title: 'Review', bg: 'bg-purple-50/40 dark:bg-purple-950/10 border-purple-100 dark:border-purple-900/30' },
  { id: 'done', title: 'Done', bg: 'bg-green-50/40 dark:bg-green-950/10 border-green-100 dark:border-green-900/30' },
];

const Tasks = () => {
  const [filters, setFilters] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskAPI.getAll({ ...filters, limit: 150 }).then((r) => r.data.data),
    staleTime: 0,
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (formData) => taskAPI.create({ ...formData, dueDate: formData.dueDate || null, assignee: formData.assignee || null }),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); queryClient.invalidateQueries(['dashboard']); setShowCreate(false); toast.success('Task created!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create task.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) =>
      taskAPI.update(id, {
        ...data,
        assignee: data.assignee !== undefined ? (data.assignee || null) : undefined,
        dueDate: data.dueDate !== undefined ? (data.dueDate || null) : undefined,
      }),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); queryClient.invalidateQueries(['dashboard']); setEditTask(null); toast.success('Task updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update task.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => taskAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); queryClient.invalidateQueries(['dashboard']); setDeleteTask(null); toast.success('Task deleted.'); },
    onError: () => toast.error('Failed to delete task.'),
  });

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      const task = data?.tasks?.find((t) => t._id === taskId);
      if (task && task.status !== targetStatus) {
        if (!task.assignee) {
          toast.error('Task must be assigned to someone before changing its status.');
          return;
        }
        updateMutation.mutate({ id: taskId, status: targetStatus });
      }
    }
  };

  const editDefaults = editTask ? {
    ...editTask,
    assignee: editTask.assignee?._id || '',
    dueDate: editTask.dueDate ? format(new Date(editTask.dueDate), 'yyyy-MM-dd') : '',
    labels: editTask.labels || [],
  } : {};

  const tasksByStatus = {
    todo: [],
    'in-progress': [],
    review: [],
    done: [],
  };

  data?.tasks?.forEach((task) => {
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    }
  });

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

      <TaskFilters filters={filters} onChange={(f) => setFilters(f)} />

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
        <div className="flex lg:grid lg:grid-cols-4 gap-4 overflow-x-auto pb-4 lg:overflow-x-visible items-start min-h-[600px]">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-[290px] sm:w-[320px] lg:w-full flex-shrink-0 flex flex-col rounded-xl p-4 min-h-[500px] border ${col.bg}`}
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {col.title}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200/80 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
                  {tasksByStatus[col.id].length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[70vh] pr-1">
                {tasksByStatus[col.id].map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskCard task={task} onEdit={setEditTask} onDelete={setDeleteTask} />
                  </div>
                ))}
                {tasksByStatus[col.id].length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-400 text-xs">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Task" size="lg">
        <TaskForm onSubmit={(data) => {
          if (data.status !== 'todo' && !data.assignee) {
            toast.error('Task must be assigned to someone before changing its status.');
            return;
          }
          createMutation.mutate(data);
        }} isLoading={createMutation.isPending} submitLabel="Create Task" />
      </Modal>

      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        <TaskForm key={editTask?._id} defaultValues={editDefaults} onSubmit={(data) => {
          if (editTask.status !== data.status && !data.assignee) {
            toast.error('Task must be assigned to someone before changing its status.');
            return;
          }
          updateMutation.mutate({ id: editTask._id, ...data });
        }} isLoading={updateMutation.isPending} submitLabel="Save Changes" />
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
