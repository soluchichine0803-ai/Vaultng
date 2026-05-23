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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-primary/80 backdrop-blur-2xl border-t border-white/[0.04] px-2 pb-safe">
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
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <>
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute -top-[1px] w-10 h-[2px] bg-purple-primary rounded-full shadow-[0_0_15px_rgba(124,58,237,0.8)]"
                    />
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-purple-primary/5 blur-xl rounded-full"
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
