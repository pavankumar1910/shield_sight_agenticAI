import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Layers,
  ExternalLink,
  Mail,
  QrCode,
  FileText,
  MousePointer,
  Filter,
  Search,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { HistoryEntry, ScanMode, SourceType } from '../../stores/historyStore';
import toast from 'react-hot-toast';

interface HistoryListProps {
  entries: HistoryEntry[];
  onRemove: (id: string) => void;
}

const ITEMS_PER_PAGE = 15;

// Source type icons and labels
const sourceTypeConfig: Record<SourceType, { icon: typeof Mail; label: string; color: string }> = {
  manual: { icon: MousePointer, label: 'Manual', color: 'text-blue-500 bg-blue-500/10' },
  email: { icon: Mail, label: 'Email', color: 'text-purple-500 bg-purple-500/10' },
  qr: { icon: QrCode, label: 'QR Code', color: 'text-pink-500 bg-pink-500/10' },
  document: { icon: FileText, label: 'Document', color: 'text-orange-500 bg-orange-500/10' },
};

export const HistoryList = ({ entries, onRemove }: HistoryListProps) => {
  const [sortBy, setSortBy] = useState<'date' | 'prediction'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);

  // Filter states
  const [filterPrediction, setFilterPrediction] = useState<'all' | 'phishing' | 'legitimate'>('all');
  const [filterScanMode, setFilterScanMode] = useState<'all' | ScanMode>('all');
  const [filterSourceType, setFilterSourceType] = useState<'all' | SourceType>('all');

  // Filter and sort entries using useMemo for performance
  const filteredAndSortedEntries = useMemo(() => {
    let result = entries.filter((entry) => {
      // Search filter
      if (searchQuery && !entry.url.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Prediction filter
      if (filterPrediction !== 'all' && entry.prediction !== filterPrediction) {
        return false;
      }

      // Scan mode filter (handle legacy 'type' field)
      const scanMode = entry.scanMode || entry.type || 'single';
      if (filterScanMode !== 'all' && scanMode !== filterScanMode) {
        return false;
      }

      // Source type filter (default to 'manual' for legacy entries)
      const sourceType = entry.sourceType || 'manual';
      if (filterSourceType !== 'all' && sourceType !== filterSourceType) {
        return false;
      }

      return true;
    });

    // Sort
    return result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return a.prediction.localeCompare(b.prediction);
      }
    });
  }, [entries, searchQuery, filterPrediction, filterScanMode, filterSourceType, sortBy]);

  const pagedEntries = filteredAndSortedEntries.slice(0, visibleItems);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleRemove = (id: string, url: string) => {
    if (confirm(`Remove "${url}" from history?`)) {
      onRemove(id);
      toast.success('Removed from history');
    }
  };

  const clearFilters = () => {
    setFilterPrediction('all');
    setFilterScanMode('all');
    setFilterSourceType('all');
    setSearchQuery('');
  };

  const hasActiveFilters = filterPrediction !== 'all' || filterScanMode !== 'all' || filterSourceType !== 'all' || searchQuery !== '';

  return (
    <Card className="glass relative overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-6 h-6 text-primary" />
              Scan History
            </CardTitle>

            <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50">
              <Button
                size="sm"
                variant={sortBy === 'date' ? 'default' : 'ghost'}
                onClick={() => setSortBy('date')}
                className="rounded-md"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Date
              </Button>
              <Button
                size="sm"
                variant={sortBy === 'prediction' ? 'default' : 'ghost'}
                onClick={() => setSortBy('prediction')}
                className="rounded-md"
              >
                <Shield className="w-4 h-4 mr-2" />
                Result
              </Button>
            </div>
          </div>

          {/* Search and Filters Section */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search history by URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 py-2 border-t border-border/20">
              <div className="flex flex-wrap gap-6">
                {/* Classification Filter */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Classification</span>
                  <div className="flex gap-2">
                    {['all', 'legitimate', 'phishing'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setFilterPrediction(p as any)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm transition-all border',
                          filterPrediction === p
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted text-muted-foreground border-border'
                        )}
                      >
                        {p === 'legitimate' ? 'Safe' : p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scan Mode Filter */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scan Mode</span>
                  <div className="flex gap-2">
                    {['all', 'single', 'batch'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setFilterScanMode(m as any)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm transition-all border flex items-center gap-2',
                          filterScanMode === m
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted text-muted-foreground border-border'
                        )}
                      >
                        {m === 'batch' && <Layers className="w-3.5 h-3.5" />}
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source Filter */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterSourceType('all')}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm transition-all border',
                        filterSourceType === 'all'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted text-muted-foreground border-border'
                      )}
                    >
                      All
                    </button>
                    {(Object.keys(sourceTypeConfig) as SourceType[]).map((source) => {
                      const config = sourceTypeConfig[source];
                      const SIcon = config.icon;
                      return (
                        <button
                          key={source}
                          onClick={() => setFilterSourceType(source)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-sm transition-all border flex items-center gap-2',
                            filterSourceType === source
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted text-muted-foreground border-border'
                          )}
                        >
                          <SIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-primary hover:text-primary/80 h-9 font-medium"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </div>

          {/* Filter Results Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pb-4">
            <Filter className="w-4 h-4" />
            <span>
              Showing {pagedEntries.length} of {filteredAndSortedEntries.length} entries
              {hasActiveFilters && ' (filtered)'} from {entries.length} total
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {pagedEntries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/50"
              >
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No results found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {hasActiveFilters
                    ? 'Try adjusting your search query or filters to find what you are looking for.'
                    : 'Start analyzing URLs to build your history.'}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline" className="mt-4">
                    Clear all filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pagedEntries.map((entry) => {
                  const isPhishing = entry.prediction === 'phishing';
                  const Icon = isPhishing ? AlertTriangle : CheckCircle;
                  const sourceType: SourceType = entry.sourceType || 'manual';
                  const scanMode: ScanMode = entry.scanMode || entry.type as ScanMode || 'single';
                  const sourceConfig = sourceTypeConfig[sourceType];
                  const SourceIcon = sourceConfig.icon;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className={cn(
                        'p-5 rounded-2xl border transition-all group relative',
                        isPhishing
                          ? 'bg-red-500/[0.03] border-red-500/20 hover:border-red-500/40'
                          : 'bg-green-500/[0.03] border-green-500/20 hover:border-green-500/40'
                      )}
                    >
                      <div className="flex items-start gap-5">
                        {/* Icon */}
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border',
                          isPhishing
                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                            : 'bg-green-500/10 border-green-500/20 text-green-500'
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <code className="text-sm font-semibold text-foreground truncate block bg-muted/30 px-2 py-0.5 rounded border border-border/50 max-w-fit">
                                {entry.url}
                              </code>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => window.open(entry.url, '_blank')}
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                title="Open in new tab"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemove(entry.id, entry.url)}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                title="Remove from history"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                'text-xs font-bold px-2 py-1 rounded uppercase tracking-wider',
                                isPhishing ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'
                              )}>
                                {entry.prediction}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs font-medium text-foreground">
                                {(entry.confidence * 100).toFixed(1)}% Confidence
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className={cn(
                                'text-xs font-medium capitalize',
                                entry.risk_level === 'high' ? 'text-red-500' : 'text-muted-foreground'
                              )}>
                                {entry.risk_level} Risk
                              </span>
                            </div>

                            <div className="flex items-center gap-3 md:justify-end">
                              <span className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight',
                                sourceConfig.color
                              )}>
                                <SourceIcon className="w-3 h-3" />
                                {sourceConfig.label}
                              </span>

                              <span className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight',
                                scanMode === 'batch'
                                  ? 'text-amber-600 bg-amber-500/10 border border-amber-500/20'
                                  : 'text-sky-600 bg-sky-500/10 border border-sky-500/20'
                              )}>
                                {scanMode === 'batch' && <Layers className="w-3 h-3" />}
                                {scanMode}
                              </span>

                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(entry.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          {/* Load More Button */}
          {filteredAndSortedEntries.length > visibleItems && (
            <div className="flex justify-center pt-8 pb-4">
              <Button
                variant="outline"
                onClick={() => setVisibleItems(prev => prev + ITEMS_PER_PAGE)}
                className="gap-2 px-8 rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group"
              >
                Load More Results
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};