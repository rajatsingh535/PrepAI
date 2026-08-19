import { Menu, Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard':       'Dashboard',
  '/interviews':      'Interviews',
  '/interviews/new':  'New Interview',
  '/dsa-session':     'DSA Arena',
  '/sessions':        'Session History',
  '/resumes':         'Resumes',
  '/jobs':            'Jobs',
  '/jobs/recommended':'Matched Jobs',
  '/profile':         'Profile',
};

export default function Topbar({ onMenuClick }) {
  const { user } = useAuthStore();
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'PrepAI';

  return (
    <header className="h-14 flex items-center justify-between px-5 border-b border-white/[0.06] bg-slate-900/60 backdrop-blur-xl flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors lg:hidden">
          <Menu className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>
        <div className="pl-2 border-l border-white/[0.06] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-xs shadow-glow">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-slate-300 font-medium hidden sm:block">{user?.name?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
}
