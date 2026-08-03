-- WSV Academy: RLS für exercises
-- Im Supabase SQL-Editor ausführen.

alter table public.exercises enable row level security;

drop policy if exists "exercises_select_authenticated" on public.exercises;
drop policy if exists "exercises_insert_admin" on public.exercises;
drop policy if exists "exercises_update_admin" on public.exercises;
drop policy if exists "exercises_delete_admin" on public.exercises;

create policy "exercises_select_authenticated"
  on public.exercises
  for select
  to authenticated
  using (true);

create policy "exercises_insert_admin"
  on public.exercises
  for insert
  to authenticated
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "exercises_update_admin"
  on public.exercises
  for update
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "exercises_delete_admin"
  on public.exercises
  for delete
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
