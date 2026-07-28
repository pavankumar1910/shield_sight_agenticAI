import { motion } from 'framer-motion';
import { Bell, Mail, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useSettingsStore } from '../../stores/settingsStore';
import toast from 'react-hot-toast';

export const NotificationSettings = () => {
  const { notifications, updateNotifications } = useSettingsStore();

  const handleToggle = (key: keyof typeof notifications) => {
    updateNotifications({ [key]: !notifications[key] });
    toast.success('Notification settings updated');
  };

  const settings = [
    {
      key: 'emailNotifications' as const,
      icon: Mail,
      title: 'Email Notifications',
      description: 'Receive updates and alerts via email',
      color: 'text-blue-500',
    },
    {
      key: 'pushNotifications' as const,
      icon: Bell,
      title: 'Push Notifications',
      description: 'Get instant alerts in your browser',
      color: 'text-purple-500',
    },
    {
      key: 'phishingAlerts' as const,
      icon: AlertTriangle,
      title: 'Phishing Alerts',
      description: 'Notify when phishing URLs are detected',
      color: 'text-red-500',
    },
    {
      key: 'weeklyReports' as const,
      icon: Calendar,
      title: 'Weekly Reports',
      description: 'Get weekly summary of your scans',
      color: 'text-green-500',
    },
  ];

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings.map((setting, index) => {
          const Icon = setting.icon;
          const isEnabled = notifications[setting.key];

          return (
            <motion.div
              key={setting.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${setting.color}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{setting.title}</p>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(setting.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isEnabled ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <motion.div
                  animate={{ x: isEnabled ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </button>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};