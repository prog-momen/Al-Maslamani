import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader, Button, CARD_BASE_CLASS, FormIcons } from '@/src/shared/ui';
import { useVerifyOtp } from '../hooks/useVerifyOtp';

export function OtpScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();
    const { verifyOtp, isLoading, error, success, setError } = useVerifyOtp();

    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const inputs = useRef<(TextInput | null)[]>([]);

    const [timeLeft, setTimeLeft] = useState(54);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const intervalId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
        if (error) setError(null);
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
            if (error) setError(null);
        }
    };

    const onSubmit = async () => {
        const code = otp.join('');
        if (code.length < 6) {
            setError('الرجاء إدخال رمز التحقق بالكامل');
            return;
        }
        try {
            await verifyOtp(email || '', code);
            setTimeout(() => {
                router.push('/(auth)/login');
            }, 1000);
        } catch {
            // Error handled by hook
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-brand-surface">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

                    {/* ✅ AppHeader الموحّد */}
                    <AppHeader
                        logo="transparent"
                        withSidebar
                        sidebarSide="left"
                        left={<Ionicons name="menu" size={26} color="#84BD00" />}
                        right={
                            <Pressable
                                onPress={() => router.push('/contact-us')}
                                hitSlop={10}
                                className="w-10 h-10 items-center justify-center"
                            >
                                <Ionicons name="help-circle-outline" size={28} color="#84BD00" />
                            </Pressable>
                        }
                    />

                    <View className="flex-1 items-center px-6 pt-16 pb-8">
                        <Text className="font-tajawal-bold text-[28px] text-brand-title mb-4 text-center">
                            أدخل رمز التحقق
                        </Text>
                        <Text className="font-tajawal-medium text-[16px] text-brand-text mb-12 text-center px-4 leading-6">
                            لقد قمنا بإرسال رمز التحقق المكون من ٦ أرقام إلى بريدك الإلكتروني.
                        </Text>

                        <View className={`${CARD_BASE_CLASS} w-full bg-[#FCFBFA] p-8 items-center mb-10 border-[#EFECE5]`}>
                            <View className="flex-row items-center justify-center gap-2 mb-6">
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => { inputs.current[index] = ref; }}
                                        className={`w-[45px] h-[55px] bg-[#EAE8E3] rounded-xl text-center font-tajawal-bold text-[22px] text-brand-title ${error ? 'border border-red-500' : ''}`}
                                        keyboardType="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChangeText={(value) => handleOtpChange(value, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        selectionColor="#1F8A5B"
                                    />
                                ))}
                            </View>

                            <View className="flex-row items-center justify-center gap-2 mb-6">
                                <Text className="font-tajawal-medium text-[14px] text-brand-text">
                                    {formatTime(timeLeft)}
                                </Text>
                                <FormIcons.Clock color="#757575" width={14} height={14} />
                            </View>

                            <Pressable onPress={() => setTimeLeft(54)} disabled={timeLeft > 0}>
                                <Text className={`font-tajawal-bold text-[15px] ${timeLeft > 0 ? 'text-[#A0CBB3]' : 'text-brand-primary'}`}>
                                    إعادة إرسال الرمز
                                </Text>
                            </Pressable>
                        </View>

                        {error && <Text className="font-tajawal-bold text-red-500 text-center mb-6">{error}</Text>}
                        {success && <Text className="font-tajawal-bold text-green-600 text-center mb-6">تم التحقق بنجاح!</Text>}

                        <Button
                            onPress={onSubmit}
                            loading={isLoading}
                            label="تحقق"
                            icon={<FormIcons.ShieldCheck color="white" width={20} height={20} />}
                            className="w-full h-[54px]"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
