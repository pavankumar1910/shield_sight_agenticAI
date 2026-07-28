import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineDetector = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div
            className={`px-6 py-3 rounded-full shadow-xl backdrop-blur-lg border-2 flex items-center gap-3 ${
              isOnline
                ? 'bg-green-500/90 border-green-400 text-white'
                : 'bg-red-500/90 border-red-400 text-white'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5" />
                <span className="font-semibold">Back online!</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5" />
                <span className="font-semibold">No internet connection</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};