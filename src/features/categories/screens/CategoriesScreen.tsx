import { useCartActions } from '@/src/features/cart/hooks/useCartActions';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AddToCartModal, AppHeader, CARD_BASE_CLASS, NotificationBell } from '@/src/shared/ui';
import { BottomNavbar } from '@/src/shared/ui/BottomNavbar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRealtimeSignal } from '@/src/shared/contexts/RealtimeContext';
import { CatalogProduct, getGroupedProducts, GroupedProduct, ProductVariant } from '@/src/features/products/services/products.service';

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
  const [groupedProducts, setGroupedProducts] = useState<GroupedProduct[]>([]);
  const productsSignal = useRealtimeSignal('products');
  const [isLoading, setIsLoading] = useState(true);
  const tabs = useMemo(() => {
    const names = Array.from(new Set(groupedProducts.map((p) => p.category_name?.trim()).filter(Boolean) as string[]));
    return ['الكل', ...names];
  }, [groupedProducts]);
  const [activeTab, setActiveTab] = useState('الكل');
  const { user } = useAuth();
  const { addItem } = useCartActions();
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartProductName, setCartProductName] = useState<string | undefined>();
  const [cartVariantSize, setCartVariantSize] = useState<string | undefined>();
  const [cartProductPrice, setCartProductPrice] = useState<number | undefined>();

  // --- New ProductCard for Categories ---
  const CategoryProductCard = ({ group }: { group: GroupedProduct }) => {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(group.variants[0]);
    const displayPrice = `${Number.isFinite(selectedVariant.price) ? selectedVariant.price.toFixed(0) : '0'} ₪`;
    const displayImage = selectedVariant.image_url ? { uri: selectedVariant.image_url } : fallbackProductImage;

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/product-details', params: { id: selectedVariant.id } })}
        className={`w-[48%] p-3.5 mb-4 ${CARD_BASE_CLASS} min-h-[300px]`}
      >
        <View className="items-center mt-1 h-[110px] justify-center">
          <Image source={displayImage} className="w-[104px] h-[104px]" contentFit="contain" transition={200} />
        </View>

        <View className="flex-1">
          <Text className="font-tajawal-bold text-[18px] text-brand-title text-right leading-[22px] min-h-[44px] mt-2" numberOfLines={2}>
            {group.name}
          </Text>

          {/* Mini Variant Selector */}
          <View className="flex-row items-center justify-end flex-wrap gap-1 mt-2 mb-2">
            {group.variants.map((v) => (
              <TouchableOpacity
                key={v.id}
                onPress={() => setSelectedVariant(v)}
                className={`px-1.5 py-0.5 rounded border ${v.id === selectedVariant.id ? 'bg-brand-primary border-brand-primary' : 'bg-transparent border-gray-200'}`}
              >
                <Text className={`font-tajawal-bold text-[9px] ${v.id === selectedVariant.id ? 'text-white' : 'text-gray-500'}`}>
                  {v.size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row-reverse items-center justify-between mt-auto">
            <Text className="font-tajawal-bold text-[18px] text-brand-primary">{displayPrice}</Text>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-brand-primary items-center justify-center"
              onPress={() => {
                if (!user?.id) return;
                addItem(user.id, selectedVariant.id, {
                  onSuccess: () => {
                    setCartProductName(group.name);
                    setCartVariantSize(selectedVariant.size);
                    setCartProductPrice(selectedVariant.price);
                    setShowCartModal(true);
                  },
                });
              }}
            >
              <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  };
  // ------------------------------------

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getGroupedProducts();
        if (mounted) {
          setGroupedProducts(data);
        }
      } catch (error) {
        console.error('Failed to load grouped products for categories:', error);
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
  }, [productsSignal]);

  const visibleGrouped = useMemo(() => {
    const trimmedActiveTab = activeTab.trim();
    if (trimmedActiveTab === 'الكل') {
      return groupedProducts;
    }

    return groupedProducts.filter((p) => p.category_name?.trim() === trimmedActiveTab);
  }, [activeTab, groupedProducts]);

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
        left={<Feather name="menu" size={27} color="#84BD00" />}
        right={
          <NotificationBell />
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
            <ActivityIndicator color="#84BD00" size="large" />
          </View>
        ) : null}

        {!isLoading && visibleGrouped.length === 0 ? (
          <View className="px-6 mt-8">
            <Text className="font-tajawal-medium text-brand-text text-right">
              لا توجد منتجات حالياً.
            </Text>
          </View>
        ) : null}

        <View className="px-6 mt-6 flex-row flex-wrap justify-between">
          {visibleGrouped.map((group) => (
            <CategoryProductCard
              key={group.name}
              group={group}
            />
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

      <AddToCartModal
        visible={showCartModal}
        productName={cartProductName}
        variantSize={cartVariantSize}
        price={cartProductPrice}
        onContinueShopping={() => setShowCartModal(false)}
        onGoToCart={() => {
          setShowCartModal(false);
          router.push('/cart');
        }}
      />
    </SafeAreaView>
  );
}