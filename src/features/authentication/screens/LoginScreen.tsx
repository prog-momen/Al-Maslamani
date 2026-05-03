import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getHomeRouteForRole } from '@/src/shared/constants/role-routes';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { Button, CARD_BASE_CLASS, FormField, SocialLoginButtons } from '@/src/shared/ui';
import { useLogin } from '../hooks/useLogin';
import { authService } from '../services/auth.service';
import { useState } from 'react';

export function LoginScreen() {
    const router = useRouter();
    const { login, isLoading, error } = useLogin();
    const { isAuthenticated, role, isInitializing, setGuestMode } = useAuth();
    const [isSocialLoading, setIsSocialLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { email: '', password: '' }
    });

    const onSubmit = async (data: any) => {
        try {
            const authData = await login(data);
            const userId = authData.user?.id;

            if (userId) {
              const role = await authService.getUserRole(userId);
              router.replace(getHomeRouteForRole(role));
              return;
            }

            router.replace('/home');
        } catch {
            // Error is handled by hook and displayed below
        }
    };

    const handleGoogleLogin = async () => {
        setIsSocialLoading(true);
        try {
            const result = await authService.signInWithOAuth('google');
            if (result.success) {
                // Auth state will be handled by useAuth effect
            }
        } catch (e) {
            console.error('Google login error:', e);
            alert('فشل الدخول عبر Google. تأكد من تفعيل الخدمة في Supabase.');
        } finally {
            setIsSocialLoading(false);
        }
    };

        useEffect(() => {
            if (!isInitializing && isAuthenticated) {
                router.replace(getHomeRouteForRole(role));
            }
        }, [isAuthenticated, isInitializing, role, router]);

    return (
        <SafeAreaView className="flex-1 bg-brand-surface">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0} className="flex-1">
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    automaticallyAdjustKeyboardInsets
                >
                    <View className="items-center px-6 pt-16 pb-8">

                        {/* Logo */}
                        <View className="w-[100px] h-[100px] mb-4 rounded-full overflow-hidden items-center justify-center bg-white shadow-sm border border-gray-100">
                            <Image
                                source={require('@/assets/images/logo2.png')}
                                style={{ width: 100, height: 100 }}
                                contentFit="cover"
                            />
                        </View>

                        {/* Title */}
                        <Text className="font-tajawal-bold text-[28px] text-brand-title mb-2">
                            أهلاً بعودتك
                        </Text>
                        <Text className="font-tajawal-medium text-[16px] text-brand-text mb-10">
                            يسعدنا وجودك معنا
                        </Text>

                        {/* Form Card */}
                        <View className={`${CARD_BASE_CLASS} w-full bg-[#FCFBFA] p-6 flex-col`}>

                            <Controller
                                control={control}
                                rules={{
                                    required: 'البريد الإلكتروني مطلوب',
                                    pattern: { value: /\S+@\S+\.\S+/, message: 'بريد إلكتروني غير صالح' }
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        label="البريد الإلكتروني أو رقم الهاتف"
                                        placeholder="example@gmail.com"
                                        iconType="Email"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={errors.email?.message as string}
                                    />
                                )}
                                name="email"
                            />

                            <View className="flex-row-reverse items-center justify-between mb-2 mt-2">
                                <Text className="font-tajawal-bold text-brand-title text-[15px]">كلمة المرور</Text>
                                <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                                    <Text className="font-tajawal-bold text-brand-primary text-[14px]">نسيت كلمة المرور؟</Text>
                                </Pressable>
                            </View>

                            <Controller
                                control={control}
                                rules={{ required: 'كلمة المرور مطلوبة', minLength: { value: 6, message: 'كلمة المرور قصيرة جداً' } }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        label=""
                                        placeholder="........"
                                        iconType="Lock"
                                        secureTextEntry
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={errors.password?.message as string}
                                    />
                                )}
                                name="password"
                            />

                            {error && <Text className="font-tajawal-bold text-red-500 text-center mt-2 mb-2">{error}</Text>}

                            <Button
                                onPress={handleSubmit(onSubmit)}
                                loading={isLoading}
                                label="تسجيل الدخول"
                                icon={<Text className="font-tajawal-bold text-[18px] text-white">←</Text>}
                                className="w-full h-[54px] mt-6"
                            />

                            <SocialLoginButtons 
                                onGooglePress={handleGoogleLogin} 
                                isLoading={isSocialLoading} 
                            />
                        </View>

                        <View className="mt-12 flex-col items-center justify-center gap-4">
                            <View className="flex-row-reverse items-center justify-center gap-2">
                                <Text className="font-tajawal-medium text-[16px] text-brand-text">
                                    ليس لديك حساب؟
                                </Text>
                                <Pressable onPress={() => router.push('/(auth)/signup')} hitSlop={10}>
                                    <Text className="font-tajawal-bold text-[16px] text-brand-primary">
                                        أنشئ حساباً جديداً
                                    </Text>
                                </Pressable>
                            </View>

                            <Pressable 
                                onPress={async () => {
                                    await setGuestMode(true);
                                    router.replace('/home');
                                }} 
                                hitSlop={10}
                            >
                                <Text className="font-tajawal-bold text-[16px] text-gray-500 border-b border-gray-400 pb-0.5">
                                    المتابعة كضيف
                                </Text>
                            </Pressable>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
