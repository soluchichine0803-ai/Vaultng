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
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'Invest', icon: <TrendingUp size={20} />, path: '/invest' },
    { label: 'Deposit', icon: <ArrowUpCircle size={20} />, path: '/deposit' },
    { label: 'Withdraw', icon: <ArrowDownCircle size={20} />, path: '/withdraw' },
    { label: 'Referrals', icon: <Users size={20} />, path: '/referrals' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-background-secondary border-r border-purple-primary/10 h-screen sticky top-0">
      <div className="p-6">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-purple-primary/10 text-purple-soft shadow-[inset_0_0_10px_rgba(124,58,237,0.1)]'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'}
              `}
            >
              <span className="group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
              {/* Active Indicator */}
              <NavLink to={item.path}>
                {({ isActive }) => isActive && (
                   <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-primary shadow-[0_0_8px_rgba(124,58,237,0.8)]"></div>
                )}
              </NavLink>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-1">
        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-all group">
          <Settings size={20} className="group-hover:rotate-45 transition-transform duration-300" />
          <span className="font-medium text-sm">Settings</span>
        </button>
        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-danger/70 hover:text-danger hover:bg-danger/5 transition-all group">
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
