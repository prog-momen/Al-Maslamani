import { supabase } from '@/src/lib/supabase/client';
import { Database } from '@/src/lib/supabase/database.types';
import { sendNotification } from '@/src/features/notifications/services/notifications.service';
import { formatOrderNumber } from '@/src/shared/utils/order-utils';

const sb = supabase as any;

export type AppRole = Database['public']['Tables']['profiles']['Row']['role'];
export type OrderStatus = Database['public']['Tables']['orders']['Row']['status'];

export type OrderHistoryItem = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  productName: string;
  productSubtitle: string;
  productImageUrl: string | null;
};

/** Re-orders an existing order by adding all its items to the current user's cart. */
export async function reorderOrder(orderId: string, userId: string) {
  // 1. Fetch all items from the old order
  const { data: orderItems, error: fetchError } = await sb
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId);

  if (fetchError || !orderItems) {
    throw fetchError || new Error('No items found in this order');
  }

  // 2. Add each item to the cart
  const cartEntries = orderItems.map((item: any) => ({
    user_id: userId,
    product_id: item.product_id,
    quantity: item.quantity,
  }));

  const { error: insertError } = await sb
    .from('cart_items')
    .insert(cartEntries);

  if (insertError) {
    throw insertError;
  }
}

export type AdminOrderItem = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  customerName: string;
  userId: string;
  createdAt: string;
  assignedDeliveryUserId: string | null;
  assignedDeliveryName: string | null;
};

export type AdminUserItem = {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
};

type PlaceOrderFromCartPayload = {
  addressLabel: string;
  addressDetails: string;
  paymentMethod: 'cash_on_delivery' | 'card';
  deliveryFee: number;
  note?: string;
};

export type DeliveryOrderProduct = {
  id: string;
  name: string;
  quantity: number;
  imageUrl: string | null;
  unitPrice: number;
};

export type DeliveryOrderDetails = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  customerName: string;
  customerPhone: string | null;
  addressTitle: string;
  addressDetails: string;
  notes: string | null;
  items: DeliveryOrderProduct[];
};

export type OrderTrackingDetails = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  deliveryName: string | null;
  deliveryPhone: string | null;
  productName: string;
  productQuantity: number;
};



function toDisplayName(fullName?: string | null, email?: string | null, fallback = 'مستخدم') {
  const normalizedFullName = fullName?.trim();
  if (normalizedFullName) {
    return normalizedFullName;
  }

  const normalizedEmail = email?.trim();
  if (normalizedEmail) {
    const [prefix] = normalizedEmail.split('@');
    return prefix || normalizedEmail;
  }

  return fallback;
}

export async function getUserRole(userId: string): Promise<AppRole> {
  const { data, error } = await sb
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.role ?? 'member';
}

export async function getMyOrders(userId: string): Promise<OrderHistoryItem[]> {
  const { data: ordersData, error: ordersError } = await sb
    .from('orders')
    .select('id,status,total,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (ordersError) {
    throw ordersError;
  }

  const orderIds = (ordersData ?? []).map((o: any) => o.id);
  if (orderIds.length === 0) {
    return [];
  }

  const { data: itemsData, error: itemsError } = await sb
    .from('order_items')
    .select('order_id,quantity,product_name_snapshot,product_price_snapshot,product_id,products(image_url)')
    .in('order_id', orderIds);

  if (itemsError) {
    throw itemsError;
  }

  const firstItemByOrder = new Map<string, any>();
  for (const item of itemsData ?? []) {
    if (!firstItemByOrder.has(item.order_id)) {
      firstItemByOrder.set(item.order_id, item);
    }
  }

  return (ordersData ?? []).map((order: any) => {
    const firstItem = firstItemByOrder.get(order.id);
    const productImage = Array.isArray(firstItem?.products)
      ? firstItem?.products[0]?.image_url
      : firstItem?.products?.image_url;

    return {
      id: order.id,
      orderNumber: formatOrderNumber(order.id),
      status: order.status,
      total: order.total,
      createdAt: order.created_at,
      productName: firstItem?.product_name_snapshot ?? 'طلب بدون عناصر',
      productSubtitle: firstItem ? `الكمية ${firstItem.quantity}` : '-',
      productImageUrl: productImage ?? null,
    };
  });
}

