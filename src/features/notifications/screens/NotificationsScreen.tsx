import { useNotifications } from '@/src/shared/contexts/NotificationContext';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader } from '@/src/shared/ui';
import { BottomNavbar } from '@/src/shared/ui/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNotificationPermissionStatus, registerForPushNotificationsAsync } from '../services/push-notifications.service';
import type { Notification, NotificationType } from '../types/notification.types';

// ─── Filter Tabs ──────────────────────────────────────────────────
type FilterTab = 'all' | NotificationType;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'offer', label: 'العروض' },
  { key: 'discount_code', label: 'أكواد الخصم' },
  { key: 'order_update', label: 'الطلبات' },
];

// ─── Notification card icon & accent mapping ──────────────────────
function getNotificationMeta(type: NotificationType) {
  switch (type) {
    case 'offer':
      return {
        icon: 'pricetag' as const,
        iconBg: '#FFF3E0',
        iconColor: '#FF9800',
        accentColor: '#FF9800',
        label: 'عرض جديد',
      };
    case 'discount_code':
      return {
        icon: 'gift' as const,
        iconBg: '#F3E5F5',
        iconColor: '#9C27B0',
        accentColor: '#9C27B0',
        label: 'كود خصم',
      };
    case 'order_update':
      return {
        icon: 'cube' as const,
        iconBg: '#E8F5E9',
        iconColor: '#84BD00',
        accentColor: '#84BD00',
        label: 'تحديث طلب',
      };
  }
}

// ─── Relative time helper ─────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `قبل ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `قبل ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `قبل ${days} يوم`;
  return new Date(dateStr).toLocaleDateString('ar-PS');
}

