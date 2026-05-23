import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  variant?: 'default' | 'elevated' | 'glass';
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverable = false,
  className = '',
  children,
}) => {
  const baseStyles = 'rounded-xl overflow-hidden border transition-all duration-300';

  const variants = {
    default: 'bg-white/[0.02] border-white/[0.05]',
    elevated: 'bg-white/[0.04] border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
    glass: 'bg-background-primary/40 backdrop-blur-xl border-white/[0.05]',
  };

  const hoverStyles = hoverable ? 'hover:bg-white/[0.05] hover:border-white/[0.1] hover:shadow-[0_4px_20px_rgba(124,58,237,0.05)]' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
