import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface SocialLoginButtonsProps {
  onGooglePress: () => void;
  isLoading?: boolean;
}

export function SocialLoginButtons({ onGooglePress, isLoading }: SocialLoginButtonsProps) {
  return (
    <View className="w-full mt-6 space-y-4">
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-[1px] bg-gray-200" />
        <Text className="font-tajawal-medium text-gray-400 mx-4">أو عبر</Text>
        <View className="flex-1 h-[1px] bg-gray-200" />
      </View>

      {/* Google Button */}
      <Pressable
        onPress={onGooglePress}
        disabled={isLoading}
        className="flex-row-reverse items-center justify-center bg-white border border-gray-200 h-[54px] rounded-[16px] px-4 shadow-sm"
      >
        {isLoading ? (
          <ActivityIndicator color="#84BD00" />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginLeft: 12 }} />
            <Text className="font-tajawal-bold text-[16px] text-brand-title">المتابعة عبر Google</Text>
          </>
        )}
      </Pressable>

      {/* Apple Button (Disabled) */}
      <View
        className="flex-row-reverse items-center justify-center bg-white border border-gray-100 h-[54px] rounded-[16px] px-4 opacity-40"
      >
        <Ionicons name="logo-apple" size={20} color="#000000" style={{ marginLeft: 12 }} />
        <Text className="font-tajawal-bold text-[16px] text-gray-400">المتابعة عبر Apple (قريباً)</Text>
      </View>
    </View>
  );
}
