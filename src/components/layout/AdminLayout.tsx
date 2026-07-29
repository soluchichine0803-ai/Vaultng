import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  LogOut,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import ParticleBackground from '../ui/ParticleBackground';
import ToastContainer from '../ui/Toast';
import { useState } from 'react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Deposits', path: '/admin/deposits', icon: ArrowUpRight },
    { label: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowDownLeft },
    { label: 'Transactions', path: '/admin/transactions', icon: History },
  ];

  return (
    <div className="min-h-screen bg-background-primary text-text-primary selection:bg-purple-primary/30 overflow-x-hidden">
      <ParticleBackground />

      <div className="relative z-10 min-h-screen w-full flex flex-col lg:flex-row">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-[240px] border-r border-white/[0.04] bg-background-primary/80 backdrop-blur-md fixed top-0 bottom-0 left-0 z-20">
          <div className="p-6 border-b border-white/[0.04] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-primary flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <ShieldAlert className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider uppercase text-purple-bright">VaultNG Ops</h1>
              <p className="text-[9px] text-text-muted uppercase tracking-widest font-black opacity-60">Operations Unit</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-xs font-black uppercase tracking-widest ${
                    isActive
                      ? 'bg-purple-primary/10 border border-purple-primary/20 text-purple-bright shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                      : 'border border-transparent text-text-muted hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/[0.04]">
            <div className="px-4 py-3 mb-3 bg-white/[0.02] border border-white/[0.02] rounded-xl">
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold truncate">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-purple-primary/20 text-purple-bright border border-purple-primary/20">
                ADMIN SECURE
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-transparent transition-all duration-200"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile Navbar */}
        <header className="lg:hidden w-full h-16 border-b border-white/[0.04] bg-background-primary/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-primary flex items-center justify-center">
              <ShieldAlert className="text-white w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-wider uppercase text-purple-bright">VaultNG Ops</h1>
              <p className="text-[8px] text-text-muted uppercase tracking-widest font-black opacity-60">Security Node</p>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.05] text-white hover:bg-white/[0.04] transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden w-full border-b border-white/[0.04] bg-background-primary/95 backdrop-blur-md fixed top-16 left-0 right-0 z-10 flex flex-col p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest ${
                    isActive
                      ? 'bg-purple-primary/10 border border-purple-primary/20 text-purple-bright'
                      : 'border border-transparent text-text-muted'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 border border-transparent"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 transition-all duration-300 ease-in-out relative z-0 min-h-screen lg:pl-[240px] flex flex-col">
          <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-6 lg:py-10 flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AdminLayout;
