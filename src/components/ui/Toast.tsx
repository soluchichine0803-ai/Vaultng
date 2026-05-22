import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, type Toast as ToastType } from '../../store/toastStore';
import { slideIn } from '../../lib/animations';

const ToastItem: React.FC<{ toast: ToastType }> = ({ toast }) => {
  const removeToast = useToastStore((state) => state.removeToast);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.duration || 3000;
    const interval = 10;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - step));
    }, interval);

    const timeout = setTimeout(() => {
      removeToast(toast.id);
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [toast, removeToast]);

  const icons = {
    success: <CheckCircle2 className="text-success" size={18} />,
    error: <AlertCircle className="text-danger" size={18} />,
    warning: <AlertCircle className="text-warning" size={18} />,
    info: <Info className="text-info" size={18} />,
  };

  const borders = {
    success: 'border-success/20',
    error: 'border-danger/20',
    warning: 'border-warning/20',
    info: 'border-info/20',
  };

  return (
    <motion.div
      variants={slideIn}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={`relative flex items-center gap-3 p-4 bg-card-elevated border ${borders[toast.type]} rounded-xl shadow-2xl min-w-[280px] max-w-md overflow-hidden`}
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="text-sm font-medium text-text-primary flex-grow pr-4">
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-1 hover:bg-white/5 rounded-lg text-text-muted transition-colors"
      >
        <X size={14} />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-white/10 w-full">
        <motion.div
          className={`h-full ${
            toast.type === 'success' ? 'bg-success' :
            toast.type === 'error' ? 'bg-danger' :
            toast.type === 'warning' ? 'bg-warning' : 'bg-info'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
