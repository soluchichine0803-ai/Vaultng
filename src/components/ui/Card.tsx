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
    default: 'bg-card border-purple-primary/10',
    elevated: 'bg-card-elevated border-purple-primary/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
    glass: 'bg-background-secondary/40 backdrop-blur-md border-white/5',
  };

  const hoverStyles = hoverable ? 'hover:translate-y-[-4px] hover:border-purple-primary/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)]' : '';

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
