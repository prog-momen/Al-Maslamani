import { useAppEntry } from '@/src/features/app-entry/hooks/useAppEntry';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SplashScreen() {
  const { handleContinue, handleLoginPress } = useAppEntry();

  return (
    <SafeAreaView className="flex-1 bg-brand-surface">
      <View className="flex-1 items-center justify-between px-6 py-10">

        {/* Header Strings */}
        <View className="items-center mt-4">
          <Text
            className="text-center font-tajawal-bold text-[32px] text-brand-primary"
            style={{
              textShadowColor: 'rgba(0, 0, 0, 0.75)',
              textShadowOffset: { width: 0.5, height: 0.5 },
              textShadowRadius: 1
            }}>
            سعد المسلماني
          </Text>
          <Text className="mt-2 text-center font-tajawal-bold text-[18px] text-brand-subtitle">
            عالم من المكسرات الفاخرة والحلويات المميزة
          </Text>
        </View>

        {/* Logo */}
        <View className="flex-1 w-full items-center justify-center py-8">
          <View className="items-center justify-center bg-[#84BD25]" style={{ width: 280, height: 280, borderRadius: 24 }}>
            <Image
              source={require('@/assets/images/logo.png')}
              contentFit="contain"
              style={{ width: 240, height: 240 }}
            />
          </View>
        </View>

        {/* Bottom Card */}
        <View className="w-full flex-col items-center">
          <View className="w-full rounded-[40px] bg-[#F7F5F0] px-6 py-8 items-center justify-center mb-6">
            <Text className="text-center font-tajawal-bold text-[22px] text-brand-title">
              مرحبا بك في عالمنا
            </Text>
            <Text className="mt-3 text-center font-tajawal-medium text-[16px] text-brand-text leading-7">
              نقدم لك أجود المكسرات والحلويات بأسلوب يليق بذوقك
            </Text>
          </View>

          {/* CTA */}
          <Pressable
            onPress={handleContinue}
            className="w-full h-[54px] rounded-[30px] bg-brand-primary flex-row-reverse items-center justify-center shadow-sm active:opacity-85"
          >
            <Text className="font-tajawal-bold text-[18px] text-white">ابدأ التسوق</Text>
            <View className="ml-2 mt-1">
              <Text className="font-tajawal-bold text-[20px] text-white">←</Text>
            </View>
          </Pressable>

          {/* Login Link */}
          <View className="mt-6 flex-row-reverse items-center justify-center gap-2">
            <Text className="font-tajawal-medium text-[15px] text-brand-text">
              لديك حساب بالفعل؟
            </Text>
            <Pressable onPress={handleLoginPress} hitSlop={10}>
              <Text className="font-tajawal-bold text-[15px] text-[#4F555A] border-b border-[#4F555A]">
                تسجيل الدخول
              </Text>
            </Pressable>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}