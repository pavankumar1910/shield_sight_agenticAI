import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  phishingAlerts: boolean;
  weeklyReports: boolean;
}

interface PrivacySettings {
  saveHistory: boolean;
  shareTelemetry: boolean;
  publicProfile: boolean;
}

interface PreferenceSettings {
  defaultView: 'analyze' | 'batch' | 'dashboard';
  resultsPerPage: number;
  autoExport: boolean;
  exportFormat: 'csv' | 'json' | 'txt';
}

interface SettingsState {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  preferences: PreferenceSettings;
  
  // Actions
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updatePrivacy: (settings: Partial<PrivacySettings>) => void;
  updatePreferences: (settings: Partial<PreferenceSettings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    phishingAlerts: true,
    weeklyReports: true,
  },
  privacy: {
    saveHistory: true,
    shareTelemetry: false,
    publicProfile: false,
  },
  preferences: {
    defaultView: 'dashboard' as const,
    resultsPerPage: 20,
    autoExport: false,
    exportFormat: 'csv' as const,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      updatePrivacy: (settings) =>
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        })),

      updatePreferences: (settings) =>
        set((state) => ({
          preferences: { ...state.preferences, ...settings },
        })),

      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
    }
  )
);