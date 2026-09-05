import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  Zap, LayoutDashboard, MessageSquarePlus, History,
  User, LogOut, X, Sparkles, Crown,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

// Navigation structure: Dashboard, New Interview, History, Pricing, Profile
const NAV_SECTIONS = [
  {
    label: 'Practice',
    items: [
      { to: '/dashboard',      icon: LayoutDashboard,   label: 'Dashboard' },
      { to: '/interviews/new', icon: MessageSquarePlus, label: 'New Interview', accent: true },
      { to: '/history',        icon: History,           label: 'History' },
      { to: '/pricing',        icon: Crown,             label: 'Plans & Pricing', badge: 'PRO' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', icon: User, label: 'Profile' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={clsx(
        'hidden lg:flex flex-col border-r border-white/[0.06] bg-slate-900/60 backdrop-blur-xl transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}>
        <SidebarContent
          user={user} onLogout={handleLogout}
          collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden" />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed left-0 top-0 z-30 h-full w-64 flex flex-col border-r border-white/[0.06] bg-slate-900/90 backdrop-blur-xl lg:hidden">
              <button onClick={onClose}
                className="absolute top-4 right-3 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors">
                <X className="w-4 h-4" />
              </button>
              <SidebarContent user={user} onLogout={handleLogout} collapsed={false} onNavClick={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({ user, onLogout, collapsed, onToggleCollapse, onNavClick }) {
  // Safe guest user defaults
  const userName = user?.name || "Guest";
  const userEmail = user?.email || "guest@prepai.com";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className={clsx('flex items-center h-14 border-b border-white/[0.06] flex-shrink-0 transition-all', collapsed ? 'justify-center px-3' : 'justify-between px-4')}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                className="text-sm font-semibold text-white overflow-hidden whitespace-nowrap">
                PrepAI
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {onToggleCollapse && (
          <button onClick={onToggleCollapse}
            className="p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-colors flex-shrink-0">
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV_SECTIONS.map(({ label, items }) => (
          <div key={label}>
            {!collapsed && (
              <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest px-3 mb-2">{label}</p>
            )}
            <div className="space-y-0.5">
              {items.map(({ to, icon: Icon, label: itemLabel, badge, accent }) => (
                <NavLink key={to} to={to} end={to === '/dashboard'} onClick={onNavClick}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 overflow-hidden',
                    collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                    isActive
                      ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.06]'
                      : 'text-slate-500 hover:text-white hover:bg-white/[0.05]'
                  )}>
                  {({ isActive }) => (
                    <>
                      <Icon className={clsx('w-4 h-4 flex-shrink-0 transition-colors',
                        isActive ? (accent ? 'text-brand-400' : 'text-white') : '')} />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                            className="flex-1 overflow-hidden whitespace-nowrap flex items-center justify-between">
                            {itemLabel}
                            {badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                                {badge}
                              </span>
                            )}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
        
        {/* Conditional Matched Jobs link (only if user has resume) */}
        {user?.hasResume && (
          <div>
            {!collapsed && (
              <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest px-3 mb-2">Jobs</p>
            )}
            <NavLink to="/jobs/matched" end onClick={onNavClick}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 overflow-hidden',
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                isActive
                  ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.06]'
                  : 'text-slate-500 hover:text-white hover:bg-white/[0.05]'
              )}>
              {({ isActive }) => (
                <>
                  <Sparkles className={clsx('w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-brand-400' : '')} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                        className="flex-1 overflow-hidden whitespace-nowrap">
                        Matched Jobs
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          </div>
        )}
      </nav>

      {/* User profile at bottom */}
      <div className={clsx('flex-shrink-0 border-t border-white/[0.06] p-3', collapsed ? 'flex justify-center' : '')}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-glow">
            {userInitial}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-default">
              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-glow">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>
            </div>
            <button onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
