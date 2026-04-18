import { AppHeader } from '@/src/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { 
    ActivityIndicator, 
    Alert, 
    KeyboardAvoidingView, 
    Platform,
    Pressable, 
    ScrollView, 
    StyleSheet, 
    Text, 
    TextInput, 
    View 
} from 'react-native';
import MapView, { Marker } from '@/src/shared/ui/Maps/MapViewCustom';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from '@/src/shared/hooks/useAuth';

const PRIMARY_GREEN = '#67BB28';
const PALESTINE_LAT = 31.9029;
const PALESTINE_LNG = 35.2062;

const sb = supabase as any;

export function AddAddressScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const mapRef = useRef<any>(null);
  
  const [region, setRegion] = useState({
    latitude: PALESTINE_LAT,
    longitude: PALESTINE_LNG,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [label, setLabel] = useState('المنزل');
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setIsLocating(false);
          return;
        }

        // Add a timeout or defensive catch for Google Play Services issues
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion);
        reverseGeocode(location.coords.latitude, location.coords.longitude);
      } catch (err) {
        console.warn('Initial location fetch failed:', err);
        // If GPS fails, we just stop locating and let the user use the map/form manually
      } finally {
        setIsLocating(false);
      }
    })();
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!lat || !lng) return;
    console.log(`[Geocode] Triggered for: ${lat}, ${lng}`);
    
    const GOOGLE_API_KEY = 'AIzaSyC3aHQe8nGPsjiO2laPr9QZvEMNhCAeVWg';
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=ar`;
      const response = await fetch(url);
      const json = await response.json();
      
      console.log('[Geocode] Google Response Status:', json.status);

      if (json.status === 'OK' && json.results.length > 0) {
        const address = json.results[0];
        let detectedCity = '';
        let detectedStreet = '';
        
        address.address_components.forEach((comp: any) => {
          if (comp.types.includes('locality')) detectedCity = comp.long_name;
          if (comp.types.includes('route')) detectedStreet = comp.long_name;
          if (!detectedCity && comp.types.includes('administrative_area_level_1')) detectedCity = comp.long_name;
        });

        console.log('[Geocode] Success:', { city: detectedCity, street: detectedStreet });
        setCity(detectedCity || '');
        setStreet(detectedStreet || address.formatted_address.split(',')[0] || '');
        return;
      } else if (json.status === 'REQUEST_DENIED' || json.status === 'ZERO_RESULTS') {
        console.warn('[Geocode] Google API Error:', json.error_message || json.status);
      }
    } catch (apiErr) {
      console.error('[Geocode] Direct API Fetch Error:', apiErr);
    }

    try {
      console.log('[Geocode] Falling back to Expo Location...');
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (results && results.length > 0) {
        const address = results[0];
        setCity(address.city || address.region || address.subregion || '');
        setStreet(address.street || address.name || address.district || '');
      }
    } catch (e: any) {
      console.warn('[Geocode] Expo Fallback Error (handled):', e?.message || e);
    }
  };

  const handleRegionChangeComplete = (newRegion: any) => {
    setRegion(newRegion);
    reverseGeocode(newRegion.latitude, newRegion.longitude);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!city || !street || !fullName || !phone) {
      Alert.alert('تنبيه', 'يرجى التأكد من تحديد الموقع وإدخال كافة البيانات المطلوبة');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await sb.from('addresses').insert({
        user_id: user.id,
        label,
        full_name: fullName,
        phone,
        city,
        street,
        building,
        notes,
        latitude: region.latitude,
        longitude: region.longitude,
      });

      if (error) throw error;
      
      router.back();
    } catch (error: any) {
      console.error('Save address failed:', error);
      Alert.alert('خطأ في الحفظ', error.message || 'فشل حفظ العنوان، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          logo="none"
          title="إضافة عنوان"
          right={
            <Pressable onPress={() => router.back()} hitSlop={15}>
              <Ionicons name="chevron-forward" size={32} color={PRIMARY_GREEN} />
            </Pressable>
          }
        />

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation
            showsMyLocationButton
          />
          {/* Central Pin - only show if not on web or if we want a custom UI */}
          {Platform.OS !== 'web' && (
            <View style={styles.markerFixed} pointerEvents="none">
              <Ionicons name="location" size={40} color={PRIMARY_GREEN} />
            </View>
          )}
          
          {isLocating && Platform.OS !== 'web' && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="white" />
              <Text style={styles.loadingText}>جاري تحديد موقعك...</Text>
            </View>
          )}
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer}
        >
          <ScrollView 
            contentContainerStyle={styles.formScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>تفاصيل العنوان</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>اسم المستلم</Text>
              <TextInput 
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="مثال: أحمد محمد"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رقم التواصل</Text>
              <TextInput 
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="مثال: 059xxxxxxx"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.labelSelection}>
              {['المنزل', 'العمل', 'آخر'].map(l => (
                <Pressable 
                  key={l}
                  onPress={() => setLabel(l)}
                  style={[styles.labelChip, label === l && styles.labelChipActive]}
                >
                  <Text style={[styles.labelChipText, label === l && styles.labelChipTextActive]}>{l}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>المدينة / المنطقة</Text>
              <TextInput 
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="مثال: رام الله"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الشارع</Text>
              <TextInput 
                style={styles.input}
                value={street}
                onChangeText={setStreet}
                placeholder="مثال: شارع الإرسال"
              />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>البناية / رقم الشقة</Text>
                  <TextInput 
                    style={styles.input}
                    value={building}
                    onChangeText={setBuilding}
                    placeholder="مثال: عمارة النور"
                  />
                </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ملاحظات إضافية</Text>
              <TextInput 
                style={[styles.input, { height: 80, paddingTop: 12 }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="أي تعليمات للمندوب..."
                multiline
              />
            </View>

            <Pressable 
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveBtnText}>حفظ العنوان</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  safeArea: {
    flex: 1,
  },
  mapContainer: {
    height: '40%',
    width: '100%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerFixed: {
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    position: 'absolute',
    top: '50%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: 'white',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 14,
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  formScroll: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 20,
    color: '#1F2937',
    textAlign: 'right',
    marginBottom: 20,
  },
  labelSelection: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginBottom: 24,
  },
  labelChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  labelChipActive: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
  labelChipText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 14,
    color: '#6B7280',
  },
  labelChipTextActive: {
    color: 'white',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'right',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 54,
    paddingHorizontal: 16,
    textAlign: 'right',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  saveBtn: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 20,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 18,
    color: 'white',
  },
});
