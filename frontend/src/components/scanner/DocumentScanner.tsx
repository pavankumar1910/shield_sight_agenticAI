import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, AlertCircle, CheckCircle2, Download, FileWarning } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { showToast } from '../ui/Toast';
import { useHistoryStore } from '../../stores/historyStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface DocumentResult {
  file_name: string;
  file_type: string;
  urls_found: number;
  phishing_detected: number;
  safe_urls: number;
  results: any[];
  document_info: any;
}

export const DocumentScanner = () => {
  const [result, setResult] = useState<DocumentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addBatchHistory = useHistoryStore((state) => state.addBatchEntries);

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      showToast('error', 'Invalid file type. Please upload PDF, DOCX, or TXT files.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'File too large. Maximum size is 10MB.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/predict/document-scan`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);

      if (response.data.urls_found === 0) {
        showToast('warning', 'No URLs found in document');
      } else if (response.data.phishing_detected > 0) {
        showToast('error', `Found ${response.data.phishing_detected} phishing URL(s)!`);
      } else {
        showToast('success', `All ${response.data.urls_found} URLs are safe`);
      }

      // Add to history
      if (response.data.results && response.data.results.length > 0) {
        addBatchHistory(response.data.results
          .filter((r: any) => r.prediction && r.confidence)
          .map((r: any) => ({
            url: r.url,
            prediction: r.prediction as 'phishing' | 'legitimate',
            confidence: r.confidence,
            risk_level: (r.risk_level || 'medium') as 'low' | 'medium' | 'high',
            sourceType: 'document' as const,
          })), 'document');
      }
    } catch (error: any) {
      console.error('Document scan error:', error);
      showToast('error', error.response?.data?.detail || 'Document analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const downloadReport = () => {
    if (!result) return;

    const csv = [
      ['URL', 'Prediction', 'Confidence', 'Risk Level', 'Location', 'Context'].join(','),
      ...result.results.map(r => [
        `"${r.url}"`,
        r.prediction || 'error',
        r.confidence ? `${(r.confidence * 100).toFixed(1)}%` : 'N/A',
        r.risk_level || 'N/A',
        r.document_metadata?.page ? `Page ${r.document_metadata.page}` :
          r.document_metadata?.paragraph ? `Para ${r.document_metadata.paragraph}` :
            r.document_metadata?.line ? `Line ${r.document_metadata.line}` : 'N/A',
        `"${r.document_metadata?.context || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-scan-${result.file_name}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Document Scanner
            </h1>
            <p className="text-muted-foreground">
              Extract and analyze URLs from PDF, DOCX, and TXT files
            </p>
          </div>
        </div>
      </motion.div>

      {/* Upload Area */}
      {!result && (
        <Card className="p-8">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
              : 'border-border hover:border-blue-400'
              }`}
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              Upload Document
            </h3>
            <p className="text-muted-foreground mb-6">
              Drag and drop or click to upload
            </p>

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="mb-4"
            >
              {loading ? 'Analyzing...' : 'Choose File'}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileInput}
              className="hidden"
            />

            <p className="text-sm text-muted-foreground mt-4">
              Supported: PDF, DOCX, TXT • Max size: 10MB
            </p>
          </div>

          {loading && (
            <div className="mt-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                Extracting and analyzing URLs from document...
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Analysis Results</h3>
                <p className="text-sm text-muted-foreground">
                  {result.file_name} ({result.file_type.toUpperCase()})
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={downloadReport} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  onClick={() => {
                    setResult(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  variant="outline"
                  size="sm"
                >
                  Scan New
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.urls_found}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">URLs Found</p>
              </div>

              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {result.phishing_detected}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">Phishing</p>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.safe_urls}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">Safe</p>
              </div>
            </div>

            {/* Document Info */}
            {result.document_info && (
              <div className="text-sm text-muted-foreground">
                Document contains:{' '}
                {result.document_info.total_pages && `${result.document_info.total_pages} pages`}
                {result.document_info.total_paragraphs && `${result.document_info.total_paragraphs} paragraphs`}
                {result.document_info.total_lines && `${result.document_info.total_lines} lines`}
              </div>
            )}
          </Card>

          {/* Threat Warning */}
          {result.phishing_detected > 0 && (
            <Card className="p-4 bg-red-50 dark:bg-red-950 border-2 border-red-500">
              <div className="flex gap-3">
                <FileWarning className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-600 mb-1">
                    ⚠️ PHISHING DETECTED IN DOCUMENT
                  </h4>
                  <p className="text-sm text-red-600">
                    This document contains {result.phishing_detected} malicious URL(s).
                    Do not click any links or provide personal information.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* URL List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Extracted URLs</h3>
            {result.results.map((item, index) => (
              <Card key={index} className={`p-4 ${item.prediction === 'phishing' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'
                }`}>
                <div className="space-y-3">
                  {/* URL */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">URL:</p>
                    <p className="font-mono text-sm break-all">{item.url}</p>
                  </div>

                  {/* Prediction */}
                  <div className="flex items-center gap-2">
                    {item.prediction === 'phishing' ? (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-red-500">PHISHING</span>
                        <span className="text-sm text-muted-foreground">
                          ({(item.confidence * 100).toFixed(1)}% confidence)
                        </span>
                      </>
                    ) : item.prediction === 'legitimate' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-green-500">SAFE</span>
                        <span className="text-sm text-muted-foreground">
                          ({(item.confidence * 100).toFixed(1)}% confidence)
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-yellow-600">Analysis Error</span>
                    )}
                  </div>

                  {/* Location in Document */}
                  {item.document_metadata && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Location: </span>
                      {item.document_metadata.page && (
                        <span className="font-medium">Page {item.document_metadata.page}</span>
                      )}
                      {item.document_metadata.paragraph && (
                        <span className="font-medium">Paragraph {item.document_metadata.paragraph}</span>
                      )}
                      {item.document_metadata.line && (
                        <span className="font-medium">Line {item.document_metadata.line}</span>
                      )}
                    </div>
                  )}

                  {/* Context */}
                  {item.document_metadata?.context && (
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">Context:</p>
                      <p className="text-xs font-mono bg-muted p-2 rounded">
                        {item.document_metadata.context}
                      </p>
                    </div>
                  )}

                  {/* Risk Level */}
                  {item.risk_level && (
                    <div>
                      <span className="text-xs px-2 py-1 rounded bg-muted">
                        Risk: {item.risk_level.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-semibold mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Extracts all URLs from your document</li>
              <li>Analyzes each URL with ML + SHAP</li>
              <li>Shows location of each URL in document</li>
              <li>Provides detailed threat analysis</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};