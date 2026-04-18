import { useCartActions } from '@/src/features/cart/hooks/useCartActions';
import { CatalogProduct, getCatalogProducts } from '@/src/features/products/services/products.service';
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

export function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialQuery = typeof params.q === 'string' ? params.q : '';

  const { user } = useAuth();
  const { addItem } = useCartActions();
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartProductName, setCartProductName] = useState<string | undefined>();

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getCatalogProducts();
        if (mounted) {
          setProducts(data);
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

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return products
      .filter((product) => (normalized ? product.name.toLowerCase().includes(normalized) : true))
      .map(toSearchCard);
  }, [products, query]);

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

        {!isLoading && visibleProducts.length === 0 ? (
          <View className="mt-16 items-center">
            <Ionicons name="search-outline" size={42} color="#A8ACA4" />
            <Text className="font-tajawal-bold text-[18px] text-[#4D514A] mt-3">لا توجد نتائج</Text>
            <Text className="font-tajawal-medium text-[14px] text-[#7B7F78] mt-1 text-center">
              جرّب اسم صنف آخر.
            </Text>
          </View>
        ) : null}

        <View className="flex-row flex-wrap justify-between">
          {visibleProducts.map((product) => (
            <Pressable
              key={product.id}
              className="w-[48.5%] mb-4 p-3 rounded-[24px] border border-[#E5E3DD] bg-[#FCFBF8]"
              onPress={() => router.push({ pathname: '/product-details', params: { id: product.id } })}
            >
              <View className="items-center mt-1">
                <Image source={product.image} className="w-[100px] h-[100px]" contentFit="contain" transition={200} />
              </View>

              <Text className="font-tajawal-bold text-[20px] text-brand-title text-right leading-[24px] min-h-[48px] mt-2">
                {product.title}
              </Text>

              <View className="flex-row-reverse items-center justify-between mt-3">
                <Text className="font-tajawal-bold text-[20px] text-brand-primary">{product.price}</Text>
                <TouchableOpacity
                  className="w-11 h-11 rounded-full bg-brand-primary items-center justify-center"
                  onPress={() => {
                    if (!user?.id) {
                      return;
                    }

                    addItem(user.id, product.id, {
                      onSuccess: () => {
                        setCartProductName(product.title);
                        setShowCartModal(true);
                      },
                    });
                  }}
                >
                  <Feather name="plus" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </Pressable>
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
