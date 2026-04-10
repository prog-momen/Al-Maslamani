import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthInput } from '../components/AuthInput';
import { useLogin } from '../hooks/useLogin';

export function LoginScreen() {
    const router = useRouter();
    const { login, isLoading, error } = useLogin();

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { email: '', password: '' }
    });

    const onSubmit = async (data: any) => {
        try {
            await login(data);
        } catch {
            // Error is handled by hook and displayed below
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-brand-surface">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                    <View className="flex-1 items-center px-6 pt-16 pb-8">

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
                        <View className="w-full bg-[#fcfbfa] rounded-[30px] p-6 shadow-sm flex-col">

                            <Controller
                                control={control}
                                rules={{
                                    required: 'البريد الإلكتروني مطلوب',
                                    pattern: { value: /\S+@\S+\.\S+/, message: 'بريد إلكتروني غير صالح' }
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <AuthInput
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
                                    // AuthInput handles the label slightly differently if we inject the "Forgot Password" node, 
                                    // but we mapped the label outside to have flex layout with forgot password link!
                                    <AuthInput
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

                            <Pressable
                                onPress={handleSubmit(onSubmit)}
                                disabled={isLoading}
                                className="w-full h-[54px] rounded-[30px] bg-brand-primary flex-row items-center justify-center mt-6 active:opacity-85 shadow-sm"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="font-tajawal-bold text-[18px] text-white">تسجيل الدخول</Text>
                                        <Text className="font-tajawal-bold text-[18px] text-white absolute left-5">←</Text>
                                    </>
                                )}
                            </Pressable>

                            <View className="items-center mt-8 space-y-2">
                                <Text className="font-tajawal-bold text-brand-title text-[14px]">المتابعة عبر Google .</Text>
                                <Text className="font-tajawal-bold text-brand-title text-[14px]">المتابعة عبر Apple .</Text>
                            </View>
                        </View>

                        <View className="mt-12 flex-row-reverse items-center justify-center gap-2">
                            <Text className="font-tajawal-medium text-[16px] text-brand-text">
                                ليس لديك حساب؟
                            </Text>
                            <Pressable onPress={() => router.push('/(auth)/signup')} hitSlop={10}>
                                <Text className="font-tajawal-bold text-[16px] text-brand-primary">
                                    أنشئ حساباً جديداً
                                </Text>
                            </Pressable>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
