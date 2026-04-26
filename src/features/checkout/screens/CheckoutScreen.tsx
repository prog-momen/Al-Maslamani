import { supabase } from '@/src/lib/supabase/client';
import { useCart } from '@/src/shared/contexts/CartContext';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader } from '@/src/shared/ui';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatOrderNumber, placeOrderFromCart } from '../../orders/services/orders.service';
import { CheckoutSteps } from '../components/CheckoutSteps';

const PRIMARY_GREEN = '#84BD00';

const sb = supabase as any;

type SavedAddress = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  city: string;
  street: string;
  building: string | null;
  notes: string | null;
  is_default: boolean;
};

type SavedPhone = {
  id: string;
  phone: string;
  is_default?: boolean;
};

export const CheckoutScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const defaultContactPhone =
    (typeof user?.user_metadata?.phone === 'string' ? user.user_metadata.phone : '') ||
    (typeof user?.phone === 'string' ? user.phone : '');

  // Detailed Address State
  const [addressDetails, setAddressDetails] = useState({
    city: '',
    street: '',
    building: '',
    notes: '',
  });
  const [contactPhone, setContactPhone] = useState(defaultContactPhone);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [savedPhones, setSavedPhones] = useState<SavedPhone[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);

  const [payment, setPayment] = useState('cash');
  const [deliveryTiming, setDeliveryTiming] = useState<'asap' | 'normal_24'>('asap');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isLoadingPhones, setIsLoadingPhones] = useState(false);
  const vatRate = 0.15;

  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!user?.id) {
        setSavedAddresses([]);
        setSelectedAddressId(null);
        return;
      }

      setIsLoadingAddresses(true);
      try {
        const { data, error } = await sb
          .from('addresses')
          .select('id,label,full_name,phone,city,street,building,notes,is_default')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;

        const rows = (data || []) as SavedAddress[];
        setSavedAddresses(rows);

        if (rows.length > 0) {
          const preferred = rows[0];
          setSelectedAddressId(preferred.id);
          setAddressDetails({
            city: preferred.city || '',
            street: preferred.street || '',
            building: preferred.building || '',
            notes: preferred.notes || '',
          });
        }
      } catch (error) {
        console.error('Failed to load saved addresses for checkout:', error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    const loadSavedPhones = async () => {
      if (!user?.id) {
        setSavedPhones([]);
        setSelectedPhoneId(null);
        return;
      }

      setIsLoadingPhones(true);
      try {
        const { data, error } = await sb
          .from('user_contact_phones')
          .select('id,phone,is_default')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;

        const rows = (data || []) as SavedPhone[];
        if (defaultContactPhone.trim() && !rows.some((item) => item.phone === defaultContactPhone.trim())) {
          rows.push({ id: 'profile-phone', phone: defaultContactPhone.trim(), is_default: false });
        }

        setSavedPhones(rows);

        const preferredPhone = rows.find((item) => item.is_default)?.phone || rows[0]?.phone || defaultContactPhone;
        if (preferredPhone) {
          setContactPhone(preferredPhone);
          const preferredEntry = rows.find((item) => item.phone === preferredPhone);
          setSelectedPhoneId(preferredEntry?.id || null);
        }
      } catch (error) {
        console.error('Failed to load saved phones for checkout:', error);
      } finally {
        setIsLoadingPhones(false);
      }
    };

    loadSavedAddresses();
    loadSavedPhones();
  }, [user?.id]);

  const handleSelectSavedAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setAddressDetails({
      city: address.city || '',
      street: address.street || '',
      building: address.building || '',
      notes: address.notes || '',
    });
  };

  const handleSelectSavedPhone = (savedPhone: SavedPhone) => {
    setSelectedPhoneId(savedPhone.id);
    setContactPhone(savedPhone.phone);
  };

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

  const handleCheckout = async () => {
    if (!addressDetails.city || !addressDetails.street) {
      Alert.alert('تنبيه', 'يرجى إدخال تفاصيل العنوان (المدينة والشارع على الأقل)');
      return;
    }

    if (!contactPhone.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال رقم التواصل للطلبية');
      return;
    }

    if (!/^059\d{7}$/.test(contactPhone.trim())) {
      Alert.alert('تنبيه', 'رقم التواصل يجب أن يكون 10 أرقام ويبدأ بـ 059');
      return;
    }

    if (payment === 'card') {
      Alert.alert('تنبيه', 'الدفع بالبطاقة غير متوفر حالياً، يرجى اختيار الدفع عند الاستلام');
      return;
    }

    if (!user?.id) {
      router.replace('/(auth)/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedAddress = savedAddresses.find((item) => item.id === selectedAddressId);
      const timingLabel = deliveryTiming === 'asap' ? 'الاستلام: بأسرع وقت' : 'الاستلام: عادي خلال 24 ساعة';
      const combinedNote = [addressDetails.notes?.trim(), timingLabel].filter(Boolean).join(' | ');

      // Format the detailed address for the database
      const formattedAddress = `المدينة: ${addressDetails.city}, شارع: ${addressDetails.street}${addressDetails.building ? `, بناية: ${addressDetails.building}` : ''}`;

      const { orderId } = await placeOrderFromCart({
        addressLabel: selectedAddress?.label || 'طلب جديد',
        addressDetails: formattedAddress,
        contactPhone: contactPhone.trim(),
        paymentMethod: 'cash_on_delivery',
        deliveryFee: shipping,
        note: combinedNote || undefined
      });

      clearCart?.();

      router.replace({
        pathname: '/order-confirmation',
        params: {
          orderId,
          orderNumber: formatOrderNumber(orderId),
          orderStatus: 'pending',
          currentStep: '0',
          total: total.toFixed(2),
        },
      });
    } catch (error: any) {
      console.error('Failed to place order:', error);
      Alert.alert('فشل إرسال الطلب', error.message || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        logo="transparent"
        left={
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
          >
            <Feather name="x" size={20} color="#000" />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>إتمام الشراء</Text>
          </View>

          <CheckoutSteps />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>بيانات العنوان</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.savedHeaderRow}>
              <TouchableOpacity onPress={() => router.push('/addresses')}>
                <Text style={styles.manageAddressesText}>إدارة العناوين</Text>
              </TouchableOpacity>
              <Text style={styles.inputLabel}>العناوين المحفوظة</Text>
            </View>

            {isLoadingAddresses ? (
              <Text style={styles.savedAddressHint}>جاري تحميل العناوين...</Text>
            ) : savedAddresses.length === 0 ? (
              <Text style={styles.savedAddressHint}>لا يوجد عناوين محفوظة. يمكنك الإضافة من صفحة العناوين.</Text>
            ) : (
              <View style={styles.savedAddressList}>
                {savedAddresses.map((address) => {
                  const isSelected = selectedAddressId === address.id;
                  return (
                    <TouchableOpacity
                      key={address.id}
                      style={[styles.savedAddressCard, isSelected && styles.savedAddressCardActive]}
                      onPress={() => handleSelectSavedAddress(address)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.savedAddressTitle}>{address.label}</Text>
                      <Text style={styles.savedAddressLine}>{address.city}، {address.street}{address.building ? `، ${address.building}` : ''}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.savedHeaderRow}>
              <TouchableOpacity onPress={() => router.push('/contact-phones')}>
                <Text style={styles.manageAddressesText}>تحديث الأرقام</Text>
              </TouchableOpacity>
              <Text style={styles.inputLabel}>الأرقام المحفوظة</Text>
            </View>

            {isLoadingPhones ? (
              <Text style={styles.savedAddressHint}>جاري تحميل الأرقام...</Text>
            ) : savedPhones.length === 0 ? (
              <Text style={styles.savedAddressHint}>لا يوجد أرقام محفوظة. يمكنك إضافتها من صفحة أرقام التواصل.</Text>
            ) : (
              <View style={styles.phoneChipList}>
                {savedPhones.map((phoneItem) => {
                  const isSelected = selectedPhoneId === phoneItem.id;
                  return (
                    <TouchableOpacity
                      key={`${phoneItem.id}-${phoneItem.phone}`}
                      style={[styles.phoneChip, isSelected && styles.phoneChipActive]}
                      onPress={() => handleSelectSavedPhone(phoneItem)}
                    >
                      <Text style={[styles.phoneChipText, isSelected && styles.phoneChipTextActive]}>{phoneItem.phone}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>المدينة / المنطقة</Text>
              <TextInput
                style={styles.input}
                value={addressDetails.city}
                onChangeText={(val) => setAddressDetails(prev => ({ ...prev, city: val }))}
                placeholder="مثال: نابلس، رفيديا"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>اسم الشارع</Text>
              <TextInput
                style={styles.input}
                value={addressDetails.street}
                onChangeText={(val) => setAddressDetails(prev => ({ ...prev, street: val }))}
                placeholder="مثال: شارع تونس"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رقم البناية / العلامة المميزة</Text>
              <TextInput
                style={styles.input}
                value={addressDetails.building}
                onChangeText={(val) => setAddressDetails(prev => ({ ...prev, building: val }))}
                placeholder="مثال: عمارة الشروق أو بالقرب من.."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رقم التواصل</Text>
              <TextInput
                style={styles.input}
                value={contactPhone}
                onChangeText={(val) => {
                  setContactPhone(val);
                  setSelectedPhoneId(null);
                }}
                placeholder="مثال: 0599123456"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ملاحظات إضافية (اختياري)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                value={addressDetails.notes}
                onChangeText={(val) => setAddressDetails(prev => ({ ...prev, notes: val }))}
                placeholder="أي تفاصيل أخرى تسهل الوصول إليك"
                placeholderTextColor="#999"
                multiline
              />
            </View>
          </View>

          <Text style={styles.paymentTitle}>موعد الاستلام</Text>

          <TouchableOpacity
            style={[styles.paymentItem, deliveryTiming === 'asap' && styles.paymentItemActive]}
            onPress={() => setDeliveryTiming('asap')}
          >
            <View style={styles.paymentRight}>
              <View style={[styles.paymentIcon, { backgroundColor: '#2F855A' }]}>
                <Feather name="zap" size={16} color="#fff" />
              </View>
              <Text style={styles.paymentText}>الاستلام بأسرع وقت</Text>
            </View>
            <View style={[styles.radio, deliveryTiming === 'asap' && styles.radioActive]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentItem, deliveryTiming === 'normal_24' && styles.paymentItemActive]}
            onPress={() => setDeliveryTiming('normal_24')}
          >
            <View style={styles.paymentRight}>
              <View style={[styles.paymentIcon, { backgroundColor: '#4B5563' }]}>
                <Feather name="clock" size={16} color="#fff" />
              </View>
              <Text style={styles.paymentText}>الاستلام العادي خلال 24 ساعة</Text>
            </View>
            <View style={[styles.radio, deliveryTiming === 'normal_24' && styles.radioActive]} />
          </TouchableOpacity>

          <Text style={styles.paymentTitle}>خيار الدفع</Text>

          <TouchableOpacity
            style={[styles.paymentItem, payment === 'cash' && styles.paymentItemActive]}
            onPress={() => setPayment('cash')}
          >
            <View style={styles.paymentRight}>
              <View style={[styles.paymentIcon, { backgroundColor: '#2E7D32' }]}>
                <Feather name="dollar-sign" size={16} color="#fff" />
              </View>
              <Text style={styles.paymentText}>الدفع عند الاستلام</Text>
            </View>
            <View style={[styles.radio, payment === 'cash' && styles.radioActive]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentItem}
            onPress={() => setPayment('card')}
          >
            <View style={styles.paymentRight}>
              <View style={[styles.paymentIcon, { backgroundColor: '#C2185B' }]}>
                <Feather name="credit-card" size={16} color="#fff" />
              </View>
              <Text style={styles.paymentText}>بطاقة ائتمان (قريباً)</Text>
            </View>
            <View style={styles.radio} />
          </TouchableOpacity>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>قيمة المشتريات</Text>
              <Text style={styles.summaryValue}>₪ {subtotal.toFixed(2)}</Text>
            </View>

            {discountRate > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>الخصم</Text>
                <Text style={styles.summaryValue}>- ₪ {(subtotal * discountRate).toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>رسوم التوصيل</Text>
              <Text style={styles.summaryValue}>{shipping === 0 ? 'مجاناً' : `₪ ${shipping}`}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>الضريبة (15%)</Text>
              <Text style={styles.summaryValue}>₪ {vat.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>الإجمالي الكلي</Text>
              <Text style={styles.totalValue}>₪ {total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, isSubmitting && styles.btnDisabled]}
          onPress={handleCheckout}
          disabled={isSubmitting}
        >
          <Text style={styles.confirmBtnText}>
            {isSubmitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.legalText}>بالضغط على تأكيد، أنت توافق على شروط استهلاك سعد المسلماني</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2EFE9' },
  scroll: { padding: 20 },
  headerTitleBox: { alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: PRIMARY_GREEN, fontFamily: 'Tajawal_700Bold' },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: { marginBottom: 15, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B1C1C', textAlign: 'right', fontFamily: 'Tajawal_700Bold' },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  savedHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  manageAddressesText: {
    fontSize: 13,
    color: PRIMARY_GREEN,
    fontFamily: 'Tajawal_700Bold',
  },
  savedAddressHint: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 14,
    fontFamily: 'Tajawal_500Medium',
  },
  savedAddressList: {
    marginBottom: 12,
    gap: 8,
  },
  savedAddressCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'flex-end',
  },
  savedAddressCardActive: {
    borderColor: PRIMARY_GREEN,
    backgroundColor: '#84BD0015',
  },
  savedAddressTitle: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'right',
  },
  savedAddressLine: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
    textAlign: 'right',
    fontFamily: 'Tajawal_500Medium',
  },
  phoneChipList: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  phoneChip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  phoneChipActive: {
    borderColor: PRIMARY_GREEN,
    backgroundColor: '#84BD001A',
  },
  phoneChipText: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Tajawal_700Bold',
  },
  phoneChipTextActive: {
    color: PRIMARY_GREEN,
  },
  inputGroup: { marginBottom: 15 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'right',
    marginBottom: 8,
    fontFamily: 'Tajawal_500Medium',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 50,
    paddingHorizontal: 15,
    textAlign: 'right',
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
  },

  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B1C1C',
    textAlign: 'right',
    marginBottom: 15,
    fontFamily: 'Tajawal_700Bold',
  },
  paymentItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
  },
  paymentItemActive: {
    borderColor: PRIMARY_GREEN,
    borderWidth: 1.5,
  },
  paymentRight: { flexDirection: 'row-reverse', alignItems: 'center' },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  paymentText: { fontSize: 14, fontWeight: '700', color: '#1B1C1C', fontFamily: 'Tajawal_700Bold' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioActive: {
    borderColor: PRIMARY_GREEN,
    backgroundColor: PRIMARY_GREEN,
    borderWidth: 6,
  },

  summaryCard: {
    backgroundColor: PRIMARY_GREEN + '10',
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
  },
  summaryRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#4B5563', fontFamily: 'Tajawal_500Medium' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#1B1C1C' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#111827', fontFamily: 'Tajawal_700Bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: PRIMARY_GREEN, fontFamily: 'Tajawal_700Bold' },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  confirmBtn: {
    backgroundColor: PRIMARY_GREEN,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  confirmBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Tajawal_700Bold' },
  legalText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#6B7280',
    marginTop: 12,
    fontFamily: 'Tajawal_500Medium',
  },
});
