import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppEntry } from '@/src/features/app-entry/hooks/useAppEntry';
import { ScreenWrapper } from '@/src/shared/ui';

export function SplashScreen() {
  const { handleContinue, handleLoginPress, isAuthenticated, isInitializing } = useAppEntry();

  return (
    <SafeAreaView className="flex-1 bg-[#FAFCF7]">
      <View className="absolute left-0 right-0 top-0 h-64 bg-[#F2FAEE]" />
      <View className="absolute left-6 top-20 h-3 w-3 rounded-full bg-[#B4D9AF]" />
      <View className="absolute right-8 top-24 h-3 w-3 rounded-full bg-[#F0BED3]" />
      <View className="absolute left-8 bottom-16 h-2.5 w-2.5 rounded-full bg-[#B4D9AF]" />

      <ScreenWrapper>
        <View className="flex-1 justify-between pt-3">
          <View className="items-center gap-1 pt-1">
            <Text className="text-center text-[29px] font-extrabold leading-10 text-[#0F7A2E]">
              سعد
              {'\n'}المسلماني
            </Text>
            <Text className="text-center text-[15px] font-medium leading-7 text-[#737373]">
              عالم من المكسرات والحلويات الفاخرة
            </Text>
          </View>

          <View className="items-center pt-3">
            <View className="absolute left-1 top-10 z-10 h-16 w-16 -rotate-12 rounded-full bg-white shadow-[0_10px_20px_rgba(0,0,0,0.08)]">
              <Image
                source={require('@/assets/images/hero-products.png')}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                contentPosition="left center"
              />
            </View>

            <View className="relative mt-8 w-full items-center justify-center">
              <View className="absolute h-[290px] w-[290px] rounded-full bg-black/5" />
              <View className="absolute h-[220px] w-[220px] rounded-full bg-black/5" />
              <View className="w-[89%] rounded-[32px] bg-white p-4 shadow-[0_18px_34px_rgba(0,0,0,0.08)]">
                <View className="overflow-hidden rounded-[26px] bg-[#F6F2EA]">
                  <Image
                    source={require('@/assets/images/hero-products.png')}
                    style={{ width: '100%', height: 298 }}
                    contentFit="cover"
                  />
                </View>
              </View>

              <View className="absolute bottom-2 right-8 flex-row-reverse items-center gap-2 rounded-full bg-[#F27AA8] px-4 py-2 shadow-[0_8px_20px_rgba(242,122,168,0.34)]">
                <Text className="text-[13px] font-semibold text-white">طازج يوميًا</Text>
                <Text className="text-[13px] text-white">✦</Text>
              </View>
            </View>

            <View className="mt-7 w-full items-center rounded-[28px] bg-white px-6 py-5 shadow-[0_14px_26px_rgba(0,0,0,0.05)]">
              <Text className="text-center text-[26px] font-extrabold leading-9 text-[#202020]">
                {isAuthenticated ? 'مرحبًا بك' : 'مرحبًا بك'}
                {'\n'}في عالمنا
              </Text>
              <Text className="mt-2.5 text-center text-[14px] leading-7 text-[#707070]">
                {isInitializing
                  ? 'جارٍ التحقق من الجلسة...'
                  : 'استمتع بأجود أنواع المكسرات والحلويات المصنوعة بعناية والحلويات الشرقية التقليدية تصلك أينما كنت.'}
              </Text>
            </View>

            <View className="mt-6 w-full">
              <Pressable
                onPress={handleContinue}
                className="flex-row-reverse items-center justify-center rounded-full bg-[#1FA043] px-6 py-4 shadow-[0_10px_24px_rgba(31,160,67,0.32)] active:opacity-90">
                <Text className="text-center text-[17px] font-bold text-white">ابدأ التسوق</Text>
                <Text className="ml-3 text-[17px] font-bold text-white">←</Text>
              </Pressable>
            </View>

            <View className="mt-5 flex-row-reverse items-center justify-center gap-3">
              <View className="items-center">
                <Text className="text-[13px] text-[#7B7B7B]">لديك حساب بالفعل؟</Text>
              </View>

              <Pressable onPress={handleLoginPress} hitSlop={10}>
                <Text className="text-[13px] font-bold text-[#1F8A5B] underline underline-offset-4">
                  تسجيل الدخول
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScreenWrapper>
    </SafeAreaView>
  );
}
