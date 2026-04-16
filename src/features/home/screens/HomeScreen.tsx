import { useCartActions } from '@/src/features/cart/hooks/useCartActions';
import { CatalogProduct, getCatalogProducts, getFavoriteProductIds, setFavoriteProduct } from '@/src/features/products/services/products.service';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader, CARD_BASE_CLASS } from '@/src/shared/ui';
import { BottomNavbar } from '@/src/shared/ui/BottomNavbar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Product = {
  id: string;
  title: string;
  price: string;
  image: any;
  badge?: { text: string; bgClass: string; textClass: string };
};

const fallbackProductImage = require('@/assets/images/mixed_nuts.png');

function toUiProduct(product: CatalogProduct): Product {
  const roundedPrice = Number.isFinite(product.price) ? product.price.toFixed(0) : '0';
  return {
    id: product.id,
    title: product.name,
    price: `${roundedPrice} ₪`,
    image: product.image_url ? { uri: product.image_url } : fallbackProductImage,
    badge: product.description
      ? { text: product.description, bgClass: 'bg-[#CFF3D2]', textClass: 'text-brand-primary' }
      : undefined,
  };
}

export function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCartActions();

  const categoryTabs = useMemo(() => {
    const names = Array.from(new Set(products.map((p) => p.category_name).filter(Boolean) as string[]));
    return ['الكل', ...names];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState('الكل');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [data, userFavoriteIds] = await Promise.all([
          getCatalogProducts(),
          user?.id ? getFavoriteProductIds(user.id) : Promise.resolve([]),
        ]);

        if (mounted) {
          setProducts(data);
          setFavoriteIds(new Set(userFavoriteIds));
        }
      } catch (error) {
        console.error('Failed to load products for home:', error);
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
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const refreshFavorites = async () => {
        if (!user?.id) {
          if (active) {
            setFavoriteIds(new Set());
          }
          return;
        }

        try {
          const ids = await getFavoriteProductIds(user.id);
          if (active) {
            setFavoriteIds(new Set(ids));
          }
        } catch (error) {
          console.error('Failed to refresh favorites on home focus:', error);
        }
      };

      refreshFavorites();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  const handleToggleFavorite = (productId: string) => {
    if (!user?.id) {
      return;
    }

    const isAlreadyFavorite = favoriteIds.has(productId);
    const nextSet = new Set(favoriteIds);

    if (isAlreadyFavorite) {
      nextSet.delete(productId);
    } else {
      nextSet.add(productId);
    }

    setFavoriteIds(nextSet);

    setFavoriteProduct(user.id, productId, !isAlreadyFavorite).catch((error) => {
      console.error('Failed to toggle favorite from home:', error);
      setFavoriteIds(new Set(favoriteIds));
    });
  };

  const visibleProducts = useMemo(() => {
    if (activeCategory === 'الكل') {
      return products.map(toUiProduct);
    }

    return products
      .filter((product) => product.category_name === activeCategory)
      .map(toUiProduct);
  }, [activeCategory, products]);

  useEffect(() => {
    if (!categoryTabs.includes(activeCategory)) {
      setActiveCategory('الكل');
    }
  }, [activeCategory, categoryTabs]);

  return (
    <SafeAreaView className="flex-1 bg-brand-surface" edges={['top']}>
      <AppHeader
        logo="transparent"
        withSidebar
        sidebarActiveItem="home"
        sidebarSide="left"
        left={<Feather name="menu" size={27} color="#67BB28" />}
        right={
          <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={() => router.push('/contact-us')}>
            <Ionicons name="help-circle-outline" size={28} color="#67BB28" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 mt-2">
          <View className="h-12 rounded-full bg-[#ECEBE9] px-4 flex-row-reverse items-center justify-between">
            <Feather name="search" size={22} color="#8B948D" />
            <TextInput
              placeholder="ابحث عن المكسرات، البزورات، أو الوجبات الخفيفة..."
              placeholderTextColor="#8B948D"
              textAlign="right"
              className="flex-1 font-tajawal-medium text-[14px] text-brand-text pr-2"
            />
          </View>
        </View>

        <View className="px-6 mt-8 flex-row-reverse items-center justify-between">
          <Text className="font-tajawal-bold text-[32px] text-brand-title">التصنيفات</Text>
          <Pressable onPress={() => router.push('/categories')}>
            <Text className="font-tajawal-bold text-[22px] text-brand-primary">عرض الكل</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ direction: 'rtl' }}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 10, marginTop: 14 }}
        >
          {categoryTabs.map((category) => {
            const isActive = category === activeCategory;
            return (
              <TouchableOpacity
                key={category}
                className={`px-5 py-2 rounded-full ${isActive ? 'bg-brand-primary' : 'bg-[#E8E8E8]'}`}
                onPress={() => setActiveCategory(category)}
              >
                <Text className={`font-tajawal-bold text-[18px] ${isActive ? 'text-white' : 'text-[#5D645F]'}`}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View className="px-6 mt-8">
          <View className="rounded-[24px] overflow-hidden h-[190px] relative">
            <Image source={require('@/assets/images/hero-products.png')} className="w-full h-full" contentFit="cover" transition={200} />

            <View className="absolute right-4 top-4 bg-[#C53673] px-3 py-1 rounded-full">
              <Text className="font-tajawal-bold text-[13px] text-white">عرض خاص</Text>
            </View>

            <View className="absolute right-4 bottom-4 items-end">
              <Text className="font-tajawal-bold text-[26px] leading-[28px] text-white">خصم %30</Text>
              <Text className="font-tajawal-medium text-[14px] text-[#ECECEC] text-right leading-5 mt-1">
                على تشكيلة مختارة من
              </Text>
              <Text className="font-tajawal-medium text-[14px] text-[#ECECEC] text-right leading-5 mb-2">
                المكسرات المحمصة الطازجة
              </Text>
              <TouchableOpacity className="bg-[#F8F6EE] px-4 py-1.5 rounded-full">
                <Text className="font-tajawal-bold text-[17px] text-brand-primary">اطلب الآن</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-6 mt-8 flex-row-reverse items-center justify-between">
          <Text className="font-tajawal-bold text-[32px] text-brand-title">المنتجات الأكثر طلباً</Text>
          <TouchableOpacity className="bg-brand-primary px-5 py-2 rounded-full">
            <Text className="font-tajawal-bold text-[17px] text-white">مشاهدة الكل</Text>
          </TouchableOpacity>
        </View>

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
              className={`w-[48%] mb-4 p-3 relative overflow-hidden ${CARD_BASE_CLASS}`}
              onPress={() => router.push({ pathname: '/product-details', params: { id: product.id } })}
            >
              <View className="items-center">
                <Image source={product.image} className="w-[104px] h-[104px]" contentFit="contain" transition={200} />
              </View>

              <Pressable
                className="absolute top-1 left-1 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
                onPress={(event) => {
                  event.stopPropagation();
                  handleToggleFavorite(product.id);
                }}
              >
                <Ionicons name={favoriteIds.has(product.id) ? 'heart' : 'heart-outline'} size={24} color={favoriteIds.has(product.id) ? '#E53935' : '#67BB28'} />
              </Pressable>

              <View className="mt-2 items-end">
                {product.badge ? (
                  <View className={`${product.badge.bgClass} px-3 py-1 rounded-full self-end mb-2`}>
                    <Text className={`${product.badge.textClass} font-tajawal-bold text-[11px]`}>{product.badge.text}</Text>
                  </View>
                ) : null}
                <Text className="font-tajawal-bold text-[20px] text-brand-title text-right leading-[24px] min-h-[48px]">
                  {product.title}
                </Text>
                <Text className="font-tajawal-bold text-[20px] text-brand-primary mt-1">{product.price}</Text>
              </View>

              <TouchableOpacity
  className="absolute bottom-1 left-1 w-12 h-12 rounded-full bg-brand-primary items-center justify-center"
  onPress={() => {
    if (!user?.id) return;

    addItem(user.id, product.id);
  }}
>
  <Feather name="plus" size={28} color="white" />
</TouchableOpacity>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <BottomNavbar activeTab="home" />
    </SafeAreaView>
  );
}