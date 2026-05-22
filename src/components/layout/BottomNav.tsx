import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav: React.FC = () => {
  const navItems = [
    { label: 'Home', icon: <Home size={22} />, path: '/dashboard' },
    { label: 'Invest', icon: <TrendingUp size={22} />, path: '/invest' },
    { label: 'Deposit', icon: <ArrowUpCircle size={22} />, path: '/deposit' },
    { label: 'Withdraw', icon: <ArrowDownCircle size={22} />, path: '/withdraw' },
    { label: 'Referrals', icon: <Users size={22} />, path: '/referrals' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-primary/80 backdrop-blur-xl border-t border-purple-primary/10 px-2 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors
              ${isActive ? 'text-purple-primary' : 'text-text-muted hover:text-text-secondary'}
            `}
          >
            {({ isActive }) => (
              <>
                <motion.span
                  animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {item.icon}
                </motion.span>
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-[1px] w-8 h-0.5 bg-purple-primary rounded-full shadow-[0_0_10px_rgba(124,58,237,0.8)]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
