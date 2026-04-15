import { AppHeader, BottomNavbar } from '@/src/shared/ui';
import { Feather } from '@expo/vector-icons';
import { useMemo, useState, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '@/src/shared/hooks/useAuth';
import { CartItemCard } from '../components/CartItemCard';
import { getCartItems, updateQuantity, removeItem } from '../services/cart.service';

export const CartScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [couponError, setCouponError] = useState('');
  const loadCart = async () => {
    if (!user?.id) return;
    const data = await getCartItems(user.id);
    const formatted = data.map((i: any) => ({
      id: i.id, title: i.product.name, price: i.product.price, image: i.product.image_url ? { uri: i.product.image_url } : require('@/assets/images/mixed_nuts.png'), quantity: i.quantity,
    }));

    setItems(formatted);
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [user?.id])
  );

  const handleIncrease = async (id: string) => {
    const item = items.find((i: any) => i.id === id);
    if (!item) return;

    await updateQuantity(id, item.quantity + 1);
    loadCart();
  };

  const handleDecrease = async (id: string) => {
    const item = items.find((i: any) => i.id === id);
    if (!item || item.quantity <= 1) return;

    await updateQuantity(id, item.quantity - 1);
    loadCart();
  };

  const handleRemove = async (id: string) => {
    await removeItem(id);
    loadCart();
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0
    );
  }, [items]);

  const shipping = subtotal > 50 ? 0 : 5;

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
            items.map((item: any) => (
              <CartItemCard
                key={item.id}
                item={item}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
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
            <Text style={styles.value}>{subtotal} ₪</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>الشحن</Text>
            <Text style={styles.value}>{shipping === 0 ? 'مجاني' : `${shipping} ₪`}</Text>
          </View>

          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>الإجمالي الكلي</Text>
            <Text style={styles.totalValue}>{finalTotal} ₪</Text>
          </View>

          <TouchableOpacity style={styles.orderBtn} onPress={() => router.push({ pathname: '/checkout', params: {
            discount: discount.toString(), coupon: coupon,},})}>

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
  },

  subtitle: {
    fontSize: 16,
    color: '#333',
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
  },

  successText: {
    color: 'green',
    marginTop: 8,
    textAlign: 'right',
  },

  errorText: {
    color: 'red',
    marginTop: 8,
    textAlign: 'right',
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
  },

  value: {
    color: '#000',
  },

  divider: {
    height: 1,
    backgroundColor: '#DDD',
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
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
  },
});
