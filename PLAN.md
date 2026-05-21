# Personal Website — Build Plan

A small, art-first portfolio site for Ethan Moynihan. Primary goal: display paintings. Secondary: short about page.

## Decisions locked in

- **Art type:** Paintings / 2D physical
- **Volume:** Under 20 pieces to start, occasional adds
- **Add flow:** `/admin` upload page behind Supabase Auth
- **Theme vibe:** Playful / colorful
- **Branding:** Ethan Moynihan (own name)
- **Palette:** Propose one (see below)
- **Grouping:** Paintings can belong to a **series** (e.g. a body of work with a shared title and theme). Standard art-world term, reads instantly in URLs (`/series/winter-light`).

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind v4 with theme tokens in one config file
- **Backend:** Supabase free tier
  - Postgres for `artworks` table
  - Storage bucket for image files
  - Auth for admin login (just me)
- **Hosting:** Vercel free tier

Rationale: Next.js handles image optimization out of the box (critical for an art site), Tailwind keeps the colorful theme consistent via tokens, Supabase free tier covers DB + storage + auth in one place with 1GB storage (plenty for <20 paintings).

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing — featured pieces or direct entry to gallery (TBD) |
| `/gallery` | Responsive grid of all published artworks (every piece, regardless of series) |
| `/gallery/[id]` | Single artwork detail view — large image, metadata, series link, prev/next |
| `/series` | Index of all series — cover image + title + short description per series |
| `/series/[slug]` | Single series view — series description, then a grid of its paintings |
| `/about` | Short bio, contact links |
| `/admin` | Auth-gated: drag-drop uploader + manage pieces + manage series |

## Palette

Playful but calm enough to not fight the art. Lives as CSS variables + Tailwind theme tokens so swapping is a one-file change.

| Token | Hex | Use |
|---|---|---|
| `ink` | `#1a1a2e` | Text |
| `cream` | `#fdf6e3` | Background |
| `coral` | `#ff6b6b` | Primary accent — links, buttons |
| `mustard` | `#f4b942` | Secondary accent — hover, highlights |
| `sage` | `#7fb069` | Tertiary — used sparingly |

## Database schema

Two tables: `series` and `artworks`. A painting can optionally belong to one series (nullable FK). Resist further modeling — add tags/multi-image when actually needed.

```sql
create table series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,           -- url-friendly, e.g. "winter-light"
  title text not null,
  description text,
  cover_artwork_id uuid,               -- which piece represents the series (set after artworks exist)
  display_order int default 0,
  is_published bool default true,
  created_at timestamptz default now()
);

create table artworks (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references series(id) on delete set null,  -- nullable: piece can stand alone
  title text not null,
  description text,
  medium text,
  year int,
  image_path text not null,
  thumbnail_path text,
  width_px int,
  height_px int,
  display_order int default 0,         -- order within its series (or in main gallery if no series)
  is_published bool default true,
  created_at timestamptz default now()
);

-- cover_artwork_id FK added after both tables exist to avoid circular-create issues
alter table series
  add constraint series_cover_artwork_fk
  foreign key (cover_artwork_id) references artworks(id) on delete set null;

create index artworks_series_id_idx on artworks(series_id);
```

**RLS policies (both tables):**
- Public read where `is_published = true`
- Authenticated write (admin only)

## Admin upload flow

1. Log in via Supabase Auth at `/admin`
2. **Manage series:** create/edit a series (title, slug, description) — needed before assigning paintings to it
3. **Upload a painting:**
   - Drag-drop an image
   - Form autofills width/height from the file
   - Fill in title, medium, year, description
   - Optionally pick a series from a dropdown (or leave unassigned)
   - One submit → uploads file to Storage + inserts row in `artworks`
4. **Set series cover:** from a series's edit view, pick which of its paintings is the cover

## What is intentionally NOT in v1

Listed so we don't drift into building them prematurely:

- Tags or categories
- Multi-image pieces (multiple angles per painting)
- Nested series (a series inside a series)
- Paintings belonging to multiple series at once
- Search
- Pagination
- Light/dark mode toggle
- CMS abstractions
- Filtering by year/medium

Add any of these when there's a real reason — not before.

## Build steps

1. `npx create-next-app` with TypeScript + Tailwind + App Router
2. Install Supabase client libs (`@supabase/supabase-js`, `@supabase/ssr`)
3. Set up theme tokens + base layout (nav, footer, typography)
4. Build gallery + detail pages reading from Supabase
5. Build admin upload flow
6. Write `SETUP.md` covering the manual Supabase + Vercel steps (account creation, schema SQL, storage bucket, env vars)

## Manual steps that can't be scripted

Supabase and Vercel each require account creation and clicking through their setup UI. The `SETUP.md` will walk through:

- Creating a Supabase project
- Running the schema SQL
- Creating the storage bucket and setting its policies
- Copying env vars into `.env.local`
- Connecting the GitHub repo to Vercel
