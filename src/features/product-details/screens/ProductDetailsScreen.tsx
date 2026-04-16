import { AppHeader } from '@/src/shared/ui';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCartActions } from '@/src/features/cart/hooks/useCartActions';
import {
    CatalogProduct,
    getFavoriteProductIds,
    getProductById,
    setFavoriteProduct,
} from '@/src/features/products/services/products.service';
import { useAuth } from '@/src/shared/hooks/useAuth';

const DEFAULT_WEIGHTS = ['250 جرام', '500 جرام', '1 كيلو'];

export function ProductDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCartActions();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const productId = Array.isArray(id) ? id[0] : id;
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState('250 جرام');
  const [quantity, setQuantity] = useState(1);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const fallbackProductImage = require('@/assets/images/mixed_nuts.png');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setProduct(null);
      try {
        const [data, favoriteIds] = await Promise.all([
          getProductById(productId),
          user?.id ? getFavoriteProductIds(user.id) : Promise.resolve([]),
        ]);

        if (mounted) {
          setProduct(data);
          setIsFavorite(favoriteIds.includes(productId));
          if (data?.description) {
            setSelectedWeight(data.description);
          }
        }
      } catch (error) {
        console.error('Failed to load product details:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [productId, user?.id]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const refreshFavorite = async () => {
        if (!user?.id || !productId) {
          return;
        }

        try {
          const ids = await getFavoriteProductIds(user.id);
          if (active) {
            setIsFavorite(ids.includes(productId));
          }
        } catch (error) {
          console.error('Failed to refresh product favorite on focus:', error);
        }
      };

      refreshFavorite();
      return () => {
        active = false;
      };
    }, [productId, user?.id])
  );
  const handleToggleFavorite = () => {
    if (!user?.id || !productId) {
      return;
    }

    const nextValue = !isFavorite;
    setIsFavorite(nextValue);

    setFavoriteProduct(user.id, productId, nextValue).catch((error) => {
      console.error('Failed to toggle favorite from product details:', error);
      setIsFavorite(!nextValue);
    });
  };

  const shownWeights = useMemo(() => {
    if (product?.description) {
      return [product.description, ...DEFAULT_WEIGHTS.filter((w) => w !== product.description)];
    }
    return DEFAULT_WEIGHTS;
  }, [product?.description]);

  const unitPrice = Number.isFinite(product?.price) ? Number(product?.price) : 0;
  const displayPrice = `${unitPrice.toFixed(0)} ₪`;
  const displayImage = product?.image_url ? { uri: product.image_url } : fallbackProductImage;
  const displayName = product?.name ?? 'منتج';
  const displayDescription = product?.description ?? 'وصف المنتج غير متوفر حالياً.';

  return (
    <SafeAreaView className="flex-1 bg-[#F6F5F2]" edges={['top']}>
      {/* Top Header */}
      <AppHeader
        logo="transparent"
        className="z-10"
        withSidebar
        sidebarSide="left"
        left={<Feather name="menu" size={24} color="#67BB28" />}
        right={
          <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={() => router.push('/contact-us')}>
            <Ionicons name="help-circle-outline" size={28} color="#67BB28" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {isLoading ? (
          <View className="mt-14 items-center justify-center">
            <ActivityIndicator color="#67BB28" size="large" />
          </View>
        ) : (
          <>

            {/* Product Image Section */}
            <View className="items-center mt-4">
              <View className="relative w-[300px] h-[340px] items-center justify-center">
                {/* The transparent jar product image */}
                <Image
                  source={displayImage}
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
              <Text className="text-brand-primary font-tajawal-bold text-[24px]">{displayPrice}</Text>
              <Text className="text-gray-500 font-tajawal-medium text-[12px] mt-1">شامل الضريبة</Text>
            </View>
            <View className="items-end">
              <Text className="text-[32px] font-tajawal-bold text-brand-title">{displayName}</Text>
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
              {displayDescription}
            </Text>
          </View>

          {/* Weight Selector */}
          <View className="mb-8">
            <Text className="font-tajawal-bold text-[16px] text-right text-brand-title mb-4">اختر الوزن</Text>
            <View className="flex-row items-center justify-end flex-wrap gap-x-3">
              {shownWeights.map((weight) => {
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
          </>
        )}

      </ScrollView>

      {/* Sticky Bottom Bar */}
      {!isLoading ? (
        <View className="absolute bottom-0 left-0 right-0 bg-white pt-4 pb-8 px-6 flex-row items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[32px]">
          {/* Total Price */}
          <View className="bg-[#EAE8E3] px-6 py-3 rounded-[20px] items-center">
            <Text className="font-tajawal-medium text-[11px] text-[#666]">المجموع</Text>
            <Text className="font-tajawal-bold text-[16px] text-brand-title">{(unitPrice * quantity).toFixed(0)} ₪</Text>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            className="flex-1 ml-4 bg-brand-primary h-[54px] rounded-[20px] flex-row items-center justify-center shadow-sm"
            onPress={() => {
              if (!user?.id || !productId) {
                router.push('/(auth)/login');
                return;
              }

              addItem(user.id, productId, {
                quantity,
                onGoToCart: () => router.push('/cart'),
              });
            }}
          >
            <Text className="font-tajawal-bold text-[16px] text-white mr-3">إضافة إلى السلة</Text>
            <Ionicons name="cart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
