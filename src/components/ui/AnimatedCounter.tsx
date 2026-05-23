import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  currency?: string;
  decimals?: number;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  currency,
  decimals = 2,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  const springValue = useSpring(0, {
    mass: 1,
    stiffness: 100 / (duration / 2),
    damping: 30,
  });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      setDisplayValue(latest);
    });
  }, [springValue]);

  const formatNumber = (val: number) => {
    const formatted = val.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return currency ? `${currency}${formatted}` : formatted;
  };

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`font-mono tabular-nums inline-block transition-all duration-300 ${className}`}
    >
      <motion.span
        key={value}
        animate={{
          textShadow: [
            "0 0 0px rgba(124,58,237,0)",
            "0 0 10px rgba(124,58,237,0.5)",
            "0 0 0px rgba(124,58,237,0)"
          ]
        }}
        transition={{ duration: 0.5 }}
      >
        {formatNumber(displayValue)}
      </motion.span>
    </motion.span>
  );
};

export default AnimatedCounter;
