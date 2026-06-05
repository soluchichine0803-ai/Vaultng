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
  const baseStyles = 'rounded-xl overflow-hidden border';

  const variants = {
    // Increased background from 0.02 to 0.03 and border from 0.05 to 0.08 for better contrast
    default: 'bg-white/[0.03] border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.2)]',
    // Intensified elevated variant
    elevated: 'bg-white/[0.05] border-white/[0.12] shadow-[0_12px_48px_rgba(0,0,0,0.5)]',
    glass: 'bg-background-primary/40 backdrop-blur-xl border-white/[0.08]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        translateY: -2,
        transition: { duration: 0.2, ease: "easeOut" }
      } : undefined}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
