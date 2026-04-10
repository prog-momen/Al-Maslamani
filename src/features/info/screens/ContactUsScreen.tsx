import { AppHeader, FormField } from '@/src/shared/ui';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

const Icons = {
  Menu: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Line x1="4" x2="20" y1="12" y2="12" />
      <Line x1="4" x2="20" y1="6" y2="6" />
      <Line x1="4" x2="20" y1="18" y2="18" />
    </Svg>
  ),
  Search: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Circle cx="11" cy="11" r="8" />
      <Path d="m21 21-4.3-4.3" />
    </Svg>
  ),
  Bell: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  ),
  Send: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M22 2L11 13" />
      <Path d="M22 2L15 22L11 13L2 9L22 2z" />
    </Svg>
  ),
  MapPin: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <Circle cx="12" cy="10" r="3" />
    </Svg>
  ),
  Phone: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
  ),
  Mail: (props: any) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Rect width="20" height="16" x="2" y="4" rx="2" />
        <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </Svg>
  ),
  ChevronRight: (props: any) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="m9 18 6-6-6-6" />
    </Svg>
  ),
};

export function ContactUsScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  return (
    <View className="flex-1 bg-[#F5F2EC]">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top']}>
          {/* Header */}
          <AppHeader
            logo="transparent"
            left={
              <Pressable onPress={() => router.back()} className="hit-slop-10 items-center justify-center w-10 h-10">
                <Icons.ChevronRight color="#67BB28" />
              </Pressable>
            }
            right={
              <Pressable className="hit-slop-10">
                <Icons.Menu color="#67BB28" />
              </Pressable>
            }
          />

          {/* Intro block */}
          <View className="px-6 mt-4 items-end">
            <Text className="font-tajawal-bold text-[32px] text-brand-title">اتصل بنا</Text>
            <Text className="font-tajawal-medium text-[15px] text-brand-text text-right mt-3 leading-relaxed">
              نحن هنا لمساعدتك. يسعدنا استقبال استفساراتك واقتراحاتك في أي وقت.
            </Text>
          </View>

          {/* Form */}
          <View className="px-6 mt-8">
            <View className="bg-[#FAF9F5] rounded-[24px] p-6 border border-[#EBEBEB]">
              <FormField
                label="الاسم الكامل"
                placeholder="ادخل اسمك هنا"
                value={name}
                onChangeText={setName}
                className="bg-[#EBEBEB]"
              />

              <FormField
                label="البريد الإلكتروني"
                placeholder="ادخل بريدك الإلكتروني"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-[#EBEBEB]"
              />

              <View className="mb-6">
                <Text className="font-tajawal-bold text-[15px] mb-2 text-right text-brand-title">الرسالة</Text>
                <View className="w-full h-32 rounded-2xl border border-transparent px-4 py-3 bg-[#EBEBEB]">
                  <TextInput
                    className="flex-1 font-tajawal-medium text-[15px] text-right text-[#18181B]"
                    placeholderTextColor="#9ca3af"
                    placeholder="كيف يمكننا مساعدتك اليوم؟"
                    multiline
                    textAlignVertical="top"
                    value={message}
                    onChangeText={setMessage}
                  />
                </View>
              </View>

              <Pressable className="w-full bg-[#67BB28] rounded-[16px] h-[54px] flex-row items-center justify-center gap-2">
                <Icons.Send color="white" />
                <Text className="font-tajawal-bold text-[16px] text-white">إرسال</Text>
              </Pressable>
            </View>
          </View>

          {/* Location Block */}
          <View className="px-6 mt-6">
            <View className="bg-[#A1A1AA] rounded-[24px] h-40 items-center justify-center overflow-hidden relative">
              <View className="absolute inset-0 opacity-20">
                <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Simplistic map line pattern simulation */}
                  <Path d="M0,20 Q25,10 50,30 T100,20 M0,50 Q25,40 50,60 T100,50 M0,80 Q25,70 50,90 T100,80 M20,0 L30,100 M80,0 L70,100 M50,0 C40,30 60,70 50,100" fill="none" stroke="white" strokeWidth="1" />
                </Svg>
              </View>
              <View className="items-center">
                <View className="w-12 h-12 bg-[#67BB28] rounded-full items-center justify-center border-4 border-white/30 mb-2">
                  <Icons.MapPin color="white" />
                </View>
                <Text className="font-tajawal-bold text-[18px] text-[#18181B]">موقعنا في نابلس</Text>
              </View>
            </View>
          </View>

          {/* Contact Info Cards */}
          <View className="px-6 mt-6 gap-4">
            <View className="bg-[#EAF3E2] rounded-[24px] p-4 flex-row-reverse items-center justify-between">
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center border border-[#EBEBEB]">
                <Icons.Phone color="#18181B" />
              </View>
              <View className="items-end flex-1 mr-4">
                <Text className="font-tajawal-medium text-[13px] text-brand-text mb-1">اتصل بنا مباشرة</Text>
                <Text className="font-tajawal-bold text-[16px] text-[#276B2C]">+974 4455 6677</Text>
              </View>
            </View>

            <View className="bg-[#FAF9F5] border border-[#EBEBEB] rounded-[24px] p-4 flex-row-reverse items-center justify-between">
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center border border-[#EBEBEB]">
                <Icons.Mail color="#18181B" />
              </View>
              <View className="items-end flex-1 mr-4">
                <Text className="font-tajawal-medium text-[13px] text-brand-text mb-1">راسلنا عبر البريد</Text>
                <Text className="font-tajawal-bold text-[15px] text-[#18181B]">support@saadalmaslamani.com</Text>
              </View>
            </View>
          </View>

          {/* Working Hours */}
          <View className="px-6 mt-6">
             <View className="bg-[#FAF9F5] rounded-[24px] p-6 border border-[#EBEBEB] border-r-4 border-r-[#67BB28]">
                 <Text className="font-tajawal-bold text-[18px] text-brand-title text-right mb-2">ساعات العمل</Text>
                 <Text className="font-tajawal-medium text-[14px] text-brand-text text-right leading-relaxed">
                     الأحد - الخميس: 9:00 صباحاً - 8:00 مساءً{'\n'}الجمعة: مغلق
                 </Text>
             </View>
          </View>

        </SafeAreaView>
      </ScrollView>
    </View>
  );
}
