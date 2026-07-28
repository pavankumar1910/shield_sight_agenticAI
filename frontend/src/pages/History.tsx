import { motion } from 'framer-motion';
import { History as HistoryIcon, Trash2, Download } from 'lucide-react';  // ✅ ADDED Download
import { useHistoryStore } from '../stores/historyStore';
import { HistoryStats } from '../components/history/HistoryStats';
import { HistoryList } from '../components/history/HistoryList';
import { Button } from '../components/ui/Button';
import { showToast } from '../components/ui/Toast';

export const History = () => {
  const { entries, removeEntry, clearHistory, getStats } = useHistoryStore();
  const stats = getStats();

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      clearHistory();
      showToast('success', 'History cleared');
    }
  };

  // ✅ NEW: Export to CSV function
  const exportToCSV = () => {
    if (entries.length === 0) {
      showToast('warning', 'No history to export');
      return;
    }

    try {
      // Create CSV content
      const csv = [
        // Header row
        ['URL', 'Prediction', 'Confidence', 'Risk Level', 'Source Type', 'Scan Mode', 'Timestamp'].join(','),
        // Data rows
        ...entries.map(entry => [
          `"${entry.url.replace(/"/g, '""')}"`,  // Escape quotes in URL
          entry.prediction,
          entry.confidence,
          entry.risk_level || 'N/A',
          entry.sourceType || 'manual',
          entry.scanMode || entry.type || 'single',
          `"${new Date(entry.timestamp).toLocaleString()}"`
        ].join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shieldsight-history-${Date.now()}.csv`;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      showToast('success', `Exported ${entries.length} entries successfully`);
    } catch (error) {
      console.error('Export error:', error);
      showToast('error', 'Failed to export history');
    }
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <HistoryIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">
                Scan History
              </h1>
              <p className="text-muted-foreground">
                View your past URL scans and analysis results
              </p>
            </div>
          </div>

          {/* ✅ NEW: Action Buttons */}
          {entries.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                onClick={handleClearHistory}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <HistoryStats
          total={stats.total}
          phishing={stats.phishing}
          legitimate={stats.legitimate}
          today={stats.today}
          thisWeek={stats.thisWeek}
        />
      </motion.div>

      {/* History List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <HistoryList entries={entries} onRemove={removeEntry} />
      </motion.div>
    </div>
  );
};