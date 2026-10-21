-- Islamic Daily — the adhkar library the app downloads when online.
--
-- Recreates public.daily_adhkar in the shape the app uses. The original
-- table (int8 id, single `translation`, int `reference`/`virtue`) could not
-- hold three languages or text references. Safe to run on the empty table;
-- it refuses to run if the table already has rows.
--
-- Run in Supabase: SQL Editor → paste → Run. Then load data with
-- supabase/seed/daily_adhkar.sql (or import supabase/seed/daily_adhkar.csv).

do $$
begin
  if to_regclass('public.daily_adhkar') is not null then
    if exists (select 1 from public.daily_adhkar) then
      raise exception 'public.daily_adhkar has rows; export them before recreating the table';
    end if;
  end if;
end
$$;

drop table if exists public.daily_adhkar;

create table public.daily_adhkar (
  -- Stable key. The app stores each user's daily counts under it, so never
  -- rename an id once published; add a new row instead.
  id              text primary key check (id ~ '^[a-z0-9_]+$'),
  list            text not null default 'others' check (list in ('favourites', 'others')),
  time_of_day     text not null check (time_of_day in ('morning', 'evening', 'salah', 'any')),
  sort_order      integer not null default 0,

  name            text not null check (length(btrim(name)) > 0),
  name_ar         text not null default '',
  arabic          text not null check (length(btrim(arabic)) > 0),
  count           integer not null check (count between 1 and 100000),
  -- Optional multi-part count, as a JSON array, e.g.
  -- [{"arabic":"سُبْحَانَ اللَّهِ","count":33,"label":"SubhanAllah"}, ...]
  -- Stored as text so it can be edited and CSV-imported like any other cell.
  segments        text check (segments is null or segments = '' or jsonb_typeof(segments::jsonb) = 'array'),

  translation_ur  text,
  translation_hi  text,
  translation_en  text,
  virtue_ur       text,
  virtue_hi       text,
  virtue_en       text,
  hadith_ur       text,
  hadith_hi       text,
  hadith_en       text,
  -- Short reference shown as a chip, e.g. 'Sahih al-Bukhari 6306'.
  source          text,

  -- Untick to hide an entry from the app without deleting it.
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.daily_adhkar is 'Adhkar served to the Islamic Daily app (read-only for clients).';
comment on column public.daily_adhkar.id is 'Stable key; the app stores daily counts under it. Do not rename.';
comment on column public.daily_adhkar.list is 'Which tab: favourites or others ("More adhkar").';
comment on column public.daily_adhkar.time_of_day is 'morning | evening | salah (after salah) | any';
comment on column public.daily_adhkar.sort_order is 'Order within the list (gaps of 10 leave room to insert).';
comment on column public.daily_adhkar.segments is 'Optional JSON array of {arabic, count, label}; counts must add up to count.';
comment on column public.daily_adhkar.is_active is 'Untick to hide from the app without deleting.';

-- Keep updated_at current on every edit.
create or replace function public.daily_adhkar_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger daily_adhkar_touch_updated_at
before update on public.daily_adhkar
for each row execute function public.daily_adhkar_touch_updated_at();

-- Clients (the app, with the anon/publishable key) may only read active rows.
-- Edits happen in the Supabase dashboard, which bypasses RLS.
alter table public.daily_adhkar enable row level security;

create policy "Anyone can read active adhkar"
on public.daily_adhkar
for select
to anon, authenticated
using (is_active);

revoke all on public.daily_adhkar from anon, authenticated;
grant select on public.daily_adhkar to anon, authenticated;
