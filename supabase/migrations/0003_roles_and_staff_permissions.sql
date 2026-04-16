-- Roles + staff permissions + admin role management.

-- 1) Role enum and profile role column.
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_role'
      and n.nspname = 'public'
  ) then
    create type public.app_role as enum ('member', 'delivery', 'admin');
  end if;
end
$$;

alter table public.profiles
  add column if not exists role public.app_role not null default 'member';

create index if not exists idx_profiles_role on public.profiles(role);

-- 2) Order assignment for delivery users.
alter table public.orders
  add column if not exists assigned_delivery_user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_orders_assigned_delivery_user_id
  on public.orders(assigned_delivery_user_id);

-- 3) Keep profile data synced from auth metadata on signup.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', null))
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        updated_at = now();

  return new;
end;
$$;

-- 4) Role helper functions for RLS and backend APIs.
create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.role from public.profiles p where p.id = auth.uid()),
    'member'::public.app_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin'::public.app_role;
$$;

create or replace function public.is_delivery()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'delivery'::public.app_role;
$$;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_delivery() to authenticated;

-- 5) Audit table + admin RPC to change user roles.
create table if not exists public.user_role_audit (
  id uuid primary key default gen_random_uuid(),
  changed_by uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  old_role public.app_role not null,
  new_role public.app_role not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_role_audit_target_user_id
  on public.user_role_audit(target_user_id);

alter table public.user_role_audit enable row level security;

drop policy if exists "user_role_audit_admin_read" on public.user_role_audit;
create policy "user_role_audit_admin_read" on public.user_role_audit
for select using (public.is_admin());

create or replace function public.admin_set_user_role(
  target_user_id uuid,
  new_role public.app_role
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid;
  previous_role public.app_role;
  updated_profile public.profiles;
begin
  actor_id := auth.uid();

  if actor_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin() then
    raise exception 'Only admins can change user roles';
  end if;

  select p.role
  into previous_role
  from public.profiles p
  where p.id = target_user_id
  for update;

  if previous_role is null then
    raise exception 'Target profile not found';
  end if;

  update public.profiles p
  set role = new_role,
      updated_at = now()
  where p.id = target_user_id
  returning p.* into updated_profile;

  insert into public.user_role_audit (changed_by, target_user_id, old_role, new_role)
  values (actor_id, target_user_id, previous_role, new_role);

  return updated_profile;
end;
$$;

grant execute on function public.admin_set_user_role(uuid, public.app_role) to authenticated;

-- 6) RLS extensions for staff permissions.
-- profiles: admins and delivery can read profiles; only admins can update all profiles.
drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff" on public.profiles
for select using (public.is_admin() or public.is_delivery());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
for update using (public.is_admin()) with check (public.is_admin());

-- orders: admins read/update all. delivery reads/updates assigned only.
drop policy if exists "orders_select_admin_all" on public.orders;
create policy "orders_select_admin_all" on public.orders
for select using (public.is_admin());

drop policy if exists "orders_update_admin_all" on public.orders;
create policy "orders_update_admin_all" on public.orders
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_select_delivery_assigned" on public.orders;
create policy "orders_select_delivery_assigned" on public.orders
for select using (assigned_delivery_user_id = auth.uid());

drop policy if exists "orders_update_delivery_assigned" on public.orders;
create policy "orders_update_delivery_assigned" on public.orders
for update using (assigned_delivery_user_id = auth.uid())
with check (assigned_delivery_user_id = auth.uid());

-- addresses: delivery can read only addresses of assigned orders, admin can read all.
drop policy if exists "addresses_select_admin_all" on public.addresses;
create policy "addresses_select_admin_all" on public.addresses
for select using (public.is_admin());

drop policy if exists "addresses_select_delivery_assigned" on public.addresses;
create policy "addresses_select_delivery_assigned" on public.addresses
for select using (
  exists (
    select 1
    from public.orders o
    where o.address_id = addresses.id
      and o.assigned_delivery_user_id = auth.uid()
  )
);

-- order_items: admins all, delivery for assigned orders.
drop policy if exists "order_items_select_admin_all" on public.order_items;
create policy "order_items_select_admin_all" on public.order_items
for select using (public.is_admin());

drop policy if exists "order_items_select_delivery_assigned" on public.order_items;
create policy "order_items_select_delivery_assigned" on public.order_items
for select using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.assigned_delivery_user_id = auth.uid()
  )
);

-- order status history: admins all; delivery read/insert for assigned orders.
drop policy if exists "order_status_history_select_admin_all" on public.order_status_history;
create policy "order_status_history_select_admin_all" on public.order_status_history
for select using (public.is_admin());

drop policy if exists "order_status_history_insert_admin_all" on public.order_status_history;
create policy "order_status_history_insert_admin_all" on public.order_status_history
for insert with check (public.is_admin());

drop policy if exists "order_status_history_select_delivery_assigned" on public.order_status_history;
create policy "order_status_history_select_delivery_assigned" on public.order_status_history
for select using (
  exists (
    select 1
    from public.orders o
    where o.id = order_status_history.order_id
      and o.assigned_delivery_user_id = auth.uid()
  )
);

drop policy if exists "order_status_history_insert_delivery_assigned" on public.order_status_history;
create policy "order_status_history_insert_delivery_assigned" on public.order_status_history
for insert with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_status_history.order_id
      and o.assigned_delivery_user_id = auth.uid()
  )
);
