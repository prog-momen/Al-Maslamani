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
  items_count int;
begin
  actor_id := auth.uid();

  if actor_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 1. Check if there are ANY items in the cart (regardless of price)
  select count(*) into items_count from public.cart_items where user_id = actor_id;

  if items_count = 0 then
    raise exception 'Cart is empty for user %', actor_id;
  end if;

  -- 2. Fetch profile
  select p.*
  into profile_row
  from public.profiles p
  where p.id = actor_id;

  -- 3. Calculate subtotal
  select coalesce(sum(ci.quantity * p.price), 0)::numeric(10, 2)
  into subtotal_value
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.user_id = actor_id;

  order_total := subtotal_value + coalesce(delivery_fee_input, 0);

  -- 4. Create address
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

  -- 5. Create order
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

  -- 6. Move items from cart to order items
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

  -- 7. Log history
  insert into public.order_status_history (order_id, status, note)
  values (created_order_id, 'pending', 'تم إنشاء الطلب');

  -- 8. Final clear
  delete from public.cart_items where user_id = actor_id;

  return created_order_id;
end;
$$;
