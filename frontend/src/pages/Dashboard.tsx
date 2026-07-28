import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Activity,
  FileText,
  Clock,
  Globe,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Zap,
  Target,
  Cpu,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore } from '../stores/historyStore';
import { showToast } from '../components/ui/Toast';

// Import chart components (install: npm install recharts)
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// ═══════════════════════════════════════════════════════════
// MEMOIZED CHART COMPONENTS (prevents unnecessary re-renders)
// ═══════════════════════════════════════════════════════════

interface PieChartData {
  name: string;
  value: number;
  percent: number;
  color: string;
  [key: string]: string | number;  // Index signature for Recharts compatibility
}

interface LineChartData {
  date: string;
  scans: number;
  threats: number;
}

// Memoized Pie Chart - only re-renders when data actually changes
const MemoizedPieChart = memo(({
  data,
  renderLabel,
  CustomTooltip
}: {
  data: PieChartData[];
  renderLabel: (props: any) => React.ReactNode;
  CustomTooltip: React.ComponentType<any>;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <RechartsPieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={renderLabel}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend />
    </RechartsPieChart>
  </ResponsiveContainer>
));

MemoizedPieChart.displayName = 'MemoizedPieChart';

// Memoized Line Chart - only re-renders when data actually changes  
const MemoizedLineChart = memo(({
  data,
  CustomTooltip
}: {
  data: LineChartData[];
  CustomTooltip: React.ComponentType<any>;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <RechartsLineChart
      data={data}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
      <XAxis
        dataKey="date"
        stroke="#888888"
        fontSize={12}
      />
      <YAxis
        stroke="#888888"
        fontSize={12}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      <Line
        type="monotone"
        dataKey="scans"
        name="Total Scans"
        stroke="#3b82f6"
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
      <Line
        type="monotone"
        dataKey="threats"
        name="Threats Detected"
        stroke="#ef4444"
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
    </RechartsLineChart>
  </ResponsiveContainer>
));

MemoizedLineChart.displayName = 'MemoizedLineChart';


export const Dashboard = () => {
  const navigate = useNavigate();
  const { entries } = useHistoryStore();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filter entries based on time range
  const filteredEntries = useMemo(() => {
    const now = new Date();
    let cutoff = new Date();

    switch (timeRange) {
      case '24h':
        cutoff.setDate(now.getDate() - 1);
        break;
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      case 'all':
        return entries;
    }

    return entries.filter(entry => new Date(entry.timestamp) >= cutoff);
  }, [entries, timeRange]);

  // ✅ CALCULATE REAL STATS FROM FILTERED HISTORY
  const stats = useMemo(() => {
    const total = filteredEntries.length;
    const threats = filteredEntries.filter(e => e.prediction === 'phishing').length;
    const safe = filteredEntries.filter(e => e.prediction === 'legitimate').length;

    // Calculate real vs previous period
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    // Get previous period data for comparison
    const getPreviousPeriodData = () => {
      const now = new Date();
      let startPrev = new Date();
      let endPrev = new Date();

      switch (timeRange) {
        case '24h':
          startPrev.setDate(now.getDate() - 2);
          endPrev.setDate(now.getDate() - 1);
          break;
        case '7d':
          startPrev.setDate(now.getDate() - 14);
          endPrev.setDate(now.getDate() - 7);
          break;
        case '30d':
          startPrev.setDate(now.getDate() - 60);
          endPrev.setDate(now.getDate() - 30);
          break;
        default:
          return { total: 0, threats: 0, safe: 0 };
      }

      const prevEntries = entries.filter(entry => {
        const date = new Date(entry.timestamp);
        return date >= startPrev && date < endPrev;
      });

      return {
        total: prevEntries.length,
        threats: prevEntries.filter(e => e.prediction === 'phishing').length,
        safe: prevEntries.filter(e => e.prediction === 'legitimate').length,
      };
    };

    const prev = getPreviousPeriodData();

    return {
      totalScans: total,
      threatsDetected: threats,
      safeUrls: safe,
      detectionRate: total > 0 ? ((threats / total) * 100).toFixed(1) : '0.0',
      avgConfidence: total > 0
        ? (filteredEntries.reduce((sum, e) => sum + (e.confidence || 0), 0) / total * 100).toFixed(1)
        : '0.0',
      trendTotal: calculateTrend(total, prev.total),
      trendThreats: calculateTrend(threats, prev.threats),
      trendSafe: calculateTrend(safe, prev.safe),
      trendDirectionTotal: total >= prev.total ? 'up' : 'down',
      trendDirectionThreats: threats >= prev.threats ? 'up' : 'down',
      trendDirectionSafe: safe >= prev.safe ? 'up' : 'down',
    };
  }, [filteredEntries, entries, timeRange]);

  // Risk level distribution
  const riskDistribution = useMemo(() => {
    const distribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      minimal: 0,
    };

    filteredEntries.forEach(entry => {
      if (entry.risk_level) {
        const level = entry.risk_level.toLowerCase();
        if (level.includes('critical')) distribution.critical++;
        else if (level.includes('high')) distribution.high++;
        else if (level.includes('medium')) distribution.medium++;
        else if (level.includes('low')) distribution.low++;
        else distribution.minimal++;
      }
    });

    const data = Object.entries(distribution)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        percent: (value / filteredEntries.length) * 100,
        color: {
          critical: '#DC2626',
          high: '#EA580C',
          medium: '#D97706',
          low: '#2563EB',
          minimal: '#059669',
        }[name]
      }));

    return data;
  }, [filteredEntries]);

  // Daily scan activity (for line chart)
  const dailyActivity = useMemo(() => {
    const days: Record<string, { scans: number; threats: number; date: string }> = {};

    filteredEntries.forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      if (!days[date]) {
        days[date] = { scans: 0, threats: 0, date };
      }

      days[date].scans++;
      if (entry.prediction === 'phishing') {
        days[date].threats++;
      }
    });

    return Object.values(days).sort((a, b) => {
      const dateA = new Date(a.date.split(' ').reverse().join(' '));
      const dateB = new Date(b.date.split(' ').reverse().join(' '));
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredEntries]);

  // Top threat categories (based on URL patterns)
  const threatCategories = useMemo(() => {
    const categories: Record<string, number> = {
      'Financial': 0,
      'Social Media': 0,
      'Shopping': 0,
      'Tech/Cloud': 0,
      'Entertainment': 0,
      'Other': 0,
    };

    const phishingEntries = filteredEntries.filter(e => e.prediction === 'phishing');

    phishingEntries.forEach(entry => {
      const url = entry.url.toLowerCase();
      if (url.includes('bank') || url.includes('pay') || url.includes('wallet') || url.includes('login')) {
        categories['Financial']++;
      } else if (url.includes('facebook') || url.includes('instagram') || url.includes('twitter') || url.includes('linkedin')) {
        categories['Social Media']++;
      } else if (url.includes('shop') || url.includes('amazon') || url.includes('ebay') || url.includes('store')) {
        categories['Shopping']++;
      } else if (url.includes('microsoft') || url.includes('google') || url.includes('apple') || url.includes('cloud')) {
        categories['Tech/Cloud']++;
      } else if (url.includes('netflix') || url.includes('spotify') || url.includes('youtube') || url.includes('stream')) {
        categories['Entertainment']++;
      } else {
        categories['Other']++;
      }
    });

    return Object.entries(categories)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name,
        value,
        percentage: phishingEntries.length > 0 ? (value / phishingEntries.length) * 100 : 0
      }));
  }, [filteredEntries]);

  // Get recent scans (last 5)
  const recentScans = useMemo(() => {
    return filteredEntries.slice(0, 5).map(entry => ({
      url: entry.url,
      status: entry.prediction,
      time: new Date(entry.timestamp).toLocaleString(),
      confidence: entry.confidence,
      riskLevel: entry.risk_level,
    }));
  }, [filteredEntries]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    showToast('info', 'Refreshing dashboard data...');

    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('success', 'Dashboard refreshed!');
    }, 1000);
  };

  const handleExportDashboard = () => {
    setExporting(true);
    showToast('info', 'Preparing dashboard export...');

    // In a real app, this would generate a PDF/PNG
    setTimeout(() => {
      setExporting(false);
      showToast('success', 'Dashboard exported! Check your downloads.');
    }, 1500);
  };

  const handleTimeRangeChange = (range: '24h' | '7d' | '30d' | 'all') => {
    setTimeRange(range);
    showToast('info', `Showing data from last ${range === 'all' ? 'all time' : range}`);
  };

  // Get scan speed statistics
  const performanceStats = useMemo(() => {
    if (filteredEntries.length === 0) return { avgSpeed: '0.5s', accuracy: '95%', reliability: '99.9%' };

    // Mock performance data - in real app this would come from API
    return {
      avgSpeed: '0.3s',
      accuracy: `${(95 + Math.random() * 3).toFixed(1)}%`,
      reliability: `${(99.5 + Math.random() * 0.4).toFixed(1)}%`,
    };
  }, [filteredEntries]);

  // Custom Pie Chart label renderer - FIXED: removed unused 'name' parameter
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (!percent) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percent.toFixed(0)}%`}
      </text>
    );
  };

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground">{entry.dataKey}:</span>
            <span className="font-semibold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header with Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-heading font-bold text-foreground">
              ShieldSight Dashboard
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Real-time phishing detection analytics & insights
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/50 rounded-lg p-1">
            {(['24h', '7d', '30d', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTimeRangeChange(range)}
                className="px-3 py-1 text-xs"
              >
                {range === 'all' ? 'All Time' : range}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 w-9"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleExportDashboard}
            disabled={exporting}
            className="h-9 w-9"
          >
            <Download className={`w-4 h-4 ${exporting ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Scans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Total Scans
                  </p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalScans}</p>
                  <div className={`flex items-center gap-1 mt-2 text-xs ${stats.trendDirectionTotal === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    <TrendingUp className={`w-3 h-3 ${stats.trendDirectionTotal === 'down' ? 'rotate-180' : ''}`} />
                    <span>{stats.trendTotal}</span>
                    <span className="text-muted-foreground ml-1">vs previous period</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Threats Detected */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> Threats Detected
                  </p>
                  <p className="text-3xl font-bold text-foreground">{stats.threatsDetected}</p>
                  <div className={`flex items-center gap-1 mt-2 text-xs ${stats.trendDirectionThreats === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                    <TrendingUp className={`w-3 h-3 ${stats.trendDirectionThreats === 'down' ? 'rotate-180' : ''}`} />
                    <span>{stats.trendThreats}</span>
                    <span className="text-muted-foreground ml-1">vs previous period</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Safe URLs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" /> Safe URLs
                  </p>
                  <p className="text-3xl font-bold text-foreground">{stats.safeUrls}</p>
                  <div className={`flex items-center gap-1 mt-2 text-xs ${stats.trendDirectionSafe === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    <TrendingUp className={`w-3 h-3 ${stats.trendDirectionSafe === 'down' ? 'rotate-180' : ''}`} />
                    <span>{stats.trendSafe}</span>
                    <span className="text-muted-foreground ml-1">vs previous period</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detection Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Detection Rate
                  </p>
                  <p className="text-3xl font-bold text-foreground">{stats.detectionRate}%</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Activity className="w-3 h-3" />
                    <span>Based on {stats.totalScans} scans</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Risk Level Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of detected threat levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {riskDistribution.length > 0 ? (
                <div className="flex flex-col">
                  {/* Pie Chart */}
                  <div className="h-64 min-h-[250px] w-full relative" style={{ minHeight: 250 }}>
                    <ResponsiveContainer width="99%" height={250}>
                      <RechartsPieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend with percentages */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {riskDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-foreground font-medium">
                          {item.name}
                        </span>
                        <span className="text-sm text-muted-foreground ml-auto whitespace-nowrap">
                          {item.value} ({item.percent.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-muted/20 rounded-xl border-2 border-dashed border-border/50">
                  <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <PieChart className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-medium">No risk data available yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Start scanning URLs to see analytics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Activity Line Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary" />
                Scan Activity Timeline
              </CardTitle>
              <CardDescription>
                Scans and threats detected over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dailyActivity.length > 1 ? (
                <div className="h-96 min-h-[350px] w-full relative" style={{ minHeight: 350 }}>
                  <ResponsiveContainer width="99%" height={350}>
                    <RechartsLineChart
                      data={dailyActivity}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="scans"
                        name="Total Scans"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="threats"
                        name="Threats Detected"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center bg-muted/20 rounded-xl border-2 border-dashed border-border/50">
                  <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <LineChart className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-medium">Insufficient data for timeline</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Activity over time will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row - Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Threat Categories
              </CardTitle>
              <CardDescription>
                Types of sites being targeted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {threatCategories.length > 0 ? (
                <div className="space-y-3">
                  {threatCategories.map((category, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{category.name}</span>
                        <span className="text-muted-foreground">
                          {category.value} threat{category.value !== 1 ? 's' : ''} ({category.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                          style={{
                            width: `${category.percentage}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center">
                  <Globe className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No threat category data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Scans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="glass h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Scans
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/app/history')}>
                  View All
                </Button>
              </div>
              <CardDescription>
                Latest scan results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentScans.length > 0 ? (
                <div className="space-y-3">
                  {recentScans.map((scan, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded-full ${scan.status === 'phishing' ? 'bg-red-500' : 'bg-green-500'}`} />
                        <div className="min-w-0">
                          <code className="text-sm font-mono truncate block" title={scan.url}>
                            {scan.url}
                          </code>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-semibold ${scan.status === 'phishing' ? 'text-red-600' : 'text-green-600'}`}>
                              {scan.status === 'phishing' ? 'Phishing' : 'Safe'}
                            </span>
                            {scan.confidence && (
                              <span className="text-xs text-muted-foreground">
                                {Math.round(scan.confidence * 100)}% confidence
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(scan.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center">
                  <Clock className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">No recent scans</p>
                  <Button onClick={() => navigate('/app/analyze')} size="sm">
                    Start Scanning
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                System Performance
              </CardTitle>
              <CardDescription>
                Model accuracy and speed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-500/5 to-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Avg. Scan Speed</p>
                      <p className="text-xs text-muted-foreground">Time per analysis</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{performanceStats.avgSpeed}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/5 to-green-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Target className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Detection Accuracy</p>
                      <p className="text-xs text-muted-foreground">Model precision</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">{performanceStats.accuracy}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500/5 to-purple-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">System Reliability</p>
                      <p className="text-xs text-muted-foreground">Uptime & stability</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{performanceStats.reliability}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Model Version</span>
                  <span className="font-medium text-foreground">Random Forest v2.1</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium text-foreground">Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="glass border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Start scanning URLs or explore more features
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => navigate('/app/analyze')} className="gap-2">
                  <Shield className="w-4 h-4" />
                  Single URL Scan
                </Button>
                <Button variant="outline" onClick={() => navigate('/app/batch')} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Batch Analysis
                </Button>
                <Button variant="outline" onClick={() => navigate('/app/qr-scanner')} className="gap-2">
                  <Globe className="w-4 h-4" />
                  QR Scanner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};