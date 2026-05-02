import {
  AdminProduct,
  AdminProductInput,
  CategoryOption,
  adminCreateProduct,
  adminDeleteProduct,
  adminToggleProductActive,
  adminUpdateProduct,
  getAdminProducts,
  getCategories,
} from '@/src/features/products/services/products.service';
import { useRealtimeSignal } from '@/src/shared/contexts/RealtimeContext';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { AppHeader, Button, Card, StaffBottomNavbar } from '@/src/shared/ui';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGE_BG = '#F2F1EE';
const BRAND_GREEN = '#84BD00';
const BRAND_TEXT = '#30312F';
const CARD_BG = '#FCFBF8';

// ─── Empty form state ──────────────────────────────────────────────────────────
const EMPTY_FORM: AdminProductInput = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  packaging: '',
  category_id: null,
  stock: 0,
  is_active: true,
};

// ─── Product form modal ────────────────────────────────────────────────────────
function ProductFormModal({
  visible,
  product,
  categories,
  onClose,
  onSave,
}: {
  visible: boolean;
  product: AdminProduct | null;
  categories: CategoryOption[];
  onClose: () => void;
  onSave: (input: AdminProductInput) => Promise<void>;
}) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState<AdminProductInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AdminProductInput, string>>>({});

  // Sync form when modal opens or product changes
  useEffect(() => {
    if (!visible) return;
    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        image_url: product.image_url ?? '',
        packaging: product.packaging ?? '',
        category_id: product.category_id,
        stock: product.stock,
        is_active: product.is_active,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [visible, product]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'الاسم مطلوب';
    if (!form.price || form.price <= 0) e.price = 'السعر يجب أن يكون أكبر من صفر';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || null,
        image_url: form.image_url?.trim() || null,
        packaging: form.packaging?.trim() || null,
      });
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    key: keyof AdminProductInput,
    opts?: { keyboardType?: 'default' | 'numeric'; placeholder?: string; multiline?: boolean }
  ) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          opts?.multiline && styles.fieldInputMulti,
          errors[key] ? styles.fieldInputError : null,
        ]}
        value={String(form[key] ?? '')}
        onChangeText={(v) =>
          setForm((prev) => ({
            ...prev,
            [key]: opts?.keyboardType === 'numeric' ? (parseFloat(v) || 0) : v,
          }))
        }
        placeholder={opts?.placeholder ?? label}
        placeholderTextColor="#9CA09A"
        keyboardType={opts?.keyboardType ?? 'default'}
        textAlign="right"
        multiline={opts?.multiline}
        numberOfLines={opts?.multiline ? 3 : 1}
      />
      {errors[key] ? <Text style={styles.fieldError}>{errors[key]}</Text> : null}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn} activeOpacity={0.8}>
                <Ionicons name="close" size={22} color="#5A5D57" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              {field('اسم المنتج', 'name', { placeholder: 'مثال: زيت زيتون' })}
              {field('الوصف / الحجم', 'description', { placeholder: 'مثال: 250 مل', multiline: true })}
              {field('السعر (₪)', 'price', { keyboardType: 'numeric', placeholder: '0.00' })}
              {field('رابط الصورة', 'image_url', { placeholder: 'https://...' })}
              {field('التعبئة', 'packaging', { placeholder: 'مثال: جرة، كيس...' })}
              {field('المخزون', 'stock', { keyboardType: 'numeric', placeholder: '0' })}

              {/* Category picker */}
              {categories.length > 0 && (
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>الفئة</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.catRow}>
                      <TouchableOpacity
                        style={[styles.catChip, form.category_id === null && styles.catChipActive]}
                        onPress={() => setForm((p) => ({ ...p, category_id: null }))}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.catChipText, form.category_id === null && styles.catChipTextActive]}>بدون</Text>
                      </TouchableOpacity>
                      {categories.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          style={[styles.catChip, form.category_id === c.id && styles.catChipActive]}
                          onPress={() => setForm((p) => ({ ...p, category_id: c.id }))}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.catChipText, form.category_id === c.id && styles.catChipTextActive]}>{c.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Active toggle */}
              <View style={styles.toggleRow}>
                <Text style={styles.fieldLabel}>نشط / مفعّل</Text>
                <Switch
                  value={form.is_active}
                  onValueChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
                  trackColor={{ false: '#D5D4CE', true: BRAND_GREEN }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Save button */}
            <View style={styles.modalFooter}>
              <Button
                label={saving ? 'جارٍ الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}
                onPress={handleSave}
                loading={saving}
                icon={<Ionicons name={isEdit ? 'save-outline' : 'add-circle-outline'} size={20} color="#fff" />}
                iconPosition="start"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Product card ──────────────────────────────────────────────────────────────
function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggle,
  isProcessing,
}: {
  product: AdminProduct;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isProcessing: boolean;
}) {
  return (
    <Card className="mb-4 rounded-[24px] border border-[#EBE8E1] bg-[#FCFBF8] px-4 py-4">
      {/* Top row: name + active badge */}
      <View style={styles.cardTopRow}>
        <View style={[styles.activeBadge, { backgroundColor: product.is_active ? '#DCF2C0' : '#F3DDD4' }]}>
          <View style={[styles.activeDot, { backgroundColor: product.is_active ? BRAND_GREEN : '#C93206' }]} />
          <Text style={[styles.activeBadgeText, { color: product.is_active ? '#3A6B00' : '#C93206' }]}>
            {product.is_active ? 'نشط' : 'معطّل'}
          </Text>
        </View>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
      </View>

      {/* Meta row */}
      <View style={styles.cardMeta}>
        <Text style={styles.metaText}>₪ {product.price.toFixed(2)}</Text>
        {product.category_name ? (
          <View style={styles.metaSep} />
        ) : null}
        {product.category_name ? (
          <Text style={styles.metaText}>{product.category_name}</Text>
        ) : null}
        <View style={styles.metaSep} />
        <Text style={styles.metaText}>مخزون: {product.stock}</Text>
      </View>

      {product.description ? (
        <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>
      ) : null}

      {/* Actions */}
      <View style={styles.cardActions}>
        {/* Toggle active */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionToggle, isProcessing && styles.actionDisabled]}
          onPress={onToggle}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          <Ionicons
            name={product.is_active ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color={isProcessing ? '#B9B9B9' : '#5A7A00'}
          />
          <Text style={[styles.actionBtnText, styles.actionToggleText, isProcessing && styles.actionDisabledText]}>
            {product.is_active ? 'تعطيل' : 'تفعيل'}
          </Text>
        </TouchableOpacity>

        {/* Edit */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionEdit]}
          onPress={onEdit}
          activeOpacity={0.85}
        >
          <Feather name="edit-2" size={18} color="#FFFFFF" />
          <Text style={[styles.actionBtnText, styles.actionEditText]}>تعديل</Text>
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionDelete, isProcessing && styles.actionDisabled]}
          onPress={onDelete}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          <Feather name="trash-2" size={18} color={isProcessing ? '#B9B9B9' : '#C93206'} />
          <Text style={[styles.actionBtnText, styles.actionDeleteText, isProcessing && styles.actionDisabledText]}>حذف</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export function AdminProductsScreen() {
  const router = useRouter();
  const { isAuthenticated, isInitializing, role } = useAuth();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const productsSignal = useRealtimeSignal('products');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const [formVisible, setFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([getAdminProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    if (!isAuthenticated || role !== 'admin') return;
    loadData();
  }, [isAuthenticated, role, loadData, productsSignal]));

  if (!isInitializing && (!isAuthenticated || role !== 'admin')) {
    router.replace(isAuthenticated ? '/home' : '/(auth)/login');
    return null;
  }

  // Filtered list
  const filtered = products.filter((p) => {
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchFilter =
      filterActive === 'all' ? true : filterActive === 'active' ? p.is_active : !p.is_active;
    return matchSearch && matchFilter;
  });

  const openAdd = () => {
    setEditingProduct(null);
    setFormVisible(true);
  };

  const openEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormVisible(true);
  };

  const handleSave = async (input: AdminProductInput) => {
    try {
      if (editingProduct) {
        const updated = await adminUpdateProduct(editingProduct.id, input);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updated : p))
        );
      } else {
        const created = await adminCreateProduct(input);
        setProducts((prev) => [created, ...prev]);
      }
      setFormVisible(false);
      setEditingProduct(null);
    } catch (err) {
      Alert.alert('خطأ', 'تعذّر حفظ المنتج، حاول مرة أخرى.');
      throw err;
    }
  };

  const handleToggle = async (product: AdminProduct) => {
    setProcessingId(product.id);
    try {
      await adminToggleProductActive(product.id, !product.is_active);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      );
    } catch {
      Alert.alert('خطأ', 'تعذّر تغيير حالة المنتج.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = (product: AdminProduct) => {
    Alert.alert(
      'حذف المنتج',
      `هل أنت متأكد من حذف "${product.name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(product.id);
            try {
              await adminDeleteProduct(product.id);
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
            } catch {
              Alert.alert('خطأ', 'تعذّر حذف المنتج.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PAGE_BG} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          logo="transparent"
          withSidebar
          sidebarActiveItem="admin-products"
          sidebarSide="left"
          left={<Ionicons name="menu" size={28} color={BRAND_GREEN} />}
          right={
            <TouchableOpacity activeOpacity={0.8} onPress={loadData}>
              <Ionicons name="refresh-outline" size={26} color={BRAND_GREEN} />
            </TouchableOpacity>
          }
        />

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={BRAND_GREEN} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.headerSection}>
                <Text style={styles.pageTitle}>إدارة المنتجات</Text>
                <Text style={styles.pageSubtitle}>
                  {products.length} منتج إجمالاً • {products.filter((p) => p.is_active).length} نشط
                </Text>

                {/* Search */}
                <View style={styles.searchBox}>
                  <Feather name="search" size={18} color="#7A7E78" />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="بحث باسم المنتج..."
                    placeholderTextColor="#9CA09A"
                    textAlign="right"
                    style={styles.searchInput}
                  />
                  {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                      <Ionicons name="close-circle" size={18} color="#9CA09A" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Filter tabs */}
                <View style={styles.filterRow}>
                  {(['all', 'active', 'inactive'] as const).map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.filterChip, filterActive === f && styles.filterChipActive]}
                      onPress={() => setFilterActive(f)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.filterChipText, filterActive === f && styles.filterChipTextActive]}>
                        {f === 'all' ? 'الكل' : f === 'active' ? 'النشطة' : 'المعطّلة'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Add button */}
                <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.88}>
                  <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>إضافة منتج جديد</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item)}
                onToggle={() => handleToggle(item)}
                isProcessing={processingId === item.id}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="cube-outline" size={52} color="#C4C7C1" />
                <Text style={styles.emptyText}>لا توجد منتجات مطابقة</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      <ProductFormModal
        visible={formVisible}
        product={editingProduct}
        categories={categories}
        onClose={() => {
          setFormVisible(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
      />

      <StaffBottomNavbar role="admin" activeTab="products" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BG },
  safeArea: { flex: 1 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 18, paddingBottom: 160 },

  // Header
  headerSection: { marginTop: 2, marginBottom: 14 },
  pageTitle: { textAlign: 'right', color: BRAND_TEXT, fontSize: 31, lineHeight: 38, fontFamily: 'Tajawal_700Bold' },
  pageSubtitle: { textAlign: 'right', color: '#626560', fontSize: 15, lineHeight: 22, fontFamily: 'Tajawal_500Medium', marginTop: 4 },

  // Search
  searchBox: {
    borderRadius: 20, backgroundColor: '#F1EFEB', height: 48, paddingHorizontal: 14,
    flexDirection: 'row-reverse', alignItems: 'center', borderWidth: 1, borderColor: '#ECE8DF', marginTop: 14,
  },
  searchInput: { flex: 1, fontFamily: 'Tajawal_500Medium', fontSize: 15, color: '#444845', marginRight: 8 },

  // Filter
  filterRow: { flexDirection: 'row-reverse', gap: 8, marginTop: 12 },
  filterChip: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16, backgroundColor: '#E9E7E1' },
  filterChipActive: { backgroundColor: BRAND_GREEN },
  filterChipText: { color: '#656760', fontSize: 14, fontFamily: 'Tajawal_500Medium' },
  filterChipTextActive: { color: '#FFFFFF', fontFamily: 'Tajawal_700Bold' },

  // Add button
  addBtn: {
    marginTop: 14, height: 52, borderRadius: 999, backgroundColor: BRAND_GREEN,
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: BRAND_GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,
    shadowRadius: 8, elevation: 5,
  },
  addBtnText: { color: '#FFFFFF', fontFamily: 'Tajawal_700Bold', fontSize: 16 },

  // Product card
  cardTopRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  productName: { color: BRAND_TEXT, fontFamily: 'Tajawal_700Bold', fontSize: 17, flex: 1, textAlign: 'right' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10, gap: 4, marginLeft: 8 },
  activeDot: { width: 7, height: 7, borderRadius: 999 },
  activeBadgeText: { fontFamily: 'Tajawal_700Bold', fontSize: 12 },
  cardMeta: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 6, gap: 6 },
  metaText: { color: '#6E716D', fontFamily: 'Tajawal_500Medium', fontSize: 14 },
  metaSep: { width: 1, height: 14, backgroundColor: '#D8D6D0' },
  productDesc: { color: '#8A8D87', fontFamily: 'Tajawal_500Medium', fontSize: 13, textAlign: 'right', marginBottom: 6 },

  // Card actions
  cardActions: { flexDirection: 'row-reverse', gap: 8, marginTop: 10 },
  actionBtn: { flex: 1, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  actionToggle: { backgroundColor: '#EEF6E8' },
  actionEdit: { backgroundColor: BRAND_GREEN },
  actionDelete: { backgroundColor: '#F3DDD4' },
  actionDisabled: { backgroundColor: '#EFEEE9' },
  actionBtnText: { fontFamily: 'Tajawal_700Bold', fontSize: 13 },
  actionToggleText: { color: '#5A7A00' },
  actionEditText: { color: '#FFFFFF' },
  actionDeleteText: { color: '#C93206' },
  actionDisabledText: { color: '#B9B9B9' },

  // Empty
  emptyBox: { marginTop: 60, alignItems: 'center' },
  emptyText: { marginTop: 14, textAlign: 'center', fontFamily: 'Tajawal_500Medium', color: '#7A7D78', fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: CARD_BG, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%' },
  modalHeader: {
    flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#ECEAE3',
  },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0EEE7', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  modalTitle: { flex: 1, textAlign: 'right', color: BRAND_TEXT, fontFamily: 'Tajawal_700Bold', fontSize: 20 },
  modalScroll: { paddingHorizontal: 20, paddingTop: 14 },
  modalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#ECEAE3' },

  // Form fields
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { textAlign: 'right', color: BRAND_TEXT, fontFamily: 'Tajawal_700Bold', fontSize: 14, marginBottom: 6 },
  fieldInput: {
    backgroundColor: '#F1EFEB', borderRadius: 16, height: 48, paddingHorizontal: 14,
    fontFamily: 'Tajawal_500Medium', fontSize: 15, color: '#444845', textAlign: 'right',
    borderWidth: 1, borderColor: '#E5E2DA',
  },
  fieldInputMulti: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
  fieldInputError: { borderColor: '#C93206', backgroundColor: '#FFF5F4' },
  fieldError: { textAlign: 'right', color: '#C93206', fontFamily: 'Tajawal_500Medium', fontSize: 12, marginTop: 4 },

  // Category picker
  catRow: { flexDirection: 'row-reverse', gap: 8, paddingBottom: 4 },
  catChip: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: '#E9E7E1', borderWidth: 1, borderColor: '#D8D6D0' },
  catChipActive: { backgroundColor: BRAND_GREEN, borderColor: BRAND_GREEN },
  catChipText: { color: '#656760', fontFamily: 'Tajawal_500Medium', fontSize: 13 },
  catChipTextActive: { color: '#FFFFFF', fontFamily: 'Tajawal_700Bold' },

  // Toggle row
  toggleRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
});
