import { Shield, AlertTriangle, Info } from 'lucide-react';
import { Card } from '../ui/Card';

interface ThreatDashboardProps {
  threatIndex: number;
  threatLevel: string;
  breakdown: any;
  timeline: any;
  attackType: string;
  modelReliability?: string;
}

export const ThreatDashboard = ({
  threatIndex,
  threatLevel,
  breakdown,
  timeline,
  attackType,
  modelReliability
}: ThreatDashboardProps) => {
  const getThreatColor = () => {
    if (threatIndex >= 80) return 'red';
    if (threatIndex >= 60) return 'orange';
    if (threatIndex >= 40) return 'yellow';
    return 'green';
  };

  return (
    <div className="space-y-6">
      {/* Threat Index */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Threat Index</h3>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${threatIndex * 3.51} 351`}
                className={`text-${getThreatColor()}-500`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{threatIndex}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          
          <div>
            <p className={`text-2xl font-bold text-${getThreatColor()}-600`}>
              {threatLevel}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Threat Level
            </p>
            
            {/* Attack Type */}
            {attackType && (
              <div className="mt-3">
                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                  {attackType}
                </span>
              </div>
            )}
            
            {/* Model Reliability Badge */}
            {modelReliability && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Model Reliability:</span>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    modelReliability === 'HIGH' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    modelReliability === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {modelReliability}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown */}
        {breakdown && (
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium">Score Breakdown:</p>
            {Object.entries(breakdown).map(([key, value]: [string, any]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground capitalize">
                  {key.replace('_', ' ')}:
                </span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Explainability Timeline */}
      {timeline && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Threat Analysis Timeline</h3>
          
          <div className="space-y-6">
            {/* WHY */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 className="font-semibold">WHY Flagged</h4>
              </div>
              <div className="pl-7 space-y-1 text-sm">
                {timeline.why_flagged?.map((reason: string, idx: number) => (
                  <p key={idx}>{reason}</p>
                ))}
              </div>
            </div>

            {/* HOW */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-orange-500" />
                <h4 className="font-semibold">HOW Attackers Exploit This</h4>
              </div>
              <div className="pl-7 space-y-1 text-sm">
                {timeline.how_exploited?.map((method: string, idx: number) => (
                  <p key={idx}>• {method}</p>
                ))}
              </div>
            </div>

            {/* WHAT */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold">WHAT You Should Do</h4>
              </div>
              <div className="pl-7 space-y-1 text-sm">
                {timeline.what_to_do?.map((action: string, idx: number) => (
                  <p key={idx} className="font-medium">{action}</p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};