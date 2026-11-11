# Adhkar library on Supabase

The app downloads its adhkar from `public.daily_adhkar` whenever it's online, so
editing a row in Supabase updates every phone — no new build. Offline, it uses
the last download, and before the first download the list bundled in the app.

## One-time setup

1. **Create the table.** Supabase → SQL Editor → paste
   [`migrations/20261021000000_daily_adhkar.sql`](migrations/20261021000000_daily_adhkar.sql) → Run.
   It replaces the old empty `daily_adhkar` table (and refuses to run if it has rows),
   and turns on read-only Row Level Security for the app.
2. **Load the adhkar.** Either
   - SQL Editor → paste [`seed/daily_adhkar.sql`](seed/daily_adhkar.sql) → Run (re-runnable), or
   - Table Editor → `daily_adhkar` → Insert → *Import data from CSV* →
     [`seed/daily_adhkar.csv`](seed/daily_adhkar.csv).
3. **Point the app at your project.** In [`../src/config/remote.ts`](../src/config/remote.ts) set
   `SUPABASE_URL` (`https://<project>.supabase.co`) and `SUPABASE_ANON_KEY` — the
   **anon / publishable** key from Project Settings → API. Never use the
   service_role / secret key. Build once; after that, data changes need no build.

## Editing

| Column | Notes |
|---|---|
| `id` | Lowercase letters, digits, `_`. The app saves daily counts under it — **don't rename** a published id. |
| `list` | `favourites` or `others` (the "More adhkar" tab). |
| `time_of_day` | `morning`, `evening`, `salah`, `any`. Morning/evening reminders count `favourites` only. |
| `sort_order` | Order within the list. Seeded in steps of 10, so you can insert between. |
| `count` | Target repetitions per day. |
| `segments` | Optional multi-part count as JSON, e.g. `[{"arabic":"سُبْحَانَ اللَّهِ","count":33,"label":"SubhanAllah"}, …]` (counts must add up). |
| `translation_*`, `virtue_*`, `hadith_*` | `ur`, `hi`, `en`. Leave a language empty and the app shows English with a note. |
| `source` | Short reference shown as a chip, e.g. `Sahih Muslim 2692`. |
| `is_active` | Untick to hide from the app without deleting. |

The app checks at launch, when it comes back to the foreground (at most every
15 minutes), and on pull-to-refresh in the Dhikr tab. Settings → Dhikr →
*Adhkar library* shows when it last updated, and tapping it checks now.

Rows that fail validation (missing name/Arabic, unknown `list`/`time_of_day`,
bad `count`) are skipped. If the table is empty or unreachable, the app keeps
what it already has.

## Regenerating the seed files

After changing the adhkar bundled in `src/data/adhkar/`:

```sh
npm run export:adhkar
```
