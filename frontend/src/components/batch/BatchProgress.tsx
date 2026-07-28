import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface BatchProgressProps {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  isProcessing: boolean;
}

export const BatchProgress = ({
  total,
  processed,
  successful,
  failed,
  isProcessing,
}: BatchProgressProps) => {
  const progress = total > 0 ? (processed / total) * 100 : 0;
  const remaining = total - processed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            Batch Analysis Progress
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold text-foreground">
                {processed} / {total} URLs
              </span>
            </div>
            
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress.toFixed(1)}% Complete</span>
              {isProcessing && remaining > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {remaining} remaining
                </span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Total */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{total}</p>
            </div>

            {/* Successful */}
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Successful</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {successful}
              </p>
            </div>

            {/* Failed */}
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground">Failed</span>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {failed}
              </p>
            </div>
          </div>

          {/* Processing Animation */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 p-4 rounded-lg bg-primary/5 border border-primary/20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-5 h-5 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-primary">
                Processing URLs...
              </span>
            </motion.div>
          )}

          {/* Completion Message */}
          {!isProcessing && processed === total && total > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20"
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Analysis Complete!
              </span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};