import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppEntry } from '@/src/features/app-entry/hooks/useAppEntry';
import { Button, ScreenWrapper } from '@/src/shared/ui';

export function SplashScreen() {
  const { handleContinue, handleLoginPress, isAuthenticated, isInitializing } = useAppEntry();

  return (
    <SafeAreaView className="flex-1 bg-[#F7F1E8]">
      <View className="absolute left-0 right-0 top-0 h-72 bg-[#DDEFD9]" />
      <View className="absolute -left-20 top-20 h-44 w-44 rounded-full bg-[#F9D9E3] opacity-90" />
      <View className="absolute -right-16 bottom-24 h-36 w-36 rounded-full bg-[#F3E2B6] opacity-80" />

      <ScreenWrapper>
        <View className="flex-1 justify-between">
          <View className="items-end gap-3 pt-4">
            <View className="self-end rounded-full bg-[#F9D9E3] px-4 py-2">
              <Text className="text-sm font-semibold text-[#B73E67]">تسوق ذكي</Text>
            </View>

            <Text className="text-right text-3xl font-bold leading-10 text-[#173A2E]">
              الماسلماني
            </Text>
            <Text className="text-right text-base leading-7 text-[#49635A]">
              أهلاً بك في تجربة تسوق عربية أنيقة وسريعة لطلب كل ما تحتاجه بسهولة.
            </Text>
          </View>

          <View className="items-center py-6">
            <View className="w-full rounded-[36px] bg-white/85 p-4 shadow-sm shadow-black/10">
              <View className="overflow-hidden rounded-[28px] bg-[#F6F2EA]">
                <Image
                  source={require('@/assets/images/hero-products.png')}
                  style={{ width: '100%', height: 320 }}
                  contentFit="cover"
                />
              </View>
            </View>

            <View className="mt-5 w-full rounded-[28px] bg-white px-5 py-5 shadow-sm shadow-black/5">
              <Text className="text-right text-2xl font-bold leading-8 text-[#173A2E]">
                {isAuthenticated ? 'نأخذك إلى حسابك' : 'ابدأ رحلتك الآن'}
              </Text>
              <Text className="mt-2 text-right text-sm leading-6 text-[#61756C]">
                {isInitializing
                  ? 'جارٍ التحقق من الجلسة...'
                  : 'اختر من المنتجات بسهولة وكمّل طلبك بخطوات بسيطة.'}
              </Text>

              <View className="mt-4">
                <Button label="ابدأ التسوق" onPress={handleContinue} />
              </View>

              <View className="mt-3 flex-row-reverse items-center justify-center gap-2">
                <Text className="text-sm text-[#6B7D76]">لديك حساب بالفعل؟</Text>
                <Pressable onPress={handleLoginPress} hitSlop={10}>
                  <Text className="text-sm font-semibold text-[#B73E67]">تسجيل الدخول</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScreenWrapper>
    </SafeAreaView>
  );
}