export async function getAdminOrders(): Promise<AdminOrderItem[]> {
  const { data: ordersData, error: ordersError } = await sb
    .from('orders')
    .select('id,user_id,status,total,created_at,assigned_delivery_user_id')
    .order('created_at', { ascending: false });

  if (ordersError) {
    throw ordersError;
  }

  const profileIds = Array.from(
    new Set(
      (ordersData ?? []).flatMap((o: any) => [o.user_id, o.assigned_delivery_user_id].filter(Boolean))
    )
  );

  const { data: profilesData, error: profilesError } = await sb
    .from('profiles')
    .select('id,full_name,email')
    .in('id', profileIds);

  if (profilesError) {
    throw profilesError;
  }

  const profileMap = new Map((profilesData ?? []).map((p: any) => [p.id, p]));

  return (ordersData ?? []).map((order: any) => {
    const profile: any = profileMap.get(order.user_id);
    const assignedDeliveryProfile: any = order.assigned_delivery_user_id
      ? profileMap.get(order.assigned_delivery_user_id)
      : null;

    return {
      id: order.id,
      orderNumber: formatOrderNumber(order.id),
      status: order.status,
      total: order.total,
      customerName: toDisplayName(profile?.full_name, profile?.email, 'عميل'),
      userId: order.user_id,
      createdAt: order.created_at,
      assignedDeliveryUserId: order.assigned_delivery_user_id ?? null,
      assignedDeliveryName: order.assigned_delivery_user_id
        ? toDisplayName(assignedDeliveryProfile?.full_name, assignedDeliveryProfile?.email, 'مندوب')
        : null,
    };
  });
}

export async function placeOrderFromCart(payload: PlaceOrderFromCartPayload): Promise<{ orderId: string }> {
  const { data, error } = await sb.rpc('place_order_from_cart', {
    address_label: payload.addressLabel,
    address_details: payload.addressDetails,
    payment_method_input: payload.paymentMethod,
    delivery_fee_input: payload.deliveryFee,
    note_input: payload.note ?? null,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('تعذر إنشاء الطلب');
  }

  return { orderId: data as string };
}

export async function adminAssignDeliveryToOrder(orderId: string, deliveryUserId: string) {
  const { data, error } = await sb.rpc('admin_assign_delivery_to_order', {
    target_order_id: orderId,
    delivery_user_id: deliveryUserId,
  });

  if (error) {
    throw error;
  }

  // 1. Notify the Customer about delivery assignment
  const { data: order } = await sb.from('orders').select('user_id').eq('id', orderId).single();
  const orderNumber = formatOrderNumber(orderId);

  if (order) {
    await sendNotification({
      type: 'order_update',
      title: `🚚 تم تعيين مندوب لطلبك ${orderNumber}`,
      body: 'تم تعيين مندوب توصيل لطلبك، سيتم التواصل معك قريباً.',
      userId: order.user_id,
      orderId: orderId,
    });
  }

  // 2. Notify the Delivery Person about the new task
  await sendNotification({
    type: 'order_update',
    title: `📋 مهمة توصيل جديدة: ${orderNumber}`,
    body: 'تم تعيينك لتوصيل هذا الطلب، تحقق من التفاصيل الآن.',
    userId: deliveryUserId,
    orderId: orderId,
  });

  return data;
}

export async function setOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  // 1. Update order status
  const { data: order, error: updateError } = await sb
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select('user_id')
    .single();

  if (updateError) {
    throw updateError;
  }

  // 2. Add to history
  const { error: historyError } = await sb
    .from('order_status_history')
    .insert({ order_id: orderId, status, note: note ?? null });

  if (historyError) {
    throw historyError;
  }

  // 3. Insert notification for building the order-update alert
  const orderNumber = formatOrderNumber(orderId);
  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'تم التأكيد',
    preparing: 'جاري التحضير',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'تم الإلغاء',
  };
  const label = statusLabels[status] || status;

  await sendNotification({
    type: 'order_update',
    title: `📦 تحديث الطلب ${orderNumber}`,
    body: `حالة طلبك تغيّرت إلى: ${label}`,
    userId: order.user_id,
    orderId: orderId,
  });
}

