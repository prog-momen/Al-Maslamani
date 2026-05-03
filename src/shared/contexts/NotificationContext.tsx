import storage from '@/src/lib/storage';
import {
    getNotifications,
    markAllAsRead,
    markAsRead
} from '@/src/features/notifications/services/notifications.service';
import {
    getNotificationPermissionStatus,
    registerForPushNotificationsAsync
} from '@/src/features/notifications/services/push-notifications.service';
import type { Notification } from '@/src/features/notifications/types/notification.types';
import { useRealtimeSignal } from '@/src/shared/contexts/RealtimeContext';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { NotificationPermissionModal } from '../ui/NotificationPermissionModal';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type NotificationContextValue = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  refresh: async () => {},
  markNotificationRead: async () => {},
  markAllNotificationsRead: async () => {},
});

const PERMISSION_DEFER_KEY = '@notification_permission_deferred_until';
const DEFER_DAYS = 5;

export function NotificationProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const notificationsSignal = useRealtimeSignal('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Handle data fetching when signal or user changes
  useEffect(() => {
    refresh();
  }, [refresh, notificationsSignal]);

  // Handle permission check separately and only once per session/user change
  useEffect(() => {
    if (user?.id) {
      checkPermissions(user.id);
    }
  }, [user?.id]);

  const checkPermissions = async (userId: string) => {
    const status = await getNotificationPermissionStatus();
    
    if (status === 'granted') {
      await registerForPushNotificationsAsync(userId);
      return;
    }

    // Check if we should show the custom modal (deferred logic)
    const deferredUntil = await storage.getItem(PERMISSION_DEFER_KEY);
    if (deferredUntil) {
      const deferredTime = parseInt(deferredUntil, 10);
      if (Date.now() < deferredTime) {
        // Still in the deferral period
        return;
      }
    }

    // If we reach here, show the modal
    setShowPermissionModal(true);
  };

  const markNotificationRead = useCallback(
    async (id: string) => {
      await markAsRead(id);

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    []
  );

  const markAllNotificationsRead = useCallback(async () => {
    const ids = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (ids.length === 0) return;

    await markAllAsRead(ids);

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      refresh,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [notifications, unreadCount, isLoading, refresh, markNotificationRead, markAllNotificationsRead]
  );

  const handleAllow = async () => {
    setShowPermissionModal(false);
    if (user?.id) {
      await registerForPushNotificationsAsync(user.id);
    }
  };

  const handleDecline = async () => {
    setShowPermissionModal(false);
    // Defer for 5 days
    const deferUntil = Date.now() + DEFER_DAYS * 24 * 60 * 60 * 1000;
    await storage.setItem(PERMISSION_DEFER_KEY, deferUntil.toString());
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationPermissionModal
        visible={showPermissionModal}
        onAllow={handleAllow}
        onDecline={handleDecline}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
