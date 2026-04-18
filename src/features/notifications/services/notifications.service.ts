import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/lib/supabase/client';
import { formatOrderNumber } from '@/src/shared/utils/order-utils';
import { getTargetPushTokens, sendPushNotification } from './push-notifications.service';
import type { Notification, NotificationType } from '../types/notification.types';

const STORAGE_KEY = '@al_maslamani_notifications';
const LAST_SYNC_KEY = '@al_maslamani_notifications_last_sync';

// ─── Helpers ──────────────────────────────────────────────────────

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  preparing: 'جاري التحضير',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'تم الإلغاء',
};

// ─── Build order-update notifications from DB ───────────────────────

async function fetchDbNotifications(userId: string): Promise<Notification[]> {
  const sb = supabase as any;

  // Fetch notifications where user_id is the current user OR null (global)
  const { data, error } = await sb
    .from('notifications')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) {
    console.error('Error fetching DB notifications:', error);
    return [];
  }

  return (data as any[]).map((item) => ({
    id: item.id,
    type: item.type as NotificationType,
    title: item.title,
    body: item.body,
    imageUrl: item.image_url,
    orderId: item.order_id,
    discountCode: item.discount_code,
    discountValue: item.discount_value,
    isRead: false, // Will be overridden by local read states
    createdAt: item.created_at,
  }));
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Fetch all notifications for the given user from the database.
 * Merges read-state persisted locally with the latest data.
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  // 1. Get locally persisted read-state
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const readMap: Record<string, boolean> = raw ? JSON.parse(raw) : {};

  // 2. Build notifications from database
  const all = await fetchDbNotifications(userId);
  
  // 3. Apply persisted read-state
  for (const n of all) {
    if (readMap[n.id] === true) {
      n.isRead = true;
    }
  }

  // 5. Sort newest first (redundant if DB already sorted, but safe)
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return all;
}

/** Admin: Send a new notification and create a coupon if it's a discount code. */
export async function sendNotification(payload: {
  type: NotificationType;
  title: string;
  body: string;
  userId?: string | null;
  discountCode?: string;
  discountValue?: string;
  orderId?: string;
}): Promise<void> {
  const sb = supabase as any;

  // 1. If it's a discount code, create the actual coupon record first
  if (payload.type === 'discount_code' && payload.discountCode) {
    // Parse value (e.g. "20%" or "50")
    const numericValue = parseFloat(payload.discountValue || '0');
    const isPercentage = (payload.discountValue || '').includes('%');

    if (numericValue > 0) {
      await sb.from('coupons').insert({
        code: payload.discountCode.toUpperCase(),
        discount_type: isPercentage ? 'percentage' : 'fixed',
        discount_value: numericValue,
        is_active: true,
      });
    }
  }

  // 2. Insert the notification
  const { error } = await sb.from('notifications').insert({
    type: payload.type,
    title: payload.title,
    body: payload.body,
    user_id: payload.userId || null,
    discount_code: payload.discountCode || null,
    discount_value: payload.discountValue || null,
    order_id: payload.orderId || null,
  });

  if (error) {
    throw error;
  }

  // 3. Send real-time Push Notification
  try {
    const tokens = await getTargetPushTokens(payload.userId);
    if (tokens.length > 0) {
      await sendPushNotification(tokens, payload.title, payload.body, { 
        orderId: payload.orderId,
        type: payload.type 
      });
    }
  } catch (pushError) {
    console.error('Failed to send push notification:', pushError);
    // We don't throw here to ensure DB operation is considered success
  }
}

/** Mark a single notification as read (persisted). */
export async function markAsRead(notificationId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const readMap: Record<string, boolean> = raw ? JSON.parse(raw) : {};
  readMap[notificationId] = true;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(readMap));
}

/** Mark all notifications as read (persisted). */
export async function markAllAsRead(notificationIds: string[]): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const readMap: Record<string, boolean> = raw ? JSON.parse(raw) : {};

  for (const id of notificationIds) {
    readMap[id] = true;
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(readMap));
}

/** Count unread notifications. */
export async function getUnreadCount(userId: string): Promise<number> {
  const notifications = await getNotifications(userId);
  return notifications.filter((n) => !n.isRead).length;
}
