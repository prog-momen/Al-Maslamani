import { useNotifications } from '@/src/shared/contexts/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

type NotificationBellProps = {
  color?: string;
  size?: number;
};

export function NotificationBell({ color = '#67BB28', size = 26 }: NotificationBellProps) {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  // Subtle shake animation when unread count increases
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const prevCount = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevCount.current) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
    prevCount.current = unreadCount;
  }, [unreadCount, shakeAnim]);

  const rotate = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      hitSlop={10}
      className="w-10 h-10 items-center justify-center"
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons
          name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
          size={size}
          color={color}
        />
      </Animated.View>

      {unreadCount > 0 ? (
        <View className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#C53673] items-center justify-center px-1">
          <Text className="text-white text-[10px] font-tajawal-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
