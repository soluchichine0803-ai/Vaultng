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
    info: 'bg-info/[0.03] border-info/10',
    warning: 'bg-warning/[0.03] border-warning/10',
    danger: 'bg-danger/[0.03] border-danger/10',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="overflow-hidden"
        >
          <div className={`flex items-center gap-3 px-4 lg:px-10 py-2 border-b border-white/[0.02] ${backgrounds[type]}`}>
            <div className="flex-shrink-0 opacity-80">{icons[type]}</div>
            <p className="text-[11px] font-bold tracking-tight text-text-secondary flex-grow uppercase">
              {message}
            </p>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/[0.05] rounded-lg text-text-muted transition-colors"
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
