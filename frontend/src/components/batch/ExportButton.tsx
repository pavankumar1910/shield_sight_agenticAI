import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface BatchResult {
  url: string;
  prediction: 'phishing' | 'legitimate';
  confidence: number;
  risk_level: 'low' | 'medium' | 'high';
  phishing_probability: number;
  legitimate_probability: number;
}

interface ExportButtonProps {
  results: BatchResult[];
  disabled?: boolean;
}

export const ExportButton = ({ results, disabled = false }: ExportButtonProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    setExporting(true);
    
    try {
      // Create CSV content
      const headers = ['URL', 'Prediction', 'Confidence', 'Risk Level', 'Phishing Probability', 'Legitimate Probability'];
      const rows = results.map(r => [
        r.url,
        r.prediction,
        (r.confidence * 100).toFixed(2) + '%',
        r.risk_level,
        (r.phishing_probability * 100).toFixed(2) + '%',
        (r.legitimate_probability * 100).toFixed(2) + '%',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `batch_analysis_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
      setShowMenu(false);
    }
  };

  const exportToJSON = () => {
    setExporting(true);
    
    try {
      const jsonContent = JSON.stringify({
        exported_at: new Date().toISOString(),
        total_results: results.length,
        results: results,
      }, null, 2);

      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `batch_analysis_${Date.now()}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('JSON exported successfully!');
    } catch (error) {
      toast.error('Failed to export JSON');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
      setShowMenu(false);
    }
  };

  const exportToTXT = () => {
    setExporting(true);
    
    try {
      const txtContent = [
        'BATCH ANALYSIS RESULTS',
        '='.repeat(50),
        `Generated: ${new Date().toLocaleString()}`,
        `Total URLs: ${results.length}`,
        '='.repeat(50),
        '',
        ...results.map((r, i) => [
          `\n${i + 1}. ${r.url}`,
          `   Prediction: ${r.prediction.toUpperCase()}`,
          `   Confidence: ${(r.confidence * 100).toFixed(2)}%`,
          `   Risk Level: ${r.risk_level.toUpperCase()}`,
          `   Phishing Probability: ${(r.phishing_probability * 100).toFixed(2)}%`,
          `   Legitimate Probability: ${(r.legitimate_probability * 100).toFixed(2)}%`,
        ].join('\n')),
      ].join('\n');

      const blob = new Blob([txtContent], { type: 'text/plain' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `batch_analysis_${Date.now()}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('TXT exported successfully!');
    } catch (error) {
      toast.error('Failed to export TXT');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || results.length === 0 || exporting}
        className="gap-2"
        variant="outline"
      >
        <Download className="w-4 h-4" />
        Export Results
      </Button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50"
            >
              <div className="p-2 space-y-1">
                {/* CSV Export */}
                <button
                  onClick={exportToCSV}
                  disabled={exporting}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left group"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Export as CSV</p>
                    <p className="text-xs text-muted-foreground">Excel compatible</p>
                  </div>
                  {exporting && <CheckCircle className="w-4 h-4 text-primary animate-pulse" />}
                </button>

                {/* JSON Export */}
                <button
                  onClick={exportToJSON}
                  disabled={exporting}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left group"
                >
                  <FileText className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Export as JSON</p>
                    <p className="text-xs text-muted-foreground">Machine readable</p>
                  </div>
                  {exporting && <CheckCircle className="w-4 h-4 text-primary animate-pulse" />}
                </button>

                {/* TXT Export */}
                <button
                  onClick={exportToTXT}
                  disabled={exporting}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left group"
                >
                  <FileText className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Export as TXT</p>
                    <p className="text-xs text-muted-foreground">Plain text report</p>
                  </div>
                  {exporting && <CheckCircle className="w-4 h-4 text-primary animate-pulse" />}
                </button>
              </div>

              {/* Footer */}
              <div className="px-3 py-2 bg-muted/50 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {results.length} result{results.length !== 1 ? 's' : ''} ready to export
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};