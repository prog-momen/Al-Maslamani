import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AuthInput } from '../components/AuthInput';
import { useRegister } from '../hooks/useRegister';

export function SignUpScreen() {
    const router = useRouter();
    const { register, isLoading, error } = useRegister();
    const [agreed, setAgreed] = useState(false);

    const { control, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '' }
    });

    const pwd = watch('password');

    const onSubmit = async (data: any) => {
        if (!agreed) {
            alert("الرجاء الموافقة على شروط الخدمة وسياسة الخصوصية");
            return;
        }
        try {
            await register({ email: data.email, password: data.password }, data.fullName);
            // Navigate to login after successful registration
            router.push('/(auth)/login');
        } catch {
            // Error is handled by hook
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-brand-surface">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                    <View className="flex-1 px-6 pt-8 pb-8">
                        <View className="items-center mb-8 mt-2">
                            <View className="w-[100px] h-[100px] rounded-full overflow-hidden items-center justify-center bg-white shadow-sm border border-gray-100">
                                <Image
                                    source={require('@/assets/images/logo2.png')}
                                    style={{ width: 100, height: 100 }}
                                    contentFit="cover"
                                />
                            </View>
                        </View>
                        <View className="items-end mb-8">
                            <Text className="font-tajawal-bold text-[28px] text-brand-title mb-2">إنشاء حساب</Text>
                            <Text className="font-tajawal-medium text-[16px] text-brand-text">أدخل بياناتك للانضمام إلى عالمنا.</Text>
                        </View>

                        <Controller
                            control={control}
                            rules={{ required: 'الاسم الكامل مطلوب' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AuthInput label="الاسم الكامل" placeholder="أدخل اسمك هنا" iconType="User" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.fullName?.message as string} />
                            )}
                            name="fullName"
                        />

                        <Controller
                            control={control}
                            rules={{
                                required: 'البريد الإلكتروني مطلوب',
                                pattern: { value: /\S+@\S+\.\S+/, message: 'بريد إلكتروني غير صالح' }
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AuthInput label="البريد الإلكتروني" placeholder="example@domain.com" iconType="Email" keyboardType="email-address" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.email?.message as string} />
                            )}
                            name="email"
                        />

                        <Controller
                            control={control}
                            rules={{ required: 'رقم الهاتف مطلوب' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AuthInput label="رقم الهاتف" placeholder="05XXXXXXXX" iconType="Phone" keyboardType="phone-pad" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.phone?.message as string} />
                            )}
                            name="phone"
                        />

                        <Controller
                            control={control}
                            rules={{ required: 'كلمة المرور مطلوبة', minLength: { value: 6, message: '6 أحرف كحد أدنى' } }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AuthInput label="كلمة المرور" placeholder="........" iconType="Lock" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={errors.password?.message as string} />
                            )}
                            name="password"
                        />

                        <Controller
                            control={control}
                            rules={{
                                required: 'تأكيد كلمة المرور مطلوب',
                                validate: (value) => value === pwd || 'كلمتا المرور غير متطابقتين'
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AuthInput label="تأكيد كلمة المرور" placeholder="........" iconType="Lock" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={errors.confirmPassword?.message as string} />
                            )}
                            name="confirmPassword"
                        />

                        <View className="flex-row-reverse items-center justify-start mt-2 mb-6">
                            <Pressable
                                onPress={() => setAgreed(!agreed)}
                                className={`w-6 h-6 rounded-full border items-center justify-center ml-3 ${agreed ? 'bg-brand-primary border-brand-primary' : 'bg-transparent border-[#9ca3af]'}`}
                            >
                                {agreed && <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><Path d="M20 6 9 17l-5-5" /></Svg>}
                            </Pressable>
                            <Text className="font-tajawal-medium text-[15px] text-brand-text">أوافق على </Text>
                            <Pressable hitSlop={5}><Text className="font-tajawal-bold text-[15px] text-brand-primary">شروط الخدمة</Text></Pressable>
                            <Text className="font-tajawal-medium text-[15px] text-brand-text"> و </Text>
                            <Pressable hitSlop={5}><Text className="font-tajawal-bold text-[15px] text-brand-primary">سياسة الخصوصية</Text></Pressable>
                        </View>

                        {error && <Text className="font-tajawal-bold text-red-500 text-center mb-4">{error}</Text>}

                        <Pressable
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading}
                            className="w-full h-[54px] rounded-full bg-brand-primary flex-row items-center justify-center active:opacity-85 shadow-sm"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="font-tajawal-bold text-[18px] text-white">إنشاء حساب</Text>
                            )}
                        </Pressable>

                        <View className="mt-8 flex-row-reverse items-center justify-center gap-2 mb-10">
                            <Text className="font-tajawal-medium text-[16px] text-brand-text">
                                لديك حساب بالفعل؟
                            </Text>
                            <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={10}>
                                <Text className="font-tajawal-bold text-[16px] text-brand-primary">
                                    تسجيل الدخول
                                </Text>
                            </Pressable>
                        </View>

                        {/* Bottom Safe Badges UI */}
                        <View className="flex-row-reverse items-center justify-center gap-8 border-t border-[#e5e7eb] pt-6 opacity-60">
                            <View className="items-center">
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><Path d="m9 12 2 2 4-4" /></Svg>
                                <Text className="font-tajawal-bold text-[10px] mt-1 text-center text-brand-title">دفع آمن</Text>
                            </View>
                            <View className="items-center">
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><Path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" /><Path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" /><Circle cx="7" cy="18" r="2" /><Circle cx="17" cy="18" r="2" /></Svg>
                                <Text className="font-tajawal-bold text-[10px] mt-1 text-center text-brand-title">توصيل سريع</Text>
                            </View>
                            <View className="items-center">
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><Path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></Svg>
                                <Text className="font-tajawal-bold text-[10px] mt-1 text-center text-brand-title">%100 عضوي</Text>
                            </View>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
