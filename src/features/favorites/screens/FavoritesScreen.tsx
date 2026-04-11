import { AppHeader, BottomNavbar } from '@/src/shared/ui';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoriteProduct, FavoriteProductCard } from '../components/FavoriteProductCard';
import { SuggestedProduct, SuggestedProductCard } from '../components/SuggestedProductCard';

export function FavoritesScreen() {
  // Mock Data
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([
    {
      id: '1',
      title: 'قضامة',
      price: '00₪',
      image: require('@/assets/images/chickpeas.png'),
      isFavorite: true,
      tag: { text: 'عضوي', bgColor: 'bg-[#CFF3D2]', textColor: 'text-brand-primary' },
    },
    {
      id: '2',
      title: 'مخلوطة محمصة\nاكسترا مبهرة',
      price: '00₪',
      image: require('@/assets/images/mixed_nuts.png'),
      isFavorite: true,
      tag: { text: 'الأكثر مبيعاً', bgColor: 'bg-[#F9C3D9]', textColor: 'text-[#D81B60]' },
    },
    {
      id: '3',
      title: 'ذرة محمصة',
      price: '00₪',
      image: require('@/assets/images/corn.png'),
      isFavorite: true,
      tag: { text: 'خلطة سرية', bgColor: 'bg-[#CFF3D2]', textColor: 'text-brand-primary' },
    },
  ]);

  const suggestedProducts: SuggestedProduct[] = [
    {
      id: '4',
      title: 'بيكان محمص',
      price: '00₪',
      image: require('@/assets/images/pecan.png'),
    },
    {
      id: '5',
      title: 'مقرمشات الأرز',
      price: '00₪',
      image: require('@/assets/images/rice_crispies.png'),
    },
  ];

  const handleToggleFavorite = (id: string) => {
    setFavoriteProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const handleAddToCart = (id: string) => {
    console.log('Added to cart:', id);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-surface" edges={['top']}>
      {/* Top Header */}
      <AppHeader
        logo="transparent"
        left={
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Feather name="menu" size={24} color="#67BB28" />
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Feather name="search" size={24} color="#67BB28" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Title and Badge */}
        <View className="flex-row items-center justify-between px-6 mt-4 mb-6">
          <View className="bg-[#E2F2E2] px-4 py-2 rounded-full">
            <Text className="text-brand-primary font-tajawal-bold text-xs">
              {favoriteProducts.filter(p => p.isFavorite).length} منتجات
            </Text>
          </View>
          <Text className="text-[28px] font-tajawal-bold text-brand-title">المفضلة</Text>
        </View>

        {/* Favorite Products List */}
        <View className="px-6 space-y-6">
          {favoriteProducts.map((product) => (
            <FavoriteProductCard
              key={product.id}
              product={product}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={handleAddToCart}
            />
          ))}
        </View>

        {/* Suggested horizontal list */}
        <View className="mt-8 mb-6">
          <Text className="font-tajawal-bold text-brand-title text-[20px] text-right px-6 mb-6">
            قد يعجبك أيضاً
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24, paddingLeft: 8, gap: 16 }}
            style={{ direction: 'rtl' }}
          >
            {suggestedProducts.map((product) => (
              <SuggestedProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <BottomNavbar activeTab="favorites" />
    </SafeAreaView>
  );
}
