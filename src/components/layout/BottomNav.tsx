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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-primary/95 backdrop-blur-2xl border-t border-white/[0.06] px-2 pb-safe shadow-[0_-12px_48px_-12px_rgba(124,58,237,0.22)]">
      <div className="flex items-center justify-around h-[72px] max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all duration-300
              ${isActive ? 'text-purple-primary' : 'text-text-muted'}
            `}
          >
            {({ isActive }) => (
              <>
                <motion.span
                  animate={isActive ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative z-10"
                >
                  {item.icon}
                </motion.span>
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <>
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute -top-[1px] w-10 h-[1.5px] bg-purple-primary rounded-full shadow-[0_0_10px_rgba(124,58,237,0.4)]"
                    />
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-purple-primary/10 blur-2xl rounded-full"
                    />
                  </>
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
