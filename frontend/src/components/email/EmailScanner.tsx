import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Search, AlertTriangle, CheckCircle, Loader2, RefreshCw, FileText, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { showToast } from '../ui/Toast';
import { batchPredict } from '../../services/api';
import { useNotificationStore } from '../../stores/notificationStore';
import { useHistoryStore } from '../../stores/historyStore';

interface ScanResult {
  url: string;
  prediction: string;
  confidence: number;
  risk_level: string;
  phishing_probability?: number;
  legitimate_probability?: number;
}

export const EmailScanner = () => {
  const { addNotification } = useNotificationStore();
  const addBatchHistory = useHistoryStore((state) => state.addBatchEntries);
  const [emailContent, setEmailContent] = useState('');
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  // ✅ Enhanced URL extraction with better regex
  const extractUrls = (text: string): string[] => {
    // Match http/https URLs
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;
    const matches = text.match(urlRegex) || [];

    // Remove duplicates and clean trailing punctuation
    const uniqueUrls = [...new Set(matches.map(url => {
      return url.replace(/[.,;:!?)\]}>'"]+$/, '');
    }))];

    return uniqueUrls;
  };

  // ✅ Direct scan - no extraction step!
  const handleScan = async () => {
    if (!emailContent.trim()) {
      showToast('warning', 'Please paste email content first');
      return;
    }

    const urls = extractUrls(emailContent);

    if (urls.length === 0) {
      showToast('warning', 'No URLs found in email content');
      return;
    }

    if (urls.length > 100) {
      showToast('error', `Too many URLs (${urls.length}). Maximum 100 allowed.`);
      return;
    }

    setLoading(true);
    setScanned(true);

    try {
      showToast('info', `Scanning ${urls.length} URL(s) from email...`);

      const response = await batchPredict(urls);

      const mappedResults: ScanResult[] = response.results.map(r => ({
        ...r,
        phishing_probability: r.prediction === 'phishing' ? r.confidence : 1 - r.confidence,
        legitimate_probability: r.prediction === 'legitimate' ? r.confidence : 1 - r.confidence
      }));

      setResults(mappedResults);

      // Add to history
      addBatchHistory(mappedResults.map((r) => ({
        url: r.url,
        prediction: r.prediction as 'phishing' | 'legitimate',
        confidence: r.confidence,
        risk_level: r.risk_level as 'low' | 'medium' | 'high',
        sourceType: 'email' as const,
      })), 'email');

      const phishingCount = mappedResults.filter(
        (r) => r.prediction === 'phishing'
      ).length;

      if (phishingCount > 0) {
        showToast('error', `⚠️ DANGER! Found ${phishingCount} phishing URL(s)!`, 6000);
        addNotification({
          type: 'error',
          title: 'Threats Detected',
          message: `Email scan found ${phishingCount} phishing URLs.`,
        });
      } else {
        showToast('success', `✅ All ${urls.length} URLs appear safe!`);
        addNotification({
          type: 'success',
          title: 'Email Scan Safe',
          message: `Scanned ${urls.length} URLs, no threats found.`,
        });
      }
    } catch (error: any) {
      showToast('error', error.message || 'Failed to scan URLs. Please try again.');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmailContent('');
    setResults([]);
    setScanned(false);
    setLoading(false);
  };

  // ✅ Realistic sample emails
  const loadSamplePhishing = () => {
    setEmailContent(`Subject: URGENT: Your Account Has Been Suspended

Dear Customer,

We detected unusual activity on your account. Your account has been temporarily locked for security reasons.

To restore access immediately, please verify your identity by clicking here:
http://paypal-secure-login.tk/verify

You must complete verification within 24 hours or your account will be permanently closed.

Additional support link: http://support-verify-account.com/help

Click here to verify now: http://secure-paypal-verification.xyz/login

Best regards,
PayPal Security Team

This is an automated message. Please do not reply.`);
    showToast('info', '📧 Loaded phishing email sample');
    setScanned(false);
    setResults([]);
  };

  const loadSampleLegitimate = () => {
    setEmailContent(`Subject: Your Amazon Order Confirmation

Hi there,

Thank you for your order! Your purchase has been confirmed and will ship soon.

Order Number: 123-4567890-1234567

View your order details:
https://www.amazon.com/gp/your-account/order-details

Track your package:
https://www.amazon.com/progress-tracker/package

Manage your orders:
https://www.amazon.com/your-orders

Need help? Visit our customer service:
https://www.amazon.com/gp/help/customer/display.html

Thank you for shopping with us!

Best regards,
Amazon Customer Service

Visit Amazon.com: https://www.amazon.com`);
    showToast('info', '📧 Loaded legitimate email sample');
    setScanned(false);
    setResults([]);
  };

  const loadSampleMixed = () => {
    setEmailContent(`Subject: Important Security Update

Dear User,

We've upgraded our security systems. Please review the following:

Legitimate link - Our official site:
https://www.google.com

SUSPICIOUS LINK - Phishing attempt:
http://go0gle-secure-login.tk/verify

Another legitimate link:
https://www.github.com

Another phishing link:
http://paypal-verify-now.xyz/account

Please be careful which links you click!`);
    showToast('info', '📧 Loaded mixed email sample (2 safe, 2 phishing)');
    setScanned(false);
    setResults([]);
  };

  // Calculate stats
  const phishingCount = results.filter(r => r.prediction === 'phishing').length;
  const safeCount = results.filter(r => r.prediction === 'legitimate').length;
  const totalUrls = results.length;

  return (
    <div className="space-y-6">
      {/* Main Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Email URL Scanner
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Paste suspicious email content below. We'll automatically extract and scan all URLs for phishing threats.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sample Email Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadSamplePhishing}
                className="text-xs"
              >
                <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />
                Phishing Example
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadSampleLegitimate}
                className="text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                Legitimate Example
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadSampleMixed}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1 text-blue-500" />
                Mixed Example
              </Button>
            </div>

            {/* Email Content Textarea */}
            <div className="relative">
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Paste suspicious email content here...

Example:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: Urgent Account Verification
From: security@paypa1-verify.com

Your account has been suspended!
Click here to verify: http://paypal-secure.tk/login
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tip: Include the entire email with subject, body, and all links."
                className="w-full h-64 p-4 rounded-lg border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                disabled={loading}
              />
              {emailContent && !loading && (
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEmailContent('')}
                    className="h-6 px-2 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleScan}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                disabled={!emailContent.trim() || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning Email...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Scan Email for Threats
                  </>
                )}
              </Button>
              {(scanned || loading) && (
                <Button onClick={handleReset} variant="outline" disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Scan
                </Button>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>💡 How it works:</strong> Paste any email content, and we'll automatically extract all URLs and check them for phishing.
                Works with forwarded emails, suspicious messages, and marketing emails.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass">
              <CardContent className="p-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                  <p className="text-xl font-semibold">Scanning Email...</p>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Extracting URLs and analyzing each one for phishing threats using AI-powered detection
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      {scanned && !loading && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary Card */}
          <Card className={`glass border-2 ${phishingCount > 0
            ? 'border-red-500/30 bg-red-500/5'
            : 'border-green-500/30 bg-green-500/5'
            }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {phishingCount > 0 ? (
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-green-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      {phishingCount > 0 ? '⚠️ Threats Detected!' : '✅ Email is Safe'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Scanned {totalUrls} URL(s) from email content
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <div className="text-4xl font-bold text-red-500">
                      {phishingCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Phishing</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-green-500">
                      {safeCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Safe</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Detailed Scan Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                Each URL found in the email has been analyzed for phishing indicators
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, index) => {
                  const isPhishing = result.prediction === 'phishing';
                  const isHighRisk = result.risk_level === 'high' || result.risk_level === 'critical';

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${isPhishing
                        ? 'bg-red-500/5 border-red-500/30'
                        : 'bg-green-500/5 border-green-500/30'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {isPhishing ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isHighRisk ? 'bg-red-600 animate-pulse' : 'bg-red-500'
                              }`}>
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm break-all mb-3 text-foreground">
                            {result.url}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${isPhishing
                              ? 'bg-red-500 text-white'
                              : 'bg-green-500 text-white'
                              }`}>
                              {isPhishing ? '🚨 PHISHING' : '✅ SAFE'}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              {(result.confidence * 100).toFixed(1)}% confidence
                            </span>

                            <span className={`text-xs px-2 py-1 rounded-full ${result.risk_level === 'high' || result.risk_level === 'critical'
                              ? 'bg-red-500/20 text-red-600 font-semibold' :
                              result.risk_level === 'medium' || result.risk_level === 'caution'
                                ? 'bg-yellow-500/20 text-yellow-600' :
                                'bg-green-500/20 text-green-600'
                              }`}>
                              {result.risk_level} risk
                            </span>
                          </div>

                          {isPhishing && (
                            <div className="text-xs text-red-600 dark:text-red-400 mt-2 space-y-1">
                              <p className="font-semibold">⚠️ DO NOT CLICK THIS LINK!</p>
                              {result.phishing_probability !== undefined && (
                                <p>Phishing probability: {(result.phishing_probability * 100).toFixed(1)}%</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Warning Card for Phishing */}
          {phishingCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glass border-2 border-red-500/30 bg-red-500/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 animate-pulse" />
                    <div>
                      <h4 className="text-lg font-bold text-red-600 dark:text-red-400 mb-3">
                        🚨 DANGER: Phishing Email Detected!
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-foreground">Immediate Actions Required:</p>
                        <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                          <li><strong>DO NOT</strong> click any links in this email</li>
                          <li><strong>DO NOT</strong> enter passwords or personal information</li>
                          <li><strong>DO NOT</strong> download any attachments</li>
                          <li><strong>DELETE</strong> this email immediately</li>
                          <li><strong>REPORT</strong> to your email provider as phishing/spam</li>
                          <li><strong>INFORM</strong> IT department if this is a work email</li>
                        </ul>
                        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <p className="text-xs text-red-600 dark:text-red-400">
                            <strong>Why is this dangerous?</strong> Phishing emails try to steal your passwords,
                            credit card info, or install malware. Even clicking the link can be dangerous.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Safe Email Card */}
          {phishingCount === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glass border-2 border-green-500/30 bg-green-500/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                    <div>
                      <h4 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                        ✅ Email Appears Safe
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        All URLs in this email passed our phishing detection checks.
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Remember:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Always verify sender email addresses</li>
                          <li>Check for spelling errors in URLs</li>
                          <li>Hover over links before clicking to see actual destination</li>
                          <li>Be cautious with urgent or threatening language</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};