// ─── Animated Notification Card ──────────────────────────────────
function NotificationCard({
  notification,
  index,
  onPress,
}: {
  notification: Notification;
  index: number;
  onPress: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const meta = getNotificationMeta(notification.type);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Pressable
        onPress={onPress}
        className={`mx-5 mb-3 rounded-2xl overflow-hidden ${notification.isRead ? 'bg-white' : 'bg-[#F8FFF2]'
          }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
          borderWidth: notification.isRead ? 0 : 1.5,
          borderColor: notification.isRead ? 'transparent' : `${meta.accentColor}30`,
        }}
      >
        {/* Accent top stripe */}
        <View
          style={{
            height: 3,
            backgroundColor: notification.isRead ? '#E8E8E8' : meta.accentColor,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        />

        <View className="p-4 flex-row-reverse">
          {/* Icon */}
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: meta.iconBg }}
          >
            <Ionicons name={meta.icon} size={24} color={meta.iconColor} />
          </View>

          {/* Content */}
          <View className="flex-1 mr-3">
            {/* Type badge + Time */}
            <View className="flex-row-reverse items-center justify-between mb-1">
              <View
                className="px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${meta.accentColor}18` }}
              >
                <Text
                  className="font-tajawal-medium text-[11px]"
                  style={{ color: meta.accentColor }}
                >
                  {meta.label}
                </Text>
              </View>
              <Text className="font-tajawal-regular text-[11px] text-[#9E9E9E]">
                {timeAgo(notification.createdAt)}
              </Text>
            </View>

            {/* Title */}
            <Text
              className={`font-tajawal-bold text-[15px] text-right leading-[22px] ${notification.isRead ? 'text-[#757575]' : 'text-[#1B1C1C]'
                }`}
              numberOfLines={2}
            >
              {notification.title}
            </Text>

            {/* Body */}
            <Text
              className="font-tajawal-regular text-[13px] text-[#757575] text-right leading-[20px] mt-1"
              numberOfLines={3}
            >
              {notification.body}
            </Text>

            {/* Discount code chip */}
            {notification.discountCode ? (
              <View className="flex-row-reverse items-center mt-2 gap-2">
                <View className="bg-[#F3E5F5] px-4 py-1.5 rounded-full border border-dashed border-[#9C27B0]">
                  <Text className="font-tajawal-bold text-[14px] text-[#9C27B0] tracking-widest">
                    {notification.discountCode}
                  </Text>
                </View>
                {notification.discountValue ? (
                  <Text className="font-tajawal-medium text-[12px] text-[#9C27B0]">
                    خصم {notification.discountValue}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {/* Discount value for offers (no code) */}
            {notification.type === 'offer' && notification.discountValue && !notification.discountCode ? (
              <View className="flex-row-reverse items-center mt-2">
                <View className="bg-[#FFF3E0] px-3 py-1 rounded-full">
                  <Text className="font-tajawal-bold text-[13px] text-[#FF9800]">
                    خصم {notification.discountValue}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Order CTA link */}
            {notification.orderId ? (
              <View className="flex-row-reverse items-center mt-2">
                <Ionicons name="open-outline" size={14} color="#84BD00" />
                <Text className="font-tajawal-medium text-[12px] text-brand-primary mr-1">
                  تتبع الطلب
                </Text>
              </View>
            ) : null}
          </View>

          {/* Unread dot */}
          {!notification.isRead ? (
            <View className="w-2.5 h-2.5 rounded-full bg-[#84BD00] mt-1" />
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────
function EmptyState({ filter }: { filter: FilterTab }) {
  const messages: Record<FilterTab, { icon: keyof typeof Ionicons.glyphMap; text: string }> = {
    all: { icon: 'notifications-off-outline', text: 'لا توجد إشعارات حالياً' },
    offer: { icon: 'pricetag-outline', text: 'لا توجد عروض حالياً' },
    discount_code: { icon: 'gift-outline', text: 'لا توجد أكواد خصم حالياً' },
    order_update: { icon: 'cube-outline', text: 'لا توجد تحديثات على الطلبات' },
  };

  const { icon, text } = messages[filter];

  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 rounded-full bg-[#F0F0F0] items-center justify-center mb-4">
        <Ionicons name={icon} size={40} color="#BDBDBD" />
      </View>
      <Text className="font-tajawal-medium text-[16px] text-[#9E9E9E] text-center">{text}</Text>
      <Text className="font-tajawal-regular text-[13px] text-[#BDBDBD] text-center mt-1">
        سنُعلمك فور وصول إشعارات جديدة
      </Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────
export function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    refresh,
    markNotificationRead,
    markAllNotificationsRead,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('granted');
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const status = await getNotificationPermissionStatus();
    setPermissionStatus(status);
  };

  const requestPermission = async () => {
    if (!user?.id) return;
    try {
      const token = await registerForPushNotificationsAsync(user.id);
      // Once they interact, we consider it "done" for this session's UI
      setIsBannerDismissed(true);

      if (token) {
        setPermissionStatus('granted');
      }
    } catch (e) {
      console.error('Permission request failed:', e);
      setIsBannerDismissed(true);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    await checkPermission();
    setRefreshing(false);
  }, [refresh]);

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === activeFilter);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationRead(notification.id);
    }

    // Navigate to order tracking for order updates
    if (notification.orderId) {
      router.push({ pathname: '/order-tracking', params: { orderId: notification.orderId } });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-surface" edges={['top']}>
      {/* Header */}
      <AppHeader
        logo="none"
        left={
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center"
            onPress={handleGoBack}
          >
            <Ionicons name="chevron-forward" size={28} color="#1B1C1C" />
          </TouchableOpacity>
        }
        right={
          unreadCount > 0 ? (
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              onPress={markAllNotificationsRead}
            >
              <Ionicons name="checkmark-done" size={22} color="#84BD00" />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Permission Banner */}
      {Platform.OS !== 'web' && permissionStatus !== 'granted' && !isBannerDismissed && (
        <View className="mx-5 mb-4 bg-brand-primary/10 p-4 rounded-2xl flex-row-reverse items-center justify-between border border-brand-primary/20">
          <TouchableOpacity
            onPress={requestPermission}
            activeOpacity={0.8}
            className="flex-row-reverse items-center flex-1"
          >
            <View className="w-10 h-10 rounded-full bg-[#84BD00] items-center justify-center ml-3">
              <Ionicons name="notifications" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="font-tajawal-bold text-[14px] text-brand-title text-right">فعّل التنبيهات</Text>
              <Text className="font-tajawal-regular text-[12px] text-brand-muted text-right">لتبقى على اطلاع بآخر العروض وحالة طلباتك</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsBannerDismissed(true)}
            className="w-8 h-8 items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        </View>
      )}

      {/* Title Row */}
      <View className="px-6 flex-row-reverse items-center justify-between">
        <View className="flex-row-reverse items-center gap-2">
          <Text className="font-tajawal-bold text-[28px] text-[#1B1C1C]">الإشعارات</Text>
          {unreadCount > 0 ? (
            <View className="min-w-[24px] h-[24px] rounded-full bg-[#C53673] items-center justify-center px-1.5">
              <Text className="font-tajawal-bold text-[12px] text-white">{unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ direction: 'rtl' }}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8, marginTop: 16, marginBottom: 4 }}
        className="max-h-[52px]"
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count =
            tab.key === 'all'
              ? notifications.filter((n) => !n.isRead).length
              : notifications.filter((n) => n.type === tab.key && !n.isRead).length;

          return (
            <TouchableOpacity
              key={tab.key}
              className={`px-4 py-2 rounded-full flex-row-reverse items-center gap-1.5 ${isActive ? 'bg-brand-primary' : 'bg-[#ECEBE9]'
                }`}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text
                className={`font-tajawal-bold text-[14px] ${isActive ? 'text-white' : 'text-[#5D645F]'
                  }`}
              >
                {tab.label}
              </Text>
              {count > 0 ? (
                <View
                  className="min-w-[20px] h-[20px] rounded-full items-center justify-center px-1"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : '#C53673',
                  }}
                >
                  <Text
                    className="font-tajawal-bold text-[10px]"
                    style={{ color: isActive ? '#FFFFFF' : '#FFFFFF' }}
                  >
                    {count}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#84BD00" size="large" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 mt-3"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#84BD00" />
          }
        >
          {filtered.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            filtered.map((notification, index) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                index={index}
                onPress={() => handleNotificationPress(notification)}
              />
            ))
          )}
        </ScrollView>
      )}

      <BottomNavbar activeTab="home" />
    </SafeAreaView>
  );
}
