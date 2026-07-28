import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '../../lib/utils';

interface ShapFeature {
  feature: string;
  value: number;
  contribution: number;
  impact: 'positive' | 'negative';
}

interface ShapChartProps {
  features: ShapFeature[];
  explanationMethod: string;
  baseValue: number;
}

export const ShapChart = ({ features, explanationMethod, baseValue }: ShapChartProps) => {
  // Get top 10 features by absolute contribution
  const topFeatures = [...(features || [])]
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 10);

  // Find max absolute value for scaling
  const maxContribution = topFeatures.length > 0
    ? Math.max(...topFeatures.map(f => Math.abs(f.contribution)))
    : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Detailed Analysis
            </CardTitle>
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {explanationMethod || 'N/A'}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Top features influencing the prediction
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Base Value Info */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Base Value</span>
              <span className="text-sm font-semibold text-foreground">
                {typeof baseValue === 'number' ? baseValue.toFixed(3) : '0.500'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average model prediction before considering features
            </p>
          </div>

          {/* Feature Bars */}
          <div className="space-y-3">
            {topFeatures.map((feature, index) => {
              const isPositive = feature.contribution > 0;
              const barWidth = (Math.abs(feature.contribution) / maxContribution) * 100;
              // REVERSED LOGIC: Positive SHAP = Green (Good/Legit), Negative SHAP = Red (Bad/Phishing)
              const TrendIcon = isPositive ? TrendingDown : TrendingUp;

              return (
                <motion.div
                  key={feature.feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  {/* Feature Name & Value */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <TrendIcon className={cn(
                        'w-4 h-4 flex-shrink-0',
                        isPositive ? 'text-green-500' : 'text-red-500'
                      )} />
                      <span className="font-medium text-foreground truncate">
                        {feature.feature}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 ml-2">
                      <span className="text-xs text-muted-foreground">
                        Value: {typeof feature.value === 'number' ? feature.value.toFixed(3) : 'N/A'}
                      </span>
                      <span className={cn(
                        'text-xs font-semibold min-w-[60px] text-right',
                        isPositive ? 'text-green-500' : 'text-red-500'
                      )}>
                        {isPositive ? '+' : ''}{typeof feature.contribution === 'number' ? feature.contribution.toFixed(3) : '0.000'}
                      </span>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full',
                        isPositive
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      )}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Increases Legitimacy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Increases Risk</span>
              </div>
            </div>
          </div>

          {/* Explanation Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20"
          >
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">What is this analysis?</span> This chart visualizes the SHAP (SHapley Additive exPlanations) values. Features with <span className="text-green-600 font-medium">green bars</span> contribute to the URL being safely classified (Legitimate), while <span className="text-red-600 font-medium">red bars</span> indicate features that increase the likelihood of phishing.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};