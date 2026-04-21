import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader } from '@/src/shared/ui';
import { BottomNavbar } from '@/src/shared/ui/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_GREEN = '#84BD00';
const PAGE_BG = '#F5F4F0';
const sb = supabase as any;

type ContactPhoneRow = {
  id: string;
  phone: string;
  is_default: boolean;
};

export function ContactPhonesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [phones, setPhones] = useState<ContactPhoneRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPhone, setNewPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadPhones = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await sb
        .from('user_contact_phones')
        .select('id,phone,is_default')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhones(data || []);
    } catch (error) {
      console.error('Failed to load contact phones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadPhones();
    }, [loadPhones])
  );

  const addPhone = async () => {
    if (!user?.id) return;
    const normalized = newPhone.trim();
    if (!normalized) {
      Alert.alert('تنبيه', 'يرجى إدخال رقم التواصل');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await sb.from('user_contact_phones').insert({
        user_id: user.id,
        phone: normalized,
        is_default: phones.length === 0,
      });

      if (error) throw error;
      setNewPhone('');
      await loadPhones();
    } catch (error: any) {
      console.error('Failed to save contact phone:', error);
      Alert.alert('خطأ', error.message || 'تعذر حفظ الرقم');
    } finally {
      setIsSaving(false);
    }
  };

  const setDefault = async (id: string) => {
    if (!user?.id) return;

    try {
      await sb.from('user_contact_phones').update({ is_default: false }).eq('user_id', user.id);
      const { error } = await sb.from('user_contact_phones').update({ is_default: true }).eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      await loadPhones();
    } catch (error) {
      console.error('Failed to set default phone:', error);
    }
  };

  const removePhone = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await sb.from('user_contact_phones').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      await loadPhones();
    } catch (error) {
      console.error('Failed to delete phone:', error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          logo="transparent"
          title="أرقام التواصل"
          left={
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-forward" size={28} color={PRIMARY_GREEN} />
            </TouchableOpacity>
          }
        />

        <View style={styles.formCard}>
          <Text style={styles.label}>رقم جديد</Text>
          <View style={styles.inputRow}>
            <Pressable style={[styles.addBtn, isSaving && { opacity: 0.7 }]} onPress={addPhone} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color="white" size="small" /> : <Ionicons name="add" size={20} color="white" />}
            </Pressable>
            <TextInput
              style={styles.input}
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
              placeholder="مثال: 0599123456"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={PRIMARY_GREEN} />
          </View>
        ) : (
          <FlatList
            data={phones}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.phoneCard}>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => removePhone(item.id)}>
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.defaultBtn, item.is_default && styles.defaultBtnActive]} onPress={() => setDefault(item.id)}>
                    <Text style={[styles.defaultBtnText, item.is_default && styles.defaultBtnTextActive]}>
                      {item.is_default ? 'الافتراضي' : 'جعله افتراضي'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.phoneText}>{item.phone}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>لا يوجد أرقام محفوظة بعد.</Text>}
          />
        )}
      </SafeAreaView>

      <BottomNavbar activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BG },
  safeArea: { flex: 1 },
  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 14,
  },
  label: {
    textAlign: 'right',
    color: '#374151',
    fontFamily: 'Tajawal_700Bold',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    minHeight: 46,
    paddingHorizontal: 12,
    textAlign: 'right',
    fontFamily: 'Tajawal_500Medium',
    color: '#111827',
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: PRIMARY_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
  },
  phoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  phoneText: {
    textAlign: 'right',
    color: '#111827',
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  defaultBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  defaultBtnActive: {
    borderColor: PRIMARY_GREEN,
    backgroundColor: '#84BD0015',
  },
  defaultBtnText: {
    fontFamily: 'Tajawal_700Bold',
    color: '#6B7280',
    fontSize: 12,
  },
  defaultBtnTextActive: {
    color: PRIMARY_GREEN,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#6B7280',
    fontFamily: 'Tajawal_500Medium',
  },
});
