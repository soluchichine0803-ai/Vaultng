import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, XCircle, X } from 'lucide-react';

interface BannerProps {
  id: string;
  type?: 'info' | 'warning' | 'danger';
  message: string;
}

const Banner: React.FC<BannerProps> = ({ id, type = 'info', message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(`banner_dismissed_${id}`);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, [id]);

  const handleDismiss = () => {
    localStorage.setItem(`banner_dismissed_${id}`, 'true');
    setIsVisible(false);
  };

  const icons = {
    info: <Info size={18} className="text-info" />,
    warning: <AlertTriangle size={18} className="text-warning" />,
    danger: <XCircle size={18} className="text-danger" />,
  };

  const backgrounds = {
    info: 'bg-info/10 border-info/20',
    warning: 'bg-warning/10 border-warning/20',
    danger: 'bg-danger/10 border-danger/20',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className={`flex items-center gap-3 px-4 py-2.5 border-b ${backgrounds[type]}`}>
            <div className="flex-shrink-0">{icons[type]}</div>
            <p className="text-xs font-medium text-text-primary flex-grow">
              {message}
            </p>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/5 rounded-md text-text-muted transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Banner;
