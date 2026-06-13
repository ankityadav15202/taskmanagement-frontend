import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => (
  <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
    <Sidebar />
    {/* Desktop: offset by sidebar. Mobile: offset by top bar (h-14) */}
    <main className="flex-1 lg:ml-60 mt-14 lg:mt-0 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AppLayout;
