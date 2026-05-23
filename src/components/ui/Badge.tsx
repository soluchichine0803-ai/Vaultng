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
    purple: 'bg-purple-primary/5 text-purple-soft border border-purple-primary/10',
    success: 'bg-success/5 text-success border border-success/10',
    warning: 'bg-warning/5 text-warning border border-warning/10',
    danger: 'bg-danger/5 text-danger border border-danger/10',
    info: 'bg-info/5 text-info border border-info/10',
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
