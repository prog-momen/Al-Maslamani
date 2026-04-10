import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthIcons } from '../components/AuthInput';
import { useVerifyOtp } from '../hooks/useVerifyOtp';

export function OtpScreen() {
    const router = useRouter();
    const { verifyOtp, isLoading, error, success, setError } = useVerifyOtp();
    
    const [otp, setOtp] = useState<string[]>(['', '', '', '']);
    const inputs = useRef<(TextInput | null)[]>([]);
    
    // Timer state
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

        // Move to next automatically
        if (value && index < 3) {
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
        if (code.length < 4) {
             setError('الرجاء إدخال رمز التحقق بالكامل');
             return;
        }

        try {
            await verifyOtp(code);
            // On success, redirect to login or home
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
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 pt-4 relative">
                        <View className="w-10 h-10" /> 
                        <Image
                            source={require('@/assets/images/logo-transparent.png')}
                            style={{ width: 100, height: 40 }}
                            contentFit="contain"
                        />
                        <Pressable onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100">
                             <Text className="font-tajawal-bold text-[18px]">➔</Text>
                        </Pressable>
                    </View>

                    <View className="flex-1 items-center px-6 pt-16 pb-8">
                        {/* Text */}
                        <Text className="font-tajawal-bold text-[28px] text-brand-title mb-4 text-center">
                            أدخل رمز التحقق
                        </Text>
                        <Text className="font-tajawal-medium text-[16px] text-brand-text mb-12 text-center px-4 leading-6">
                            لقد قمنا بإرسال رمز التحقق المكون من ٤ أرقام إلى هاتفك المحمول.
                        </Text>

                        {/* OTP Verification Box */}
                        <View className="w-full bg-[#FCFBFA] rounded-[30px] p-8 shadow-sm items-center mb-10 border border-[#EFECE5]">
                             {/* Inputs */}
                             <View className="flex-row items-center justify-center gap-4 mb-6">
                                 {otp.map((digit, index) => (
                                     <TextInput
                                         key={index}
                                         ref={(ref) => { inputs.current[index] = ref; }}
                                         className={`w-[60px] h-[60px] bg-[#EAE8E3] rounded-2xl text-center font-tajawal-bold text-[24px] text-brand-title ${error ? 'border border-red-500' : ''}`}
                                         keyboardType="numeric"
                                         maxLength={1}
                                         value={digit}
                                         onChangeText={(value) => handleOtpChange(value, index)}
                                         onKeyPress={(e) => handleKeyPress(e, index)}
                                         selectionColor="#1F8A5B"
                                     />
                                 ))}
                             </View>

                             {/* Timer */}
                             <View className="flex-row items-center justify-center gap-2 mb-6">
                                 <Text className="font-tajawal-medium text-[14px] text-brand-text">
                                     {formatTime(timeLeft)}
                                 </Text>
                                 <AuthIcons.Clock color="#757575" width={14} height={14} />
                             </View>

                             {/* Resend */}
                             <Pressable 
                                 onPress={() => setTimeLeft(54)}
                                 disabled={timeLeft > 0}
                             >
                                 <Text className={`font-tajawal-bold text-[15px] ${timeLeft > 0 ? 'text-[#A0CBB3]' : 'text-brand-primary'}`}>
                                     إعادة إرسال الرمز
                                 </Text>
                             </Pressable>
                        </View>
                        
                        {error && <Text className="font-tajawal-bold text-red-500 text-center mb-6">{error}</Text>}
                        {success && <Text className="font-tajawal-bold text-green-600 text-center mb-6">تم التحقق بنجاح!</Text>}

                        {/* Submit Button */}
                        <Pressable
                            onPress={onSubmit}
                            disabled={isLoading}
                            className="w-full h-[54px] rounded-[30px] bg-brand-primary flex-row-reverse items-center justify-center active:opacity-85 shadow-sm"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="font-tajawal-bold text-[18px] text-white">تحقق</Text>
                                    <AuthIcons.ShieldCheck color="white" width={20} height={20} className="mr-3" />
                                </>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
