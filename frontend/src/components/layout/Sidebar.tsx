import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
  { to: '/calls', label: 'Calls' },
  { to: '/settings', label: 'Settings' },
  { to: '/live', label: 'Live Monitor' },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-surface-foreground px-4 py-6">
      <div className="mb-8 px-2">
        <div className="text-sm font-medium text-primary-200">Salama</div>
        <div className="text-xl font-semibold text-white">AI Receptionist</div>
      </div>
      <nav className="flex flex-1 flex-col space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600/20 text-white border border-primary-500/40'
                  : 'text-slate-300 hover:bg-slate-800/70 border border-transparent',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-400">
        Live WebSocket status: <span className="text-emerald-300">Connected</span>
      </div>
    </aside>
  );
}
