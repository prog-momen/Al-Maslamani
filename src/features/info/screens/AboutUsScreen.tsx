import { AppHeader, BottomNavbar, CARD_BASE_CLASS } from '@/src/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

const Icons = {
  Bell: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  ),
  Menu: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Line x1="4" x2="20" y1="12" y2="12" />
      <Line x1="4" x2="20" y1="6" y2="6" />
      <Line x1="4" x2="20" y1="18" y2="18" />
    </Svg>
  ),
  ChevronRight: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="m9 18 6-6-6-6" />
    </Svg>
  ),
  Info: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
       <Circle cx="12" cy="12" r="10" />
       <Path d="M12 16v-4M12 8h.01" />
    </Svg>
  ),
  Diamond: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Path d="m12 2 10 10-10 10L2 12Z"/>
    </Svg>
  ),
  Check: (props: any) => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Polyline points="20 6 9 17 4 12" />
    </Svg>
  ),
};

export function AboutUsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F5F2EC]">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top']}>
          {/* Header */}
          <AppHeader
            logo="transparent"
            withSidebar
            sidebarActiveItem="about"
            sidebarSide="left"
            left={<Icons.Menu color="#67BB28" />}
            right={
              <Pressable onPress={() => router.push('/contact-us')} hitSlop={10} className="hit-slop-10 items-center justify-center w-10 h-10">
                <Ionicons name="help-circle-outline" size={28} color="#67BB28" />
              </Pressable>
            }
          />

          {/* Intro block */}
          <View className="px-6 mt-4 items-end">
            <Text className="font-tajawal-bold text-[14px] text-[#67BB28]">منذ 1953</Text>
            <Text className="font-tajawal-bold text-[32px] text-brand-title">عن الشركة</Text>
            <Text className="font-tajawal-medium text-[15px] text-brand-text text-right mt-3 leading-relaxed">
              انطلاقاً من أب على بيت لتقوم شركة &quot;سعد المسلماني&quot; كرمز للجودة والتميز في عالم المكسرات والتمور المحمصة.
            </Text>
          </View>

          {/* First Image */}
          <View className="px-6 mt-6">
            <Image
              source={require('@/assets/images/about1.png')}
              className="w-full h-48 rounded-[20px]"
              contentFit="cover"
            />
          </View>

          {/* Our Story */}
          <View className="px-6 mt-8">
            <Text className="font-tajawal-bold text-[22px] text-brand-title text-right mb-4">قصتنا</Text>
            <Text className="font-tajawal-medium text-[15px] text-brand-text text-right leading-relaxed mb-4">
              منذ انطلاقتنا سعت محامص سعد المسلماني إلى جعل المكسرات أكثر من مجرد تسلية لتصبح تجربة.
            </Text>
            <Text className="font-tajawal-medium text-[15px] text-brand-text text-right leading-relaxed">
              بدأنا من شغف الجودة والاصالة و تطورنا بخطوات واثقة حتى أصبح اسمنا تثقون به كل يوم.
            </Text>
          </View>

          {/* Quality Block */}
          <View className="px-6 mt-8">
             <View className={`${CARD_BASE_CLASS} bg-[#FAF9F5] p-6 items-center`}>
                 <Text className="font-tajawal-bold text-[20px] text-brand-title text-center mb-3">الجودة هي المعيار</Text>
                 <Text className="font-tajawal-medium text-[14px] text-[#71717A] text-center leading-relaxed mb-6">
                     نلتزم بتقديم أعلى معايير الجودة في كل تفصيلة لنضمن لك تجربة متكاملة و منتج يفوق توقعاتك.
                 </Text>
                 <View className="flex-row gap-3">
                     <Pressable className="flex-1 bg-[#67BB28] rounded-[16px] h-12 items-center justify-center">
                         <Text className="font-tajawal-bold text-[15px] text-white">تسوق الان</Text>
                     </Pressable>
                     <Pressable 
                        className="flex-1 bg-[#67BB28] rounded-[16px] h-12 items-center justify-center"
                        onPress={() => router.push('/contact-us')}
                    >
                         <Text className="font-tajawal-bold text-[15px] text-white">تواصل معنا</Text>
                     </Pressable>
                 </View>
             </View>
          </View>

          {/* Second Image with Text Overlay */}
          <View className="px-6 mt-8">
              <View className={`${CARD_BASE_CLASS} overflow-hidden`}>
                <Image
                    source={require('@/assets/images/about2.png')}
                    className="w-full h-64"
                    contentFit="cover"
                />
                <View className="absolute bottom-0 w-full p-4 bg-black/40">
                    <Text className="font-tajawal-bold text-[18px] text-white text-center">نختار الأفضل</Text>
                    <Text className="font-tajawal-medium text-[13px] text-white/90 text-center mt-1">نسعى جاهدين لتقديم الجودة والذوق</Text>
                </View>
              </View>
          </View>

          {/* Our Mission and Values */}
          <View className="mt-12">
            <View className="items-center mb-6">
                <Text className="font-tajawal-bold text-[22px] text-brand-title">رسالتنا وقيمنا</Text>
                <View className="w-16 h-1 bg-[#67BB28] mt-2 rounded"></View>
            </View>

            <View className="px-6 mb-4">
              <View className={`${CARD_BASE_CLASS} bg-[#FAF9F5] p-6 items-center pt-8 mt-6`}>
                    <View className="absolute -top-6 w-12 h-12 rounded-full bg-[#67BB28] items-center justify-center border-4 border-[#F5F2EC]">
                        <Icons.Info color="white" />
                    </View>
                    <Text className="font-tajawal-bold text-[20px] text-brand-title mb-3">رسالتنا</Text>
                    <Text className="font-tajawal-medium text-[14px] text-brand-text text-center leading-relaxed">
                        الاستمرارية في التميز والإبداع وتلبية تطلعات زبائننا لاختيار أفضل المنتجات.
                    </Text>
                    <Text className="font-tajawal-medium text-[14px] text-brand-text text-center leading-relaxed mt-2">
                        إيصال منتجاتنا عالية الجودة من المكسرات والحلويات إلى كافة أنحاء العالم باحترافية عالية تليق بنا وبتميز علامتنا وثقة عملائنا فينا.
                    </Text>
                </View>
            </View>

            <View className="px-6">
              <View className={`${CARD_BASE_CLASS} bg-[#FAF9F5] p-6 items-center pt-8 mt-6`}>
                    <View className="absolute -top-6 w-12 h-12 rounded-full bg-[#67BB28] items-center justify-center border-4 border-[#F5F2EC]">
                        <Icons.Diamond color="white" />
                    </View>
                    <Text className="font-tajawal-bold text-[20px] text-brand-title mb-4">قيمنا</Text>
                    <View className="w-full">
                        <View className="flex-row-reverse items-center gap-3 mb-3">
                            <Icons.Check color="#67BB28" />
                            <Text className="font-tajawal-medium text-[15px] text-brand-text text-right flex-1">الشفافية في الإنتاج والعمل</Text>
                        </View>
                        <View className="flex-row-reverse items-center gap-3 mb-3">
                            <Icons.Check color="#67BB28" />
                            <Text className="font-tajawal-medium text-[15px] text-brand-text text-right flex-1">البحث عن الجودة والابتكار</Text>
                        </View>
                        <View className="flex-row-reverse items-center gap-3">
                            <Icons.Check color="#67BB28" />
                            <Text className="font-tajawal-medium text-[15px] text-brand-text text-right flex-1">تعزيز الانتماء لعمالنا</Text>
                        </View>
                    </View>
                </View>
            </View>
          </View>

          {/* Thank You Section */}
          <View className="px-6 mt-12 items-center">
             <View className="w-24 h-24 rounded-full bg-white items-center justify-center shadow-sm overflow-hidden mb-4">
                 <Image
                     source={require('@/assets/images/mixed_nuts.png')}
                     className="w-20 h-20"
                     contentFit="contain"
                 />
             </View>
             <Text className="font-tajawal-bold text-[20px] text-brand-title mb-3">شكراً لكونكم جزءاً من عائلتنا</Text>
             <Text className="font-tajawal-medium text-[14px] text-brand-text text-center leading-relaxed px-4 mb-6">
                 دائماً نستمر بفضل دعمكم ، كل حبنا وامتنانا لكم لتكونوا أحد أفراد عائلة سعد المسلماني، ولكم جزيل الشكر.
             </Text>
             <Pressable 
                className="w-full bg-[#67BB28] rounded-[16px] h-[54px] items-center justify-center mb-6"
                onPress={() => router.push('/home')}
             >
                 <Text className="font-tajawal-bold text-[16px] text-white">اكتشف منتجاتنا</Text>
             </Pressable>
          </View>

        </SafeAreaView>
      </ScrollView>

      <BottomNavbar activeTab="profile" />
    </View>
  );
}
