import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { ExportButton } from './ExportButton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface BatchResult {
  url: string;
  prediction: 'phishing' | 'legitimate';
  confidence: number;
  risk_level: 'low' | 'medium' | 'high';
  phishing_probability: number;
  legitimate_probability: number;
}

interface ResultsTableProps {
  results: BatchResult[];
}

type FilterType = 'all' | 'phishing' | 'legitimate';
type RiskFilter = 'all' | 'high' | 'medium' | 'low';
type SortField = 'url' | 'confidence' | 'risk';
type SortOrder = 'asc' | 'desc';

export const ResultsTable = ({ results }: ResultsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [sortField, setSortField] = useState<SortField>('confidence');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Filter results
  const filteredResults = results.filter((result) => {
    const matchesSearch = result.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || result.prediction === filter;
    const matchesRisk = riskFilter === 'all' || result.risk_level === riskFilter;
    return matchesSearch && matchesFilter && matchesRisk;
  });

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    let comparison = 0;

    if (sortField === 'url') {
      comparison = a.url.localeCompare(b.url);
    } else if (sortField === 'confidence') {
      comparison = a.confidence - b.confidence;
    } else if (sortField === 'risk') {
      const riskOrder = { low: 0, medium: 1, high: 2 };
      comparison = riskOrder[a.risk_level] - riskOrder[b.risk_level];
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getResultIcon = (prediction: 'phishing' | 'legitimate') => {
    return prediction === 'phishing' ? (
      <AlertTriangle className="w-5 h-5 text-red-500" />
    ) : (
      <CheckCircle className="w-5 h-5 text-green-500" />
    );
  };

  const getRiskBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    const config = {
      low: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      high: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    };

    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-semibold border', config[riskLevel])}>
        {riskLevel.toUpperCase()}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="glass">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-6 h-6 text-primary" />
              Analysis Results
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="flex bg-muted p-1 rounded-lg border border-border">
                <Button
                  size="sm"
                  variant={sortField === 'confidence' ? 'default' : 'ghost'}
                  onClick={() => toggleSort('confidence')}
                  className="h-8 px-3 text-xs"
                >
                  By Confidence
                </Button>
                <Button
                  size="sm"
                  variant={sortField === 'risk' ? 'default' : 'ghost'}
                  onClick={() => toggleSort('risk')}
                  className="h-8 px-3 text-xs"
                >
                  By Risk
                </Button>
              </div>
              <div className="h-8 w-px bg-border mx-1" />
              <ExportButton results={sortedResults} />
            </div>
          </div>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by URL domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-muted/30 border-border/50 focus:bg-background transition-all"
              />
            </div>

            {/* Filter Mechanism */}
            <div className="p-4 rounded-xl bg-muted/20 border border-border/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Filter className="w-4 h-4 text-primary" />
                  Filters
                </div>
                {(filter !== 'all' || riskFilter !== 'all' || searchTerm) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilter('all');
                      setRiskFilter('all');
                      setSearchTerm('');
                    }}
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-6">
                {/* Classification Group */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">
                    Classification
                  </label>
                  <div className="flex gap-1.5 p-1 bg-background/50 rounded-lg border border-border/50">
                    <Button
                      size="sm"
                      variant={filter === 'all' ? 'default' : 'ghost'}
                      onClick={() => setFilter('all')}
                      className="h-8 px-3 text-xs"
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === 'phishing' ? 'default' : 'ghost'}
                      onClick={() => setFilter('phishing')}
                      className={cn(
                        "h-8 px-3 text-xs gap-1.5",
                        filter === 'phishing' ? "" : "text-red-500 hover:bg-red-500/10"
                      )}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Phishing
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === 'legitimate' ? 'default' : 'ghost'}
                      onClick={() => setFilter('legitimate')}
                      className={cn(
                        "h-8 px-3 text-xs gap-1.5",
                        filter === 'legitimate' ? "" : "text-green-500 hover:bg-green-500/10"
                      )}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Legitimate
                    </Button>
                  </div>
                </div>

                {/* Risk Group */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">
                    Risk Assessment
                  </label>
                  <div className="flex gap-1.5 p-1 bg-background/50 rounded-lg border border-border/50">
                    <Button
                      size="sm"
                      variant={riskFilter === 'all' ? 'default' : 'ghost'}
                      onClick={() => setRiskFilter('all')}
                      className="h-8 px-3 text-xs"
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={riskFilter === 'high' ? 'default' : 'ghost'}
                      onClick={() => setRiskFilter('high')}
                      className={cn(
                        "h-8 px-3 text-xs",
                        riskFilter === 'high' ? "" : "text-red-500 hover:bg-red-500/10"
                      )}
                    >
                      High
                    </Button>
                    <Button
                      size="sm"
                      variant={riskFilter === 'medium' ? 'default' : 'ghost'}
                      onClick={() => setRiskFilter('medium')}
                      className={cn(
                        "h-8 px-3 text-xs",
                        riskFilter === 'medium' ? "" : "text-yellow-500 hover:bg-yellow-500/10"
                      )}
                    >
                      Medium
                    </Button>
                    <Button
                      size="sm"
                      variant={riskFilter === 'low' ? 'default' : 'ghost'}
                      onClick={() => setRiskFilter('low')}
                      className={cn(
                        "h-8 px-3 text-xs",
                        riskFilter === 'low' ? "" : "text-green-500 hover:bg-green-500/10"
                      )}
                    >
                      Low
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count Summary */}
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-muted-foreground font-medium">
                Showing <span className="text-foreground font-bold">{sortedResults.length}</span> of <span className="text-foreground font-bold">{results.length}</span> analysis results
                {(filter !== 'all' || riskFilter !== 'all' || searchTerm) && " (filtered)"}
              </p>
              {sortedResults.length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                  <ArrowUpDown className="w-3 h-3" />
                  Sorted by {sortField}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    <button
                      onClick={() => toggleSort('url')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      URL
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    <button
                      onClick={() => toggleSort('confidence')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Confidence
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    <button
                      onClick={() => toggleSort('risk')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Risk Level
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                  {sortedResults.map((result, index) => (
                    <motion.tr
                      key={result.url}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3">
                        <code className="text-sm text-foreground font-mono truncate max-w-md block">
                          {result.url}
                        </code>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getResultIcon(result.prediction)}
                          <span className="text-sm capitalize font-medium">
                            {result.prediction}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                result.prediction === 'phishing'
                                  ? 'bg-red-500'
                                  : 'bg-green-500'
                              )}
                              style={{ width: `${result.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        {getRiskBadge(result.risk_level)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <motion.div
                            animate={{ rotate: expandedRow === index ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          </motion.div>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {sortedResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    {getResultIcon(result.prediction)}
                    <code className="flex-1 text-sm font-mono truncate">
                      {result.url}
                    </code>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confidence:</span>
                    <span className="font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Risk:</span>
                    {getRiskBadge(result.risk_level)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {sortedResults.length === 0 && (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || filter !== 'all'
                  ? 'No results match your filters'
                  : 'No results yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div >
  );
};
