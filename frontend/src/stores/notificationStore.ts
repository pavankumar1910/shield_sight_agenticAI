import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    time: string; // We can use a timestamp and format it relative to now
    read: boolean;
    timestamp: number;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;

    // Actions
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'time' | 'timestamp'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(persist((set) => ({
    notifications: [
        {
            id: '1',
            type: 'info',
            title: 'Welcome to ShieldSight',
            message: 'System initialization complete.',
            time: 'Just now',
            read: false,
            timestamp: Date.now(),
        }
    ],
    unreadCount: 1,

    addNotification: (data) => set((state) => {
        const newNotification: Notification = {
            id: uuidv4(),
            read: false,
            time: 'Just now',
            timestamp: Date.now(),
            ...data,
        };
        return {
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        };
    }),

    markAsRead: (id) => set((state) => {
        const newNotifications = state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        );
        return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter(n => !n.read).length,
        };
    }),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
    })),

    clearAll: () => set({ notifications: [], unreadCount: 0 }),
}), {
    name: 'notification-storage',
}));
