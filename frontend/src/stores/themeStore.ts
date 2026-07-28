import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        return { theme: newTheme };
      }),
      
      setTheme: (theme) => set(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        return { theme };
      }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const theme = useThemeStore.getState().theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}