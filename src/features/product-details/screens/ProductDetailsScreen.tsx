import { AddToCartModal, AppHeader } from '@/src/shared/ui';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCartActions } from '@/src/features/cart/hooks/useCartActions';
import {
    CatalogProduct,
    getFavoriteProductIds,
    getProductById,
    getProductGroupByProductId,
    GroupedProduct,
    ProductVariant,
    setFavoriteProduct,
} from '@/src/features/products/services/products.service';
import { useRealtimeSignal } from '@/src/shared/contexts/RealtimeContext';
import { useAuth } from '@/src/shared/hooks/useAuth';

const DEFAULT_WEIGHTS = ['250 جرام', '500 جرام', '1 كيلو'];

export function ProductDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCartActions();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const productId = Array.isArray(id) ? id[0] : id;
  const productsSignal = useRealtimeSignal('products');
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [productGroup, setProductGroup] = useState<GroupedProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartProductName, setCartProductName] = useState<string | undefined>();
  const [explainingFeature, setExplainingFeature] = useState<{ id: string, label: string, desc: string, icon: string, color: string } | null>(null);

  const featureInfo: Record<string, { desc: string, icon: string, color: string }> = {
    'عضوي': { 
      desc: 'تم إنتاجه بطرق طبيعية بالكامل دون استخدام أسمدة كيماوية أو مبيدات صناعية، لضمان أعلى جودة ونكهة طبيعية.',
      icon: 'leaf-outline',
      color: '#55772D'
    },
    'بروتين عالي': { 
      desc: 'يحتوي على نسبة عالية من البروتين النباتي الضروري لبناء العضلات ومد الجسم بالأحماض الأمينية الأساسية.',
      icon: 'trending-up-outline',
      color: '#3F7C4D'
    },
    'طاقة طبيعية': { 
      desc: 'مصدر مثالي للطاقة المستدامة التي تساعدك على التركيز والنشاط طوال اليوم دون هبوط مفاجئ.',
      icon: 'flash-outline',
      color: '#4F8D40'
    },
    'بدون سكر': { 
      desc: 'خالٍ تماماً من السكر المضاف، مما يجعله خياراً صحياً مثالياً لمرضى السكري أو من يتبعون حمية غذائية.',
      icon: 'remove-circle-outline',
      color: '#C93206'
    },
    'غني بالألياف': { 
      desc: 'يساعد في تحسين عملية الهضم والشعور بالشبع لفترة أطول، مما يدعم صحة الجهاز الهضمي.',
      icon: 'fitness-outline',
      color: '#005FB8'
    },
  };

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

      try {
        const [data, group, favoriteIds] = await Promise.all([
          getProductById(productId),
          getProductGroupByProductId(productId),
          user?.id ? getFavoriteProductIds(user.id) : Promise.resolve([]),
        ]);

        if (mounted) {
          setProduct(data);
          setProductGroup(group);
          setIsFavorite(favoriteIds.includes(productId));

          if (group) {
            const initialVariant = group.variants.find(v => v.id === productId) || group.variants[0];
            setSelectedVariant(initialVariant);
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
  }, [productId, user?.id, productsSignal]);

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

  const unitPrice = selectedVariant?.price ?? 0;
  const displayPrice = `${unitPrice.toFixed(0)} ₪`;
  const displayImage = selectedVariant?.image_url ? { uri: selectedVariant.image_url } : fallbackProductImage;
  const displayName = productGroup?.name ?? 'منتج';
  
  // Smart description fallback: Variant Long -> Group Long -> Group Short
  const displayDescription = selectedVariant?.long_description 
    || productGroup?.long_description 
    || productGroup?.description 
    || 'وصف المنتج غير متوفر حالياً.';

  return (
    <SafeAreaView className="flex-1 bg-[#F6F5F2]" edges={['top']}>
      {/* Top Header */}
      <AppHeader
        logo="transparent"
        className="z-10"
        withSidebar
        sidebarSide="left"
        left={
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center" 
            onPress={handleGoBack}
          >
            <Ionicons name="chevron-forward" size={28} color="#84BD00" />
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={() => router.push('/contact-us')}>
            <Ionicons name="help-circle-outline" size={28} color="#84BD00" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {isLoading ? (
          <View className="mt-14 items-center justify-center">
            <ActivityIndicator color="#84BD00" size="large" />
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
                  {selectedVariant?.long_description || displayDescription}
                </Text>
                {productGroup?.packaging && (
                  <View className="mt-3 flex-row items-center justify-end">
                    <View className="bg-white px-3 py-1.5 rounded-md border border-[#EAE8E3]">
                      <Text className="font-tajawal-bold text-[13px] text-brand-title">{productGroup.packaging}</Text>
                    </View>
                    <Text className="font-tajawal-medium text-[14px] text-gray-500 mr-2">التغليف:</Text>
                  </View>
                )}
              </View>

              {/* Weight Selector */}
              {productGroup && productGroup.variants.length > 1 && (
                <View className="mb-8">
                  <Text className="font-tajawal-bold text-[16px] text-right text-brand-title mb-4">اختر الوزن</Text>
                  <View className="flex-row items-center justify-end flex-wrap gap-x-3">
                    {productGroup.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <TouchableOpacity
                          key={v.id}
                          onPress={() => setSelectedVariant(v)}
                          className={`px-6 py-3 rounded-[20px] ${isSelected ? 'bg-brand-primary' : 'bg-[#EAE8E3]'
                            }`}
                        >
                          <Text
                            className={`font-tajawal-bold text-[15px] ${isSelected ? 'text-white' : 'text-[#666666]'
                              }`}
                          >
                            {v.size}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

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

              {/* Feature Tags (Product Group Level) */}
              {productGroup?.features && productGroup.features.length > 0 && (
                <View className="flex-row flex-wrap justify-end gap-3 mb-8">
                  {productGroup.features.map((feat: string) => {
                    const config: any = {
                      'عضوي': { icon: 'leaf-outline', iconType: 'Ionicons', bg: '#EAEFD2', text: '#55772D', border: '#D5E1AC' },
                      'بروتين عالي': { icon: 'trending-up-outline', iconType: 'Ionicons', bg: '#DEF0DE', text: '#3F7C4D', border: '#B3DCBB' },
                      'طاقة طبيعية': { icon: 'flash-outline', iconType: 'Ionicons', bg: '#E6F3E3', text: '#4F8D40', border: '#C5E5BE' },
                      'بدون سكر': { icon: 'remove-circle-outline', iconType: 'Ionicons', bg: '#FDECEC', text: '#C93206', border: '#F9D7D7' },
                      'غني بالألياف': { icon: 'fitness-outline', iconType: 'Ionicons', bg: '#F0F7FF', text: '#005FB8', border: '#D1E4FF' },
                    }[feat] || { icon: 'star-outline', iconType: 'Ionicons', bg: '#F8F9FA', text: '#666', border: '#EEE' };

                    return (
                      <TouchableOpacity 
                        key={feat}
                        activeOpacity={0.7}
                        onPress={() => {
                          const info = featureInfo[feat] || { desc: 'ميزة غذائية خاصة لضمان جودة المنتج.', icon: 'star-outline', color: '#666' };
                          setExplainingFeature({ id: feat, label: feat, ...info });
                        }}
                        style={{ backgroundColor: config.bg, borderColor: config.border }}
                        className="flex-row items-center px-4 py-2 rounded-full border"
                      >
                        <Text style={{ color: config.text }} className="font-tajawal-medium text-[13px] mr-2">{feat}</Text>
                        <Ionicons name={config.icon} size={16} color={config.text} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
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
              if (!user?.id || !selectedVariant) {
                router.push('/(auth)/login');
                return;
              }

              addItem(user.id, selectedVariant.id, {
                quantity,
                onSuccess: () => {
                  setCartProductName(`${displayName} - ${selectedVariant.size}`);
                  setShowCartModal(true);
                },
              });
            }}
          >
            <Text className="font-tajawal-bold text-[16px] text-white mr-3">إضافة إلى السلة</Text>
            <Ionicons name="cart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Add to Cart Success Modal */}
      <AddToCartModal
        visible={showCartModal}
        productName={displayName}
        quantity={quantity}
        onContinueShopping={() => setShowCartModal(false)}
        onGoToCart={() => {
          setShowCartModal(false);
          router.push('/cart');
        }}
      />

      {/* Feature Explanation Modal */}
      <Modal visible={!!explainingFeature} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-8">
          <View className="bg-white w-full rounded-[32px] p-8 shadow-2xl items-center">
            {explainingFeature && (
              <>
                <View 
                  style={{ backgroundColor: explainingFeature.color + '15' }}
                  className="w-20 h-20 rounded-full items-center justify-center mb-6"
                >
                  <Ionicons name={explainingFeature.icon as any} size={44} color={explainingFeature.color} />
                </View>
                
                <Text style={{ color: explainingFeature.color }} className="font-tajawal-bold text-[24px] mb-4">
                  {explainingFeature.label}
                </Text>
                
                <Text className="font-tajawal-medium text-[16px] text-[#4D4D4D] text-center leading-7 mb-8">
                  {explainingFeature.desc}
                </Text>

                <TouchableOpacity 
                  onPress={() => setExplainingFeature(null)}
                  style={{ backgroundColor: explainingFeature.color }}
                  className="w-full py-4 rounded-2xl items-center shadow-sm"
                >
                  <Text className="font-tajawal-bold text-white text-[18px]">فهمت، شكراً!</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
