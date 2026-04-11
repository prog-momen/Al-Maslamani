import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { I18nManager, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import '../global.css';

import { AuthProvider } from '@/src/shared/contexts/AuthContext';
import { CartProvider } from '@/src/shared/contexts/CartContext';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { queryClient } from '@/src/shared/services/query-client';
import { Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold, useFonts } from '@expo-google-fonts/tajawal';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// ← ADD THIS WHOLE COMPONENT
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

function CustomDrawerContent({ navigation }: any) {
  const router = useRouter();
  
  const menuItems = [
    { label: 'الرئيسية', route: '/homepage', icon: '⌂' },
    { label: 'الفئات', route: '/browse', icon: '⊞' },
    { label: 'المفضلة', route: '/favorites', icon: '♥' },
    { label: 'سلة التسوق', route: '/cart', icon: '🛒' },
    { label: 'حسابي', route: '/account', icon: '👤' },
  ];

  return (
    <View style={drawerStyles.container}>
      <View style={drawerStyles.header}>
        <Text style={drawerStyles.headerTitle}>المسلماني</Text>
        <Text style={drawerStyles.headerSubtitle}>للمكسرات والبزورات</Text>
      </View>
      <View style={drawerStyles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={drawerStyles.menuItem}
            onPress={() => {
              navigation.closeDrawer();
              router.push(item.route as any);
            }}
          >
            <Text style={drawerStyles.menuIcon}>{item.icon}</Text>
            <Text style={drawerStyles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const drawerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2EFE9' },
  header: { padding: 24, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#E4E2E1' },
  headerTitle: { fontSize: 28, fontFamily: 'Tajawal-Bold', color: '#1B1C1C', textAlign: 'right' },
  headerSubtitle: { fontSize: 14, fontFamily: 'Tajawal-Regular', color: '#3F4A3C', textAlign: 'right', marginTop: 4 },
  menu: { padding: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EAE8E7' },
  menuIcon: { fontSize: 22, marginRight: 16, color: '#67BB28' },
  menuLabel: { fontSize: 16, fontFamily: 'Tajawal-Medium', color: '#1B1C1C', textAlign: 'right', flex: 1 },
});
// ← END OF ADDED COMPONENT

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider> {/* ← ADD THIS */}
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <GestureHandlerRootView style={{ flex: 1 }}> {/* ← ADD THIS */}
              <Drawer /* ← CHANGE Stack TO Drawer */
                screenOptions={{
                  headerShown: false,
                  drawerPosition: 'right', // ← ADD THIS
                  drawerStyle: { width: 280 }, // ← ADD THIS
                }}
                drawerContent={(props) => <CustomDrawerContent {...props} />} // ← ADD THIS
              >
                <Drawer.Screen name="homepage" />
                <Drawer.Screen name="browse" />
                <Drawer.Screen name="cart" /> 
                <Drawer.Screen name="favorites" /> 
                <Drawer.Screen name="account" /> 
                <Drawer.Screen name="index" />
                <Drawer.Screen name="home" />
                <Drawer.Screen name="(auth)" options={{ headerShown: false }} />
              </Drawer> 
            </GestureHandlerRootView> 
          </ThemeProvider>
        </CartProvider> 
      </AuthProvider>
    </QueryClientProvider>
  );
}
