import { useCartActions } from '@/src/features/cart/hooks/useCartActions';
import {
  CatalogProduct,
  getCatalogProducts,
  getFavoriteProducts,
  setFavoriteProduct,
} from '@/src/features/products/services/products.service';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AddToCartModal, AppHeader, BottomNavbar, NotificationBell } from '@/src/shared/ui';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FavoriteProduct, FavoriteProductCard } from '../components/FavoriteProductCard';
import { SuggestedProduct, SuggestedProductCard } from '../components/SuggestedProductCard';

const fallbackProductImage = require('@/assets/images/mixed_nuts.png');

function toFavoriteUi(product: CatalogProduct): FavoriteProduct {
  return {
    id: product.id,
    title: product.name,
    price: `${Number.isFinite(product.price) ? product.price.toFixed(0) : '0'} ₪`,
    image: product.image_url ? { uri: product.image_url } : fallbackProductImage,
    isFavorite: true,
    tag: product.description
      ? { text: product.description, bgColor: 'bg-[#CFF3D2]', textColor: 'text-brand-primary' }
      : undefined,
  };
}

function toSuggestedUi(product: CatalogProduct): SuggestedProduct {
  return {
    id: product.id,
    title: product.name,
    price: `${Number.isFinite(product.price) ? product.price.toFixed(0) : '0'} ₪`,
    image: product.image_url ? { uri: product.image_url } : fallbackProductImage,
  };
}

export function FavoritesScreen() {
  const { user, isAuthenticated } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCartActions();
  const router = useRouter();
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartProductName, setCartProductName] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user?.id) {
        if (mounted) {
          setFavoriteProducts([]);
          setSuggestedProducts([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const [favorites, catalog] = await Promise.all([
          getFavoriteProducts(user.id),
          getCatalogProducts(),
        ]);

        if (!mounted) {
          return;
        }

        const favoriteIds = new Set(favorites.map((p) => p.id));
        setFavoriteProducts(favorites.map(toFavoriteUi));
        setSuggestedProducts(catalog.filter((p) => !favoriteIds.has(p.id)).slice(0, 8).map(toSuggestedUi));
      } catch (error) {
        console.error('Failed to load favorites:', error);
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
    React.useCallback(() => {
      let mounted = true;

      const reload = async () => {
        if (!user?.id) {
          return;
        }

        try {
          const [favorites, catalog] = await Promise.all([
            getFavoriteProducts(user.id),
            getCatalogProducts(),
          ]);

          if (!mounted) {
            return;
          }

          const favoriteIds = new Set(favorites.map((p) => p.id));
          setFavoriteProducts(favorites.map(toFavoriteUi));
          setSuggestedProducts(catalog.filter((p) => !favoriteIds.has(p.id)).slice(0, 8).map(toSuggestedUi));
        } catch (error) {
          console.error('Failed to refresh favorites on focus:', error);
        }
      };

      reload();
      return () => {
        mounted = false;
      };
    }, [user?.id])
  );

  const favoriteCount = useMemo(() => favoriteProducts.length, [favoriteProducts]);

  const handleToggleFavorite = (id: string) => {
    if (!user?.id) {
      return;
    }

    setFavoriteProduct(user.id, id, false).catch((error) => {
      console.error('Failed to remove favorite:', error);
    });

    setFavoriteProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddToCart = async (productId: string, productName?: string) => {
    if (!user?.id) return;

    await addItem(user.id, productId, {
      onSuccess: () => {
        setCartProductName(productName);
        setShowCartModal(true);
      },
    });
  };
  return (
    <SafeAreaView className="flex-1 bg-brand-surface" edges={['top']}>
      {/* Top Header */}
      <AppHeader
        logo="transparent"
        withSidebar
        sidebarActiveItem="favorites"
        sidebarSide="left"
        left={<Feather name="menu" size={26} color="#84BD00" />}
        right={
          <NotificationBell />
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Title and Badge */}
        <View className="flex-row items-center justify-between px-6 mt-4 mb-6">
          <View className="bg-[#E2F2E2] px-4 py-2 rounded-full">
            <Text className="text-brand-primary font-tajawal-bold text-xs">
              {favoriteCount} منتجات
            </Text>
          </View>
          <Text className="text-[28px] font-tajawal-bold text-brand-title">المفضلة</Text>
        </View>

        {!isAuthenticated ? (
          <View className="px-6">
            <Text className="font-tajawal-medium text-brand-text text-right">
              الرجاء تسجيل الدخول لعرض منتجاتك المفضلة.
            </Text>
          </View>
        ) : null}

        {isLoading ? (
          <View className="mt-10 items-center justify-center">
            <ActivityIndicator color="#84BD00" size="large" />
          </View>
        ) : null}

        {/* Favorite Products List */}
        <View className="px-6 space-y-6">
          {favoriteProducts.map((product) => (
            <FavoriteProductCard
              key={product.id}
              product={product}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={(id) => handleAddToCart(id, product.title)}
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

      <AddToCartModal
        visible={showCartModal}
        productName={cartProductName}
        onContinueShopping={() => setShowCartModal(false)}
        onGoToCart={() => {
          setShowCartModal(false);
          router.push('/cart');
        }}
      />
    </SafeAreaView>
  );
}
