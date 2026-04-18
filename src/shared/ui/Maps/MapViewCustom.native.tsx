import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let MapView: any;
let Marker: any;
let Polyline: any;
let PROVIDER_GOOGLE: any;
let mapsAvailable = false;

try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  mapsAvailable = !!MapView;
} catch (e) {
  console.warn('react-native-maps is not available in this environment');
}

export const MapViewCustom = React.forwardRef((props: any, ref: any) => {
  if (!mapsAvailable) {
    return (
      <View style={[{ flex: 1, backgroundColor: '#EBEBEB', alignItems: 'center', justifyContent: 'center', padding: 20 }, props.style]}>
        <Ionicons name="map-outline" size={48} color="#67BB28" />
        <Text style={{ fontFamily: 'Tajawal_700Bold', fontSize: 16, marginTop: 12, color: '#1F2937', textAlign: 'center' }}>
          الخريطة التفاعلية غير مدعومة في هذه النسخة
        </Text>
      </View>
    );
  }

  return (
    <MapView
      ref={ref}
      provider={PROVIDER_GOOGLE}
      {...props}
    />
  );
});

export const MapMarker = mapsAvailable ? Marker : (() => null);
export const MapPolyline = mapsAvailable ? Polyline : (() => null);

export { MapMarker as Marker, MapPolyline as Polyline };
export default MapViewCustom;
