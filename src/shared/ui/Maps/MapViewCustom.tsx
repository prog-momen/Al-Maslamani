import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Safely require react-native-maps
let MapView: any = View;
let Marker: any = View;
let Polyline: any = View;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const MapModule = require('react-native-maps');
    MapView = MapModule.default;
    Marker = MapModule.Marker;
    Polyline = MapModule.Polyline;
    PROVIDER_GOOGLE = MapModule.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn('MapView could not be loaded:', e);
  }
}

export const MapViewCustom = React.forwardRef(({ children, style, ...props }: any, ref: any) => {
  if (Platform.OS === 'web') {
    return (
      <View 
        style={[{ flex: 1, backgroundColor: '#EBEBEB', alignItems: 'center', justifyContent: 'center', padding: 20 }, style]}
      >
        <Ionicons name="map-outline" size={48} color="#67BB28" />
        <Text style={{ fontFamily: 'Tajawal_700Bold', fontSize: 16, marginTop: 12, color: '#1F2937' }}>
          الخريطة التفاعلية متاحة عبر تطبيق الموبايل
        </Text>
        <Text style={{ fontFamily: 'Tajawal_500Medium', fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
          يمكنك إكمال الإجراءات المتبقية يدوياً هنا
        </Text>
      </View>
    );
  }

  return (
    <MapView
      ref={ref}
      style={style || { flex: 1 }}
      provider={PROVIDER_GOOGLE}
      {...props}
    >
      {children}
    </MapView>
  );
});

export { Marker, Polyline, PROVIDER_GOOGLE };
export default MapViewCustom;
