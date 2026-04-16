-- Order placement + delivery assignment flow helpers.

create or replace function public.place_order_from_cart(
  address_label text,
  address_details text,
  payment_method_input public.payment_method default 'cash_on_delivery',
  delivery_fee_input numeric default 0,
  note_input text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid;
  profile_row public.profiles;
  subtotal_value numeric(10, 2);
  order_total numeric(10, 2);
  created_address_id uuid;
  created_order_id uuid;
begin
  actor_id := auth.uid();

  if actor_id is null then
    raise exception 'Not authenticated';
  end if;

  select p.*
  into profile_row
  from public.profiles p
  where p.id = actor_id;

  select coalesce(sum(ci.quantity * p.price), 0)::numeric(10, 2)
  into subtotal_value
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.user_id = actor_id;

  if subtotal_value <= 0 then
    raise exception 'Cart is empty';
  end if;

  order_total := subtotal_value + coalesce(delivery_fee_input, 0);

  insert into public.addresses (
    user_id,
    label,
    full_name,
    phone,
    city,
    street,
    building,
    notes,
    is_default
  ) values (
    actor_id,
    coalesce(nullif(address_label, ''), 'عنوان التوصيل'),
    coalesce(nullif(profile_row.full_name, ''), 'عميل'),
    coalesce(nullif(profile_row.phone, ''), '-'),
    'غير محدد',
    coalesce(nullif(address_details, ''), 'لا توجد تفاصيل عنوان'),
    null,
    note_input,
    false
  )
  returning id into created_address_id;

  insert into public.orders (
    user_id,
    address_id,
    status,
    payment_method,
    subtotal,
    delivery_fee,
    total,
    notes
  ) values (
    actor_id,
    created_address_id,
    'pending',
    payment_method_input,
    subtotal_value,
    coalesce(delivery_fee_input, 0),
    order_total,
    note_input
  )
  returning id into created_order_id;

  insert into public.order_items (
    order_id,
    product_id,
    product_name_snapshot,
    product_price_snapshot,
    quantity,
    line_total
  )
  select
    created_order_id,
    ci.product_id,
    p.name,
    p.price,
    ci.quantity,
    (ci.quantity * p.price)::numeric(10, 2)
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.user_id = actor_id;

  insert into public.order_status_history (order_id, status, note)
  values (created_order_id, 'pending', 'تم إنشاء الطلب');

  delete from public.cart_items where user_id = actor_id;

  return created_order_id;
end;
$$;

grant execute on function public.place_order_from_cart(text, text, public.payment_method, numeric, text) to authenticated;

create or replace function public.admin_assign_delivery_to_order(
  target_order_id uuid,
  delivery_user_id uuid
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid;
  delivery_role public.app_role;
  updated_order public.orders;
begin
  actor_id := auth.uid();

  if actor_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin() then
    raise exception 'Only admins can assign delivery users';
  end if;

  select p.role
  into delivery_role
  from public.profiles p
  where p.id = delivery_user_id;

  if delivery_role is distinct from 'delivery'::public.app_role then
    raise exception 'Target user is not a delivery account';
  end if;

  update public.orders o
  set assigned_delivery_user_id = delivery_user_id,
      status = case when o.status = 'pending' then 'confirmed' else o.status end,
      updated_at = now()
  where o.id = target_order_id
  returning o.* into updated_order;

  if updated_order.id is null then
    raise exception 'Order not found';
  end if;

  insert into public.order_status_history (order_id, status, note)
  values (target_order_id, updated_order.status, 'تم تعيين مندوب توصيل بواسطة الادمن');

  return updated_order;
end;
$$;

grant execute on function public.admin_assign_delivery_to_order(uuid, uuid) to authenticated;
