import { sendNotification } from '@/src/features/notifications/services/notifications.service';
import type { NotificationType } from '@/src/features/notifications/types/notification.types';
import { AppHeader, Button, Card, FormField, StaffBottomNavbar } from '@/src/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AdminNotificationsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [type, setType] = useState<NotificationType>('offer');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountValue, setDiscountValue] = useState('');

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال العنوان ونص الرسالة');
      return;
    }

    setIsLoading(true);
    try {
      await sendNotification({
        type,
        title: title.trim(),
        body: body.trim(),
        discountCode: type === 'discount_code' ? discountCode.trim() : undefined,
        discountValue: discountValue.trim() || undefined,
      });

      Alert.alert('نجاح', 'تم إرسال الإشعار لجميع المستخدمين بنجاح');

      // Reset form
      setTitle('');
      setBody('');
      setDiscountCode('');
      setDiscountValue('');
    } catch (error) {
      console.error('Failed to send notification:', error);
      Alert.alert('خطأ', 'تعذر إرسال الإشعار، حاول مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-surface" edges={['top']}>
      <AppHeader
        logo="transparent"
        left={
          <Button
            variant="secondary"
            className="w-10 h-10 p-0 border-0"
            icon={<Ionicons name="arrow-forward" size={24} color="#84BD00" />}
            onPress={() => router.back()}
            label=""
          />
        }
      />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        <View className="mt-4 mb-8">
          <Text className="font-tajawal-bold text-[32px] text-brand-title text-right">إرسال تنبيه</Text>
          <Text className="font-tajawal-medium text-[16px] text-gray-600 text-right mt-1">
            أرسل إشعارات عامة بالعروض وأكواد الخصم لجميع المستخدمين.
          </Text>
        </View>

        <Card className="p-6 rounded-[30px] border border-[#EBE8E1] bg-[#FCFBF8]">
          {/* Type Selector */}
          <Text className="font-tajawal-bold text-lg text-right mb-3">نوع التنبيه</Text>
          <View className="flex-row-reverse gap-3 mb-6">
            <Button
              label="عرض جديد"
              variant={type === 'offer' ? 'primary' : 'secondary'}
              onPress={() => setType('offer')}
              className="flex-1 h-12 py-0"
              textClassName="text-[15px]"
            />
            <Button
              label="كود خصم"
              variant={type === 'discount_code' ? 'primary' : 'secondary'}
              onPress={() => setType('discount_code')}
              className="flex-1 h-12 py-0"
              textClassName="text-[15px]"
            />
          </View>

          <FormField
            label="عنوان التنبيه"
            value={title}
            onChangeText={setTitle}
            placeholder="مثلاً: خصومات نهاية الأسبوع!"
          />

          <FormField
            label="نص الرسالة"
            value={body}
            onChangeText={setBody}
            placeholder="ادخل تفاصيل العرض هنا..."
            multiline
            numberOfLines={4}
          />

          {type === 'discount_code' && (
            <FormField
              label="كود الخصم"
              value={discountCode}
              onChangeText={setDiscountCode}
              placeholder="مثلاً: SAVE20"
            />
          )}

          <FormField
            label="قيمة الخصم (اختياري)"
            value={discountValue}
            onChangeText={setDiscountValue}
            placeholder="مثلاً: 20% أو 50 ₪"
          />

          <Button
            label="إرسال التنبيه الآن"
            onPress={handleSend}
            loading={isLoading}
            className="mt-4 h-14"
            icon={<Ionicons name="send" size={20} color="white" />}
          />
        </Card>

        {/* Preview Tip */}
        <View className="mt-8 p-4 bg-brand-primary/10 rounded-2xl flex-row-reverse items-start gap-3">
          <Ionicons name="information-circle-outline" size={24} color="#84BD00" />
          <View className="flex-1">
            <Text className="font-tajawal-bold text-[16px] text-brand-primary text-right">تلميح</Text>
            <Text className="font-tajawal-medium text-[14px] text-gray-700 text-right mt-1">
              الإشعارات المرسلة ستظهر فوراً لجميع المستخدمين في قائمة الإشعارات الخاصة بهم.
            </Text>
          </View>
        </View>
      </ScrollView>

      <StaffBottomNavbar role="admin" activeTab="notifications" />
    </SafeAreaView>
  );
}
