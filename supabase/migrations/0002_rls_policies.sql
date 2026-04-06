-- RLS configuration for user-owned resources + public catalog read.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.favorites enable row level security;
alter table public.cart_items enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- profiles: user can read/update own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

-- catalog: public read-only.
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
for select using (true);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
for select using (true);

-- favorites CRUD for owner.
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
for select using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
for insert with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
for delete using (auth.uid() = user_id);

-- cart_items CRUD for owner.
drop policy if exists "cart_select_own" on public.cart_items;
create policy "cart_select_own" on public.cart_items
for select using (auth.uid() = user_id);

drop policy if exists "cart_insert_own" on public.cart_items;
create policy "cart_insert_own" on public.cart_items
for insert with check (auth.uid() = user_id);

drop policy if exists "cart_update_own" on public.cart_items;
create policy "cart_update_own" on public.cart_items
for update using (auth.uid() = user_id);

drop policy if exists "cart_delete_own" on public.cart_items;
create policy "cart_delete_own" on public.cart_items
for delete using (auth.uid() = user_id);

-- addresses CRUD for owner.
drop policy if exists "addresses_select_own" on public.addresses;
create policy "addresses_select_own" on public.addresses
for select using (auth.uid() = user_id);

drop policy if exists "addresses_insert_own" on public.addresses;
create policy "addresses_insert_own" on public.addresses
for insert with check (auth.uid() = user_id);

drop policy if exists "addresses_update_own" on public.addresses;
create policy "addresses_update_own" on public.addresses
for update using (auth.uid() = user_id);

drop policy if exists "addresses_delete_own" on public.addresses;
create policy "addresses_delete_own" on public.addresses
for delete using (auth.uid() = user_id);

-- orders: user can read/create own orders. Update/delete are intentionally omitted for customers.
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
for select using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
for insert with check (auth.uid() = user_id);

-- order_items: user can read items only for their own orders.
drop policy if exists "order_items_select_for_own_orders" on public.order_items;
create policy "order_items_select_for_own_orders" on public.order_items
for select using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

-- order_status_history: user can read history only for their own orders.
drop policy if exists "order_status_history_select_for_own_orders" on public.order_status_history;
create policy "order_status_history_select_for_own_orders" on public.order_status_history
for select using (
  exists (
    select 1
    from public.orders o
    where o.id = order_status_history.order_id
      and o.user_id = auth.uid()
  )
);
