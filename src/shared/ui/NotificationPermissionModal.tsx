import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from './Button';

type NotificationPermissionModalProps = {
  visible: boolean;
  onAllow: () => void;
  onDecline: () => void;
};

export function NotificationPermissionModal({ visible, onAllow, onDecline }: NotificationPermissionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/85 justify-center items-center px-6">
        <Animated.View 
          entering={FadeInUp.duration(400)}
          className="bg-brand-primary w-full rounded-[40px] overflow-hidden shadow-2xl"
        >
          {/* Content Container */}
          <View className="p-8 items-center">
            {/* Icon section */}
            <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6 mt-4">
              <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center border border-white/30">
                <Ionicons name="notifications" size={48} color="white" />
              </View>
            </Animated.View>

            <Text className="font-tajawal-bold text-[28px] text-white text-center mb-3">
              خليك على اطلاع!
            </Text>
            <Text className="font-tajawal-medium text-[16px] text-white/90 text-center leading-6 px-2">
              فعل التنبيهات عشان تصلك آخر عروضنا، أكواد الخصم الحصرية، وتحديثات طلباتك أول بأول.
            </Text>

            {/* Features Row - All White Style */}
            <View className="flex-row-reverse w-full mt-10 gap-4 justify-around">
              <View className="items-center">
                <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mb-2 border border-white/10">
                  <Ionicons name="pricetag" size={24} color="white" />
                </View>
                <Text className="font-tajawal-bold text-[12px] text-white">خصومات</Text>
              </View>
              <View className="items-center">
                <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mb-2 border border-white/10">
                  <Ionicons name="cart" size={24} color="white" />
                </View>
                <Text className="font-tajawal-bold text-[12px] text-white">طلباتك</Text>
              </View>
              <View className="items-center">
                <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mb-2 border border-white/10">
                  <Ionicons name="gift" size={24} color="white" />
                </View>
                <Text className="font-tajawal-bold text-[12px] text-white">هدايا</Text>
              </View>
            </View>

            {/* Actions */}
            <View className="w-full mt-12 gap-3">
              <TouchableOpacity 
                onPress={onAllow}
                activeOpacity={0.9}
                className="bg-white h-16 rounded-2xl items-center justify-center shadow-lg"
              >
                <Text className="font-tajawal-bold text-[18px] text-brand-primary">تفعيل التنبيهات</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={onDecline}
                className="py-3 items-center"
              >
                <Text className="font-tajawal-bold text-[16px] text-white/70">ليس الآن</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
