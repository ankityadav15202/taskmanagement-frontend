import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../services/taskService';
import Avatar from '../components/common/Avatar';
import { PageLoader } from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/helpers';

const Users = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userAPI.getAll().then((r) => r.data.data.users),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Users</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{users?.length ?? 0} members in your workspace</p>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : users?.length === 0 ? (
        <EmptyState icon="👥" title="No users yet" description="Users will appear here after they register." />
      ) : (
        <div className="card overflow-hidden">
          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-700">
            {users.map((user) => (
              <div key={user._id} className="p-4 flex items-center gap-3">
                <Avatar name={user.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`badge ${user.role === 'admin' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {user.role}
                  </span>
                  <span className={`badge ${user.isActive !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600'}`}>
                    {user.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <table className="hidden sm:table w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                {['User', 'Email', 'Role', 'Joined', 'Status'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="md" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-sm text-slate-500 dark:text-slate-400">{user.email}</span></td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.role === 'admin' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4"><span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(user.createdAt)}</span></td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.isActive !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600'}`}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
