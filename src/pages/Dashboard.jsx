import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardAPI } from '../services/taskService';
import { PageLoader } from '../components/common/Spinner';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { formatDate, isOverdue } from '../utils/helpers';
import useAuthStore from '../store/authStore';

const StatCard = ({ label, value, sub, color = 'text-slate-800 dark:text-white' }) => (
  <div className="card p-5">
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
  </div>
);

const STATUS_COLORS = { todo: '#94a3b8', 'in-progress': '#60a5fa', review: '#a78bfa', done: '#34d399' };
const PRIORITY_COLORS = { low: '#94a3b8', medium: '#fbbf24', high: '#fb923c', critical: '#f87171' };

const Dashboard = () => {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardAPI.getStats().then((r) => r.data.data),
  });

  if (isLoading) return <PageLoader />;

  const statusChartData = data ? Object.entries(data.tasksByStatus).map(([name, value]) => ({ name, value })) : [];
  const priorityChartData = data ? Object.entries(data.tasksByPriority).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Welcome back, {user?.name}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={data?.totalTasks ?? 0} />
        <StatCard label="Completed" value={`${data?.completionPercentage ?? 0}%`} sub="completion rate" color="text-green-600 dark:text-green-400" />
        <StatCard label="In Progress" value={data?.tasksByStatus?.['in-progress'] ?? 0} color="text-blue-600 dark:text-blue-400" />
        <StatCard label="Overdue" value={data?.overdueTasks ?? 0} color={data?.overdueTasks > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Tasks by Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChartData} barSize={36}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#f1f5f9' }} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusChartData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={priorityChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3}>
                {priorityChartData.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#6366f1'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {priorityChartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS[entry.name] }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Assigned Tasks */}
      {data?.myAssignedTasks?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">My Assigned Tasks</h2>
          <div className="space-y-3">
            {data.myAssignedTasks.map((task) => (
              <div key={task._id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={task.status} />
                    {task.dueDate && (
                      <span className={`text-xs ${isOverdue(task.dueDate, task.status) ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
