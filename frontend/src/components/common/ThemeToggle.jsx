import { Moon, Sun } from 'lucide-react';
import { useAppContext } from '@/context';

export default function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useAppContext();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
        isLight
          ? 'bg-white border-[#dbe3ee] text-[#1e3a5f] hover:bg-[#eef2f7]'
          : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:border-white/[0.16]'
      } ${className}`}
      title={isLight ? 'Switch to dark theme' : 'Switch to professional light theme'}
    >
      {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{isLight ? 'Dark' : 'Light'}</span>
    </button>
  );
}
