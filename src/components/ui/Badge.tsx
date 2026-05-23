import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'purple',
  size = 'sm',
  pulse = false,
  className = '',
  children,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-full tracking-tighter';

  const variants = {
    purple: 'bg-purple-primary/10 text-purple-soft border border-purple-primary/20 shadow-[0_0_12px_rgba(124,58,237,0.1)]',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
    info: 'bg-info/10 text-info border border-info/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] uppercase',
    md: 'px-3 py-1 text-[12px] uppercase',
  };

  return (
    <div className="relative inline-flex">
      <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
        {children}
      </span>
      {pulse && (
        <motion.span
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-0 rounded-full ${variants[variant].split(' ')[0]} border-current opacity-50`}
          style={{ border: '1px solid' }}
        />
      )}
    </div>
  );
};

export default Badge;
