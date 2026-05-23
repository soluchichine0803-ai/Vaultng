import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  Users,
  Settings,
  LogOut
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { label: 'Invest', icon: <TrendingUp size={18} />, path: '/invest' },
    { label: 'Deposit', icon: <ArrowUpCircle size={18} />, path: '/deposit' },
    { label: 'Withdraw', icon: <ArrowDownCircle size={18} />, path: '/withdraw' },
    { label: 'Referrals', icon: <Users size={18} />, path: '/referrals' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[200px] bg-background-primary/40 backdrop-blur-xl border-r border-white/[0.02] h-screen fixed left-0 top-0 z-40">
      <div className="p-4">
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group
                ${isActive
                  ? 'bg-white/[0.03] text-purple-soft shadow-[inset_0_0_20px_rgba(124,58,237,0.02)]'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/[0.01]'}
              `}
            >
              {({ isActive }) => (
                <>
                  <span className="group-hover:scale-110 transition-transform duration-200 opacity-80">
                    {item.icon}
                  </span>
                  <span className="font-bold text-[13px] tracking-tight">{item.label}</span>
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-primary shadow-[0_0_8px_rgba(124,58,237,0.8)]"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 space-y-0.5">
        <button className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.01] transition-all group">
          <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300 opacity-80" />
          <span className="font-bold text-[13px] tracking-tight">Settings</span>
        </button>
        <button className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-danger/60 hover:text-danger hover:bg-danger/5 transition-all group">
          <LogOut size={18} className="opacity-80" />
          <span className="font-bold text-[13px] tracking-tight">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
