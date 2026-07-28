import { motion } from 'framer-motion';
import { Sliders, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useSettingsStore } from '../../stores/settingsStore';
import toast from 'react-hot-toast';

export const PreferenceSettings = () => {
  const { preferences, updatePreferences } = useSettingsStore();

  const handleChange = (key: keyof typeof preferences, value: any) => {
    updatePreferences({ [key]: value });
    toast.success('Preferences updated');
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-primary" />
          Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Default View
          </label>
          <select
            value={preferences.defaultView}
            onChange={(e) => handleChange('defaultView', e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
          >
            <option value="dashboard">Dashboard</option>
            <option value="analyze">URL Analysis</option>
            <option value="batch">Batch Analysis</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Page to show when you log in
          </p>
        </motion.div>

        {/* Results Per Page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground">
            Results Per Page
          </label>
          <select
            value={preferences.resultsPerPage}
            onChange={(e) => handleChange('resultsPerPage', Number(e.target.value))}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </motion.div>

        {/* Export Format */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Download className="w-4 h-4" />
            Default Export Format
          </label>
          <select
            value={preferences.exportFormat}
            onChange={(e) => handleChange('exportFormat', e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="txt">TXT</option>
          </select>
        </motion.div>

        {/* Auto Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between p-4 rounded-lg border border-border"
        >
          <div>
            <p className="font-medium text-foreground">Auto-Export Results</p>
            <p className="text-sm text-muted-foreground">
              Automatically download results after analysis
            </p>
          </div>
          <button
            onClick={() => handleChange('autoExport', !preferences.autoExport)}
            className={`relative w-12 h-6 rounded-full transition-colors ${preferences.autoExport ? 'bg-primary' : 'bg-muted'
              }`}
          >
            <motion.div
              animate={{ x: preferences.autoExport ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
            />
          </button>
        </motion.div>
      </CardContent>
    </Card>
  );
};