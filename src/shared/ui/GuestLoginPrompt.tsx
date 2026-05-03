import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/src/shared/ui';

export const GuestLoginPrompt = ({ message = 'يرجى تسجيل الدخول للوصول إلى هذه الميزة' }: { message?: string }) => {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-brand-surface px-6">
      <View className="w-32 h-32 mb-6 rounded-full overflow-hidden items-center justify-center bg-white shadow-sm border border-gray-100">
        <Image
          source={require('@/assets/images/logo2.png')}
          style={{ width: 100, height: 100 }}
          contentFit="cover"
        />
      </View>
      <Text className="font-tajawal-bold text-[22px] text-brand-title mb-3 text-center">
        تتطلب تسجيل الدخول
      </Text>
      <Text className="font-tajawal-medium text-[16px] text-brand-text mb-8 text-center leading-6">
        {message}
      </Text>
      
      <Button
        onPress={() => router.replace('/(auth)/login')}
        label="تسجيل الدخول / إنشاء حساب"
        className="w-full h-[54px]"
      />
    </View>
  );
};
