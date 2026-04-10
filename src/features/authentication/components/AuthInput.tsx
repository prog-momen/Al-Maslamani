import React, { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export const AuthIcons = {
    Email: (props: any) => (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <Rect width="20" height="16" x="2" y="4" rx="2" />
            <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </Svg>
    ),
    Lock: (props: any) => (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </Svg>
    ),
    Eye: (props: any) => (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <Circle cx="12" cy="12" r="3" />
        </Svg>
    ),
    EyeOff: (props: any) => (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <Path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <Path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <Path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <Line x1="2" x2="22" y1="2" y2="22" />
        </Svg>
    ),
    Phone: (props: any) => (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </Svg>
    ),
    User: (props: any) => (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <Circle cx="12" cy="7" r="4" />
        </Svg>
    ),
    Send: (props: any) => (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <Path d="M22 2L11 13" />
            <Path d="M22 2L15 22L11 13L2 9L22 2z" />
        </Svg>
    ),
    Headset: (props: any) => (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <Path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Zm-9 6v3Zm-4 3h8" />
        </Svg>
    ),
    LockRefresh: (props: any) => (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <Path d="M12 2A10 10 0 1 0 22 12" />
            <Path d="M22 12V6" />
            <Path d="M22 6H16" />
            <Rect x="9" y="11" width="6" height="8" rx="1" />
            <Path d="M10 11V9a2 2 0 0 1 4 0v2" />
        </Svg>
    ),
    Clock: (props: any) => (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 6v6l4 2" />
        </Svg>
    ),
    ShieldCheck: (props: any) => (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <Path d="M9 12l2 2 4-4" />
        </Svg>
    ),
};

interface AuthInputProps extends TextInputProps {
    label: string;
    error?: string;
    iconType?: keyof typeof AuthIcons;
}

export function AuthInput({ label, error, iconType, secureTextEntry, className, ...props }: AuthInputProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const Icon = iconType ? AuthIcons[iconType] : null;
    const isPassword = secureTextEntry || iconType === 'Lock';

    return (
        <View className="mb-4">
            <Text className="font-tajawal-bold text-brand-title text-[15px] mb-2 text-right">
                {label}
            </Text>
            <View
                className={`w-full h-[54px] rounded-2xl bg-[#EFECE5] flex-row-reverse items-center px-4 ${error ? 'border border-red-500' : ''}`}
            >
                {Icon && <Icon color="#757575" size={20} className="ml-3" />}
                <TextInput
                    className={`flex-1 font-tajawal-medium text-[15px] text-brand-text text-right px-2 ${className || ''}`}
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={isPassword && !isPasswordVisible}
                    {...props}
                />
                {isPassword && (
                    <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} className="mr-2 px-2 py-2 hit-slop-10">
                        {isPasswordVisible ? <AuthIcons.EyeOff color="#757575" size={20} /> : <AuthIcons.Eye color="#757575" size={20} />}
                    </Pressable>
                )}
            </View>
            {error && <Text className="text-red-500 text-right mt-1 font-tajawal-medium text-[13px]">{error}</Text>}
        </View>
    );
}
