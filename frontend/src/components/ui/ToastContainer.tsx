import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useToastStore } from '../../stores/toastStore';
import type { Toast } from '../../stores/toastStore';

const ToastItem = ({ toast }: { toast: Toast }) => {
  const { removeToast } = useToastStore();

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-500/95',
      border: 'border-green-500',
      iconColor: 'text-white',
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-500/95',
      border: 'border-red-500',
      iconColor: 'text-white',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-500/95',
      border: 'border-yellow-500',
      iconColor: 'text-white',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-500/95',
      border: 'border-blue-500',
      iconColor: 'text-white',
    },
  };

  const { icon: Icon, bg, border, iconColor } = config[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`${bg} backdrop-blur-lg ${border} border-2 rounded-xl p-4 shadow-2xl min-w-[320px] max-w-md`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        
        <p className="text-white text-sm flex-1 font-medium leading-relaxed">
          {toast.message}
        </p>
        
        <button
          onClick={() => removeToast(toast.id)}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-20 right-6 z-[100] space-y-3 pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};