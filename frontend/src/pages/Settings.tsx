import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Trash2, Download, RotateCcw } from 'lucide-react';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { PrivacySettings } from '../components/settings/PrivacySettings';
import { PreferenceSettings } from '../components/settings/PreferenceSettings';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSettingsStore } from '../stores/settingsStore';
import { useHistoryStore } from '../stores/historyStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/ui/Toast';  // ✅ CHANGED

export const Settings = () => {
  const navigate = useNavigate();
  const { resetToDefaults } = useSettingsStore();
  const { entries, clearHistory } = useHistoryStore();
  const { logout } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = () => {
    const data = {
      exported_at: new Date().toISOString(),
      history: entries,
      settings: useSettingsStore.getState(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shieldsight_data_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('success', 'Data exported successfully');  // ✅ CHANGED
  };

  const handleResetSettings = () => {
    if (confirm('Reset all settings to default values?')) {
      resetToDefaults();
      showToast('success', 'Settings reset to defaults');  // ✅ CHANGED
    }
  };

  const handleClearAllData = () => {
    if (confirm('Clear ALL your data including history and settings? This cannot be undone!')) {
      clearHistory();
      resetToDefaults();
      showToast('success', 'All data cleared');  // ✅ CHANGED
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to DELETE your account? This action is PERMANENT and cannot be undone!')) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      // Clear all data
      clearHistory();
      resetToDefaults();
      
      // Logout
      await logout();
      
      showToast('success', 'Account deleted. We\'re sorry to see you go!');  // ✅ CHANGED
      navigate('/');
    } catch (error) {
      showToast('error', 'Failed to delete account');  // ✅ CHANGED
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your preferences and account settings
            </p>
          </div>
        </div>
      </motion.div>

      {/* Settings Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <NotificationSettings />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <PrivacySettings />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PreferenceSettings />
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Data Management
            </h3>

            {/* Export Data */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Export Your Data</p>
                <p className="text-sm text-muted-foreground">
                  Download all your history and settings
                </p>
              </div>
              <Button onClick={handleExportData} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            {/* Reset Settings */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Reset Settings</p>
                <p className="text-sm text-muted-foreground">
                  Restore all settings to default values
                </p>
              </div>
              <Button onClick={handleResetSettings} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            {/* Clear All Data */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div>
                <p className="font-medium text-foreground">Clear All Data</p>
                <p className="text-sm text-muted-foreground">
                  Delete history and reset all settings
                </p>
              </div>
              <Button onClick={handleClearAllData} variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>

            {/* Delete Account */}
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive bg-destructive/5">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button onClick={handleDeleteAccount} variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg border-2 border-destructive bg-destructive/10"
              >
                <p className="font-semibold text-destructive mb-2">⚠️ Final Confirmation</p>
                <p className="text-sm text-foreground mb-4">
                  This will PERMANENTLY delete your account and all associated data. This action cannot be undone!
                </p>
                <div className="flex gap-2">
                  <Button onClick={confirmDeleteAccount} variant="destructive" className="flex-1">
                    Yes, Delete My Account
                  </Button>
                  <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};