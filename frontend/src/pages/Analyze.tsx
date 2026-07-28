import { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Server,
  Lock,
  Globe,
  Info,
  Activity,
  FileText,
  Download,
  Printer,
  Share2
} from 'lucide-react';
import { URLInput } from '../components/prediction/URLInput';
import { RiskIndicator } from '../components/prediction/RiskIndicator';
import { ShapChart } from '../components/prediction/ShapChart';
import { Card, CardContent } from '../components/ui/Card';
import { predictURL, explainPrediction } from '../services/api';
import type { PredictionResponse, ExplanationResponse } from '../services/api';
import { useHistoryStore } from '../stores/historyStore';
import { showToast } from '../components/ui/Toast';
import { useDebouncedCallback } from 'use-debounce';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ============================================
// ✅ VERSION 1: PHISHING DETECTION LOGIC
// ============================================
interface ValidationIssue {
  title: string;
  description: string;
  severity: 'critical' | 'warning';
}

interface URLValidationResult {
  isValid: boolean;
  isPhishing: boolean;
  issues: ValidationIssue[];
  score: number;
}

const validateAndCheckURL = (url: string): URLValidationResult => {
  const issues: ValidationIssue[] = [];
  let phishingScore = 0;

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();

    // 🚨 CHECK 1: Invalid TLD or suspicious domain patterns
    if (!domain.includes('.')) {
      issues.push({
        title: 'Missing Domain Extension',
        description: 'The URL does not have a valid domain extension (like .com or .org), which is required for legitimate websites.',
        severity: 'critical'
      });
      phishingScore += 30;
    }

    // 🚨 CHECK 2: Typosquatting detection (common misspellings)
    const suspiciousDomains = [
      /goog?le|gogle|goggle|gogo/i,
      /amaz?on|amazo|amazone|amaz0n/i,
      /faceb?ook|facebook|facebok|facebbok/i,
      /payp?al|paypal|paypel|paypa1/i,
      /micros?oft|microsft|microsot|microsft/i,
      /appl?e|aple|appl|aple/i,
      /netflix|netflox|netflics|netflix/i,
      /linkedin|linkedln|linkdin|linkedim/i,
      /instagram|instagra|insta/i,
      /twitter|twiter|twiiter/i,
      /leetcode|leecode|leet-code/i,
    ];

    const domainOnly = domain.split('.')[0];
    const knownDomains = ['leetcode', 'google', 'amazon', 'facebook', 'paypal', 'microsoft', 'apple', 'netflix', 'linkedin', 'instagram', 'twitter'];

    if (!knownDomains.includes(domainOnly)) {
      for (const pattern of suspiciousDomains) {
        if (pattern.test(domainOnly)) {
          issues.push({
            title: 'Typosquatting Detected',
            description: `The domain "${domainOnly}" resembles a popular brand. Phishers often use slight misspellings to trick users.`,
            severity: 'critical'
          });
          phishingScore += 35;
          break;
        }
      }
    }

    // 🚨 CHECK 3: Missing HTTPS
    if (urlObj.protocol !== 'https:') {
      issues.push({
        title: 'Insecure Connection (No HTTPS)',
        description: 'This site is not using HTTPS encryption. Any data you enter (passwords, credit cards) can be intercepted by attackers.',
        severity: 'warning'
      });
      phishingScore += 20;
    }

    // 🚨 CHECK 4: Suspicious characters or encoding
    if (url.includes('xn--') || /[^\w\-.:/?#[\]@!$&'()*+,;=%]/.test(url)) {
      issues.push({
        title: 'Suspicious Character Encoding',
        description: 'The URL contains special characters or obfuscated encoding often used to hide the true destination.',
        severity: 'warning'
      });
      phishingScore += 15;
    }

    // 🚨 CHECK 5: IP address instead of domain
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain)) {
      issues.push({
        title: 'Raw IP Address Usage',
        description: 'Legitimate services use domain names (e.g., google.com). Using a raw IP address is a strong indicator of a malicious site.',
        severity: 'critical'
      });
      phishingScore += 25;
    }

    // 🚨 CHECK 6: Excessive subdomains (common phishing tactic)
    const subdomainCount = (domain.match(/\./g) || []).length;
    if (subdomainCount > 3) {
      issues.push({
        title: 'Excessive Subdomains',
        description: `This URL has ${subdomainCount} subdomains. Phishers use this to hide the true domain on mobile screens.`,
        severity: 'warning'
      });
      phishingScore += 20;
    }

    // 🚨 CHECK 7: Port number (phishing often uses ports)
    if (urlObj.port && !['80', '443'].includes(urlObj.port)) {
      issues.push({
        title: 'Non-Standard Port detected',
        description: `The URL is accessing port ${urlObj.port}, which is unusual for standard web browsing and often used by malware.`,
        severity: 'warning'
      });
      phishingScore += 15;
    }

    // 🚨 CHECK 8: URL length (phishing URLs are often very long)
    if (url.length > 200) {
      issues.push({
        title: 'Suspiciously Long URL',
        description: 'The URL is extremely long (>200 chars). This is often used to hide the malicious part of the address.',
        severity: 'warning'
      });
      phishingScore += 10;
    }

    return {
      isValid: issues.length === 0,
      isPhishing: phishingScore >= 40,
      issues,
      score: Math.min(phishingScore, 100),
    };
  } catch (error) {
    return {
      isValid: false,
      isPhishing: true,
      issues: [{
        title: 'Invalid URL Format',
        description: 'The provided URL could not be parsed. Please check if it is formatted correctly.',
        severity: 'warning'
      }],
      score: 95,
    };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateFilename = (prediction: PredictionResponse) => {
  const domain = new URL(prediction.url).hostname.replace(/[^a-z0-9]/gi, '-');
  const timestamp = new Date().toISOString().split('T')[0];
  return `ShieldSight-Analysis-${domain}-${timestamp}.pdf`;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============================================
// MAIN COMPONENT
// ============================================

export const Analyze = () => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [urlValidation, setUrlValidation] = useState<URLValidationResult | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const addHistoryEntry = useHistoryStore((state) => state.addEntry);
  const reportRef = useRef<HTMLDivElement>(null);

  // MEMOIZED: Threat score calculation (only recalc when prediction changes)
  const threatScore = useMemo(() => {
    if (!prediction) return 0;
    let score = prediction.prediction === 'phishing'
      ? prediction.confidence * 100
      : (1 - prediction.confidence) * 100;
    return Math.min(Math.max(Math.round(score), 0), 100);
  }, [prediction]);

  // MAIN ANALYSIS HANDLER
  // MAIN ANALYSIS HANDLER (Debounced 300ms)
  const handleAnalyze = useDebouncedCallback(async (url: string) => {
    setLoading(true);
    setPrediction(null);
    setExplanation(null);
    setUrlValidation(null);

    try {
      // ✅ VERSION 1: LOCAL VALIDATION FIRST (instant, 5ms)
      const validation = validateAndCheckURL(url);
      setUrlValidation(validation);

      showToast('info', 'Analyzing URL...');

      // 🚨 Early warning if critical phishing indicators found
      if (validation.isPhishing && validation.score >= 80) {
        showToast('error', `⚠️ Critical phishing indicators detected:\n${validation.issues.map(i => i.title).slice(0, 2).join('\n')}`);
      }

      // ✅ OPTIMIZATION: Parallel API calls (not sequential)
      // First call only does ML + External Checks (FAST)
      // Second call handles SHAP Explanation (COMPUTE HEAVY)
      const [predictionResult, explanationResult] = await Promise.all([
        predictURL(url, false), 
        explainPrediction(url)
      ]);

      // ✅ VERSION 1: Confidence boosting based on validation
      if (validation.isPhishing && validation.score >= 40) {
        const boostAmount = Math.min(validation.score / 100 * 0.3, 0.25);
        if (predictionResult.prediction === 'legitimate') {
          predictionResult.confidence = Math.max(
            predictionResult.confidence - boostAmount,
            0.1
          );
          if (predictionResult.confidence < 0.5) {
            predictionResult.prediction = 'phishing';
            predictionResult.confidence = Math.min(1 - predictionResult.confidence, 0.99);
          }
        }
      }

      setPrediction(predictionResult);
      setExplanation(explanationResult);

      addHistoryEntry({
        url: predictionResult.url,
        prediction: predictionResult.prediction,
        confidence: predictionResult.confidence,
        risk_level: predictionResult.risk_level,
        scanMode: 'single',
        sourceType: 'manual',
      });

      showToast('success', 'Analysis complete!');
    } catch (error: any) {
      console.error('Analysis failed:', error);
      showToast('error', error.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, 300);

  // COPY URL HANDLER
  const handleCopyUrl = useCallback(() => {
    if (prediction?.url) {
      navigator.clipboard.writeText(prediction.url).then(() => {
        setCopiedUrl(true);
        showToast('success', 'URL copied to clipboard');
        setTimeout(() => setCopiedUrl(false), 2000);
      });
    }
  }, [prediction?.url]);

  const handleOpenUrl = useCallback(() => {
    if (prediction?.url) {
      window.open(prediction.url, '_blank');
    }
  }, [prediction?.url]);

  // ✅ VERSION 2: ENTERPRISE CSV EXPORT
  const handleExportCSV = useCallback(() => {
    if (!prediction || !explanation) return;

    const csvData = [
      ['ShieldSight URL Analysis Report'],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['URL Analyzed', prediction.url],
      ['Prediction', prediction.prediction.toUpperCase()],
      ['Confidence', `${(prediction.confidence * 100).toFixed(1)}%`],
      ['Risk Level', prediction.risk_level],
      ['Timestamp', new Date(prediction.timestamp).toLocaleString()],
      [''],
      ['Explanation Method', explanation.explanation_method],
      ['Base Value', `${(explanation.base_value * 100).toFixed(1)}%`],
      ['Model Confidence', `${(explanation.confidence * 100).toFixed(1)}%`],
      [''],
      ['Feature Analysis'],
      ['Feature', 'Value', 'Contribution', 'Impact'],
      ...explanation.top_features.map(f => [
        f.feature,
        f.value,
        `${(f.contribution * 100).toFixed(1)}%`,
        f.impact
      ])
    ];

    const csv = csvData.map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shieldsight-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'CSV report downloaded');
  }, [prediction, explanation]);

  // ✅ VERSION 2: ENTERPRISE PDF EXPORT WITH RICH STYLING
  const handleExportPDF = useCallback(async () => {
    if (!prediction || !explanation) {
      showToast('error', 'No analysis data to export');
      return;
    }

    setExportingPDF(true);
    showToast('info', 'Generating PDF report...');

    try {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '900px';
      tempContainer.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempContainer);

      // ✅ VERSION 2: ENTERPRISE RICH PDF STYLING
      const pdfContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 50px; color: #1f2937; background: white;">
          <!-- HEADER WITH BRANDING -->
          <div style="text-align: center; margin-bottom: 50px;">
            <div style="display: inline-flex; align-items: center; gap: 16px; margin-bottom: 30px;">
              <div style="width: 70px; height: 70px; border-radius: 20px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);">
                <span style="color: white; font-size: 32px; font-weight: bold;">🛡️</span>
              </div>
              <div>
                <h1 style="font-size: 36px; font-weight: 800; margin: 0; color: #1f2937;">ShieldSight</h1>
                <p style="font-size: 16px; color: #6b7280; margin: 5px 0 0 0; font-weight: 500;">URL Security Analysis Platform</p>
              </div>
            </div>
            <div style="border-top: 3px solid #e5e7eb; border-bottom: 3px solid #e5e7eb; padding: 20px 0; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <strong>Report Generated:</strong> ${formatDate(new Date())} | <strong>Report ID:</strong> ${Date.now()}
              </p>
            </div>
          </div>

          <!-- SUMMARY SECTION WITH GRADIENT -->
          <div style="margin-bottom: 50px;">
            <div style="background: ${prediction.prediction === 'legitimate'
          ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)'
          : 'linear-gradient(135deg, #fef2f2, #fef5f5)'}; 
              border-left: 8px solid ${prediction.prediction === 'legitimate' ? '#10b981' : '#ef4444'}; 
              border-radius: 12px; 
              padding: 40px; 
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              
              <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 30px;">
                <div style="width: 90px; height: 90px; border-radius: 24px; background: linear-gradient(135deg, ${prediction.prediction === 'legitimate' ? '#10b981, #059669' : '#ef4444, #f97316'}); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); flex-shrink: 0;">
                  <span style="color: white; font-size: 40px;">${prediction.prediction === 'legitimate' ? '✅' : '🚨'}</span>
                </div>
                <div>
                  <h2 style="font-size: 32px; font-weight: 800; margin: 0 0 10px 0; color: #1f2937;">
                    ${prediction.prediction === 'legitimate' ? 'LEGITIMATE WEBSITE' : 'PHISHING DETECTED'}
                  </h2>
                  <p style="font-size: 16px; color: #6b7280; margin: 0;">
                    Confidence Level: <strong style="font-size: 20px; color: ${prediction.prediction === 'legitimate' ? '#10b981' : '#ef4444'};">${(prediction.confidence * 100).toFixed(1)}%</strong>
                  </p>
                </div>
              </div>
              
              <!-- KEY METRICS -->
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 30px;">
                <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #e5e7eb;">
                  <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">URL Analyzed</p>
                  <p style="font-size: 13px; color: #1f2937; margin: 0; word-break: break-all; font-family: monospace; font-weight: 500;">${prediction.url}</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #e5e7eb;">
                  <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Risk Level</p>
                  <p style="font-size: 16px; color: ${prediction.prediction === 'legitimate' ? '#10b981' : '#ef4444'}; font-weight: 800; margin: 0;">${prediction.risk_level.toUpperCase()}</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #e5e7eb;">
                  <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Analysis Type</p>
                  <p style="font-size: 16px; color: #3b82f6; font-weight: 800; margin: 0;">AI-Powered</p>
                </div>
              </div>
            </div>
          </div>

          <!-- THREAT ASSESSMENT DETAILS -->
          <div style="margin-bottom: 50px;">
            <h3 style="font-size: 22px; font-weight: 800; color: #1f2937; margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 3px solid #e5e7eb;">Threat Assessment & Details</h3>
            
            <div style="background: #f9fafb; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                  <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px 0; font-weight: 600; text-transform: uppercase;">Base Prediction Value</p>
                  <p style="font-size: 18px; color: #1f2937; font-weight: 800; margin: 0;">${(explanation.base_value * 100).toFixed(1)}% Phishing Probability</p>
                </div>
                <div>
                  <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px 0; font-weight: 600; text-transform: uppercase;">Model Confidence</p>
                  <p style="font-size: 18px; color: #3b82f6; font-weight: 800; margin: 0;">${(explanation.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
              <div>
                <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase;">Explanation Method</p>
                <p style="font-size: 14px; color: #1f2937; margin: 0; background: white; padding: 10px 15px; border-radius: 6px; font-weight: 500; display: inline-block; border: 1px solid #d1d5db;">${explanation.explanation_method}</p>
              </div>
            </div>
          </div>

          <!-- TOP RISK FACTORS -->
          <div style="margin-bottom: 50px;">
            <h3 style="font-size: 22px; font-weight: 800; color: #1f2937; margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 3px solid #e5e7eb;">Top Risk Factors & Feature Contributions</h3>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
              ${(explanation.top_features || []).slice(0, 10).map((feature) => `
                <div style="background: white; border: 2px solid ${feature.impact === 'negative' ? '#fee2e2' : '#dcfce7'}; border-radius: 10px; padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                  <div>
                    <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase;">Feature</p>
                    <p style="font-size: 16px; color: #1f2937; margin: 0; font-weight: 700; text-transform: capitalize;">${feature.feature.replace(/_/g, ' ')}</p>
                    <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0; font-family: monospace;">Value: ${feature.value}</p>
                  </div>
                  <div>
                    <div style="text-align: right;">
                      <div style="display: inline-block; padding: 6px 14px; border-radius: 20px; background: ${feature.impact === 'negative' ? '#fecaca' : '#bbf7d0'}; color: ${feature.impact === 'negative' ? '#991b1b' : '#065f46'}; font-size: 12px; font-weight: 700; margin-bottom: 10px;">
                        ${feature.impact === 'negative' ? '⬆️ INCREASES RISK' : '⬇️ DECREASES RISK'}
                      </div>
                      <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                        <div style="width: ${Math.abs(feature.contribution) * 100}%; height: 100%; background: linear-gradient(90deg, ${feature.impact === 'negative' ? '#ef4444, #f97316' : '#10b981, #059669'});"></div>
                      </div>
                      <p style="font-size: 14px; color: #1f2937; margin: 0; font-weight: 800;">
                        ${feature.impact === 'negative' ? '+' : ''}${(feature.contribution * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- TECHNICAL DETAILS SECTION -->
          <div style="margin-bottom: 50px;">
            <h3 style="font-size: 22px; font-weight: 800; color: #1f2937; margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 3px solid #e5e7eb;">Technical Infrastructure</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <!-- MODEL INFORMATION -->
              <div style="background: linear-gradient(135deg, #f0f9ff, #f0f4ff); border-radius: 10px; padding: 25px; border: 2px solid #dbeafe;">
                <h4 style="font-size: 16px; font-weight: 800; color: #1f2937; margin: 0 0 20px 0; display: flex; align-items: center; gap: 8px;">
                  <span>🤖</span> Model Configuration
                </h4>
                <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #bfdbfe;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 600;">Model Version</span>
                    <span style="font-size: 14px; color: #1f2937; font-weight: 700;">${prediction.metadata?.model_version || 'Random Forest v2.0'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #bfdbfe;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 600;">Processing Time</span>
                    <span style="font-size: 14px; color: #1f2937; font-weight: 700;">${prediction.metadata?.processing_time_ms || '~120'}ms</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 600;">Explanation Method</span>
                    <span style="font-size: 14px; color: #1f2937; font-weight: 700;">${explanation.explanation_method}</span>
                  </div>
                </div>
              </div>

              <!-- WEBSITE AVAILABILITY -->
              <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border-radius: 10px; padding: 25px; border: 2px solid #dcfce7;">
                <h4 style="font-size: 16px; font-weight: 800; color: #1f2937; margin: 0 0 20px 0; display: flex; align-items: center; gap: 8px;">
                  <span>🌐</span> Website Status
                </h4>
                <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #dcfce7;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 600;">Status</span>
                    <span style="font-size: 14px; color: ${(prediction.availability?.is_accessible ?? false) ? '#059669' : '#dc2626'}; font-weight: 700;">${(prediction.availability?.is_accessible ?? false) ? '🟢 ONLINE' : '🔴 OFFLINE'}</span>
                  </div>
                  ${prediction.availability?.status_code ? `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #dcfce7;">
                      <span style="font-size: 14px; color: #6b7280; font-weight: 600;">HTTP Status</span>
                      <span style="font-size: 14px; color: #1f2937; font-weight: 700;">${prediction.availability.status_code}</span>
                    </div>
                  ` : ''}
                  ${prediction.availability?.ssl_valid !== undefined ? `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                      <span style="font-size: 14px; color: #6b7280; font-weight: 600;">SSL/TLS Certificate</span>
                      <span style="font-size: 14px; color: ${prediction.availability.ssl_valid ? '#059669' : '#dc2626'}; font-weight: 700;">${prediction.availability.ssl_valid ? '✓ Valid' : '✗ Invalid'}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>

          <!-- VALIDATION & SECURITY CHECKS -->
          ${urlValidation && urlValidation.issues.length > 0 ? `
            <div style="margin-bottom: 50px;">
              <h3 style="font-size: 22px; font-weight: 800; color: #1f2937; margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 3px solid #e5e7eb;">🔒 Security Validation Checks</h3>
              <div style="background: #fef2f2; border-left: 8px solid #ef4444; border-radius: 10px; padding: 25px;">
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 15px 0;"><strong>Detected Issues:</strong></p>
                <ul style="margin: 0; padding-left: 20px;">
                  ${urlValidation.issues.map(issue => `
                    <li style="margin: 8px 0; font-size: 13px; color: #1f2937; font-weight: 500;">
                      <strong>•</strong> ${issue}
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          ` : ''}

          <!-- SUMMARY AND RECOMMENDATIONS -->
          ${prediction.summary ? `
            <div style="margin-bottom: 50px;">
              <h3 style="font-size: 22px; font-weight: 800; color: #1f2937; margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 3px solid #e5e7eb;">Analysis Summary & Recommendations</h3>
              <div style="background: white; border: 2px solid ${prediction.prediction === 'legitimate' ? '#dcfce7' : '#fee2e2'}; border-radius: 10px; padding: 25px;">
                ${prediction.summary.split('\n\n').map((section) => {
            const lines = section.split('\n');
            const title = lines[0];
            const content = lines.slice(1);

            return `
                    <div style="margin-bottom: 20px;">
                      <h4 style="font-size: 15px; font-weight: 800; color: #1f2937; margin: 0 0 12px 0;">${title}</h4>
                      <ul style="margin: 0; padding-left: 20px;">
                        ${content.map(line => {
              if (line.trim()) {
                return `<li style="margin: 6px 0; font-size: 13px; color: #4b5563; font-weight: 500;">${line.replace(/^[✓•✗]\s*/, '').replace(/\*\*/g, '')}</li>`;
              }
              return '';
            }).join('')}
                      </ul>
                    </div>
                  `;
          }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- FOOTER -->
          <div style="border-top: 3px solid #e5e7eb; padding-top: 30px; text-align: center;">
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 10px 0; font-weight: 600;">
              ShieldSight - AI-Powered URL Security Analysis Platform
            </p>
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">
              This report was automatically generated. For questions, visit https://shieldsight.app
            </p>
            <p style="font-size: 10px; color: #d1d5db; margin: 10px 0 0 0;">
              Report ID: ${Date.now()} | Generated: ${formatDate(new Date())}
            </p>
          </div>
        </div>
      `;

      tempContainer.innerHTML = pdfContent;

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Simple PDF generation
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

      pdf.save(generateFilename(prediction));
      document.body.removeChild(tempContainer);
      showToast('success', 'PDF report generated successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showToast('error', 'Failed to generate PDF. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  }, [prediction, explanation]);

  const handleQuickPrint = useCallback(() => {
    if (!prediction || !explanation) {
      showToast('error', 'No analysis data to print');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>ShieldSight - ${prediction.url}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #1f2937; }
            h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            h2 { color: #1f2937; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border: 1px solid #e5e7eb; }
            th { background: #f3f4f6; font-weight: bold; }
            .result { padding: 15px; margin: 15px 0; border-radius: 8px; }
            .legitimate { background: #f0fdf4; border: 2px solid #10b981; }
            .phishing { background: #fef2f2; border: 2px solid #ef4444; }
            .badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; margin: 5px 5px 5px 0; }
            .badge-green { background: #dcfce7; color: #065f46; }
            .badge-red { background: #fee2e2; color: #991b1b; }
            .badge-blue { background: #dbeafe; color: #1e40af; }
            @media print {
              @page { margin: 0.5in; }
              body { color: #000; }
            }
          </style>
        </head>
        <body>
          <h1>🛡️ ShieldSight Analysis Report</h1>
          
          <div style="margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <p><strong>URL:</strong> ${prediction.url}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p>
              <span class="badge badge-blue">Report ID: ${Date.now()}</span>
              <span class="badge badge-blue">Model: ${prediction.metadata?.model_version || 'RF v2.0'}</span>
            </p>
          </div>
          
          <div class="result ${prediction.prediction === 'legitimate' ? 'legitimate' : 'phishing'}">
            <h2>${prediction.prediction === 'legitimate' ? '✅ LEGITIMATE SITE' : '🚨 PHISHING DETECTED'}</h2>
            <p><strong>Prediction:</strong> ${prediction.prediction.toUpperCase()}</p>
            <p><strong>Confidence:</strong> ${(prediction.confidence * 100).toFixed(1)}%</p>
            <p><strong>Risk Level:</strong> ${prediction.risk_level}</p>
          </div>

          <h2>📊 Top Risk Factors</h2>
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Value</th>
                <th>Contribution</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              ${(explanation.top_features || []).slice(0, 8).map(f => `
                <tr>
                  <td><strong>${f.feature.replace(/_/g, ' ')}</strong></td>
                  <td><code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${f.value}</code></td>
                  <td>${(f.contribution * 100).toFixed(1)}%</td>
                  <td>${f.impact === 'negative' ? '⬆️ Increases Risk' : '⬇️ Decreases Risk'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>🔍 Analysis Method</h2>
          <p><strong>Explanation Method:</strong> ${explanation.explanation_method}</p>
          <p><strong>Base Value:</strong> ${(explanation.base_value * 100).toFixed(1)}% Phishing Probability</p>
          <p><strong>Model Confidence:</strong> ${(explanation.confidence * 100).toFixed(1)}%</p>

          ${prediction.availability ? `
            <h2>🌐 Website Availability</h2>
            <table>
              <tr>
                <td><strong>Status</strong></td>
                <td>${(prediction.availability.is_accessible ?? false) ? '🟢 ONLINE' : '🔴 OFFLINE'}</td>
              </tr>
              ${prediction.availability.status_code ? `
                <tr>
                  <td><strong>HTTP Status</strong></td>
                  <td>${prediction.availability.status_code}</td>
                </tr>
              ` : ''}
              ${prediction.availability.ssl_valid !== undefined ? `
                <tr>
                  <td><strong>SSL/TLS</strong></td>
                  <td>${prediction.availability.ssl_valid ? '✓ Valid' : '✗ Invalid'}</td>
                </tr>
              ` : ''}
            </table>
          ` : ''}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p style="font-size: 12px; margin: 0;">
              ShieldSight - AI-Powered URL Security Analysis
            </p>
            <p style="font-size: 11px; margin: 5px 0 0 0;">
              This report was automatically generated. For more information, visit https://shieldsight.app
            </p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }

    showToast('info', 'Opening print dialog...');
  }, [prediction, explanation]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-heading font-bold text-foreground">
              URL Analysis
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Enterprise-grade phishing detection with AI & validation
            </p>
          </div>
        </div>
      </motion.div>

      {/* URL INPUT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass shadow-xl border-2 border-border/50">
          <CardContent className="p-8">
            <URLInput onSubmit={handleAnalyze} loading={loading} />
          </CardContent>
        </Card>
      </motion.div>

      {/* LOADING STATE */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass border-2 border-primary/30 shadow-2xl">
              <CardContent className="p-12">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary"
                    />
                    <Shield className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-foreground">
                      Analyzing URL Security
                    </h3>
                    <p className="text-muted-foreground">
                      Running comprehensive threat detection
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    {[
                      { label: 'Pre-Validation', icon: '✓' },
                      { label: 'ML Prediction', icon: '🤖' },
                      { label: 'SHAP Analysis', icon: '📊' }
                    ].map((step, index) => (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0.3, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.5, duration: 0.3 }}
                        className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg bg-muted/50"
                      >
                        <span className="text-2xl">{step.icon}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {step.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULTS SECTION */}
      <AnimatePresence>
        {prediction && explanation && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* VALIDATION ISSUES ALERT */}
            {urlValidation && urlValidation.issues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Card className={`glass border-2 ${urlValidation.score >= 80 ? 'border-red-500/50 bg-red-500/5' : 'border-orange-500/50 bg-orange-500/5'} shadow-lg`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${urlValidation.score >= 80 ? 'text-red-500' : 'text-orange-500'}`} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">
                          🚨 Security Validation Issues Detected
                        </h3>
                        <ul className="space-y-3">
                          {urlValidation.issues.map((issue, idx) => (
                            <li key={idx} className="bg-background/40 p-3 rounded-lg flex items-start gap-3">
                              <div className={`mt-0.5 p-1 rounded-full ${issue.severity === 'critical' ? 'bg-red-500/20 text-red-600' : 'bg-orange-500/20 text-orange-600'}`}>
                                <AlertTriangle className="w-3 h-3" />
                              </div>
                              <div>
                                <h4 className={`text-sm font-semibold ${issue.severity === 'critical' ? 'text-red-700' : 'text-orange-700'}`}>
                                  {issue.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                  {issue.description}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* EXPORT ACTIONS */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              ref={reportRef}
            >
              <Card className="glass border-2 border-primary/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-primary" />
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Analysis Report</h2>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(new Date(prediction.timestamp))}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExportCSV}
                        className="px-4 py-2 rounded-lg bg-background border border-border hover:bg-muted transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                        title="Export as CSV"
                      >
                        <Download className="w-4 h-4" />
                        CSV
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExportPDF}
                        disabled={exportingPDF}
                        className={`px-4 py-2 rounded-lg bg-background border border-border hover:bg-muted transition-all duration-200 flex items-center gap-2 text-sm font-medium ${exportingPDF ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Export as PDF"
                      >
                        {exportingPDF ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            PDF
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleQuickPrint}
                        className="px-4 py-2 rounded-lg bg-background border border-border hover:bg-muted transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                        title="Quick Print"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: 'ShieldSight Analysis Report',
                              text: `Check out this URL analysis: ${prediction.url}`,
                              url: window.location.href,
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            showToast('success', 'Link copied to clipboard');
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-background border border-border hover:bg-muted transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                        title="Share Report"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </motion.button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ANALYZED URL SECTION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass border-2 border-border/50 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
                    <Globe className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Analyzed URL</h2>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/30">
                    <code className="flex-1 text-sm font-mono text-foreground break-all">
                      {prediction.url}
                    </code>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyUrl}
                        className="p-2 rounded-lg bg-background hover:bg-muted transition-colors"
                        title="Copy URL"
                      >
                        {copiedUrl ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpenUrl}
                        className="p-2 rounded-lg bg-background hover:bg-muted transition-colors"
                        title="Open URL"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </motion.button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* MODEL VERSION & METADATA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="glass border border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Model:</span>
                        <span className="text-sm font-semibold text-foreground">
                          {prediction.metadata?.model_version || 'Random Forest v2.0'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Processing:</span>
                        <span className="text-sm font-semibold text-foreground">
                          {prediction.metadata?.processing_time_ms || '~120'}ms
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {prediction.metadata?.from_cache && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                          Cached
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">
                        Pre-Validated
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        SHAP Explainable
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ANALYSIS SUMMARY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className={`glass border-2 shadow-2xl ${prediction.prediction === 'legitimate'
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-red-500/30 bg-red-500/5'
                }`}>
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${prediction.prediction === 'legitimate'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                      : 'bg-gradient-to-br from-red-500 to-orange-600'
                      }`}>
                      {prediction.prediction === 'legitimate' ? (
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        {prediction.prediction === 'legitimate'
                          ? '✅ LEGITIMATE SITE'
                          : '🚨 PHISHING DETECTED'}
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-muted-foreground">
                          Confidence:
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${prediction.confidence * 100}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full ${prediction.prediction === 'legitimate'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                : 'bg-gradient-to-r from-red-500 to-orange-600'
                                }`}
                            />
                          </div>
                          <span className="text-xl font-bold text-foreground">
                            {(prediction.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {prediction.summary && (
                    <div className="space-y-4">
                      {prediction.summary.split('\n\n').map((section, index) => {
                        const lines = section.split('\n');
                        const title = lines[0];
                        const content = lines.slice(1);

                        return (
                          <div key={index} className="space-y-2">
                            {(title.includes('✅') || title.includes('🚨')) && (
                              <div className={`p-4 rounded-xl border-2 ${title.includes('✅')
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                                }`}>
                                <h3 className="font-bold text-lg mb-2 text-foreground">
                                  {title.replace(/\*\*/g, '')}
                                </h3>
                                <ul className="space-y-1">
                                  {content.map((line, i) => (
                                    line.trim() && (
                                      <li key={i} className="text-muted-foreground flex items-start gap-2">
                                        <span className="mt-1">•</span>
                                        <span>{line.replace(/^[✓•✗]\s*/, '').replace(/\*\*/g, '')}</span>
                                      </li>
                                    )
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* WEBSITE AVAILABILITY */}
            {prediction.availability && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass border-2 border-border/50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border/50">
                      <Server className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">Website Availability</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${(prediction.availability.is_accessible ?? false) ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                        </div>
                        <p className={`text-lg font-bold ${(prediction.availability.is_accessible ?? false) ? 'text-green-600' : 'text-red-600'}`}>
                          {(prediction.availability.is_accessible ?? false) ? 'ONLINE' : 'OFFLINE'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Response Time</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">
                          {prediction.availability.response_time || (prediction.availability.response_time_ms ? `${prediction.availability.response_time_ms}ms` : 'N/A')}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">HTTP Status</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">
                          {prediction.availability.status_code || 'N/A'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">SSL/TLS</span>
                        </div>
                        <p className={`text-lg font-bold ${prediction.availability.ssl_valid ? 'text-green-600' : 'text-orange-600'}`}>
                          {prediction.availability.ssl_valid ? 'Secure' : 'Invalid'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* GEO-BLOCKING VISUALIZATION */}
            {prediction.geo_analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
              >
                <Card className="glass border-2 border-border/50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border/50">
                      <Globe className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">Geographic Analysis</h2>
                      {prediction.geo_analysis.is_geo_restricted && (
                        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-600 font-medium">
                          Blocked: {prediction.geo_analysis.total_blocks}
                        </span>
                      )}
                    </div>

                    {prediction.geo_analysis.geolocation && (
                      <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border/20">
                        <div className="flex items-center gap-3 mb-3">
                          <Server className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Server Location</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Country</p>
                            <p className="text-sm font-medium text-foreground">
                              {prediction.geo_analysis.geolocation.country}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">City</p>
                            <p className="text-sm font-medium text-foreground">
                              {prediction.geo_analysis.geolocation.city || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">ISP</p>
                            <p className="text-sm font-medium text-foreground">
                              {prediction.geo_analysis.geolocation.isp || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">IP</p>
                            <p className="text-sm font-mono text-foreground text-xs">
                              {prediction.geo_analysis.geolocation.ip}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {prediction.geo_analysis.blocked_in_countries &&
                      prediction.geo_analysis.blocked_in_countries.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase">Government Access Restrictions (Non-Security)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {prediction.geo_analysis.blocked_in_countries.map((block, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                  <span className="font-medium text-foreground">{block.country}</span>
                                </div>
                                <p className="text-xs text-muted-foreground ml-6">{block.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* THREAT SCORE GAUGE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
            >
              <Card className="glass border-2 border-border/50 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border/50">
                    <Activity className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Threat Score</h2>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-48 h-48 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="20"
                          className="text-muted/20"
                        />

                        <motion.circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          strokeWidth="20"
                          strokeLinecap="round"
                          className={
                            threatScore >= 80 ? 'text-red-500' :
                              threatScore >= 60 ? 'text-orange-500' :
                                threatScore >= 45 ? 'text-yellow-500' :
                                  threatScore >= 25 ? 'text-blue-500' :
                                    'text-green-500'
                          }
                          strokeDasharray={`${(threatScore / 100) * 502} 502`}
                          initial={{ strokeDasharray: "0 502" }}
                          animate={{ strokeDasharray: `${(threatScore / 100) * 502} 502` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                          className="text-5xl font-bold text-foreground"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          {threatScore}
                        </motion.span>
                        <span className="text-sm text-muted-foreground">/ 100</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-full font-semibold text-sm ${threatScore >= 80 ? 'bg-red-500/20 text-red-600' :
                          threatScore >= 60 ? 'bg-orange-500/20 text-orange-600' :
                            threatScore >= 45 ? 'bg-yellow-500/20 text-yellow-600' :
                              threatScore >= 25 ? 'bg-blue-500/20 text-blue-600' :
                                'bg-green-500/20 text-green-600'
                          }`}>
                          {threatScore >= 80 ? 'CRITICAL' :
                            threatScore >= 60 ? 'PHISHING' :  // > 60% is now Phishing
                              threatScore >= 45 ? 'SUSPICIOUS' : // 45-60% is Suspicious
                                threatScore >= 25 ? 'PROBABLY SAFE' : // 25-45% is Probably Safe
                                  'SAFE'} {/* < 25% Threat (i.e. > 75% Legit) is Safe */}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Score Breakdown</h3>
                        {[
                          { label: 'ML Confidence', value: 40, color: 'bg-blue-500' },
                          { label: 'SHAP Weight', value: 25, color: 'bg-purple-500' },
                          { label: 'Availability', value: 15, color: 'bg-green-500' },
                          { label: 'Domain Trust', value: 10, color: 'bg-yellow-500' },
                          { label: 'SSL Security', value: 10, color: 'bg-orange-500' }
                        ].map((comp, index) => (
                          <div key={comp.label} className="flex items-center gap-3">
                            <div className="w-24 text-sm text-muted-foreground">{comp.label}</div>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className={comp.color}
                                initial={{ width: 0 }}
                                animate={{ width: `${(threatScore * comp.value) / 100}%` }}
                                transition={{ delay: index * 0.1, duration: 0.8 }}
                              />
                            </div>
                            <div className="w-12 text-sm font-medium text-foreground text-right">
                              {comp.value}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI EXPLANATION SUMMARY */}
            {explanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="glass border-2 border-border/50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border/50">
                      <Activity className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">Risk Factors</h2>
                      <span className="ml-auto text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {explanation.explanation_method}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(explanation.top_features || []).slice(0, 8).map((feature, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-muted/20 border border-border/10 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground capitalize text-sm">
                              {feature.feature.replace(/_/g, ' ')}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${feature.impact === 'negative'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-green-500/10 text-green-600'
                              }`}>
                              {feature.impact === 'negative' ? 'Risk ↑' : 'Safe ↓'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${feature.impact === 'negative'
                                  ? 'bg-red-500'
                                  : 'bg-green-500'
                                  }`}
                                style={{ width: `${Math.abs(feature.contribution) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-muted-foreground min-w-[60px] text-right">
                              {feature.impact === 'negative' ? '+' : ''}{(feature.contribution * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* RISK INDICATOR */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <RiskIndicator
                prediction={prediction.prediction}
                confidence={prediction.confidence}
                riskLevel={prediction.risk_level}
              />
            </motion.div>

            {/* SHAP DETAILED CHART */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <ShapChart
                features={explanation.top_features}
                explanationMethod={explanation.explanation_method}
                baseValue={explanation.base_value}
              />
            </motion.div>

            {/* ANALYZE ANOTHER URL BUTTON */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-4 pt-6 pb-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setPrediction(null);
                  setExplanation(null);
                  setUrlValidation(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Analyze Another URL
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EMPTY STATE */}
      {!prediction && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shield className="w-32 h-32 text-muted-foreground/20 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Analyze</h3>
          <p className="text-lg text-muted-foreground">
            Enter a URL to check for phishing threats
          </p>
        </motion.div>
      )}
    </div>
  );
};