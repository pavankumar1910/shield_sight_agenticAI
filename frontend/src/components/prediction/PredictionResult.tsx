import { motion } from 'framer-motion';
import {
  Clock,
  Link as LinkIcon,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  Globe,
  CheckCircle,
  XCircle,
  Lock,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { GeoInfo } from '../analysis/GeoInfo';
import { ThreatDashboard } from '../analysis/ThreatDashboard';

/* -------------------- TYPES -------------------- */

export interface PredictionSummary {
  verdict: string;
  confidence: number;
  risk_factors: string[];
  safe_factors: string[];
  recommendation: string;
  action: string;
}

export interface LinkStatus {
  is_accessible: boolean;
  status_code?: number | null;
  response_time_ms?: number | null;
  ssl_valid?: boolean | null;
  has_redirects?: boolean | null;
  final_url?: string | null;
  error_message?: string | null;
  server_info?: string | null;
}

interface PredictionResultProps {
  url: string;
  timestamp: string;
  prediction?: string;
  confidence?: number;
  summary?: string | PredictionSummary;
  linkStatus?: LinkStatus;
  availability?: LinkStatus;
  geo_analysis?: any;
  threat_index?: number;
  threat_level?: string;
  threat_breakdown?: any;
  explainability_timeline?: any[];
  attack_type?: string;
  model_reliability?: string;
  showAnalysis?: boolean;
  className?: string;
}

/* -------------------- COMPONENT -------------------- */

export const PredictionResult = ({
  url,
  timestamp,
  prediction,
  summary,
  linkStatus,
  availability,
  geo_analysis,
  threat_index,
  threat_level,
  threat_breakdown,
  explainability_timeline,
  attack_type,
  model_reliability,
  showAnalysis = true,
  className
}: PredictionResultProps) => {
  // Debug logging
  console.log('🔍 PredictionResult Props:', {
    summary,
    linkStatus,
    availability,
    className
  });

  const [copied, setCopied] = useState(false);

  // Use either linkStatus or availability (they're the same data)
  const websiteStatus = linkStatus || availability;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Handle both string and object summary formats
  const isSummaryObject = typeof summary === 'object' && summary !== null;
  const summaryObj = isSummaryObject ? summary as PredictionSummary : null;
  const summaryText = typeof summary === 'string' ? summary : null;

  const isPhishing =
    summaryObj?.verdict?.toLowerCase().includes('phishing') ??
    prediction?.toLowerCase().includes('phishing') ??
    false;

  const hasRiskFactors = summaryObj && summaryObj.risk_factors?.length > 0;
  const hasSafeFactors = summaryObj && summaryObj.safe_factors?.length > 0;

  const getStatusText = (statusCode?: number): string => {
    if (!statusCode) return '';

    if (statusCode >= 200 && statusCode < 300) return 'OK';
    if (statusCode >= 300 && statusCode < 400) return 'Redirect';
    if (statusCode >= 400 && statusCode < 500) return 'Client Error';
    if (statusCode >= 500) return 'Server Error';
    return 'Unknown';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn('space-y-4', className)}
    >
      {/* ---------------- URL CARD ---------------- */}
      <Card className="glass overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Analyzed URL
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <time dateTime={timestamp}>
                  {formatTimestamp(timestamp)}
                </time>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <code className="flex-1 text-sm truncate font-mono text-foreground select-all">
                {url}
              </code>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="h-8 w-8 flex-shrink-0"
                title={copied ? 'Copied!' : 'Copy URL'}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(url, '_blank', 'noopener,noreferrer')
                }
                className="text-xs gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-xs gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✨ TEXT SUMMARY CARD */}
      {summaryText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="glass">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Analysis Summary
              </h3>

              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-sans">
                  {summaryText}
                </pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ✨ WEBSITE STATUS CARD - FIXED! */}
      {websiteStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={cn(
            "glass border",
            websiteStatus?.is_accessible === true
              ? "border-green-500/30 bg-green-500/5"
              : websiteStatus?.is_accessible === false
                ? "border-red-500/30 bg-red-500/5"
                : "border-gray-500/30 bg-gray-500/5"
          )}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  Website Availability
                </h3>
              </div>

              {websiteStatus?.is_accessible ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Website is ONLINE</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {websiteStatus?.response_time_ms && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <span className="text-xs text-muted-foreground block mb-1">Response Time</span>
                        <p className="text-sm font-semibold">{websiteStatus.response_time_ms}ms</p>
                      </div>
                    )}

                    {websiteStatus?.status_code && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <span className="text-xs text-muted-foreground block mb-1">HTTP Status</span>
                        <p className="text-sm font-semibold">
                          {websiteStatus.status_code} {getStatusText(websiteStatus.status_code)}
                        </p>
                      </div>
                    )}
                  </div>

                  {websiteStatus?.ssl_valid !== undefined && (
                    websiteStatus.ssl_valid ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                        <Lock className="w-4 h-4" />
                        <span>Secure HTTPS connection</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>No HTTPS (insecure)</span>
                      </div>
                    )
                  )}

                  {websiteStatus?.has_redirects && websiteStatus?.final_url && (
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                            ⚠️ URL Redirects
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 break-all">
                            Final: {websiteStatus.final_url}
                          </p>
                          <p className="text-xs text-yellow-600/80 mt-1">
                            Redirects can be used in phishing attacks
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {websiteStatus?.server_info && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground">Server</span>
                      <span className="text-xs font-mono text-foreground">
                        {websiteStatus.server_info}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Website is OFFLINE or UNREACHABLE</span>
                  </div>

                  {websiteStatus?.error_message && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <strong>Error:</strong> {websiteStatus.error_message}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      ⚠️ This could indicate:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Website is temporarily down</li>
                      <li>Server maintenance in progress</li>
                      <li>Domain doesn't exist (typo or fake)</li>
                      <li>Phishing site was taken down</li>
                      <li>DNS lookup failure</li>
                    </ul>
                  </div>

                  {websiteStatus?.ssl_valid === false && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        🚨 <strong>Extra suspicious:</strong> No HTTPS + unreachable = likely phishing!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ✨ THREAT INTELLIGENCE DASHBOARD */}
      {threat_index !== undefined && (
        <ThreatDashboard
          threatIndex={threat_index}
          threatLevel={threat_level || "Unknown"}
          breakdown={threat_breakdown}
          timeline={explainability_timeline || {}}
          attackType={attack_type || "Unknown"}
          modelReliability={model_reliability}
        />
      )}

      {/* ✨ GEO-BLOCKING & PROXY DETECTION CARD */}
      {geo_analysis && <GeoInfo geoAnalysis={geo_analysis} />}

      {/* STRUCTURED ANALYSIS CARD */}
      {showAnalysis && summaryObj && (
        <Card
          className={cn(
            'border overflow-hidden',
            isPhishing
              ? 'border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent'
              : 'border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent'
          )}
        >
          <CardContent className="p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'p-2 rounded-full',
                  isPhishing
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-green-500/10 text-green-500'
                )}
              >
                {isPhishing ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold">
                    {summaryObj?.verdict || 'Unknown'}
                  </h3>
                  {summaryObj?.confidence && (
                    <div
                      className={cn(
                        'px-2 py-1 rounded-md text-xs font-medium',
                        isPhishing
                          ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                          : 'bg-green-500/20 text-green-700 dark:text-green-300'
                      )}
                    >
                      {summaryObj.confidence}% confidence
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  AI-powered analysis completed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hasRiskFactors && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h4 className="text-sm font-semibold text-red-600">
                      Risk Factors
                    </h4>
                  </div>
                  <ul className="space-y-1.5">
                    {summaryObj.risk_factors.map((factor, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-red-500">•</span>
                        <span className="text-muted-foreground">
                          {factor}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasSafeFactors && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <h4 className="text-sm font-semibold text-green-600">
                      Safety Indicators
                    </h4>
                  </div>
                  <ul className="space-y-1.5">
                    {summaryObj.safe_factors.map((factor, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-green-500">•</span>
                        <span className="text-muted-foreground">
                          {factor}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {(summaryObj?.recommendation || summaryObj?.action) && (
              <div className="pt-4 border-t border-border/50 space-y-2">
                <h4 className="text-sm font-semibold">
                  Recommendation
                </h4>
                <p className="text-sm font-medium">
                  {summaryObj.recommendation}
                </p>
                <p className="text-sm text-muted-foreground">
                  {summaryObj.action}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};