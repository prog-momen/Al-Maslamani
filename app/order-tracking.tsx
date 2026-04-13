import { AppHeader, BottomNavbar } from '@/src/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const PRIMARY_GREEN = '#67BB28';
const PAGE_BG = '#F5F4F0';
const LIGHT_GREEN = '#B8E8BE';

const getParamString = (value: string | string[] | undefined, fallback: string) => {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return value ?? fallback;
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const currentStepRaw = parseInt(getParamString(params.currentStep as string | string[] | undefined, '2'), 10);
  const currentStep = Number.isNaN(currentStepRaw) ? 2 : Math.max(0, Math.min(3, currentStepRaw));

  const orderNumber = getParamString(params.orderNumber as string | string[] | undefined, '#123456');
  const eta = getParamString(params.eta as string | string[] | undefined, '12:45 مساء');
  const total = getParamString(params.total as string | string[] | undefined, '0.00');
  const productName = getParamString(params.productName as string | string[] | undefined, 'شوكلاته مشكّلة');
  const productSubtitle = getParamString(params.productSubtitle as string | string[] | undefined, 'يا نسون نجمي');
  const productWeight = getParamString(params.productWeight as string | string[] | undefined, '1x');

  const allowReorder = getParamString(params.allowReorder as string | string[] | undefined, '0') === '1';

  const ORDER_STEPS = [
    {
      id: 0,
      title: 'تم الطلب',
      subtitle: `استلمنا طلبك رقم ${orderNumber}`,
      time: '12:10 مساء',
      icon: 'checkmark',
    },
    {
      id: 1,
      title: 'قيد المعالجة',
      subtitle: 'يتم الآن تحضير وتغليف طلبك بعناية',
      time: '12:25 مساء',
      icon: 'checkmark',
    },
    {
      id: 2,
      title: 'في الطريق',
      subtitle: 'المندوب في طريقه إلى موقعك حالياً',
      time: 'مباشر',
      icon: 'bicycle-outline',
    },
    {
      id: 3,
      title: 'تم التوصيل',
      subtitle: 'بالهنا والشفا!',
      time: '',
      icon: 'home-outline',
    },
  ];

  const statusBanner = currentStep >= 3 ? 'تم توصيل الطلب بنجاح' : 'الطلب يتحرك بسرعة';

  const renderStep = (step: (typeof ORDER_STEPS)[number], index: number) => {
    const isCompleted = index < currentStep;
    const isCurrent = index === currentStep;
    const isPending = index > currentStep;

    const circleStyle = isPending
      ? styles.timelineCirclePending
      : isCurrent
      ? styles.timelineCircleCurrent
      : styles.timelineCircleCompleted;

    const iconColor = isPending ? '#BFC5BC' : '#FFFFFF';
    const textStyle = isPending ? styles.timelineTitlePending : styles.timelineTitle;
    const subtitleStyle = isPending ? styles.timelineSubtitlePending : styles.timelineSubtitle;

    return (
      <View key={step.id} style={styles.timelineRow}>
        <View style={styles.timelineIconColumn}>
          <View style={[styles.timelineCircle, circleStyle]}>
            <Ionicons name={step.icon as any} size={16} color={iconColor} />
          </View>
          {index < ORDER_STEPS.length - 1 ? (
            <View style={[styles.timelineLine, isPending ? styles.timelineLinePending : styles.timelineLineActive]} />
          ) : null}
        </View>

        <View style={styles.timelineTextColumn}>
          <Text style={textStyle}>{step.title}</Text>
          <Text style={subtitleStyle}>{step.subtitle}</Text>
          {step.time ? (
            <View style={isCurrent && step.time === 'مباشر' ? styles.liveBadge : undefined}>
              <Text style={isCurrent && step.time === 'مباشر' ? styles.liveBadgeText : styles.timelineTime}>{step.time}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PAGE_BG} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          logo="transparent"
          withSidebar
          sidebarActiveItem="orders"
          sidebarSide="left"
          left={<Ionicons name="menu" size={22} color={PRIMARY_GREEN} />}
          right={
            <TouchableOpacity style={styles.headerAction} activeOpacity={0.8} onPress={() => router.push('/contact-us')}>
              <Ionicons name="help-circle-outline" size={26} color="#4F5C50" />
            </TouchableOpacity>
          }
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.etaCard}>
            <View style={styles.etaShape} />
            <Text style={styles.etaLabel}>وقت التوصيل المتوقع</Text>
            <Text style={styles.etaValue}>{eta}</Text>
            <View style={styles.speedBadge}>
              <Text style={styles.speedBadgeText}>{statusBanner}</Text>
            </View>
          </View>

          <View style={styles.mapCard}>
            <Image source={require('@/assets/images/about2.png')} style={styles.mapImage} contentFit="cover" />
            <View style={styles.mapOverlay} />
            <View style={styles.riderPin}>
              <Ionicons name="bicycle-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.riderTag}>
              <Text style={styles.riderTagText}>(أحمد المندوب)</Text>
            </View>
          </View>

          <View style={styles.driverRow}>
            <TouchableOpacity style={styles.callCircle} activeOpacity={0.8}>
              <Ionicons name="call-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>أحمد محمود</Text>
              <Text style={styles.driverPhone}>رقم التواصل: 05xxxxxxx</Text>
            </View>

            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={18} color="#5B5B5B" />
            </View>
          </View>

          <View style={styles.timelineCard}>{ORDER_STEPS.map(renderStep)}</View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>ملخص الطلب</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryValue}>{`${productWeight} ${productName}`}</Text>
              <Text style={styles.summaryLabel}>الصنف</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryValue}>{productSubtitle}</Text>
              <Text style={styles.summaryLabel}>الوصف</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryFooter}>
              <Text style={styles.summaryTotalValue}>{total} ₪</Text>
              <Text style={styles.summaryTotalLabel}>الإجمالي</Text>
            </View>

            {allowReorder ? (
              <TouchableOpacity style={styles.reorderButton} activeOpacity={0.85}>
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.reorderText}>إعادة الطلب</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNavbar activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  safeArea: {
    flex: 1,
  },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 118,
  },
  etaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 9,
    overflow: 'hidden',
  },
  etaShape: {
    width: 120,
    height: 120,
    backgroundColor: '#EEF1EE',
    position: 'absolute',
    top: -44,
    right: -36,
    borderRadius: 60,
  },
  etaLabel: {
    fontSize: 13,
    lineHeight: 17,
    color: '#44484B',
    textAlign: 'center',
    fontFamily: 'Tajawal_500Medium',
  },
  etaValue: {
    marginTop: 2,
    fontSize: 26,
    lineHeight: 31,
    color: '#2C2F33',
    textAlign: 'center',
    fontFamily: 'Tajawal_700Bold',
  },
  speedBadge: {
    height: 32,
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  speedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Tajawal_700Bold',
  },
  mapCard: {
    height: 170,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 10,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(78, 129, 121, 0.26)',
  },
  riderPin: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_GREEN,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderTag: {
    position: 'absolute',
    top: 104,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  riderTagText: {
    fontSize: 10,
    lineHeight: 13,
    color: '#2B2B2B',
    fontFamily: 'Tajawal_700Bold',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  callCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginHorizontal: 10,
  },
  driverName: {
    fontSize: 12,
    lineHeight: 16,
    color: '#2A2D2E',
    fontFamily: 'Tajawal_700Bold',
  },
  driverPhone: {
    fontSize: 9,
    lineHeight: 13,
    color: '#666C67',
    fontFamily: 'Tajawal_500Medium',
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D9DBD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCard: {
    paddingTop: 2,
  },
  timelineRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  timelineIconColumn: {
    alignItems: 'center',
    width: 40,
  },
  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCircleCompleted: {
    backgroundColor: PRIMARY_GREEN,
  },
  timelineCircleCurrent: {
    backgroundColor: PRIMARY_GREEN,
    borderWidth: 3,
    borderColor: '#0B7B26',
  },
  timelineCirclePending: {
    backgroundColor: '#E6EAE4',
  },
  timelineLine: {
    width: 2,
    height: 44,
    marginVertical: 2,
  },
  timelineLineActive: {
    backgroundColor: PRIMARY_GREEN,
  },
  timelineLinePending: {
    backgroundColor: '#D9DEDA',
  },
  timelineTextColumn: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 2,
    paddingLeft: 4,
  },
  timelineTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: '#222629',
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'right',
  },
  timelineTitlePending: {
    fontSize: 20,
    lineHeight: 24,
    color: '#C7D1C5',
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'right',
  },
  timelineSubtitle: {
    fontSize: 10,
    lineHeight: 14,
    color: '#555C59',
    fontFamily: 'Tajawal_500Medium',
    textAlign: 'right',
    marginTop: 2,
  },
  timelineSubtitlePending: {
    fontSize: 10,
    lineHeight: 14,
    color: '#BCC5BA',
    fontFamily: 'Tajawal_500Medium',
    textAlign: 'right',
    marginTop: 2,
  },
  timelineTime: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 12,
    color: '#626865',
    fontFamily: 'Tajawal_500Medium',
    textAlign: 'right',
  },
  liveBadge: {
    marginTop: 4,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    color: '#2E7035',
    fontFamily: 'Tajawal_700Bold',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryTitle: {
    fontSize: 15,
    lineHeight: 19,
    color: '#202428',
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'right',
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    lineHeight: 13,
    color: '#5F6561',
    fontFamily: 'Tajawal_500Medium',
  },
  summaryValue: {
    flex: 1,
    fontSize: 10,
    lineHeight: 13,
    color: '#202428',
    fontFamily: 'Tajawal_500Medium',
    textAlign: 'right',
    marginLeft: 8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E8E9E5',
    marginVertical: 6,
  },
  summaryFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 17,
    lineHeight: 21,
    color: '#202428',
    fontFamily: 'Tajawal_700Bold',
  },
  summaryTotalValue: {
    fontSize: 17,
    lineHeight: 21,
    color: PRIMARY_GREEN,
    fontFamily: 'Tajawal_700Bold',
  },
  reorderButton: {
    marginTop: 8,
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 14,
    height: 32,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reorderText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 13,
    fontFamily: 'Tajawal_700Bold',
  },
});
