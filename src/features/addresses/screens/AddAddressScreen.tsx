import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader } from '@/src/shared/ui';
import MapView from '@/src/shared/ui/Maps/MapViewCustom';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_GREEN = '#84BD00';
const PALESTINE_LAT = 31.9029;
const PALESTINE_LNG = 35.2062;

const sb = supabase as any;

const WEST_BANK_LOCATIONS = [
  'القدس/بيت حنينا',
  'القدس/كفر عقب',
  'القدس/العيزرية',
  'رام الله/البيرة',
  'رام الله/أم الشرايط',
  'رام الله/بيتونيا',
  'رام الله/عين مصباح',
  'رام الله/الماصيون',
  'رام الله/بيرزيت',
  'رام الله/بيتين',
  'رام الله/دير دبوان',
  'رام الله/نعلين',
  'رام الله/بدرس',
  'رام الله/سنجل',
  'رام الله/ترمسعيا',
  'رام الله/المزرعة الشرقية',
  'نابلس/المدينة',
  'نابلس/رفيديا',
  'نابلس/المخفية',
  'نابلس/بيت وزن',
  'نابلس/بيت إيبا',
  'نابلس/عصيرة الشمالية',
  'نابلس/عصيرة القبلية',
  'نابلس/حوارة',
  'نابلس/بيت فوريك',
  'نابلس/عورتا',
  'نابلس/زعترة',
  'نابلس/سبسطية',
  'نابلس/بورين',
  'نابلس/تل',
  'جنين/المدينة',
  'جنين/قباطية',
  'جنين/اليامون',
  'جنين/السيلة الحارثية',
  'جنين/عرابة',
  'جنين/برقين',
  'جنين/كفر دان',
  'جنين/فحمة',
  'جنين/ميثلون',
  'جنين/يعبد',
  'طولكرم/المدينة',
  'طولكرم/عنبتا',
  'طولكرم/بلعا',
  'طولكرم/عتيل',
  'طولكرم/دير الغصون',
  'طولكرم/قفين',
  'طولكرم/الشعراوية',
  'قلقيلية/المدينة',
  'قلقيلية/عزون',
  'قلقيلية/حبلة',
  'قلقيلية/كفر ثلث',
  'قلقيلية/حجة',
  'قلقيلية/جيوس',
  'سلفيت/المدينة',
  'سلفيت/بديا',
  'سلفيت/ديراستيا',
  'سلفيت/قراوة بني حسان',
  'سلفيت/كفل حارس',
  'أريحا/المدينة',
  'أريحا/العوجا',
  'أريحا/النويعمة',
  'أريحا/فصايل',
  'بيت لحم/المدينة',
  'بيت لحم/بيت ساحور',
  'بيت لحم/بيت جالا',
  'بيت لحم/الدوحة',
  'بيت لحم/الخضر',
  'بيت لحم/تقوع',
  'بيت لحم/العبيدية',
  'الخليل/المدينة',
  'الخليل/حلحول',
  'الخليل/دورا',
  'الخليل/يطا',
  'الخليل/السموع',
  'الخليل/بيت أمر',
  'الخليل/صوريف',
  'الخليل/بني نعيم',
  'الخليل/الظاهرية',
  'طوباس/المدينة',
  'طوباس/طمون',
  'طوباس/عقابا',
] as const;

