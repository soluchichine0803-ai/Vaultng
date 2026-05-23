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
    primary: 'bg-purple-primary text-white hover:bg-purple-bright active:bg-purple-deep shadow-[0_4px_12px_rgba(124,58,237,0.15)] hover:shadow-[0_4px_24px_rgba(124,58,237,0.4)] transition-shadow duration-300',
    secondary: 'bg-white/[0.03] border border-white/10 text-text-primary hover:bg-white/[0.06] hover:border-white/20',
    danger: 'bg-danger/80 text-white hover:bg-danger active:bg-danger-deep transition-colors',
    ghost: 'bg-transparent text-text-secondary hover:bg-white/[0.05] hover:text-text-primary',
  };

  const sizes = {
    sm: 'h-10 px-4 text-xs gap-1.5', // Increased from h-9 to h-10 for better touch
    md: 'h-12 px-6 text-sm gap-2', // Increased from h-11 to h-12 (48px)
    lg: 'h-14 px-8 text-base gap-2.5',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
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
