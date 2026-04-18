import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/shared/hooks/useAuth';
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from '@/src/features/notifications/services/notifications.service';
import { 
  getNotificationPermissionStatus,
  registerForPushNotificationsAsync 
} from '@/src/features/notifications/services/push-notifications.service';
import type { Notification } from '@/src/features/notifications/types/notification.types';
import { NotificationPermissionModal } from '@/src/shared/ui';

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

export function NotificationProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
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

  // Initial load + periodic refresh (every 30s)
  useEffect(() => {
    refresh();

    if (user?.id) {
      // Check permission status
      getNotificationPermissionStatus().then((status) => {
        if (status === 'undetermined' || status === 'denied') {
          // If denied, we might not want to nag, but if undetermined (first time), definitely show.
          // For now, let's show if not granted.
          setShowPermissionModal(true);
        } else if (status === 'granted') {
          registerForPushNotificationsAsync(user.id);
        }
      });
    }

    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh, user?.id]);

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

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationPermissionModal
        visible={showPermissionModal}
        onAllow={async () => {
          setShowPermissionModal(false);
          if (user?.id) {
            await registerForPushNotificationsAsync(user.id);
          }
        }}
        onDecline={() => setShowPermissionModal(false)}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
