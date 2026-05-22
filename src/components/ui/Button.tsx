import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-lg overflow-hidden';

  const variants = {
    primary: 'bg-purple-primary text-white hover:bg-purple-bright active:bg-purple-deep shadow-[0_0_15px_rgba(124,58,237,0.3)]',
    secondary: 'bg-card border border-purple-primary/20 text-text-primary hover:bg-card-elevated hover:border-purple-primary/40',
    danger: 'bg-danger text-white hover:opacity-90 active:scale-[0.98]',
    ghost: 'bg-transparent text-text-secondary hover:bg-purple-primary/10 hover:text-text-primary',
  };

  const sizes = {
    sm: 'h-9 px-3 text-xs gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-14 px-8 text-base gap-2.5',
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;
