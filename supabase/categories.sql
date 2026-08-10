-- Mehrere Kategorien pro Übung ermöglichen.
-- Im Supabase SQL-Editor ausführen (einmalig), bevor mehrere Kategorien gespeichert werden.

alter table public.exercises
  alter column category type text[]
  using case
    when category is null then '{}'::text[]
    else array[category]
  end;
