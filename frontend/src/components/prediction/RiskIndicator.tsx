import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RiskIndicatorProps {
  prediction: 'phishing' | 'legitimate';
  confidence: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'very_low' | 'caution' | 'warning' | 'critical';  // ✅ FIXED: Made optional + added more types
}

export const RiskIndicator = ({
  prediction,
  confidence,
  riskLevel = 'medium'  // ✅ FIXED: Added default value
}: RiskIndicatorProps) => {
  const isPhishing = prediction === 'phishing';

  const config = {
    phishing: {
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-600 dark:text-red-400',
      title: '⚠️ Phishing Detected',
      description: 'This URL appears to be a phishing attempt',
    },
    legitimate: {
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-600 dark:text-green-400',
      title: '✅ Safe URL',
      description: 'This URL appears to be legitimate',
    },
  };

  const currentConfig = config[prediction];
  const Icon = currentConfig.icon;

  // ✅ FIXED: Risk level configuration with ALL possible values + fallback
  const riskConfig: Record<string, { label: string; color: string }> = {
    'very_low': { label: 'Very Low Risk', color: 'bg-green-600' },
    'low': { label: 'Low Risk', color: 'bg-green-500' },
    'caution': { label: 'Caution', color: 'bg-yellow-400' },
    'medium': { label: 'Medium Risk', color: 'bg-yellow-500' },
    'warning': { label: 'Warning', color: 'bg-orange-500' },
    'high': { label: 'High Risk', color: 'bg-red-500' },
    'critical': { label: 'Critical Risk', color: 'bg-red-600' },
  };

  // ✅ FIXED: Safe access with fallback
  const currentRisk = riskConfig[riskLevel] || riskConfig['medium'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 p-6',
        currentConfig.bgColor,
        currentConfig.borderColor
      )}
    >
      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          currentConfig.color,
          'blur-3xl'
        )}
      />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                rotate: isPhishing ? [0, 10, -10, 0] : 0,
              }}
              transition={{
                duration: 0.5,
                repeat: isPhishing ? Infinity : 0,
                repeatDelay: 2,
              }}
              className={cn(
                'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                currentConfig.color
              )}
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>

            <div>
              <h3 className={cn('text-2xl font-bold', currentConfig.textColor)}>
                {currentConfig.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentConfig.description}
              </p>
            </div>
          </div>

          {/* Risk Badge - ✅ FIXED: Uses safe currentRisk */}
          <div className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold text-white',
            currentRisk.color  // ✅ SAFE: Will always have a value
          )}>
            {currentRisk.label}  {/* ✅ SAFE: Will always have a value */}
          </div>
        </div>

        {/* Confidence Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Confidence Score</span>
            <span className={cn('font-bold text-lg', currentConfig.textColor)}>
              {(confidence * 100).toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                'absolute inset-y-0 left-0 bg-gradient-to-r rounded-full',
                currentConfig.color
              )}
            />
          </div>
        </div>

        {/* Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'p-4 rounded-lg border',
            isPhishing
              ? 'bg-red-500/5 border-red-500/20'
              : 'bg-green-500/5 border-green-500/20'
          )}
        >
          <p className="text-sm font-medium text-foreground mb-2">
            {isPhishing ? '🚫 Recommendation' : '✅ Recommendation'}
          </p>
          <p className="text-sm text-muted-foreground">
            {isPhishing
              ? 'Do not enter personal information or credentials on this site. Close this page immediately and report it.'
              : 'This URL appears safe to visit. However, always verify the URL matches the intended website before entering sensitive information.'}
          </p>
        </motion.div>

        {/* Detection Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Phishing Probability</p>
            <p className={cn('text-lg font-bold', isPhishing ? currentConfig.textColor : 'text-muted-foreground')}>
              {(prediction === 'phishing' ? confidence * 100 : (1 - confidence) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Legitimate Probability</p>
            <p className={cn('text-lg font-bold', !isPhishing ? currentConfig.textColor : 'text-muted-foreground')}>
              {(prediction === 'legitimate' ? confidence * 100 : (1 - confidence) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};