export async function getAdminUsers(): Promise<AdminUserItem[]> {
  const { data, error } = await sb
    .from('profiles')
    .select('id,full_name,email,role')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    fullName: toDisplayName(row.full_name, row.email, 'مستخدم'),
    email: row.email || '-',
    role: row.role,
  }));
}

export async function adminSetUserRole(targetUserId: string, newRole: AppRole) {
  const { data, error } = await sb.rpc('admin_set_user_role', {
    target_user_id: targetUserId,
    new_role: newRole,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function getDeliveryOrderDetails(params: {
  deliveryUserId: string;
  orderId?: string;
}): Promise<DeliveryOrderDetails | null> {
  let query = sb
    .from('orders')
    .select('id,status,total,notes,user_id,address:addresses(label,city,street,building,notes)')
    .eq('assigned_delivery_user_id', params.deliveryUserId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (params.orderId) {
    query = sb
      .from('orders')
      .select('id,status,total,notes,user_id,address:addresses(label,city,street,building,notes)')
      .eq('assigned_delivery_user_id', params.deliveryUserId)
      .eq('id', params.orderId)
      .limit(1);
  }

  const { data: ordersData, error: orderError } = await query;

  if (orderError) {
    throw orderError;
  }

  const order = ordersData?.[0];
  if (!order) {
    return null;
  }

  const { data: profile, error: profileError } = await sb
    .from('profiles')
    .select('full_name,phone')
    .eq('id', order.user_id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  const { data: itemsData, error: itemsError } = await sb
    .from('order_items')
    .select('id,quantity,product_name_snapshot,product_price_snapshot,products(image_url)')
    .eq('order_id', order.id);

  if (itemsError) {
    throw itemsError;
  }

  const mappedItems: DeliveryOrderProduct[] = (itemsData ?? []).map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    name: item.product_name_snapshot,
    unitPrice: item.product_price_snapshot,
    imageUrl: Array.isArray(item.products) ? item.products[0]?.image_url ?? null : item.products?.image_url ?? null,
  }));

  const address = Array.isArray(order.address) ? order.address[0] : order.address;
  const line1 = [address?.city, address?.street].filter(Boolean).join('، ');
  const line2 = [address?.building, address?.notes].filter(Boolean).join('، ');

  return {
    id: order.id,
    orderNumber: formatOrderNumber(order.id),
    status: order.status,
    total: order.total,
    customerName: toDisplayName(profile?.full_name, undefined, 'عميل'),
    customerPhone: profile?.phone ?? null,
    addressTitle: address?.label || 'عنوان التوصيل',
    addressDetails: line1 || line2 || 'لا يوجد عنوان متوفر',
    notes: order.notes,
    items: mappedItems,
  };
}

export async function getOrderTrackingDetails(orderId: string): Promise<OrderTrackingDetails | null> {
  const { data: order, error: orderError } = await sb
    .from('orders')
    .select('id,status,total,created_at,assigned_delivery_user_id')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError) {
    throw orderError;
  }

  if (!order) {
    return null;
  }

  let deliveryName: string | null = null;
  let deliveryPhone: string | null = null;

  if (order.assigned_delivery_user_id) {
    const { data: deliveryProfile, error: deliveryError } = await sb
      .from('profiles')
      .select('full_name,email,phone')
      .eq('id', order.assigned_delivery_user_id)
      .maybeSingle();

    if (deliveryError) {
      throw deliveryError;
    }

    deliveryName = toDisplayName(deliveryProfile?.full_name, deliveryProfile?.email, 'مندوب التوصيل');
    deliveryPhone = deliveryProfile?.phone ?? null;
  }

  const { data: firstItem, error: itemError } = await sb
    .from('order_items')
    .select('product_name_snapshot,quantity')
    .eq('order_id', order.id)
    .limit(1)
    .maybeSingle();

  if (itemError) {
    throw itemError;
  }

  return {
    id: order.id,
    orderNumber: formatOrderNumber(order.id),
    status: order.status,
    total: order.total,
    createdAt: order.created_at,
    deliveryName,
    deliveryPhone,
    productName: firstItem?.product_name_snapshot ?? 'طلب بدون عناصر',
    productQuantity: firstItem?.quantity ?? 1,
  };
}
