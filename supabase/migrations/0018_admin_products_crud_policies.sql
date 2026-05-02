-- Allow admins to manage products and categories.
-- Note: select (read) is already handled by public_read policies in 0002_rls_policies.sql.

-- Products CRUD for admins
drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert" on public.products
for insert with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products
for delete using (public.is_admin());

-- Categories CRUD for admins
drop policy if exists "categories_admin_insert" on public.categories;
create policy "categories_admin_insert" on public.categories
for insert with check (public.is_admin());

drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update" on public.categories
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete" on public.categories
for delete using (public.is_admin());
