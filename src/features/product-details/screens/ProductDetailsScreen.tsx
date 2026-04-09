import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ProductDetailsScreen() {
  const router = useRouter();
  const [selectedWeight, setSelectedWeight] = useState('250 جرام');
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const weights = ['250 جرام', '500 جرام', '1 كيلو'];

  return (
    <SafeAreaView className="flex-1 bg-[#F6F5F2]" edges={['top']}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2 z-10">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center bg-white/50 rounded-full"
          onPress={() => router.back()}
        >
          {/* Back Arrow as shown in the design: top left, pointing left */}
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        <Image
          source={require('@/assets/images/logo-transparent.png')}
          className="w-56 h-20"
          contentFit="contain"
          transition={200}
        />

        <TouchableOpacity className="w-10 h-10 items-center justify-center bg-white/50 rounded-full">
          <Ionicons name="heart-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>

        {/* Product Image Section */}
        <View className="items-center mt-4">
          <View className="relative w-[300px] h-[340px] items-center justify-center">
            {/* The transparent jar product image */}
            <Image
              source={require('@/assets/images/لوز 250 غرام علبة.png')}
              className="w-full h-full"
              contentFit="contain"
              transition={200}
            />

            {/* Badge Over Image */}
            <View className="absolute bottom-4 right-4 bg-[#B5E4B7] px-4 py-1.5 rounded-full">
              <Text className="text-[#327038] font-tajawal-bold text-[14px]">محمص طازج</Text>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View className="px-6 mt-8">

          {/* Title and Price */}
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-brand-primary font-tajawal-bold text-[24px]">20 ₪</Text>
              <Text className="text-gray-500 font-tajawal-medium text-[12px] mt-1">شامل الضريبة</Text>
            </View>
            <View className="items-end">
              <Text className="text-[32px] font-tajawal-bold text-brand-title">لوز محمص</Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-gray-500 font-tajawal-regular text-[13px] mr-2">(120 تقييم)</Text>
                <Text className="text-brand-text font-tajawal-bold text-[16px] mr-1">4.9</Text>
                <Ionicons name="star" size={16} color="#E81E61" />
              </View>
            </View>
          </View>

          {/* About Product */}
          <View className="mb-8">
            <Text className="font-tajawal-bold text-[16px] text-right text-brand-title mb-3">عن المنتج</Text>
            <Text className="font-tajawal-regular text-[14px] text-right text-[#4D4D4D] leading-6">
              لوز، محمص ببطء للحفاظ على الزيوت الطبيعية والنكهة الغنية، طبيعي 100% وبدون إضافات صناعية.
            </Text>
          </View>

          {/* Weight Selector */}
          <View className="mb-8">
            <Text className="font-tajawal-bold text-[16px] text-right text-brand-title mb-4">اختر الوزن</Text>
            <View className="flex-row items-center justify-end flex-wrap gap-x-3">
              {weights.map((weight) => {
                const isSelected = selectedWeight === weight;
                return (
                  <TouchableOpacity
                    key={weight}
                    onPress={() => setSelectedWeight(weight)}
                    className={`px-6 py-3 rounded-[20px] ${isSelected ? 'bg-brand-primary' : 'bg-[#EAE8E3]'
                      }`}
                  >
                    <Text
                      className={`font-tajawal-bold text-[15px] ${isSelected ? 'text-white' : 'text-[#666666]'
                        }`}
                    >
                      {weight}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Quantity Selector */}
          <View className="flex-row items-center justify-between mb-10">
            {/* Quantity Stepper */}
            <View className="flex-row items-center bg-[#EAE8E3] rounded-full px-2 h-[50px] min-w-[140px]">
              <TouchableOpacity onPress={decrementQuantity} className="w-10 h-10 items-center justify-center">
                <Feather name="minus" size={20} color="#000" />
              </TouchableOpacity>
              <View className="flex-1 items-center justify-center">
                <Text className="font-tajawal-bold text-[18px] text-black">{quantity}</Text>
              </View>
              <TouchableOpacity onPress={incrementQuantity} className="w-10 h-10 items-center justify-center">
                <Feather name="plus" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <Text className="font-tajawal-bold text-[16px] text-brand-title">الكمية</Text>
          </View>

          {/* Feature Tags */}
          <View className="flex-row flex-wrap justify-end gap-3 mb-8">
            {/* Tag 1 */}
            <View className="flex-row items-center bg-[#EAEFD2] px-4 py-2 rounded-full border border-[#D5E1AC]">
              <Text className="text-[#55772D] font-tajawal-medium text-[13px] mr-2">عضوي</Text>
              <Ionicons name="leaf-outline" size={16} color="#55772D" />
            </View>
            {/* Tag 2 */}
            <View className="flex-row items-center bg-[#DEF0DE] px-4 py-2 rounded-full border border-[#B3DCBB]">
              <Text className="text-[#3F7C4D] font-tajawal-medium text-[13px] mr-2">بروتين عالي</Text>
              <Feather name="arrow-up-right" size={16} color="#3F7C4D" />
            </View>
            {/* Tag 3 */}
            <View className="flex-row items-center bg-[#E6F3E3] px-4 py-2 rounded-full border border-[#C5E5BE]">
              <Text className="text-[#4F8D40] font-tajawal-medium text-[13px] mr-2">طاقة طبيعية</Text>
              <Ionicons name="flash-outline" size={16} color="#4F8D40" />
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white pt-4 pb-8 px-6 flex-row items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[32px]">
        {/* Total Price */}
        <View className="bg-[#EAE8E3] px-6 py-3 rounded-[20px] items-center">
          <Text className="font-tajawal-medium text-[11px] text-[#666]">المجموع</Text>
          <Text className="font-tajawal-bold text-[16px] text-brand-title">{20 * quantity} ₪</Text>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity className="flex-1 ml-4 bg-brand-primary h-[54px] rounded-[20px] flex-row items-center justify-center shadow-sm">
          <Text className="font-tajawal-bold text-[16px] text-white mr-3">إضافة إلى السلة</Text>
          <Ionicons name="cart-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
