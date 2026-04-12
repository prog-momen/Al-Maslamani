import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const PRIMARY_GREEN = '#2E7D32';
const LIGHT_GREEN = '#E8F5E9';

// مراحل الطلب
const ORDER_STEPS = [
  {
    id: 1,
    title: 'تم استلام الطلب',
    subtitle: 'طلبك قيد المعالجة',
    icon: 'receipt-outline',
  },
  {
    id: 2,
    title: 'جاري التجهيز',
    subtitle: 'يتم تجهيز طلبك الآن',
    icon: 'construct-outline',
  },
  {
    id: 3,
    title: 'في الطريق',
    subtitle: 'المندوب في طريقه إليك',
    icon: 'bicycle-outline',
  },
  {
    id: 4,
    title: 'تم التوصيل',
    subtitle: 'تم تسليم طلبك بنجاح',
    icon: 'home-outline',
  },
];

export default function OrderTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // المرحلة الحالية (0-based index) - يمكن تمريرها من الشاشة السابقة
  const currentStep = params?.currentStep ? parseInt(params.currentStep as string) : 2; // "في الطريق" بشكل افتراضي
  const orderNumber = params?.orderNumber || '#123456';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={PRIMARY_GREEN} barStyle="light-content" />

      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تتبع الطلب</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* بطاقة خريطة الموقع (placeholder بدل Map حقيقي) */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color={PRIMARY_GREEN} />
            <Text style={styles.mapLabel}>موقع المندوب</Text>
            <View style={styles.mapPin}>
              <Ionicons name="location" size={28} color="#FF3D00" />
            </View>
          </View>
        </View>

        {/* معلومات الطلب */}
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>رقم الطلب</Text>
            <Text style={styles.orderInfoValue}>{orderNumber}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>الحالة الحالية</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {ORDER_STEPS[currentStep]?.title}
              </Text>
            </View>
          </View>
        </View>

        {/* خط زمني / Stepper */}
        <View style={styles.stepperContainer}>
          <Text style={styles.stepperTitle}>مراحل الطلب</Text>
          {ORDER_STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <View key={step.id} style={styles.stepRow}>
                {/* الخط الرابط */}
                <View style={styles.stepLineColumn}>
                  <View
                    style={[
                      styles.stepCircle,
                      isCompleted && styles.stepCircleCompleted,
                      isCurrent && styles.stepCircleCurrent,
                      isPending && styles.stepCirclePending,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : (
                      <Ionicons
                        name={step.icon}
                        size={16}
                        color={isCurrent ? '#FFFFFF' : '#BBBBBB'}
                      />
                    )}
                  </View>
                  {/* خط رأسي */}
                  {index < ORDER_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepConnector,
                        index < currentStep && styles.stepConnectorCompleted,
                      ]}
                    />
                  )}
                </View>

                {/* محتوى الخطوة */}
                <View style={styles.stepContent}>
                  <Text
                    style={[
                      styles.stepTitle,
                      (isCompleted || isCurrent) && styles.stepTitleActive,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                </View>

                {/* علامة "الحالي" */}
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>الحالي</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* بطاقة المندوب */}
        <View style={styles.driverCard}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={28} color={PRIMARY_GREEN} />
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>محمد العلي</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFC107" />
                <Text style={styles.driverRating}>4.8</Text>
                <Text style={styles.driverLabel}> • المندوب</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton} activeOpacity={0.8}>
            <Ionicons name="call" size={20} color="#FFFFFF" />
            <Text style={styles.callButtonText}>اتصال</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: PRIMARY_GREEN,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // الخريطة
  mapContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLabel: {
    marginTop: 8,
    fontSize: 14,
    color: PRIMARY_GREEN,
    fontWeight: '500',
  },
  mapPin: {
    position: 'absolute',
    top: 60,
    right: 100,
  },
  // بطاقة معلومات الطلب
  orderInfoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  orderInfoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#777777',
  },
  orderInfoValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  statusBadge: {
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: PRIMARY_GREEN,
    fontSize: 13,
    fontWeight: '600',
  },
  // الـ Stepper
  stepperContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  stepperTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'right',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  stepLineColumn: {
    alignItems: 'center',
    width: 36,
    marginLeft: 12,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: PRIMARY_GREEN,
  },
  stepCircleCurrent: {
    backgroundColor: '#FF8F00',
  },
  stepCirclePending: {
    backgroundColor: '#E0E0E0',
  },
  stepConnector: {
    width: 2,
    height: 32,
    backgroundColor: '#E0E0E0',
  },
  stepConnectorCompleted: {
    backgroundColor: PRIMARY_GREEN,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AAAAAA',
    textAlign: 'right',
  },
  stepTitleActive: {
    color: '#1A1A1A',
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'right',
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'center',
    marginLeft: 4,
  },
  currentBadgeText: {
    color: '#FF8F00',
    fontSize: 11,
    fontWeight: '600',
  },
  // بطاقة المندوب
  driverCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  driverInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverDetails: {
    alignItems: 'flex-end',
  },
  driverName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  ratingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 3,
  },
  driverRating: {
    fontSize: 13,
    color: '#FFC107',
    fontWeight: '600',
    marginRight: 3,
  },
  driverLabel: {
    fontSize: 12,
    color: '#888888',
  },
  callButton: {
    backgroundColor: PRIMARY_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    gap: 6,
    elevation: 2,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
