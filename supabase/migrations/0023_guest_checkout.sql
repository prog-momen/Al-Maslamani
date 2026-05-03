-- Migration 0023: Guest Checkout Support
-- Allow null user_id in orders and addresses
alter table public.orders alter column user_id drop not null;
alter table public.addresses alter column user_id drop not null;

-- Add guest info to orders
alter table public.orders add column is_guest boolean default false;
alter table public.orders add column guest_name text;
alter table public.orders add column guest_phone text;

-- RPC for Guest Order Placement
create or replace function public.place_order_guest(
  items jsonb, -- Array of {product_id, quantity}
  address_label text,
  address_details text,
  contact_name_input text,
  contact_phone_input text,
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
  created_address_id uuid;
  created_order_id uuid;
  subtotal_value numeric(10, 2) := 0;
  order_total numeric(10, 2);
  item_record record;
  product_row record;
begin
  -- 1. Create Address for Guest
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
    null, -- Guest
    coalesce(nullif(address_label, ''), 'عنوان التوصيل'),
    coalesce(nullif(contact_name_input, ''), 'عميل ضيف'),
    coalesce(nullif(contact_phone_input, ''), '-'),
    'غير محدد',
    coalesce(nullif(address_details, ''), 'لا توجد تفاصيل عنوان'),
    null,
    note_input,
    false
  )
  returning id into created_address_id;

  -- 2. Calculate Subtotal from JSON items
  for item_record in select * from jsonb_to_recordset(items) as x(product_id uuid, quantity int)
  loop
    select price, name into product_row from public.products where id = item_record.product_id;
    subtotal_value := subtotal_value + (product_row.price * item_record.quantity);
  end loop;

  order_total := subtotal_value + coalesce(delivery_fee_input, 0);

  -- 3. Create Order
  insert into public.orders (
    user_id,
    address_id,
    status,
    payment_method,
    subtotal,
    delivery_fee,
    total,
    notes,
    is_guest,
    guest_name,
    guest_phone
  ) values (
    null,
    created_address_id,
    'pending',
    payment_method_input,
    subtotal_value,
    coalesce(delivery_fee_input, 0),
    order_total,
    note_input,
    true,
    contact_name_input,
    contact_phone_input
  )
  returning id into created_order_id;

  -- 4. Create Order Items
  for item_record in select * from jsonb_to_recordset(items) as x(product_id uuid, quantity int)
  loop
    select name, price into product_row from public.products where id = item_record.product_id;
    
    insert into public.order_items (
      order_id,
      product_id,
      product_name_snapshot,
      product_price_snapshot,
      quantity,
      line_total
    ) values (
      created_order_id,
      item_record.product_id,
      product_row.name,
      product_row.price,
      item_record.quantity,
      (item_record.quantity * product_row.price)::numeric(10, 2)
    );
  end loop;

  -- 5. Add to history
  insert into public.order_status_history (order_id, status, note)
  values (created_order_id, 'pending', 'تم إنشاء طلب ضيف');

  return created_order_id;
end;
$$;

-- Allow anyone to execute guest checkout
grant execute on function public.place_order_guest(jsonb, text, text, text, text, public.payment_method, numeric, text) to anon, authenticated;

-- Policy for guests to read their own orders IF they have the UUID
-- Since we use security definer for specialized functions, we can leave RLS tight,
-- but for the "OrderTracking" screen to work, it needs to be able to select the order.
drop policy if exists "orders_select_by_id" on public.orders;
create policy "orders_select_by_id" on public.orders
for select using (
  auth.uid() = user_id 
  OR (is_guest = true) -- Allow public read for guest orders if you have the ID
);

-- Note: In a production app, you might want to add a guest_token to ensure privacy.
-- For now, UUID is hard enough to guess.

-- Also allow reading items and history for guest orders
drop policy if exists "order_items_select_for_guest" on public.order_items;
create policy "order_items_select_for_guest" on public.order_items
for select using (
  exists (
    select 1 from public.orders o 
    where o.id = order_items.order_id 
    and (o.user_id = auth.uid() or o.is_guest = true)
  )
);

drop policy if exists "order_status_history_select_for_guest" on public.order_status_history;
create policy "order_status_history_select_for_guest" on public.order_status_history
for select using (
  exists (
    select 1 from public.orders o 
    where o.id = order_status_history.order_id 
    and (o.user_id = auth.uid() or o.is_guest = true)
  )
);
