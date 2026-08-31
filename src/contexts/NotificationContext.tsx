import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { NotificationItem } from '../types';
import { notificationService } from '../services/notificationService';
import { realtimeBus } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type?: 'status' | 'point' | 'info';
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  toasts: ToastAlert[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissToast: (id: string) => void;
  showToast: (title: string, message: string, type?: 'status' | 'point' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const fetchNotifs = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const list = await notificationService.getNotifications(user.id);
    setNotifications(list);
  };

  useEffect(() => {
    fetchNotifs();
  }, [user?.id]);

  // Subscribe to real-time notifications and system alerts
  useEffect(() => {
    if (!user) return;

    const unsubUserNotifs = realtimeBus.subscribe<NotificationItem[]>(
      `notifications_${user.id}`,
      (updatedList) => {
        setNotifications(updatedList);
      }
    );

    const unsubNewNotif = realtimeBus.subscribe<NotificationItem>(
      'new_notification',
      (notif) => {
        if (notif.user_id === user.id || notif.user_id === 'all') {
          showToast(notif.title, notif.message, notif.type === 'point_award' ? 'point' : 'status');
          fetchNotifs();
        }
      }
    );

    // Also notify if an issue status changed
    const unsubIssueUpdated = realtimeBus.subscribe('issue_updated', (issue: any) => {
      if (user.role === 'admin') {
        showToast('Status Updated', `Issue ${issue.report_id} status changed to ${issue.status}`, 'info');
      } else if (issue.citizen_id === user.id) {
        showToast('Real-time Status Update 🔄', `Your report ${issue.report_id} is now ${issue.status}!`, 'status');
      }
    });

    return () => {
      unsubUserNotifs();
      unsubNewNotif();
      unsubIssueUpdated();
    };
  }, [user]);

  const showToast = (title: string, message: string, type: 'status' | 'point' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        dismissToast,
        showToast,
      }}
    >
      {children}

      {/* Global Realtime Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 text-slate-100 p-4 rounded-xl shadow-2xl shadow-cyan-500/10 flex items-start justify-between gap-3 animate-in slide-in-from-right-4 duration-300"
          >
            <div className="space-y-1">
              <div className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                {toast.title}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
