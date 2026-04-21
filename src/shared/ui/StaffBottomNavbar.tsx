import { getHomeRouteForRole } from '@/src/shared/constants/role-routes';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type StaffRole = 'admin' | 'delivery';
type StaffTab = 'roleHome' | 'notifications' | 'storeHome' | 'profile';

type StaffBottomNavbarProps = {
  role: StaffRole;
  activeTab: StaffTab;
};

export function StaffBottomNavbar({ role, activeTab }: StaffBottomNavbarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const roleHomeLabel = 'لوحة التحكم';

  const navigate = (tab: StaffTab) => {
    if (tab === 'roleHome') {
      router.replace(getHomeRouteForRole(role));
      return;
    }

    if (tab === 'notifications') {
      router.replace('/admin-notifications');
      return;
    }

    if (tab === 'storeHome') {
      router.replace('/home');
      return;
    }

    router.replace('/profile');
  };

  const renderItem = (tab: StaffTab, label: string, icon: React.ReactNode) => {
    const isActive = activeTab === tab;

    return (
      <Pressable style={[styles.item, isActive && styles.itemActive]} onPress={() => navigate(tab)}>
        {icon}
        <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      {renderItem(
        'roleHome',
        roleHomeLabel,
        <Ionicons
          name={role === 'admin' ? 'shield-checkmark-outline' : 'bicycle-outline'}
          size={20}
          color={activeTab === 'roleHome' ? '#FFFFFF' : '#5C605A'}
        />
      )}

      {role === 'admin' && renderItem(
        'notifications',
        'التنبيهات',
        <Ionicons
          name={activeTab === 'notifications' ? 'notifications' : 'notifications-outline'}
          size={20}
          color={activeTab === 'notifications' ? '#FFFFFF' : '#5C605A'}
        />
      )}

      {renderItem(
        'storeHome',
        'الرئيسية',
        <Feather name="home" size={20} color={activeTab === 'storeHome' ? '#FFFFFF' : '#5C605A'} />
      )}

      {renderItem(
        'profile',
        'حسابي',
        <Feather name="user" size={20} color={activeTab === 'profile' ? '#FFFFFF' : '#5C605A'} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FCFBF8',
    borderTopWidth: 1,
    borderTopColor: '#E9E4D9',
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 5,
  },
  item: {
    minWidth: 70,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  itemActive: {
    backgroundColor: '#84BD00',
  },
  itemLabel: {
    marginTop: 2,
    color: '#5C605A',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 12,
  },
  itemLabelActive: {
    color: '#FFFFFF',
    fontFamily: 'Tajawal_700Bold',
  },
});