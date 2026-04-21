import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader, Button, FormField, FormIcons } from '@/src/shared/ui';
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
                    <AppHeader
                        logo="transparent"
                        withSidebar
                        sidebarSide="left"
                        left={<Ionicons name="menu" size={26} color="#84BD00" />}
                        right={
                            <Pressable onPress={() => router.push('/contact-us')} hitSlop={10} className="w-10 h-10 items-center justify-center">
                                <Ionicons name="help-circle-outline" size={28} color="#84BD00" />
                            </Pressable>
                        }
                    />

                    <View className="flex-1 items-center px-6 pt-16 pb-8">
                        {/* Icon */}
                        <View className="w-[100px] h-[100px] mb-8 rounded-full items-center justify-center bg-[#C6ECCB]">
                            <FormIcons.LockRefresh color="#1F8A5B" width={50} height={50} />
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
                            <FormField
                                label=""
                                placeholder="البريد الإلكتروني أو رقم الجوال"
                                iconType="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={contact}
                                onChangeText={(text) => {
                                    setContact(text);
                                    if (error) setError(null);
                                }}
                                error={error as string}
                            />

                            {success && <Text className="font-tajawal-bold text-green-600 text-center mt-2 mb-2">تم الإرسال بنجاح!</Text>}
                        </View>

                        <Button
                            onPress={onSubmit}
                            loading={isLoading}
                            label="إرسال الرابط"
                            icon={<FormIcons.Send color="white" width={20} height={20} className="transform scale-x-[-1]" />}
                            className="w-full h-[54px] mb-8"
                        />

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
                                <FormIcons.Headset color="#1F8A5B" width={24} height={24} />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
