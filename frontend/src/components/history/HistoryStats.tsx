import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';

interface HistoryStatsProps {
  total: number;
  phishing: number;
  legitimate: number;
  today: number;
  thisWeek: number;
}

export const HistoryStats = ({ total, phishing, legitimate, today, thisWeek }: HistoryStatsProps) => {
  const stats = [
    {
      title: 'Total Scans',
      value: total,
      icon: Shield,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Phishing Detected',
      value: phishing,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Safe URLs',
      value: legitimate,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: "Today's Scans",
      value: today,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'This Week',
      value: thisWeek,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {stat.title}
                    </p>
                    <p className={cn('text-3xl font-bold', stat.textColor)}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
                    stat.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};