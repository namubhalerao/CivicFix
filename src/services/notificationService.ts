import { NotificationItem } from '../types';
import { supabase, isSupabaseConfigured, realtimeBus } from '../lib/supabase';

const LOCAL_STORAGE_KEY_NOTIFS = 'civicfix_notifications';

function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFS);
    if (raw) {
      const parsed: NotificationItem[] = JSON.parse(raw);
      const cleaned = parsed.filter((n) => !n.issue_id?.startsWith('demo-issue-') && n.id !== 'notif-1' && n.id !== 'notif-2');
      if (cleaned.length !== parsed.length) {
        saveNotifications(cleaned);
      }
      return cleaned;
    }
  } catch {
    // fallback
  }
  return [];
}

function saveNotifications(notifs: NotificationItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
  } catch {
    // ignore
  }
}

export const notificationService = {
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    if (isSupabaseConfigured && !userId.startsWith('user-') && !userId.startsWith('guest-')) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .or(`user_id.eq.${userId},user_id.is.null`)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as NotificationItem[];
        }
      } catch (err) {
        console.warn('Supabase getNotifications error:', err);
      }
    }

    const list = getStoredNotifications();
    return list.filter((n) => n.user_id === userId || n.user_id === 'all');
  },

  async createNotification(params: {
    userId: string;
    issueId: string;
    reportId?: string;
    title: string;
    message: string;
    type?: 'status_update' | 'point_award' | 'general';
  }): Promise<NotificationItem> {
    const list = getStoredNotifications();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: params.userId,
      issue_id: params.issueId,
      report_id: params.reportId,
      title: params.title,
      message: params.message,
      type: params.type || 'status_update',
      read: false,
      created_at: new Date().toISOString(),
    };

    list.unshift(newNotif);
    saveNotifications(list);

    if (isSupabaseConfigured && !params.userId.startsWith('user-') && !params.userId.startsWith('guest-')) {
      try {
        await supabase.from('notifications').insert([{
          id: newNotif.id,
          user_id: params.userId,
          issue_id: params.issueId,
          report_id: params.reportId,
          title: params.title,
          message: params.message,
          type: newNotif.type,
          read: false,
        }]);
      } catch (err) {
        console.warn('Supabase createNotification error:', err);
      }
    }

    realtimeBus.emit(`notifications_${params.userId}`, list);
    realtimeBus.emit('new_notification', newNotif);

    return newNotif;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const list = getStoredNotifications();
    const target = list.find((n) => n.id === notificationId);
    if (target) {
      target.read = true;
      saveNotifications(list);
      realtimeBus.emit(`notifications_${target.user_id}`, list);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId);
      } catch (err) {
        console.warn('Supabase markAsRead error:', err);
      }
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    const list = getStoredNotifications();
    list.forEach((n) => {
      if (n.user_id === userId) n.read = true;
    });
    saveNotifications(list);
    realtimeBus.emit(`notifications_${userId}`, list);

    if (isSupabaseConfigured && !userId.startsWith('user-') && !userId.startsWith('guest-')) {
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase markAllAsRead error:', err);
      }
    }
  },
};

