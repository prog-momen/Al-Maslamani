import { useCartActions } from '@/src/features/cart/hooks/useCartActions';
import { AdminProduct, getAdminProducts, getCategories, CategoryOption, CatalogProduct, getCatalogProducts, getFavoriteProductIds, getGroupedProducts, GroupedProduct, ProductVariant, setFavoriteProduct } from '@/src/features/products/services/products.service';
import { useRealtimeSignal } from '@/src/shared/contexts/RealtimeContext';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AddToCartModal, AppHeader, CARD_BASE_CLASS, NotificationBell } from '@/src/shared/ui';
import { AdminProductGroupModal } from '../../admin-dashboard/components/AdminProductGroupModal';
import { BottomNavbar } from '@/src/shared/ui/BottomNavbar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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

// --- New ProductCard Component ---
type ProductCardProps = {
  group: GroupedProduct;
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (id: string, name: string, size: string, price: number) => void;
  isAdmin?: boolean;
  onEdit?: (variant: ProductVariant, groupName: string) => void;
};

function ProductCard({ group, favoriteIds, onToggleFavorite, onAddToCart, isAdmin, onEdit }: ProductCardProps) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(group.variants[0]);

  const displayPrice = `${Number.isFinite(selectedVariant.price) ? selectedVariant.price.toFixed(0) : '0'} ₪`;
  const displayImage = selectedVariant.image_url ? { uri: selectedVariant.image_url } : fallbackProductImage;
  const isFavorite = favoriteIds.has(selectedVariant.id);

  return (
    <Pressable
      className={`w-[48.5%] mb-6 p-3 relative overflow-hidden ${CARD_BASE_CLASS} min-h-[300px]`}
      onPress={() => router.push({ pathname: '/product-details', params: { id: selectedVariant.id } })}
    >
      <View className="items-center h-[110px] justify-center">
        <Image source={displayImage} className="w-[104px] h-[104px]" contentFit="contain" transition={200} />
      </View>

      <Pressable
        className="absolute top-2 left-2 w-9 h-9 bg-white/80 rounded-full items-center justify-center shadow-sm z-10"
        onPress={(event) => {
          event.stopPropagation();
          onToggleFavorite(selectedVariant.id);
        }}
      >
        <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#E53935' : '#84BD00'} />
      </Pressable>

      {isAdmin && (
        <Pressable
          className="absolute top-2 right-2 w-9 h-9 bg-brand-primary rounded-full items-center justify-center shadow-sm z-10"
          onPress={(event) => {
            event.stopPropagation();
            onEdit?.(selectedVariant, group.name);
          }}
        >
          <Feather name="edit-2" size={16} color="white" />
        </Pressable>
      )}

      <View className="mt-3 items-end flex-1">
        <Text className="font-tajawal-bold text-[18px] text-brand-title text-right leading-[22px] min-h-[44px]" numberOfLines={2}>
          {group.name}
        </Text>

        {/* Variant Selector */}
        <View className="flex-row items-center justify-end flex-wrap gap-1.5 mt-2 mb-3 w-full">
          {group.variants.map((v) => {
            const isSel = v.id === selectedVariant.id;
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => setSelectedVariant(v)}
                className={`px-2 py-1 rounded-md border ${isSel ? 'bg-brand-primary border-brand-primary' : 'bg-transparent border-gray-200'}`}
              >
                <Text className={`font-tajawal-bold text-[10px] ${isSel ? 'text-white' : 'text-gray-500'}`}>
                  {v.size}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row items-center justify-between w-full mt-auto">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-brand-primary items-center justify-center"
            onPress={() => onAddToCart(selectedVariant.id, group.name, selectedVariant.size, selectedVariant.price)}
          >
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
          <Text className="font-tajawal-bold text-[18px] text-brand-primary">{displayPrice}</Text>
        </View>
      </View>
    </Pressable>
  );
}
// ---------------------------------

export function HomeScreen() {
  const router = useRouter();
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProduct[]>([]);
  const productsSignal = useRealtimeSignal('products');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedAdminGroup, setSelectedAdminGroup] = useState<{ name: string, variants: AdminProduct[] } | null>(null);

  const { addItem } = useCartActions();
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartProductName, setCartProductName] = useState<string | undefined>();
  const [cartVariantSize, setCartVariantSize] = useState<string | undefined>();
  const [cartProductPrice, setCartProductPrice] = useState<number | undefined>();

  const categoryTabs = useMemo(() => {
    const names = Array.from(new Set(products.map((p) => p.category_name?.trim()).filter(Boolean) as string[]));
    return ['الكل', ...names];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState('الكل');

  const loadData = useCallback(async () => {
    try {
      const [data, grouped, userFavoriteIds] = await Promise.all([
        getCatalogProducts(),
        getGroupedProducts(),
        user?.id ? getFavoriteProductIds(user.id) : Promise.resolve([]),
      ]);

      setProducts(data);
      setGroupedProducts(grouped);
      setFavoriteIds(new Set(userFavoriteIds));

      if (isAdmin) {
        const [aProds, cats] = await Promise.all([getAdminProducts(), getCategories()]);
        setAdminProducts(aProds);
        setCategories(cats);
      }
    } catch (error) {
      console.error('Failed to load home screen data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData, productsSignal]);

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

  const handleEditGroup = (groupName: string) => {
    const groupVariants = adminProducts.filter(p => p.name === groupName);
    setSelectedAdminGroup({ name: groupName, variants: groupVariants });
  };

  const visibleGrouped = useMemo(() => {
    if (activeCategory === 'الكل') {
      return groupedProducts;
    }

    return groupedProducts.filter((p) => p.category_name === activeCategory);
  }, [activeCategory, groupedProducts]);

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
        left={<Feather name="menu" size={27} color="#84BD00" />}
        right={
          <View className="flex-row items-center gap-3">
            {isAdmin && (
              <TouchableOpacity
                className="w-10 h-10 bg-brand-primary rounded-full items-center justify-center"
                onPress={() => setSelectedAdminGroup({ name: '', variants: [] })}
              >
                <Ionicons name="add" size={26} color="white" />
              </TouchableOpacity>
            )}
            <NotificationBell />
          </View>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 mt-2">
          <TouchableOpacity
            className="h-12 rounded-full bg-[#ECEBE9] px-4 flex-row-reverse items-center justify-between"
            activeOpacity={0.8}
            onPress={() => router.push('/search')}
          >
            <Feather name="search" size={22} color="#8B948D" />
            <Text className="flex-1 font-tajawal-medium text-[14px] text-[#8B948D] pr-2 text-right">
              ابحث عن المكسرات، البزورات، أو الوجبات الخفيفة...
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-6 mt-8 flex-row-reverse items-center justify-between gap-3">
          <Text className="font-tajawal-bold text-[30px] text-brand-title flex-1 text-right">التصنيفات</Text>
          <Pressable onPress={() => router.push('/categories')}>
            <Text className="font-tajawal-bold text-[18px] text-brand-primary">عرض الكل</Text>
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

        <View className="px-6 mt-8 flex-row-reverse items-center justify-between gap-3">
          <Text className="font-tajawal-bold text-[30px] text-brand-title flex-1 text-right">المنتجات الأكثر طلباً</Text>
          <TouchableOpacity className="bg-brand-primary px-4 py-2 rounded-full self-center">
            <Text className="font-tajawal-bold text-[15px] text-white">مشاهدة الكل</Text>
          </TouchableOpacity>
        </View>

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

        <View className="px-5 mt-6 flex-row flex-wrap justify-between">
          {visibleGrouped.map((group) => (
            <ProductCard
              key={group.name}
              group={group}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              isAdmin={isAdmin}
              onEdit={(v, name) => handleEditGroup(name)}
              onAddToCart={(id, name, size, price) => {
                addItem(user?.id, id, {
                  onSuccess: () => {
                    setCartProductName(name);
                    setCartVariantSize(size);
                    setCartProductPrice(price);
                    setShowCartModal(true);
                  }
                });
              }}
            />
          ))}
        </View>
      </ScrollView>

      <BottomNavbar activeTab="home" />

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

      {selectedAdminGroup && (
        <AdminProductGroupModal
          visible={!!selectedAdminGroup}
          onClose={() => setSelectedAdminGroup(null)}
          groupName={selectedAdminGroup.name}
          variants={selectedAdminGroup.variants}
          categories={categories}
          onRefresh={loadData}
        />
      )}
    </SafeAreaView>
  );
}