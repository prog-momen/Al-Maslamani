import { AppHeader, BottomNavbar } from '@/src/shared/ui';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart } from '@/src/shared/contexts/CartContext';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { CartItemCard } from '../components/CartItemCard';

export const CartScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { 
    items, 
    isLoading, 
    refreshCart,
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    shipping, 
    total 
  } = useCart();

  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [refreshCart])
  );

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleIncrease = async (cartItemId: string) => {
    const item = items.find((i) => i.id === cartItemId);
    if (!item) return;
    await updateQuantity(cartItemId, item.quantity + 1);
  };

  const handleDecrease = async (cartItemId: string) => {
    const item = items.find((i) => i.id === cartItemId);
    if (!item || item.quantity <= 1) return;
    await updateQuantity(cartItemId, item.quantity - 1);
  };

  const handleRemove = async (cartItemId: string) => {
    await removeFromCart(cartItemId);
  };

  const finalTotal = useMemo(() => {
    return subtotal - subtotal * discount + shipping;
  }, [subtotal, discount, shipping]);

  const applyCoupon = () => {
    if (!coupon.trim()) {
      setCouponError('ادخل كود الخصم أولاً');
      setIsCouponValid(false);
      setDiscount(0);
      return;
    }

    if (coupon.trim().toUpperCase() === 'SAVE10') {
      setDiscount(0.1);
      setIsCouponValid(true);
      setCouponError('');
    } else {
      setDiscount(0);
      setIsCouponValid(false);
      setCouponError('كود الخصم غير صالح');
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader logo="transparent" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#67BB28" />
        </View>
        <BottomNavbar activeTab="cart" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader logo="transparent" withSidebar sidebarActiveItem="cart" sidebarSide="left" left={<Feather name="menu" size={26} color="#67BB28" />}/>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerBox}>
          <Text style={styles.title}>سلة التسوق</Text>
          <Text style={styles.subtitle}>لديك {items.length} منتجات في سلتك</Text>
        </View>

        <View style={styles.itemsBox}>{items.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>السلة فارغة حالياً</Text>
            </View>
          ) : (
            items.map((item) => (
              <CartItemCard
                key={item.id}
                item={{
                    ...item,
                    image: item.image || require('@/assets/images/mixed_nuts.png')
                }}
                onIncrease={() => handleIncrease(item.id)}
                onDecrease={() => handleDecrease(item.id)}
                onRemove={() => handleRemove(item.id)}
              />
            ))
          )}
        </View>

        <View style={styles.couponBox}>
          <Text style={styles.couponTitle}>كود الخصم</Text>
          <View style={styles.couponInputContainer}>
            <TextInput style={styles.couponInput} placeholder="ادخل كود الخصم هنا" placeholderTextColor="#6B6B6B" value={coupon} onChangeText={setCoupon}/>

            <TouchableOpacity style={styles.couponButton} onPress={applyCoupon}>
              <Text style={styles.couponButtonText}>تطبيق</Text>
            </TouchableOpacity>
          </View>
          {isCouponValid && (<Text style={styles.successText}>تم تطبيق كود خصم 10%</Text>
          )}

          {couponError !== '' && (<Text style={styles.errorText}>{couponError}
            </Text>
          )}
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.row}>
            <Text style={styles.label}>المجموع الفرعي</Text>
            <Text style={styles.value}>{subtotal.toFixed(0)} ₪</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>الشحن</Text>
            <Text style={styles.value}>{shipping === 0 ? 'مجاني' : `${shipping} ₪`}</Text>
          </View>

          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>الإجمالي الكلي</Text>
            <Text style={styles.totalValue}>{finalTotal.toFixed(0)} ₪</Text>
          </View>

          <TouchableOpacity
            style={[styles.orderBtn, items.length === 0 && { opacity: 0.5 }]}
            disabled={items.length === 0}
            onPress={() =>
              router.push({
                pathname: '/checkout',
                params: {
                  subtotal: subtotal.toString(),
                  shipping: shipping.toString(),
                  discount: discount.toString(),
                  coupon: coupon,
                  finalTotal: finalTotal.toString(),
                },
              })
            }
          >
            <Text style={styles.orderText}>إتمام الطلب</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavbar activeTab="cart" />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2EFE9',
  },

  scroll: {
    paddingBottom: 200,
  },

  headerBox: {
    paddingHorizontal: 24,
    marginTop: 16,
    alignItems: 'flex-end',
    gap: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Tajawal_700Bold',
  },

  subtitle: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Tajawal_500Medium',
  },

  itemsBox: {
    paddingHorizontal: 24,
    marginTop: 24,
  },

  emptyBox: {
    alignItems: 'center',
    marginTop: 40,
  },

  emptyText: {
    fontSize: 16,
    color: '#8B948D',
    fontFamily: 'Tajawal_500Medium',
  },

  couponBox: {
    paddingHorizontal: 24,
    marginTop: 20,
  },

  couponTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10,
    fontFamily: 'Tajawal_700Bold',
  },

  couponInputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#E4E2E1',
    borderRadius: 9999,
    height: 56,
    paddingHorizontal: 10,
  },

  couponInput: {
    flex: 1,
    textAlign: 'right',
    paddingHorizontal: 16,
    fontFamily: 'Tajawal_400Regular',
  },

  couponButton: {
    backgroundColor: '#000',
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },

  couponButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Tajawal_700Bold',
  },

  successText: {
    color: 'green',
    marginTop: 8,
    textAlign: 'right',
    fontFamily: 'Tajawal_500Medium',
  },

  errorText: {
    color: 'red',
    marginTop: 8,
    textAlign: 'right',
    fontFamily: 'Tajawal_500Medium',
  },

  summaryBox: {
    backgroundColor: '#F7F3EA',
    borderRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 32,
    marginHorizontal: 24,
    marginTop: 20,
    gap: 16,
  },

  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },

  label: {
    color: '#6B6B6B',
    fontFamily: 'Tajawal_400Regular',
  },

  value: {
    color: '#000',
    fontFamily: 'Tajawal_700Bold',
  },

  divider: {
    height: 1,
    backgroundColor: '#DDD',
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Tajawal_700Bold',
  },

  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#67BB28',
    fontFamily: 'Tajawal_700Bold',
  },

  orderBtn: {
    backgroundColor: '#67BB28',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  orderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
  },
});
