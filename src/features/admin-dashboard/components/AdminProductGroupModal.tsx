import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { AdminProduct, AdminProductInput, adminUpdateProduct, adminDeleteProduct, adminToggleProductActive, adminCreateProduct } from '@/src/features/products/services/products.service';

type AdminProductGroupModalProps = {
  visible: boolean;
  onClose: () => void;
  groupName: string;
  variants: AdminProduct[];
  categories: { id: string, name: string }[];
  onRefresh: () => void;
};

export function AdminProductGroupModal({
  visible,
  onClose,
  groupName,
  variants: initialVariants,
  categories,
  onRefresh,
}: AdminProductGroupModalProps) {
  const [variants, setVariants] = useState<AdminProduct[]>(initialVariants);
  const [editingVariant, setEditingVariant] = useState<AdminProduct | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  // Group level states
  const [groupFeatures, setGroupFeatures] = useState<string[]>(initialVariants[0]?.features || []);
  const [groupLongDescription, setGroupLongDescription] = useState(initialVariants[0]?.long_description || '');
  const [groupCategoryId, setGroupCategoryId] = useState(initialVariants[0]?.category_id || '');
  const [groupPackaging, setGroupPackaging] = useState(initialVariants[0]?.packaging || '');

  useEffect(() => {
    setVariants(initialVariants);
    if (initialVariants.length > 0) {
      setGroupFeatures(initialVariants[0].features || []);
      setGroupLongDescription(initialVariants[0].long_description || '');
      setGroupCategoryId(initialVariants[0].category_id || '');
      setGroupPackaging(initialVariants[0].packaging || '');
    }
  }, [initialVariants]);

  const handleUpdateGroupInfo = async () => {
    setIsSavingGroup(true);
    try {
      // Update all variants with the group info
      const updates = variants.map(v => adminUpdateProduct(v.id, {
        name: v.name,
        description: v.description,
        price: v.price,
        stock: v.stock,
        image_url: v.image_url,
        packaging: groupPackaging, // Apply group packaging to all
        is_active: v.is_active,
        category_id: groupCategoryId,
        features: groupFeatures,
        long_description: groupLongDescription
      }));
      
      await Promise.all(updates);
      Alert.alert('نجاح', 'تم تحديث معلومات المنتج لكل الأوزان');
      onRefresh();
    } catch {
      Alert.alert('خطأ', 'تعذر تحديث معلومات المجموعة');
    } finally {
      setIsSavingGroup(false);
    }
  };

  const availableFeatures = [
    { id: 'عضوي', label: 'عضوي', icon: 'leaf-outline' },
    { id: 'بروتين عالي', label: 'بروتين عالي', icon: 'trending-up-outline' },
    { id: 'طاقة طبيعية', label: 'طاقة طبيعية', icon: 'flash-outline' },
    { id: 'بدون سكر', label: 'بدون سكر', icon: 'remove-circle-outline' },
    { id: 'غني بالألياف', label: 'غني بالألياف', icon: 'fitness-outline' },
  ];

  const toggleGroupFeature = (id: string) => {
    setGroupFeatures(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleToggle = async (v: AdminProduct) => {
    setLoading(v.id);
    try {
      await adminToggleProductActive(v.id, !v.is_active);
      setVariants(prev => prev.map(p => p.id === v.id ? { ...p, is_active: !p.is_active } : p));
      onRefresh();
    } catch {
      Alert.alert('خطأ', 'تعذر تغيير الحالة');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = (v: AdminProduct) => {
    Alert.alert('حذف الوزن', `هل أنت متأكد من حذف وزن ${v.description}؟`, [
      { text: 'إلغاء' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          setLoading(v.id);
          try {
            await adminDeleteProduct(v.id);
            setVariants(prev => prev.filter(p => p.id !== v.id));
            onRefresh();
            if (variants.length <= 1) onClose();
          } catch {
            Alert.alert('خطأ', 'تعذر الحذف');
          } finally {
            setLoading(null);
          }
        }
      }
    ]);
  };

  const renderVariantRow = (v: AdminProduct) => (
    <View key={v.id} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => handleToggle(v)}
            className={`px-3 py-1 rounded-full ${v.is_active ? 'bg-[#DCF2C0]' : 'bg-red-100'}`}
          >
            <Text className={`font-tajawal-bold text-[12px] ${v.is_active ? 'text-[#3A6B00]' : 'text-red-700'}`}>
              {v.is_active ? 'نشط' : 'معطل'}
            </Text>
          </TouchableOpacity>
          <Text className="font-tajawal-bold text-[16px] text-brand-title ml-3">{v.description || 'بدون وزن'}</Text>
        </View>
        <Text className="font-tajawal-bold text-brand-primary text-[16px]">{v.price} ₪</Text>
      </View>

      <View className="flex-row justify-end gap-3 mt-1">
        <TouchableOpacity 
          onPress={() => handleDelete(v)}
          className="w-10 h-10 bg-red-50 rounded-full items-center justify-center"
        >
          <Feather name="trash-2" size={18} color="#C93206" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setEditingVariant(v)}
          className="flex-row items-center bg-brand-primary px-4 py-2 rounded-full"
        >
          <Feather name="edit-2" size={16} color="white" />
          <Text className="text-white font-tajawal-bold text-[14px] ml-2">تعديل</Text>
        </TouchableOpacity>
      </View>
      {loading === v.id && (
        <View className="absolute inset-0 bg-white/50 rounded-2xl items-center justify-center">
          <ActivityIndicator color="#84BD00" />
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-[#FBFBF8] rounded-t-[32px] max-h-[90%] p-6">
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={onClose} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text className="font-tajawal-bold text-[22px] text-brand-title text-right">{groupName}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Group General Settings */}
            <View className="mb-6 bg-white p-4 rounded-2xl border border-gray-100">
              <Text className="font-tajawal-bold text-gray-500 text-right mb-4">معلومات المنتج العامة (لكل الأوزان)</Text>
              
              <View className="mb-4">
                <Text className="text-right font-tajawal-bold text-gray-400 text-[12px] mb-2">التصنيف</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row-reverse">
                  {categories.map((c: any) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => setGroupCategoryId(c.id)}
                      className={`ml-2 px-4 py-1.5 rounded-full border ${groupCategoryId === c.id ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={`font-tajawal-bold text-[12px] ${groupCategoryId === c.id ? 'text-white' : 'text-gray-500'}`}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-4">
                <Text className="text-right font-tajawal-bold text-gray-400 text-[12px] mb-2">المميزات (Tags)</Text>
                <View className="flex-row flex-wrap justify-end gap-2">
                  {availableFeatures.map((f) => (
                    <TouchableOpacity
                      key={f.id}
                      onPress={() => toggleGroupFeature(f.id)}
                      className={`flex-row items-center px-3 py-1.5 rounded-full border ${groupFeatures.includes(f.id) ? 'bg-green-50 border-brand-primary' : 'bg-white border-gray-100'}`}
                    >
                      <Ionicons name={f.icon as any} size={14} color={groupFeatures.includes(f.id) ? '#84BD00' : '#999'} />
                      <Text className={`font-tajawal-medium text-[11px] ml-1 ${groupFeatures.includes(f.id) ? 'text-brand-primary' : 'text-gray-400'}`}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-right font-tajawal-bold text-gray-400 text-[12px] mb-2">نوع التغليف العام</Text>
                <TextInput 
                  value={groupPackaging}
                  onChangeText={setGroupPackaging}
                  className="bg-gray-50 p-3 rounded-xl text-right font-tajawal-medium text-[13px]"
                  placeholder="مثال: مرطبان، كيس..."
                />
              </View>

              <View className="mb-4">
                <Text className="text-right font-tajawal-bold text-gray-400 text-[12px] mb-2">عن المنتج (الوصف التفصيلي)</Text>
                <TextInput 
                  value={groupLongDescription}
                  onChangeText={setGroupLongDescription}
                  multiline
                  className="bg-gray-50 p-3 rounded-xl text-right font-tajawal-medium text-[13px] min-h-[80px]"
                  placeholder="اكتب وصفاً موحداً للمنتج هنا..."
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity 
                onPress={handleUpdateGroupInfo}
                disabled={isSavingGroup}
                className="bg-brand-primary py-3 rounded-xl items-center"
              >
                {isSavingGroup ? <ActivityIndicator color="white" /> : <Text className="text-white font-tajawal-bold text-[14px]">تحديث معلومات المنتج العامة</Text>}
              </TouchableOpacity>
            </View>

            <Text className="font-tajawal-bold text-gray-500 text-right mb-4">الأوزان والأسعار المتوفرة</Text>
            {variants.map(renderVariantRow)}

            <TouchableOpacity 
              onPress={() => setIsAdding(true)}
              className="flex-row items-center justify-center bg-white border-2 border-dashed border-brand-primary p-4 rounded-2xl mt-2"
            >
              <Ionicons name="add-circle-outline" size={24} color="#84BD00" />
              <Text className="text-brand-primary font-tajawal-bold text-[16px] ml-2">إضافة وزن جديد</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Internal Modal for Editing/Adding a specific variant */}
      {(editingVariant || isAdding) && (
        <VariantEditModal 
          visible={true}
          product={editingVariant}
          groupName={groupName}
          categories={categories}
          onClose={() => {
            setEditingVariant(null);
            setIsAdding(false);
          }}
          onSave={async (input: AdminProductInput) => {
            const finalInput = {
              ...input,
              features: groupFeatures,
              long_description: groupLongDescription,
              category_id: groupCategoryId,
              packaging: input.packaging || groupPackaging // Fallback to group packaging
            };
            if (editingVariant) {
              await adminUpdateProduct(editingVariant.id, finalInput);
            } else {
              await adminCreateProduct(finalInput);
            }
            onRefresh();
            setEditingVariant(null);
            setIsAdding(false);
          }}
        />
      )}
    </Modal>
  );
}

function VariantEditModal({ visible, product, groupName, categories, onClose, onSave }: any) {
  const [form, setForm] = useState({
    name: product?.name || groupName || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '100',
    image_url: product?.image_url || '',
    packaging: product?.packaging || '',
    category_id: product?.category_id || (categories.length > 0 ? categories[0].id : ''),
    is_active: product ? product.is_active : true,
    features: product?.features || [],
    long_description: product?.long_description || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price) {
      Alert.alert('تنبيه', 'يرجى إكمال البيانات الأساسية');
      return;
    }
    setLoading(true);
    try {
      await onSave({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      });
      onClose();
    } catch (e) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/60 items-center justify-center px-4">
        <View className="bg-white w-full rounded-[32px] p-6 shadow-xl max-h-[90%]">
          <Text className="font-tajawal-bold text-[20px] text-brand-title text-center mb-4">
            {product ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
            <View>
              <Text className="text-right font-tajawal-bold text-gray-500 mb-2">اسم المنتج</Text>
              <TextInput 
                value={form.name}
                onChangeText={t => setForm({...form, name: t})}
                className="bg-gray-50 p-4 rounded-xl text-right font-tajawal-bold"
                placeholder="اسم المنتج"
              />
            </View>

            <View>
              <Text className="text-right font-tajawal-bold text-gray-500 mb-2">الوزن / الحجم</Text>
              <TextInput 
                value={form.description}
                onChangeText={t => setForm({...form, description: t})}
                className="bg-gray-50 p-4 rounded-xl text-right font-tajawal-bold"
                placeholder="مثال: 500 جرام"
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-right font-tajawal-bold text-gray-500 mb-2">المخزون</Text>
                <TextInput 
                  value={form.stock}
                  onChangeText={t => setForm({...form, stock: t})}
                  keyboardType="numeric"
                  className="bg-gray-50 p-4 rounded-xl text-right font-tajawal-bold"
                />
              </View>
              <View className="flex-1">
                <Text className="text-right font-tajawal-bold text-gray-500 mb-2">السعر (₪)</Text>
                <TextInput 
                  value={form.price}
                  onChangeText={t => setForm({...form, price: t})}
                  keyboardType="numeric"
                  className="bg-gray-50 p-4 rounded-xl text-right font-tajawal-bold"
                />
              </View>
            </View>

            <View>
              <Text className="text-right font-tajawal-bold text-gray-500 mb-2">التغليف</Text>
              <TextInput 
                value={form.packaging}
                onChangeText={t => setForm({...form, packaging: t})}
                className="bg-gray-50 p-4 rounded-xl text-right font-tajawal-bold"
                placeholder="مثال: كيس، مرطبان..."
              />
            </View>

            <View>
              <Text className="text-right font-tajawal-bold text-gray-500 mb-2">رابط الصورة</Text>
              <TextInput 
                value={form.image_url}
                onChangeText={t => setForm({...form, image_url: t})}
                className="bg-gray-50 p-4 rounded-xl text-right font-tajawal-medium text-[12px]"
                placeholder="https://..."
              />
            </View>
          </ScrollView>

          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-gray-100 py-4 rounded-2xl items-center">
              <Text className="font-tajawal-bold text-gray-600">إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} className="flex-2 bg-brand-primary py-4 rounded-2xl items-center flex-row justify-center px-8">
              {loading ? <ActivityIndicator color="white" /> : <Text className="font-tajawal-bold text-white">حفظ البيانات</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