type AddressRow = {
  id: string;
  label: string;
  full_name: string;
  city: string;
  street: string;
  building: string | null;
  notes: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export function AddAddressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ addressId?: string | string[] }>();
  const { user } = useAuth();
  const mapRef = useRef<any>(null);
  const addressId = Array.isArray(params.addressId) ? params.addressId[0] : params.addressId;
  const isEditing = Boolean(addressId);

  const [region, setRegion] = useState({
    latitude: PALESTINE_LAT,
    longitude: PALESTINE_LNG,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [label, setLabel] = useState('المنزل');
  const [customLabel, setCustomLabel] = useState('');
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const filteredCities = useMemo(() => {
    const normalized = citySearch.trim();
    if (!normalized) {
      return WEST_BANK_LOCATIONS;
    }
    return WEST_BANK_LOCATIONS.filter((item) => item.includes(normalized));
  }, [citySearch]);

  useEffect(() => {
    const loadAddressForEdit = async () => {
      if (!isEditing || !addressId || !user?.id) {
        return;
      }

      try {
        const { data, error } = await sb
          .from('addresses')
          .select('id,label,full_name,city,street,building,notes,latitude,longitude')
          .eq('id', addressId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return;

        const address = data as AddressRow;
        const isPresetLabel = address.label === 'المنزل' || address.label === 'العمل' || address.label === 'آخر';

        setLabel(isPresetLabel ? address.label : 'آخر');
        setCustomLabel(isPresetLabel ? '' : address.label);
        setFullName(address.full_name || '');
        setCity(address.city || '');
        setStreet(address.street || '');
        setBuilding(address.building || '');
        setNotes(address.notes || '');

        if (address.latitude && address.longitude) {
          const nextRegion = {
            latitude: address.latitude,
            longitude: address.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };
          setRegion(nextRegion);
          mapRef.current?.animateToRegion(nextRegion);
        }
      } catch (error) {
        console.error('Load address for edit failed:', error);
      }
    };

    loadAddressForEdit();
  }, [addressId, isEditing, user?.id]);

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
    if (!city || !street || !fullName) {
      Alert.alert('تنبيه', 'يرجى التأكد من تحديد الموقع وإدخال كافة البيانات المطلوبة');
      return;
    }

    if (label === 'آخر' && !customLabel.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة اسم مخصص للعنوان عند اختيار "آخر"');
      return;
    }

    const resolvedLabel = label === 'آخر' ? customLabel.trim() : label;

    setIsSaving(true);
    try {
      let resolvedPhone = '';
      const { data: phoneRow } = await sb
        .from('user_contact_phones')
        .select('phone')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (phoneRow?.phone) {
        resolvedPhone = phoneRow.phone;
      } else if (typeof user?.user_metadata?.phone === 'string' && user.user_metadata.phone.trim()) {
        resolvedPhone = user.user_metadata.phone.trim();
      } else {
        resolvedPhone = '-';
      }

      const payload = {
        user_id: user.id,
        label: resolvedLabel,
        full_name: fullName,
        phone: resolvedPhone,
        city,
        street,
        building,
        notes,
        latitude: region.latitude,
        longitude: region.longitude,
      };

      let error;
      if (isEditing && addressId) {
        const result = await sb.from('addresses').update(payload).eq('id', addressId).eq('user_id', user.id);
        error = result.error;
      } else {
        const result = await sb.from('addresses').insert(payload);
        error = result.error;
      }

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
          title={isEditing ? 'تعديل عنوان' : 'إضافة عنوان'}
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

            {label === 'آخر' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>اسم العنوان</Text>
                <TextInput
                  style={styles.input}
                  value={customLabel}
                  onChangeText={setCustomLabel}
                  placeholder="مثال: بيت الأهل"
                />
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>المدينة / المنطقة</Text>
              <Pressable style={styles.selectInput} onPress={() => setIsCityModalVisible(true)}>
                <Ionicons name="chevron-down" size={18} color="#6B7280" />
                <Text style={city ? styles.selectTextValue : styles.selectTextPlaceholder}>
                  {city || 'اختر المدينة / المنطقة'}
                </Text>
              </Pressable>
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
                <Text style={styles.saveBtnText}>{isEditing ? 'حفظ التعديل' : 'حفظ العنوان'}</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal
        visible={isCityModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCityModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setIsCityModalVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
              <Text style={styles.modalTitle}>اختر المدينة / المنطقة</Text>
            </View>

            <TextInput
              style={styles.searchInput}
              value={citySearch}
              onChangeText={setCitySearch}
              placeholder="ابحث عن المدينة أو القرية"
              placeholderTextColor="#9CA3AF"
              textAlign="right"
            />

            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.cityRow, city === item && styles.cityRowActive]}
                  onPress={() => {
                    setCity(item);
                    setIsCityModalVisible(false);
                  }}
                >
                  <Text style={styles.cityRowText}>{item}</Text>
                </Pressable>
              )}
              ListEmptyComponent={<Text style={styles.emptyCityText}>لا توجد نتائج مطابقة</Text>}
            />
          </View>
        </View>
      </Modal>
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
  selectInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectTextPlaceholder: {
    color: '#9CA3AF',
    fontFamily: 'Tajawal_500Medium',
    fontSize: 15,
  },
  selectTextValue: {
    color: '#1F2937',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '78%',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 18,
    color: '#111827',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    minHeight: 46,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontFamily: 'Tajawal_500Medium',
    color: '#111827',
  },
  cityRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'flex-end',
  },
  cityRowActive: {
    backgroundColor: '#84BD0010',
    borderRadius: 10,
  },
  cityRowText: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 15,
    color: '#1F2937',
    textAlign: 'right',
  },
  emptyCityText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#6B7280',
    fontFamily: 'Tajawal_500Medium',
  },
});
