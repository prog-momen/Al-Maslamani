import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthIcons, AuthInput } from '../components/AuthInput';
import { useForgotPassword } from '../hooks/useForgotPassword';

export function ForgotPasswordScreen() {
    const router = useRouter();
    const { forgotPassword, isLoading, error, success, setError } = useForgotPassword();
    const [contact, setContact] = useState('');

    const onSubmit = async () => {
        if (!contact.trim()) {
            setError('الرجاء إدخال البريد الإلكتروني أو رقم الهاتف');
            return;
        }
        
        try {
            await forgotPassword(contact);
            // Navigate to OTP screen after successful submission, passing the email
            router.push({ pathname: '/(auth)/otp', params: { email: contact } });
        } catch {
            // Error handled by hook
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-brand-surface">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 pt-4 relative">
                        {/* Placeholder for left space to center logo */}
                        <View className="w-10 h-10" /> 
                        <Image
                            source={require('@/assets/images/logo2.png')}
                            style={{ width: 100, height: 40 }}
                            contentFit="contain"
                        />
                        <Pressable onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100">
                             <Text className="font-tajawal-bold text-[18px]">➔</Text>
                        </Pressable>
                    </View>

                    <View className="flex-1 items-center px-6 pt-16 pb-8">
                        {/* Icon */}
                        <View className="w-[100px] h-[100px] mb-8 rounded-full items-center justify-center bg-[#C6ECCB]">
                            <AuthIcons.LockRefresh color="#1F8A5B" width={50} height={50} />
                        </View>

                        {/* Text */}
                        <Text className="font-tajawal-bold text-[28px] text-brand-title mb-4 text-center">
                            نسيت كلمة المرور
                        </Text>
                        <Text className="font-tajawal-medium text-[16px] text-brand-text mb-12 text-center px-4 leading-6">
                            أدخل بريدك الإلكتروني أو رقم هاتفك لإرسال رابط إعادة تعيين كلمة المرور الخاصة بك.
                        </Text>

                        {/* Form */}
                        <View className="w-full mb-6">
                             <AuthInput
                                 label=""
                                 placeholder="البريد الإلكتروني أو رقم الجوال"
                                 iconType="Email"
                                 keyboardType="email-address"
                                 autoCapitalize="none"
                                 value={contact}
                                 onChangeText={(text) => {
                                     setContact(text);
                                     if(error) setError(null);
                                 }}
                                 error={error as string}
                             />

                             {success && <Text className="font-tajawal-bold text-green-600 text-center mt-2 mb-2">تم الإرسال بنجاح!</Text>}
                        </View>

                        <Pressable
                            onPress={onSubmit}
                            disabled={isLoading}
                            className="w-full h-[54px] rounded-[30px] bg-brand-primary flex-row-reverse items-center justify-center mb-8 active:opacity-85 shadow-sm"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="font-tajawal-bold text-[18px] text-white">إرسال الرابط</Text>
                                    <AuthIcons.Send color="white" width={20} height={20} className="mr-3 transform scale-x-[-1]" />
                                </>
                            )}
                        </Pressable>

                        <View className="flex-row-reverse items-center justify-center gap-1 mb-10">
                            <Text className="font-tajawal-medium text-[15px] text-brand-text">
                                تذكرت كلمة المرور؟
                            </Text>
                            <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={10}>
                                <Text className="font-tajawal-bold text-[15px] text-brand-primary">
                                    تسجيل الدخول
                                </Text>
                            </Pressable>
                        </View>

                        {/* Support Widget */}
                        <View className="w-[90%] bg-[#FCFBFA] rounded-full p-2 pl-6 pr-2 shadow-sm flex-row-reverse items-center justify-between border border-[#EFECE5] absolute bottom-8">
                             <View>
                                 <Text className="font-tajawal-bold text-[14px] text-brand-title text-right">هل تواجه مشكلة؟</Text>
                                 <Text className="font-tajawal-medium text-[12px] text-brand-text text-right">تواصل مع الدعم الفني لمساعدتك فوراً</Text>
                             </View>
                             <View className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-[#EFECE5]">
                                 <AuthIcons.Headset color="#1F8A5B" width={24} height={24} />
                             </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
