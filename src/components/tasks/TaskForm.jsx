import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../../services/taskService';
import Spinner from '../common/Spinner';

const TaskForm = ({ onSubmit, defaultValues = {}, isLoading, submitLabel = 'Save Task' }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userAPI.getAll().then((r) => r.data.data.users),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <input className="input" placeholder="bug, feature, urgent (comma separated)"
          {...register('labels', {
            setValueAs: (v) => typeof v === 'string'
              ? v.split(',').map((l) => l.trim()).filter(Boolean)
              : v,
          })} />
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
