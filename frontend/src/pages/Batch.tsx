import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileStack, AlertCircle, Sparkles } from 'lucide-react';
import { FileUpload } from '../components/batch/FileUpload';
import { BatchProgress } from '../components/batch/BatchProgress';
import { ResultsTable } from '../components/batch/ResultsTable';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { batchPredict } from '../services/api';
import { useHistoryStore } from '../stores/historyStore';
import { showToast } from '../components/ui/Toast';  // ✅ CHANGED

interface BatchResult {
  url: string;
  prediction: 'phishing' | 'legitimate';
  confidence: number;
  risk_level: 'low' | 'medium' | 'high';
  phishing_probability: number;
  legitimate_probability: number;
  timestamp: string;
}

export const Batch = () => {
  const [urls, setUrls] = useState<string[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const addBatchHistory = useHistoryStore((state) => state.addBatchEntries);
  const [progress, setProgress] = useState({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
  });

  const handleFileSelect = (selectedUrls: string[]) => {
    if (selectedUrls.length === 0) {
      showToast('error', 'No valid URLs found in file');  // ✅ CHANGED
      return;
    }

    if (selectedUrls.length > 100) {
      showToast('error', 'Maximum 100 URLs allowed. File contains ' + selectedUrls.length);  // ✅ CHANGED
      return;
    }

    setUrls(selectedUrls);
    setResults([]);
    setProgress({
      total: selectedUrls.length,
      processed: 0,
      successful: 0,
      failed: 0,
    });

    showToast('success', `Loaded ${selectedUrls.length} URLs`);  // ✅ CHANGED
  };

  const handleStartAnalysis = async () => {
    if (urls.length === 0) {
      showToast('error', 'Please upload a file first');  // ✅ CHANGED
      return;
    }

    setIsProcessing(true);
    setResults([]);

    try {
      showToast('info', 'Starting batch analysis...');  // ✅ CHANGED

      const response = await batchPredict(urls);

      const batchResults: BatchResult[] = response.results.map((r: any) => ({
        url: r.url,
        prediction: r.prediction,
        confidence: r.confidence,
        risk_level: r.risk_level,
        phishing_probability: r.phishing_probability,
        legitimate_probability: r.legitimate_probability,
        timestamp: r.timestamp,
      }));

      setResults(batchResults);
      setProgress({
        total: response.total,
        processed: response.successful + response.failed,
        successful: response.successful,
        failed: response.failed,
      });

      addBatchHistory(batchResults.map((r) => ({
        url: r.url,
        prediction: r.prediction,
        confidence: r.confidence,
        risk_level: r.risk_level,
        sourceType: 'manual' as const,
      })), 'manual');

      showToast('success', `Analysis complete! ${response.successful}/${response.total} successful`);  // ✅ CHANGED
    } catch (error: any) {
      console.error('Batch analysis failed:', error);
      showToast('error', error.response?.data?.detail || 'Batch analysis failed. Please try again.');  // ✅ CHANGED
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setUrls([]);
    setResults([]);
    setProgress({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <FileStack className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">
                Batch Analysis
              </h1>
              <p className="text-muted-foreground">
                Analyze multiple URLs at once with CSV upload
              </p>
            </div>
          </div>

          {results.length > 0 && (
            <div className="flex items-center gap-2">
              <Button onClick={handleReset} variant="outline">
                New Analysis
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Info Banner */}
      {!isProcessing && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">
                    Fast Batch Processing
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a CSV file with URLs (one per line) and analyze up to 100 URLs simultaneously.
                    Get results with confidence scores, risk levels, and detailed explanations.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Max 100 URLs per batch
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">
                      <AlertCircle className="w-3 h-3" />
                      CSV or TXT format
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* File Upload */}
      {!isProcessing && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FileUpload onFileSelect={handleFileSelect} disabled={isProcessing} />
        </motion.div>
      )}

      {/* URLs Loaded Card */}
      {urls.length > 0 && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-lg font-semibold text-foreground mb-1">
                    {urls.length} URLs Ready
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click the button to start batch analysis
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStartAnalysis}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  >
                    Start Analysis
                  </Button>
                </div>
              </div>

              {/* URL Preview */}
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Preview (first 5):</p>
                <div className="space-y-1">
                  {urls.slice(0, 5).map((url, index) => (
                    <code key={index} className="block text-xs text-foreground font-mono truncate">
                      {index + 1}. {url}
                    </code>
                  ))}
                  {urls.length > 5 && (
                    <p className="text-xs text-muted-foreground italic">
                      ... and {urls.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Progress */}
      {isProcessing && (
        <BatchProgress
          total={progress.total}
          processed={progress.processed}
          successful={progress.successful}
          failed={progress.failed}
          isProcessing={isProcessing}
        />
      )}

      {/* Results Table */}
      <AnimatePresence>
        {results.length > 0 && (
          <>
            <BatchProgress
              total={progress.total}
              processed={progress.processed}
              successful={progress.successful}
              failed={progress.failed}
              isProcessing={false}
            />
            <ResultsTable results={results} />
          </>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isProcessing && results.length === 0 && urls.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-16"
        >
          <FileStack className="w-24 h-24 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-2">
            No file uploaded yet
          </p>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file to start batch analysis
          </p>
        </motion.div>
      )}
    </div>
  );
};