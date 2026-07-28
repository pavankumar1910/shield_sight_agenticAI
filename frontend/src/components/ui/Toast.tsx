import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem = ({ toast, onClose }: ToastProps) => {
  const icons = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-500/90 border-green-500',
    error: 'bg-red-500/90 border-red-500',
    warning: 'bg-yellow-500/90 border-yellow-500',
    info: 'bg-blue-500/90 border-blue-500',
  };

  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      className={`${colors[toast.type]} backdrop-blur-lg border-2 rounded-lg p-4 shadow-2xl min-w-[300px] max-w-md`}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
        <p className="text-white text-sm flex-1 font-medium">{toast.message}</p>
        <button
          onClick={() => onClose(toast.id)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Listen for custom toast events
    const handleToast = (e: CustomEvent<Omit<Toast, 'id'>>) => {
      const newToast: Toast = {
        ...e.detail,
        id: `toast-${Date.now()}-${Math.random()}`,
      };
      setToasts((prev) => [...prev, newToast]);
    };

    window.addEventListener('show-toast' as any, handleToast);
    return () => window.removeEventListener('show-toast' as any, handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-20 right-6 z-[100] space-y-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Helper function to show toasts
export const showToast = (type: ToastType, message: string, duration?: number) => {
  const event = new CustomEvent('show-toast', {
    detail: { type, message, duration },
  });
  window.dispatchEvent(event);
};