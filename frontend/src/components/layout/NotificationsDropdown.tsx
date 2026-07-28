import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '../ui/Button';



import { useNotificationStore } from '../../stores/notificationStore';

export const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore();


  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 bg-background border border-border rounded-lg shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  {notifications.length > 0 && (
                    <div className="flex gap-2">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs h-7"
                        >
                          Mark all read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="text-xs h-7 text-red-600"
                      >
                        Clear all
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-primary/5' : ''
                          }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};