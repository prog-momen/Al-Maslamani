import { useCart } from '@/src/shared/contexts/CartContext';
import { AppHeader } from '@/src/shared/ui';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckoutSteps } from '../components/CheckoutSteps';

export const CheckoutScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [address, setAddress] = useState({
    title: 'المنزل (العمل الحالي)',
    details: 'شارع رفيديا طلعة الاتصالات',
  });

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);

  const [payment, setPayment] = useState('cash');
  const { items, clearCart } = useCart();
  const vatRate = 0.15;

  const parseNumberParam = (value: string | string[] | undefined) => {
    const raw = Array.isArray(value) ? value[0] : value;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const subtotalFromContext = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const subtotal = parseNumberParam(params.subtotal) ?? subtotalFromContext;
  const shipping = parseNumberParam(params.shipping) ?? (subtotal > 50 ? 0 : 5);
  const discountRate = parseNumberParam(params.discount) ?? 0;
  const discountedSubtotal = Math.max(0, subtotal - subtotal * discountRate);

  const { vat, total } = useMemo(() => {
    const vat = discountedSubtotal * vatRate;
    const total = discountedSubtotal + shipping + vat;
    return { vat, total };
  }, [discountedSubtotal, shipping]);

  const finalTotal = total;

  const handleCheckout = () => {
  if (!address.title || !address.details) {
    alert('يرجى إدخال عنوان التوصيل');
    return;
  }

  if (payment === 'card') {
    alert('سيتم تحويلك لصفحة الدفع بالبطاقة (غير مفعلة حالياً)');
    return;
  }

  if (payment === 'ios') {
    alert('Apple Pay غير مفعّل حالياً');
    return;
  }

  const generatedOrderNumber = `#${Date.now().toString().slice(-6)}`;

  console.log({
    address,
    payment,
    total: finalTotal,
    orderNumber: generatedOrderNumber,
  });

  clearCart?.();

  router.replace({
    pathname: '/order-confirmation',
    params: {
      orderNumber: generatedOrderNumber,
      total: finalTotal.toFixed(2),
    },
  });
};


return (
   <SafeAreaView style={styles.container}>
    <AppHeader logo="transparent"
        left={
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
          >
            <Feather name="x" size={20} color="#000" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>إتمام الشراء</Text>
        </View>

        <CheckoutSteps />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>عنوان التوصيل</Text>

          <TouchableOpacity
            onPress={() => {
              setTempAddress(address);
              setIsEditingAddress(true);
            }}
          >
            <Text style={styles.editBtn}>تعديل</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addressCard}>
          <View style={styles.addressIcon}>
            <Feather name="map-pin" size={18} color="#fff" />
          </View>

          <View style={styles.addressInfo}>
            <Text style={styles.addressTitle}>{address.title}</Text>
            <Text style={styles.addressSubtitle}>
              {address.details}
            </Text>
          </View>
        </View>

        <Text style={styles.paymentTitle}>وسيلة الدفع</Text>

        <TouchableOpacity
          style={styles.paymentItem}
          onPress={() => setPayment('ios')}
        >
          <View style={styles.paymentRight}>
            <View style={styles.iconCircleIOS}>
              <Text style={styles.iosText}>IOS</Text>
            </View>
            <Text style={styles.paymentText}>Apple Pay</Text>
          </View>

          <View style={[
            styles.radio,
            payment === 'ios' && styles.radioActive
          ]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentItem}
          onPress={() => setPayment('card')}
        >
          <View style={styles.paymentRight}>
            <View style={styles.iconCircleCard}>
              <Feather name="credit-card" size={16} color="#fff" />
            </View>
            <Text style={styles.paymentText}>بطاقة ائتمان</Text>
          </View>

          <View style={[
            styles.radio,
            payment === 'card' && styles.radioActive
          ]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentItem}
          onPress={() => setPayment('cash')}
        >
          <View style={styles.paymentRight}>
            <View style={styles.iconCircleCash}>
              <Feather name="credit-card" size={16} color="#fff" />
            </View>
            <Text style={styles.paymentText}>الدفع عند الاستلام</Text>
          </View>

          <View style={[
            styles.radio,
            payment === 'cash' && styles.radioActive
          ]} />
        </TouchableOpacity>


        <View style={styles.customSummaryCard}>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>قيمة المشتريات</Text>
            <Text style={styles.summaryValue}>₪ {subtotal.toFixed(2)}</Text>
          </View>

          {discountRate > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>الخصم</Text>
              <Text style={styles.summaryValue}>- ₪ {(subtotal * discountRate).toFixed(2)}</Text>
            </View>
          ) : null}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>رسوم التوصيل</Text>
            <Text style={styles.summaryValue}>
              {shipping === 0 ? 'مجانا' : `₪ ${shipping}`}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              ضريبة القيمة المضافة (15%)
            </Text>
            <Text style={styles.summaryValue}>₪ {vat.toFixed(2)}</Text>
          </View>

          <View style={[styles.summaryRow, styles.summaryDivider]}>
            <Text style={styles.summaryTotalLabel}>الإجمالي</Text>
            <Text style={styles.summaryTotalValue}>
              ₪ {finalTotal.toFixed(2)}
            </Text>
          </View>

        </View>

      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.button} onPress={handleCheckout}>
          <Text style={styles.buttonText}>تأكيد الطلب</Text>
        </TouchableOpacity>
        <Text style={styles.agreementText}> بالمتابعة، أنت توافق على شروط و أحكام سعد المسلماني</Text>
      </View>

      {isEditingAddress && (
        <View style={styles.modal}>
          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>تعديل العنوان</Text>

            <TextInput
              style={styles.input}
              value={tempAddress.title}
              onChangeText={(t) =>
                setTempAddress({ ...tempAddress, title: t })
              }
            />

            <TextInput
              style={styles.input}
              value={tempAddress.details}
              onChangeText={(t) =>
                setTempAddress({ ...tempAddress, details: t })
              }
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => {
                setAddress(tempAddress);
                setIsEditingAddress(false);
              }}
            >
              <Text style={{ color: '#fff' }}>حفظ</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsEditingAddress(false)}>
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2EFE9' },
  scroll: { padding: 24, paddingBottom: 120 },

  headerTitleBox: { alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#67BB28' },

  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2EFE9',
  },

  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },

  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  editBtn: { color: '#67BB28', fontWeight: '600' },

  addressCard: {
    flexDirection: 'row-reverse',
    backgroundColor: '#F7F3EA',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },

  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#67BB28',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  addressInfo: { flex: 1, alignItems: 'flex-end' },
  addressTitle: { fontSize: 14, fontWeight: 'bold' },
  addressSubtitle: { fontSize: 12, color: '#6B6B6B', marginTop: 4 },

  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'right',
  },

  paymentItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F3EA',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },

  paymentRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },

  iconCircleIOS: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#3B2A86',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iosText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  iconCircleCard: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#C2185B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconCircleCash: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#B5B5B5',
  },

  radioActive: {
    borderColor: '#67BB28',
    backgroundColor: '#67BB28',
  },

  customSummaryCard: {
    backgroundColor: '#F7F3EA',
    borderRadius: 32,
    padding: 24,
    marginTop: 16,
    gap: 12,
  },

  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    fontSize: 13,
    fontWeight: '300',
  },

  summaryValue: {
    fontSize: 13,
  },

  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
    marginTop: 6,
  },

  summaryTotalLabel: {
    fontWeight: 'bold',
  },

  summaryTotalValue: {
    fontWeight: 'bold',
    color: '#67BB28',
  },

  bottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
  },

  button: {
    backgroundColor: '#67BB28',
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
  },

  buttonText: { color: '#fff', fontWeight: 'bold' },

  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    textAlign: 'right',
  },

  saveBtn: {
    backgroundColor: '#67BB28',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  cancelText: {
    textAlign: 'center',
    marginTop: 10,
    color: 'red',
  },
  agreementText: {
  textAlign: 'center',
  color: '#333333',
  fontSize: 12,
  marginTop: 10,
  paddingHorizontal: 10,
  lineHeight: 18,
},
});
