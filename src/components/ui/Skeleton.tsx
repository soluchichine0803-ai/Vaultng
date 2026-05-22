import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'circle' | 'rectangle';
  width?: string | number;
  height?: string | number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangle',
  width,
  height,
  className = '',
}) => {
  const baseStyles = 'relative overflow-hidden bg-white/5 rounded-md';

  const variants = {
    text: 'h-4 w-full mb-2',
    card: 'h-32 w-full',
    circle: 'rounded-full',
    rectangle: '',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white-[0.02] to-transparent" />
    </div>
  );
};

export default Skeleton;
