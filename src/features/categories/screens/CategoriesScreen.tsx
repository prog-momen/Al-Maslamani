import { useCartActions } from '@/src/features/cart/hooks/useCartActions';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader, CARD_BASE_CLASS } from '@/src/shared/ui';
import { BottomNavbar } from '@/src/shared/ui/BottomNavbar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CatalogProduct, getCatalogProducts } from '@/src/features/products/services/products.service';

type CategoryProduct = {
  id: string;
  title: string;
  price: string;
  image: any;
  tag?: { text: string; bgClass: string; textClass: string };
};

const fallbackProductImage = require('@/assets/images/mixed_nuts.png');

function toCategoryProduct(product: CatalogProduct): CategoryProduct {
  const roundedPrice = Number.isFinite(product.price) ? product.price.toFixed(0) : '0';
  return {
    id: product.id,
    title: product.name,
    price: `${roundedPrice} ₪`,
    image: product.image_url ? { uri: product.image_url } : fallbackProductImage,
    tag: product.description
      ? { text: product.description, bgClass: 'bg-[#CFF3D2]', textClass: 'text-brand-primary' }
      : undefined,
  };
}

export function CategoriesScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tabs = useMemo(() => {
    const names = Array.from(new Set(products.map((p) => p.category_name).filter(Boolean) as string[]));
    return ['الكل', ...names];
  }, [products]);
  const [activeTab, setActiveTab] = useState('الكل');
  const { user } = useAuth();
  const { addItem } = useCartActions();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getCatalogProducts();
        if (mounted) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to load products for categories:', error);
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
  }, []);

  const visibleProducts = useMemo(() => {
    if (activeTab === 'الكل') {
      return products.map(toCategoryProduct);
    }

    return products
      .filter((p) => p.category_name === activeTab)
      .map(toCategoryProduct);
  }, [activeTab, products]);

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab('الكل');
    }
  }, [activeTab, tabs]);

  return (
    <SafeAreaView className="flex-1 bg-brand-surface" edges={['top']}>
      <AppHeader
        logo="transparent"
        withSidebar
        sidebarActiveItem="categories"
        sidebarSide="left"
        left={<Feather name="menu" size={27} color="#67BB28" />}
        right={
          <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={() => router.push('/contact-us')}>
            <Ionicons name="help-circle-outline" size={28} color="#67BB28" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 mt-4 items-end">
          <Text className="font-tajawal-bold text-[20px] text-brand-primary">المجموعة المختارة</Text>
          <Text className="font-tajawal-bold text-[36px] text-brand-title leading-[40px]">الفئات</Text>
        </View>

        <View className="px-6 mt-4 flex-row-reverse items-center gap-3">
          <TouchableOpacity className="w-11 h-11 rounded-full bg-[#EAE8E6] items-center justify-center">
            <Feather name="sliders" size={19} color="#4E5D50" />
          </TouchableOpacity>
          <TouchableOpacity className="w-11 h-11 rounded-full bg-[#EAE8E6] items-center justify-center">
            <Ionicons name="swap-vertical-outline" size={18} color="#4E5D50" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ direction: 'rtl' }}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 10, marginTop: 14 }}
        >
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full ${isActive ? 'bg-brand-primary' : 'bg-[#E8E8E8]'}`}
              >
                <Text className={`font-tajawal-bold text-[18px] ${isActive ? 'text-white' : 'text-[#5D645F]'}`}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <View className="mt-10 items-center justify-center">
            <ActivityIndicator color="#67BB28" size="large" />
          </View>
        ) : null}

        {!isLoading && visibleProducts.length === 0 ? (
          <View className="px-6 mt-8">
            <Text className="font-tajawal-medium text-brand-text text-right">
              لا توجد منتجات حالياً. قم باستيراد المنتجات إلى قاعدة البيانات أولاً.
            </Text>
          </View>
        ) : null}

        <View className="px-6 mt-6 flex-row flex-wrap justify-between">
          {visibleProducts.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => router.push({ pathname: '/product-details', params: { id: product.id } })}
              className={`w-[48%] p-3.5 mb-4 ${CARD_BASE_CLASS}`}
            >
              {product.tag ? (
                <View className={`${product.tag.bgClass} self-end px-3 py-1 rounded-full mb-2`}>
                  <Text className={`${product.tag.textClass} font-tajawal-bold text-[11px]`}>{product.tag.text}</Text>
                </View>
              ) : (
                <View className="h-8" />
              )}

              <View className="items-center mt-1">
                <Image source={product.image} className="w-[104px] h-[104px]" contentFit="contain" transition={200} />
              </View>

              <Text className="font-tajawal-bold text-[20px] text-brand-title text-right leading-[24px] min-h-[48px] mt-2">
                {product.title}
              </Text>

              <View className="flex-row-reverse items-center justify-between mt-3">
                <Text className="font-tajawal-bold text-[20px] text-brand-primary">{product.price}</Text>
                <TouchableOpacity
                  className="absolute bottom-1 left-1 w-12 h-12 rounded-full bg-brand-primary items-center justify-center"
                  onPress={() => {
                    if (!user?.id) return;
                
                    addItem(user.id, product.id, {
                      onGoToCart: () => router.push('/cart'),
                    });
                  }}
                >
                  <Feather name="plus" size={28} color="white" />
                </TouchableOpacity>
              </View>
            </Pressable>
          ))}
        </View>

        <View className="px-6 mt-1 items-center">
          <TouchableOpacity className="w-[178px] h-[52px] rounded-full bg-[#E8E8E8] items-center justify-center flex-row-reverse gap-2">
            <Ionicons name="chevron-down" size={20} color="#4E5D50" />
            <Text className="font-tajawal-bold text-[18px] text-[#4E5D50]">عرض المزيد</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavbar activeTab="categories" />
    </SafeAreaView>
  );
}