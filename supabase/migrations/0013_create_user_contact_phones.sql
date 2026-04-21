create table if not exists public.user_contact_phones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_user_contact_phones_user_phone
  on public.user_contact_phones(user_id, phone);

create unique index if not exists idx_user_contact_phones_single_default
  on public.user_contact_phones(user_id)
  where is_default;

alter table public.user_contact_phones enable row level security;

drop policy if exists "user_contact_phones_select_own" on public.user_contact_phones;
create policy "user_contact_phones_select_own" on public.user_contact_phones
for select using (auth.uid() = user_id);

drop policy if exists "user_contact_phones_insert_own" on public.user_contact_phones;
create policy "user_contact_phones_insert_own" on public.user_contact_phones
for insert with check (auth.uid() = user_id);

drop policy if exists "user_contact_phones_update_own" on public.user_contact_phones;
create policy "user_contact_phones_update_own" on public.user_contact_phones
for update using (auth.uid() = user_id);

drop policy if exists "user_contact_phones_delete_own" on public.user_contact_phones;
create policy "user_contact_phones_delete_own" on public.user_contact_phones
for delete using (auth.uid() = user_id);

create or replace function public.touch_user_contact_phones_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_contact_phones_touch_updated_at on public.user_contact_phones;
create trigger trg_user_contact_phones_touch_updated_at
before update on public.user_contact_phones
for each row execute function public.touch_user_contact_phones_updated_at();
