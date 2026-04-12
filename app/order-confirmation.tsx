import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const PRIMARY_GREEN = '#2E7D32';
const LIGHT_GREEN = '#E8F5E9';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // استخراج رقم الطلب من الـ params أو تعيين قيمة افتراضية
  const orderNumber = params?.orderNumber || '#123456';

  React.useEffect(() => {
    // أنيميشن لأيقونة الصح
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinueShopping = () => {
    // الرجوع للشاشة الرئيسية
    router.push('/home');
  };

  const handleTrackOrder = () => {
    // الانتقال لشاشة تتبع الطلب
    router.push({ pathname: '/order-tracking', params: { orderNumber } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={PRIMARY_GREEN} barStyle="light-content" />

      <View style={styles.content}>
        {/* أيقونة الصح المتحركة */}
        <Animated.View
          style={[
            styles.checkCircle,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Ionicons name="checkmark" size={70} color="#FFFFFF" />
        </Animated.View>

        {/* النصوص */}
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.successTitle}>تم الطلب بنجاح!</Text>
          <Text style={styles.successMessage}>
            تم استلام طلبك بنجاح وسوف يتم{'\n'}توصيله في أقرب وقت ممكن
          </Text>

          {/* رقم الطلب */}
          <View style={styles.orderNumberBox}>
            <Text style={styles.orderNumberLabel}>رقم الطلب</Text>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
          </View>
        </Animated.View>

        {/* الأزرار */}
        <Animated.View style={[styles.buttonsContainer, { opacity: fadeAnim }]}>
          {/* زر استمرار التسوق */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinueShopping}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>استمرار التسوق</Text>
          </TouchableOpacity>

          {/* رابط تتبع الطلب */}
          <TouchableOpacity onPress={handleTrackOrder} activeOpacity={0.7}>
            <Text style={styles.trackOrderLink}>تتبع الطلب</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  checkCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: PRIMARY_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    // ظل
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    writingDirection: 'rtl',
  },
  successMessage: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    writingDirection: 'rtl',
  },
  orderNumberBox: {
    backgroundColor: LIGHT_GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 48,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  orderNumberLabel: {
    fontSize: 13,
    color: PRIMARY_GREEN,
    marginBottom: 4,
    fontWeight: '500',
  },
  orderNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PRIMARY_GREEN,
    letterSpacing: 1,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: PRIMARY_GREEN,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },
  trackOrderLink: {
    color: PRIMARY_GREEN,
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
});
