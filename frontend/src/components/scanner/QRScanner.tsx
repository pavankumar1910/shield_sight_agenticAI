// src/pages/QRScanner.tsx
// Complete Enhanced QR Scanner Component with Professional Analysis Interface
// Copy this entire file to: src/pages/QRScanner.tsx

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Upload,
    Scan,
    AlertCircle,
    CheckCircle2,
    Download,
    Shield,
    ExternalLink,
    Copy,
    Globe,
    Info,
    Activity,
    FileText,
    Printer,
    X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { showToast } from '../ui/Toast';
import { analyzeQRCode } from '../../services/api';
import { RiskIndicator } from '../prediction/RiskIndicator';
import { ShapChart } from '../prediction/ShapChart';
import type { PredictionResponse, QRScanResponse } from '../../services/api';
import { useHistoryStore } from '../../stores/historyStore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const QRScanner = () => {
    const addBatchHistory = useHistoryStore((state) => state.addBatchEntries);
    const addHistoryEntry = useHistoryStore((state) => state.addEntry);
    const [scanning, setScanning] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);
    const [selectedResult, setSelectedResult] = useState<QRScanResponse | null>(null);
    const [results, setResults] = useState<QRScanResponse[]>([]);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reportRef = useRef<HTMLDivElement>(null);

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('error', 'Please upload an image file');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            setPreviewImage(base64);
            await analyzeQR(base64);
        };
        reader.readAsDataURL(file);

        // Reset input to allow re-upload of same file
        e.target.value = '';
    };

    // Start camera
    const startCamera = async () => {
        try {
            setScanning(true);
            setPreviewImage(null);
            setResults([]);
            setSelectedResult(null);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Use back camera on mobile
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (error) {
            showToast('error', 'Camera access denied. You can still upload a QR image.');
            setScanning(false);
        }
    };

    // Capture from camera
    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0);

        const base64 = canvas.toDataURL('image/png');
        setPreviewImage(base64);

        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setScanning(false);

        // Analyze
        analyzeQR(base64);
    };

    // Analyze QR code
    const analyzeQR = async (base64Image: string) => {
        setLoading(true);
        setSelectedResult(null);
        setResults([]);

        try {
            const response = await analyzeQRCode({ image: base64Image });
            setResults(response);

            if (response.length === 0) {
                showToast('warning', 'No URLs found in QR code');
            } else {
                showToast('success', `Found ${response.length} URL(s) in QR code`);
                // Select the first result by default
                if (response[0]) {
                    setSelectedResult(response[0]);
                }

                // Add to history
                if (response.length === 1) {
                    // Single URL - add as single entry
                    const r = response[0];
                    addHistoryEntry({
                        url: r.url,
                        prediction: r.prediction,
                        confidence: r.confidence,
                        risk_level: r.risk_level,
                        scanMode: 'single',
                        sourceType: 'qr',
                    });
                } else {
                    // Multiple URLs - add as batch
                    addBatchHistory(response.map((r) => ({
                        url: r.url,
                        prediction: r.prediction,
                        confidence: r.confidence,
                        risk_level: r.risk_level,
                        sourceType: 'qr' as const,
                    })), 'qr');
                }
            }
        } catch (error: any) {
            showToast('error', error.response?.data?.detail || 'QR analysis failed');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyUrl = () => {
        if (selectedResult?.url) {
            navigator.clipboard.writeText(selectedResult.url);
            setCopiedUrl(true);
            showToast('success', 'URL copied to clipboard');
            setTimeout(() => setCopiedUrl(false), 2000);
        }
    };

    const handleOpenUrl = () => {
        if (selectedResult?.url) {
            window.open(selectedResult.url, '_blank');
        }
    };

    const generateFilename = (result: PredictionResponse) => {
        const domain = result.url ? new URL(result.url).hostname.replace(/[^a-z0-9]/gi, '-') : 'qr-scan';
        const timestamp = new Date().toISOString().split('T')[0];
        return `ShieldSight-QR-Analysis-${domain}-${timestamp}.pdf`;
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

    const handleExportPDF = async () => {
        if (!selectedResult || !reportRef.current) {
            showToast('error', 'No analysis data to export');
            return;
        }

        setExportingPDF(true);
        showToast('info', 'Generating PDF report...');

        try {
            // Create a temporary container for PDF generation
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '-9999px';
            tempContainer.style.width = '800px';
            tempContainer.style.backgroundColor = '#ffffff';
            document.body.appendChild(tempContainer);

            // Create PDF content
            const pdfContent = `
        <div style="font-family: Arial, sans-serif; padding: 40px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #8b5cf6, #ec4899); display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 24px;">🔍</span>
              </div>
              <div>
                <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 0;">ShieldSight</h1>
                <p style="font-size: 16px; color: #6b7280; margin: 0;">QR Code Security Analysis Report</p>
              </div>
            </div>
            <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Generated: ${formatDate(new Date())}
              </p>
            </div>
          </div>

          <!-- QR Code Section -->
          <div style="margin-bottom: 40px; text-align: center;">
            ${previewImage ? `<img src="${previewImage}" alt="QR Code" style="max-width: 200px; margin: 0 auto 20px; border: 1px solid #e5e7eb; border-radius: 8px;" />` : ''}
            <p style="color: #6b7280; font-size: 14px;">Scanned QR Code</p>
          </div>

          <!-- Summary Section -->
          <div style="margin-bottom: 40px;">
            <div style="background: ${selectedResult.prediction === 'legitimate' ? '#f0fdf4' : '#fef2f2'}; border: 2px solid ${selectedResult.prediction === 'legitimate' ? '#10b981' : '#ef4444'}; border-radius: 12px; padding: 32px;">
              <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
                <div style="width: 80px; height: 80px; border-radius: 20px; background: linear-gradient(135deg, ${selectedResult.prediction === 'legitimate' ? '#10b981, #059669' : '#ef4444, #f97316'}); display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 36px;">${selectedResult.prediction === 'legitimate' ? '✅' : '🚨'}</span>
                </div>
                <div>
                  <h2 style="font-size: 28px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0;">
                    ${selectedResult.prediction === 'legitimate' ? 'LEGITIMATE SITE' : 'PHISHING DETECTED'}
                  </h2>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 18px; color: #6b7280;">Confidence:</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 160px; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${selectedResult.confidence * 100}%; height: 100%; background: linear-gradient(90deg, ${selectedResult.prediction === 'legitimate' ? '#10b981, #059669' : '#ef4444, #f97316'});"></div>
                      </div>
                      <span style="font-size: 20px; font-weight: bold; color: #1f2937;">
                        ${(selectedResult.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 24px;">
                <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">URL Extracted from QR</p>
                  <p style="font-size: 14px; color: #1f2937; font-weight: 500; margin: 0; word-break: break-all;">${selectedResult.url}</p>
                </div>
                <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">Risk Level</p>
                  <p style="font-size: 16px; color: ${selectedResult.prediction === 'legitimate' ? '#10b981' : '#ef4444'}; font-weight: bold; margin: 0;">${selectedResult.risk_level?.toUpperCase() || 'HIGH'}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- QR Metadata -->
          ${selectedResult.qr_metadata ? `
            <div style="margin-bottom: 40px;">
              <h3 style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">
                QR Code Information
              </h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                  <h4 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Quality Analysis</h4>
                  <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-size: 14px; color: #6b7280;">Quality Level</span>
                      <span style="font-size: 14px; color: ${selectedResult.qr_metadata.quality === 'high' ? '#10b981' :
                        (selectedResult.qr_metadata.quality || 'unknown') === 'medium' ? '#f59e0b' : '#ef4444'
                    }; font-weight: 500;">
                        ${(selectedResult.qr_metadata.quality || 'unknown').toUpperCase()}
                      </span>
                    </div>
                    ${selectedResult.qr_metadata.version ? `
                      <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 14px; color: #6b7280;">QR Version</span>
                        <span style="font-size: 14px; color: #1f2937; font-weight: 500;">${selectedResult.qr_metadata.version}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                  <h4 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Detection Info</h4>
                  <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-size: 14px; color: #6b7280;">Total URLs Found</span>
                      <span style="font-size: 14px; color: #1f2937; font-weight: 500;">${results.length}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-size: 14px; color: #6b7280;">Analysis Method</span>
                      <span style="font-size: 14px; color: #1f2937; font-weight: 500;">QR Code + URL Analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Footer -->
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">
              This report was generated by ShieldSight - QR Code Security Analysis
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              Report ID: ${Date.now()} | For more information visit: https://shieldsight.com
            </p>
          </div>
        </div>
      `;

            tempContainer.innerHTML = pdfContent;

            // Convert to canvas
            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Generate PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(generateFilename(selectedResult));

            // Clean up
            document.body.removeChild(tempContainer);

            showToast('success', 'PDF report generated successfully!');
        } catch (error) {
            console.error('PDF generation failed:', error);
            showToast('error', 'Failed to generate PDF. Please try again.');
        } finally {
            setExportingPDF(false);
        }
    };

    const downloadQRReport = () => {
        if (!results || results.length === 0) return;

        const report = results.map(r => ({
            'Extracted URL': r.url,
            'Prediction': r.prediction,
            'Confidence': `${(r.confidence * 100).toFixed(1)}%`,
            'Risk Level': r.risk_level || 'Unknown',
            'QR Quality': r.qr_metadata?.quality || 'N/A',
            'QR Version': r.qr_metadata?.version || 'N/A',
            'Timestamp': new Date().toLocaleString(),
        }));

        const csv = [
            Object.keys(report[0]).join(','),
            ...report.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-scan-report-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        showToast('success', 'CSV report downloaded');
    };

    const handleQuickPrint = () => {
        if (!selectedResult) {
            showToast('error', 'No analysis data to print');
            return;
        }

        // Create a print-friendly version
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <title>ShieldSight QR Analysis - ${selectedResult.url || 'QR Scan'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              @media print {
                @page { margin: 0.5in; }
                h1 { color: #333; }
                hr { border: 1px solid #ccc; }
              }
            </style>
          </head>
          <body>
            <h1>ShieldSight QR Code Analysis Report</h1>
            <hr>
            <h2>URL: ${selectedResult.url || 'N/A'}</h2>
            <h3>Result: ${selectedResult.prediction === 'legitimate' ? '✅ LEGITIMATE' : '🚨 PHISHING'}</h3>
            <p>Confidence: ${(selectedResult.confidence * 100).toFixed(1)}%</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <hr>
            <h3>QR Code Details:</h3>
            <p>Total URLs Found: ${results.length}</p>
            ${selectedResult.qr_metadata ? `
              <p>QR Quality: ${selectedResult.qr_metadata.quality?.toUpperCase() || 'UNKNOWN'}</p>
            ` : ''}
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }

        showToast('info', 'Opening print dialog...');
    };

    const calculateThreatScore = (result: PredictionResponse) => {
        let score = result.prediction === 'phishing'
            ? result.confidence * 100
            : (1 - result.confidence) * 100;

        return Math.min(Math.max(Math.round(score), 0), 100);
    };

    const threatScore = selectedResult ? calculateThreatScore(selectedResult) : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <Scan className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-heading font-bold text-foreground">
                            QR Code Scanner
                        </h1>
                        <p className="text-muted-foreground text-lg mt-1">
                            Scan or upload QR codes to analyze URLs for phishing threats
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Scanner Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="glass shadow-xl border-2 border-border/50">
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            {/* Action Buttons */}
                            {!scanning && !previewImage && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Button
                                        onClick={startCamera}
                                        className="h-32 flex-col gap-3 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                    >
                                        <Camera className="w-8 h-8" />
                                        <span className="text-lg font-semibold">Scan with Camera</span>
                                    </Button>

                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="outline"
                                        className="h-32 flex-col gap-3 border-2"
                                    >
                                        <Upload className="w-8 h-8" />
                                        <span className="text-lg font-semibold">Upload QR Image</span>
                                    </Button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </div>
                            )}

                            {/* Camera View */}
                            {scanning && (
                                <div className="space-y-4">
                                    <div className="relative rounded-xl overflow-hidden bg-black border-2 border-primary/30">
                                        <video
                                            ref={videoRef}
                                            className="w-full"
                                            playsInline
                                            autoPlay
                                        />
                                        {/* Scanner overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-64 h-64 border-4 border-blue-500 rounded-lg animate-pulse shadow-lg" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button onClick={captureImage} className="flex-1 py-3 text-lg">
                                            <Camera className="w-5 h-5 mr-2" />
                                            Capture & Analyze
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                const stream = videoRef.current?.srcObject as MediaStream;
                                                stream?.getTracks().forEach(track => track.stop());
                                                setScanning(false);
                                            }}
                                            variant="outline"
                                            className="py-3 text-lg"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* QR Code Preview */}
                            {previewImage && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-foreground">QR Code Preview</h2>
                                        <Button
                                            onClick={() => {
                                                setPreviewImage(null);
                                                setResults([]);
                                                setSelectedResult(null);
                                            }}
                                            variant="outline"
                                            size="lg"
                                            className="gap-2"
                                        >
                                            <X className="w-5 h-5" />
                                            Scan New QR
                                        </Button>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="flex-shrink-0">
                                            <img
                                                src={previewImage}
                                                alt="QR Code"
                                                className="w-64 h-64 rounded-xl border-2 border-border/50 shadow-lg"
                                            />
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                                                <div className="flex items-center gap-3">
                                                    <Scan className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                                    <div className="text-sm text-blue-700 dark:text-blue-300">
                                                        <p className="font-semibold mb-1">Supported Formats:</p>
                                                        <p>PNG, JPEG, JPG, WEBP - All QR code types</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {loading && (
                                                <div className="text-center py-8">
                                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                                                    <p className="mt-4 text-lg text-muted-foreground">Analyzing QR code contents...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Canvas for capture (hidden) */}
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Loading State */}
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
                                        <Scan className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </div>

                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold text-foreground">
                                            Decoding QR Code
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Extracting and analyzing URLs from QR code
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 mt-4">
                                        {[
                                            { label: 'Decoding QR', icon: '🔍' },
                                            { label: 'Extracting URLs', icon: '📱' },
                                            { label: 'Security Analysis', icon: '🛡️' }
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

            {/* Results Section */}
            <AnimatePresence>
                {results.length > 0 && selectedResult && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                        ref={reportRef}
                    >
                        {/* RESULTS HEADER WITH EXPORT ACTIONS */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                        >
                            <Card className="glass border-2 border-primary/20 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Left: Title */}
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-6 h-6 text-primary" />
                                            <div>
                                                <h2 className="text-xl font-bold text-foreground">
                                                    QR Analysis Report
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Generated on {formatDate(new Date())}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Export Actions */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={downloadQRReport}
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
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Multiple QR Detection Warning */}
                        {results.length > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="glass border-2 border-yellow-500/30 bg-yellow-500/5">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-bold text-foreground">
                                                    Multiple URLs Detected!
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    This QR code contains {results.length} URLs. This is unusual and may indicate a malicious QR code designed to redirect through multiple layers.
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {results.map((result, index) => (
                                                        <Button
                                                            key={index}
                                                            onClick={() => setSelectedResult(result)}
                                                            variant={selectedResult === result ? "default" : "outline"}
                                                            size="sm"
                                                            className="gap-2"
                                                        >
                                                            URL {index + 1}
                                                            {result.prediction === 'phishing' && (
                                                                <AlertCircle className="w-3 h-3" />
                                                            )}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* ANALYZED URL SECTION */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <Card className="glass border-2 border-border/50 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
                                        <Globe className="w-5 h-5 text-primary" />
                                        <h2 className="text-lg font-semibold text-foreground">Extracted URL</h2>
                                        <span className="ml-auto text-sm text-muted-foreground">
                                            From QR Code
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/30">
                                        <code className="flex-1 text-sm font-mono text-foreground break-all">
                                            {selectedResult.url}
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

                        {/* QR METADATA */}
                        {selectedResult.qr_metadata && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="glass border-2 border-border/50 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border/50">
                                            <Scan className="w-5 h-5 text-primary" />
                                            <h2 className="text-lg font-semibold text-foreground">
                                                QR Code Information
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-3 h-3 rounded-full ${selectedResult.qr_metadata.quality === 'high' ? 'bg-green-500' :
                                                        selectedResult.qr_metadata.quality === 'medium' ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                        }`} />
                                                    <span className="text-sm font-medium text-muted-foreground">Quality</span>
                                                </div>
                                                <p className={`text-lg font-bold ${selectedResult.qr_metadata.quality === 'high' ? 'text-green-600' :
                                                    selectedResult.qr_metadata.quality === 'medium' ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>
                                                    {selectedResult.qr_metadata.quality?.toUpperCase() || 'UNKNOWN'}
                                                </p>
                                            </div>

                                            {selectedResult.qr_metadata.version && (
                                                <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Info className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium text-muted-foreground">QR Version</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-foreground">
                                                        {selectedResult.qr_metadata.version}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Activity className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-muted-foreground">Total URLs</span>
                                                </div>
                                                <p className="text-lg font-bold text-foreground">
                                                    {results.length}
                                                </p>
                                            </div>

                                            <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-muted-foreground">Analysis Type</span>
                                                </div>
                                                <p className="text-lg font-bold text-foreground">
                                                    QR + URL Scan
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* ANALYSIS SUMMARY */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                        >
                            <Card className={`glass border-2 shadow-2xl ${selectedResult.prediction === 'legitimate'
                                ? 'border-green-500/30 bg-green-500/5'
                                : 'border-red-500/30 bg-red-500/5'
                                }`}>
                                <CardContent className="p-8">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${selectedResult.prediction === 'legitimate'
                                            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                            : 'bg-gradient-to-br from-red-500 to-orange-600'
                                            }`}>
                                            {selectedResult.prediction === 'legitimate' ? (
                                                <CheckCircle2 className="w-8 h-8 text-white" />
                                            ) : (
                                                <AlertCircle className="w-8 h-8 text-white" />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h2 className="text-3xl font-bold text-foreground mb-2">
                                                {selectedResult.prediction === 'legitimate'
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
                                                            animate={{ width: `${selectedResult.confidence * 100}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className={`h-full ${selectedResult.prediction === 'legitimate'
                                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                                                : 'bg-gradient-to-r from-red-500 to-orange-600'
                                                                }`}
                                                        />
                                                    </div>
                                                    <span className="text-xl font-bold text-foreground">
                                                        {(selectedResult.confidence * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedResult.summary && (
                                        <div className="space-y-4">
                                            {selectedResult.summary.split('\n\n').map((section, index) => {
                                                const lines = section.split('\n');
                                                const title = lines[0];
                                                const content = lines.slice(1);

                                                return (
                                                    <div key={index} className="space-y-2">
                                                        {title.includes('✅') || title.includes('🚨') ? (
                                                            <div className={`p-4 rounded-xl border-2 ${title.includes('✅')
                                                                ? 'bg-green-500/10 border-green-500/30'
                                                                : 'bg-red-500/10 border-red-500/30'
                                                                }`}>
                                                                <h3 className="font-bold text-lg mb-2 text-foreground">
                                                                    {title}
                                                                </h3>
                                                                <ul className="space-y-1">
                                                                    {content.map((line, i) => (
                                                                        line.trim() && (
                                                                            <li key={i} className="text-muted-foreground flex items-start gap-2">
                                                                                <span className="mt-1">•</span>
                                                                                <span>{line.replace(/^[✓•✗]\s*/, '')}</span>
                                                                            </li>
                                                                        )
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ) : title.includes('📋') || title.includes('🛡️') ? (
                                                            <div className="p-4 rounded-xl bg-blue-500/10 border-2 border-blue-500/30">
                                                                <h3 className="font-bold text-lg mb-2 text-foreground">
                                                                    {title}
                                                                </h3>
                                                                <ul className="space-y-1">
                                                                    {content.map((line, i) => (
                                                                        line.trim() && (
                                                                            <li key={i} className="text-muted-foreground flex items-start gap-2">
                                                                                <span className="mt-1">•</span>
                                                                                <span>{line.replace(/^[•]\s*/, '')}</span>
                                                                            </li>
                                                                        )
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* THREAT SCORE GAUGE */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="glass border-2 border-border/50 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border/50">
                                        <Activity className="w-5 h-5 text-primary" />
                                        <h2 className="text-lg font-semibold text-foreground">
                                            Composite Threat Score
                                        </h2>
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
                                                                threatScore >= 40 ? 'text-yellow-500' :
                                                                    threatScore >= 20 ? 'text-blue-500' :
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
                                                        threatScore >= 40 ? 'bg-yellow-500/20 text-yellow-600' :
                                                            threatScore >= 20 ? 'bg-blue-500/20 text-blue-600' :
                                                                'bg-green-500/20 text-green-600'
                                                    }`}>
                                                    {threatScore >= 80 ? 'CRITICAL THREAT' :
                                                        threatScore >= 60 ? 'HIGH THREAT' :
                                                            threatScore >= 40 ? 'MEDIUM THREAT' :
                                                                threatScore >= 20 ? 'LOW THREAT' :
                                                                    'MINIMAL THREAT'}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                                    Score Components
                                                </h3>

                                                {[
                                                    { label: 'ML Confidence', value: 40, color: 'bg-blue-500' },
                                                    { label: 'QR Anomaly', value: 25, color: 'bg-purple-500' },
                                                    { label: 'URL Analysis', value: 15, color: 'bg-green-500' },
                                                    { label: 'QR Quality', value: 10, color: 'bg-yellow-500' },
                                                    { label: 'Multiple URLs', value: 10, color: 'bg-orange-500' }
                                                ].map((component, index) => (
                                                    <div key={index} className="flex items-center gap-3">
                                                        <div className="w-24 text-sm text-muted-foreground">{component.label}</div>
                                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                            <motion.div
                                                                className={component.color}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(threatScore * component.value) / 100}%` }}
                                                                transition={{ delay: index * 0.1, duration: 0.8 }}
                                                            />
                                                        </div>
                                                        <div className="w-12 text-sm font-medium text-foreground text-right">
                                                            {component.value}%
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-center gap-4 text-xs flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="text-muted-foreground">0-19: Minimal</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="text-muted-foreground">20-39: Low</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <span className="text-muted-foreground">40-59: Medium</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                            <span className="text-muted-foreground">60-79: High</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span className="text-muted-foreground">80-100: Critical</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* RISK INDICATOR */}
                        {selectedResult.risk_level && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                            >
                                <RiskIndicator
                                    prediction={selectedResult.prediction}
                                    confidence={selectedResult.confidence}
                                    riskLevel={selectedResult.risk_level}
                                />
                            </motion.div>
                        )}

                        {/* SHAP CHART */}
                        {selectedResult.shap_features && selectedResult.shap_features.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <ShapChart
                                    features={selectedResult.shap_features.map((f: any) => ({
                                        feature: f.feature,
                                        value: f.value,
                                        contribution: f.contribution,
                                        impact: f.impact
                                    }))}
                                    explanationMethod="SHAP"
                                    baseValue={selectedResult.confidence}
                                />
                            </motion.div>
                        )}

                        {/* SCAN ANOTHER BUTTON */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex justify-center pt-6 pb-4"
                        >
                            <Button
                                onClick={() => {
                                    setPreviewImage(null);
                                    setResults([]);
                                    setSelectedResult(null);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                size="lg"
                                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                            >
                                <Scan className="w-5 h-5" />
                                Scan Another QR Code
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {!previewImage && !scanning && results.length === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Scan className="w-32 h-32 text-muted-foreground/20 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                        Ready to Scan
                    </h3>
                    <p className="text-lg text-muted-foreground">
                        Upload a QR code image or use your camera to scan and analyze URLs
                    </p>
                </motion.div>
            )}
        </div>
    );
};