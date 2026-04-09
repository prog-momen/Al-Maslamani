import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoriteProduct, FavoriteProductCard } from '../components/FavoriteProductCard';
import { SuggestedProduct, SuggestedProductCard } from '../components/SuggestedProductCard';

export function FavoritesScreen() {
  const router = useRouter();

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
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2 bg-brand-surface">
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Feather name="menu" size={24} color="#67BB28" />
        </TouchableOpacity>
        
        <Image
          source={require('@/assets/images/logo-transparent.png')}
          className="w-56 h-20"
          contentFit="contain"
          transition={200}
        />

        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Feather name="search" size={24} color="#67BB28" />
        </TouchableOpacity>
      </View>

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

      {/* Custom Bottom Navbar */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#F9F9F9] rounded-t-[36px] flex-row justify-between items-end pb-8 pt-5 px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-gray-100">
        <TouchableOpacity className="items-center" onPress={() => router.replace('/home')}>
          <Ionicons name="home-outline" size={24} color="#A3A3A3" />
          <Text className="text-[#A3A3A3] text-[11px] font-tajawal-bold mt-1.5">الرئيسية</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <Feather name="grid" size={22} color="#A3A3A3" />
          <Text className="text-[#A3A3A3] text-[11px] font-tajawal-bold mt-1.5">الفئات</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center relative">
          <Ionicons name="cart-outline" size={26} color="#A3A3A3" />
          <Text className="text-[#A3A3A3] text-[11px] font-tajawal-bold mt-1.5">السلة</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center -mt-2">
          <View className="w-14 h-14 bg-brand-primary rounded-full justify-center items-center -top-2">
            <Ionicons name="heart" size={24} color="white" />
          </View>
          <Text className="text-brand-primary text-[11px] font-tajawal-bold -mt-1">المفضلة</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <Feather name="user" size={24} color="#A3A3A3" />
          <Text className="text-[#A3A3A3] text-[11px] font-tajawal-bold mt-1.5">حسابي</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
