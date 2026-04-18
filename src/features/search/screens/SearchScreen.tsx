import { useCartActions } from '@/src/features/cart/hooks/useCartActions';
import { CatalogProduct, getCatalogProducts, getGroupedProducts, GroupedProduct, ProductVariant } from '@/src/features/products/services/products.service';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AddToCartModal } from '@/src/shared/ui';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const fallbackProductImage = require('@/assets/images/mixed_nuts.png');

type SearchCard = {
  id: string;
  title: string;
  price: string;
  image: any;
};

function toSearchCard(product: CatalogProduct): SearchCard {
  return {
    id: product.id,
    title: product.name,
    price: `${Number.isFinite(product.price) ? product.price.toFixed(0) : '0'} ₪`,
    image: product.image_url ? { uri: product.image_url } : fallbackProductImage,
  };
}

// --- Dynamic Search Product Card ---
function SearchProductCard({ group, user, onAddToCart }: { group: GroupedProduct, user: any, onAddToCart: (id: string, name: string, size: string, price: number) => void }) {
    const router = useRouter();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(group.variants[0]);
    const displayPrice = `${Number.isFinite(selectedVariant.price) ? selectedVariant.price.toFixed(0) : '0'} ₪`;
    const displayImage = selectedVariant.image_url ? { uri: selectedVariant.image_url } : fallbackProductImage;

    return (
      <Pressable
        key={selectedVariant.id}
        className="w-[48.5%] mb-4 p-3 rounded-[24px] border border-[#E5E3DD] bg-[#FCFBF8] min-h-[300px]"
        onPress={() => router.push({ pathname: '/product-details', params: { id: selectedVariant.id } })}
      >
        <View className="items-center mt-1 h-[100px] justify-center">
          <Image source={displayImage} className="w-[100px] h-[100px]" contentFit="contain" transition={200} />
        </View>

        <View className="flex-1">
          <Text className="font-tajawal-bold text-[18px] text-brand-title text-right leading-[22px] min-h-[44px] mt-2" numberOfLines={2}>
            {group.name}
          </Text>

          {/* Variants */}
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
              onPress={() => onAddToCart(selectedVariant.id, group.name, selectedVariant.size, selectedVariant.price)}
            >
              <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
}
// ------------------------------------

export function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialQuery = typeof params.q === 'string' ? params.q : '';

  const { user } = useAuth();
  const { addItem } = useCartActions();
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartProductName, setCartProductName] = useState<string | undefined>();

  const [query, setQuery] = useState(initialQuery);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getGroupedProducts();
        if (mounted) {
          setGroupedProducts(data);
        }
      } catch (error) {
        console.error('Failed to load search products:', error);
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

  const visibleGrouped = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return groupedProducts.filter((p) => 
        normalized ? p.name.toLowerCase().includes(normalized) : true
    );
  }, [groupedProducts, query]);

  return (
    <>
    <SafeAreaView className="flex-1 bg-[#F5F4F0]" edges={['top']}>
      <View className="px-4 pt-2 pb-3 border-b border-[#E5E2DB] bg-white">
        <View className="flex-row-reverse items-center gap-2">
          <TouchableOpacity className="w-10 h-10 rounded-full bg-[#ECEBE9] items-center justify-center" onPress={() => router.back()}>
            <Feather name="x" size={20} color="#445047" />
          </TouchableOpacity>

          <View className="flex-1 h-12 rounded-full bg-[#ECEBE9] px-4 flex-row-reverse items-center">
            <Feather name="search" size={20} color="#8B948D" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="ابحث باسم الصنف"
              placeholderTextColor="#8B948D"
              textAlign="right"
              autoFocus
              className="flex-1 font-tajawal-medium text-[15px] text-brand-text pr-2"
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 100 }}>
        {isLoading ? (
          <View className="mt-10 items-center justify-center">
            <ActivityIndicator color="#67BB28" size="large" />
          </View>
        ) : null}

        {!isLoading && visibleGrouped.length === 0 ? (
          <View className="mt-16 items-center">
            <Ionicons name="search-outline" size={42} color="#A8ACA4" />
            <Text className="font-tajawal-bold text-[18px] text-[#4D514A] mt-3">لا توجد نتائج</Text>
            <Text className="font-tajawal-medium text-[14px] text-[#7B7F78] mt-1 text-center">
              جرّب اسم صنف آخر.
            </Text>
          </View>
        ) : null}

        <View className="flex-row flex-wrap justify-between">
          {visibleGrouped.map((group) => (
            <SearchProductCard 
                key={group.name} 
                group={group} 
                user={user} 
                onAddToCart={(id, name) => {
                    if (!user?.id) return;
                    addItem(user.id, id, {
                        onSuccess: () => {
                            setCartProductName(name);
                            setShowCartModal(true);
                        },
                    });
                }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>

    <AddToCartModal
      visible={showCartModal}
      productName={cartProductName}
      onContinueShopping={() => setShowCartModal(false)}
      onGoToCart={() => {
        setShowCartModal(false);
        router.push('/cart');
      }}
    />
    </>
  );
}
