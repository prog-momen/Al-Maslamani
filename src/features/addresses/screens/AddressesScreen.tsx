import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader, GuestLoginPrompt } from '@/src/shared/ui';
import { BottomNavbar } from '@/src/shared/ui/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_GREEN = '#84BD00';
const PAGE_BG = '#F5F4F0';

const sb = supabase as any;

export function AddressesScreen() {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAddresses = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await sb
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses])
  );

  const handleDelete = async (id: string) => {
    try {
      const { error } = await sb.from('addresses').delete().eq('id', id);
      if (error) throw error;
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Delete address failed:', error);
    }
  };

  const renderAddress = ({ item }: { item: any }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressInfo}>
        <View style={styles.labelRow}>
          <Ionicons name="location-outline" size={18} color={PRIMARY_GREEN} />
          <Text style={styles.addressLabel}>{item.label}</Text>
        </View>
        <Text style={styles.addressText} numberOfLines={2}>
          {item.city}، {item.street}، {item.building}
        </Text>
      </View>
      <View style={styles.actionsCol}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            router.push({
              pathname: '/add-address',
              params: { addressId: item.id },
            })
          }
        >
          <Ionicons name="create-outline" size={20} color={PRIMARY_GREEN} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          logo="transparent"
          title="عناويني"
          left={
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-forward" size={28} color={PRIMARY_GREEN} />
            </TouchableOpacity>
          }
        />

        {isGuest ? (
          <GuestLoginPrompt message="يجب تسجيل الدخول لإدارة العناوين الخاصة بك" />
        ) : isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={PRIMARY_GREEN} />
          </View>
        ) : (
          <FlatList
            data={addresses}
            keyExtractor={(item) => item.id}
            renderItem={renderAddress}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="map-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>لم تقم بإضافة أي عناوين بعد</Text>
              </View>
            }
          />
        )}

        {/* Add New Address Button */}
        {!isGuest && (
          <View style={styles.footer}>
            <Pressable
              style={styles.addBtn}
              onPress={() => router.push('/add-address')}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.addBtnText}>إضافة عنوان جديد</Text>
            </Pressable>
          </View>
        )}
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
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addressInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  labelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  addressLabel: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 18,
    color: '#1F2937',
  },
  addressText: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 16,
    color: '#9CA3AF',
  },
  footer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: PAGE_BG,
    paddingVertical: 10,
  },
  addBtn: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 20,
    height: 56,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
    color: 'white',
  },
});
