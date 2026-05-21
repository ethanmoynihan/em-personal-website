# Setup

The site is scaffolded but needs a Supabase project (DB + storage + auth) and Vercel hosting. These are the manual steps that can't be scripted.

## 1. Local dev (no backend yet)

```bash
npm install
cp .env.local.example .env.local   # leave the placeholders for now
npm run dev
```

The site runs at [http://localhost:3000](http://localhost:3000). Without real Supabase creds, queries will fail and the gallery will be empty — that's fine for checking the layout and theme.

## 2. Create a Supabase project

1. Sign up at [https://supabase.com](https://supabase.com) (free tier is plenty)
2. New project → name it, set a strong database password, pick a region
3. Wait for it to provision (~1 min)

## 3. Run the schema

In Supabase → **SQL Editor** → New query, paste this and run:

```sql
-- Series table
create table series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cover_artwork_id uuid,
  display_order int default 0,
  is_published bool default true,
  created_at timestamptz default now()
);

-- Artworks table
create table artworks (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references series(id) on delete set null,
  title text not null,
  description text,
  medium text,
  year int,
  image_path text not null,
  thumbnail_path text,
  width_px int,
  height_px int,
  display_order int default 0,
  is_published bool default true,
  created_at timestamptz default now()
);

-- Cover FK (added after both tables exist to avoid circular create)
alter table series
  add constraint series_cover_artwork_fk
  foreign key (cover_artwork_id) references artworks(id) on delete set null;

create index artworks_series_id_idx on artworks(series_id);

-- Row Level Security
alter table series enable row level security;
alter table artworks enable row level security;

-- Public can read published rows
create policy "public read published series"
  on series for select
  using (is_published = true);

create policy "public read published artworks"
  on artworks for select
  using (is_published = true);

-- Authenticated users (i.e. you) can do anything
create policy "authenticated full access series"
  on series for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated full access artworks"
  on artworks for all
  to authenticated
  using (true)
  with check (true);
```

## 4. Create the storage bucket

In Supabase → **Storage** → New bucket:

- Name: `artworks`
- Public bucket: **yes** (so images load without signed URLs)

Then under **Policies** for the `artworks` bucket, add:

```sql
-- Public can read all files in the bucket
create policy "public read artworks bucket"
  on storage.objects for select
  using (bucket_id = 'artworks');

-- Authenticated users can upload/delete
create policy "authenticated write artworks bucket"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'artworks')
  with check (bucket_id = 'artworks');
```

(You can also click through the UI to set these as templates — the Storage policy editor has presets.)

## 5. Create your admin user

In Supabase → **Authentication** → **Users** → **Add user** → **Create new user**:

- Email: your email
- Password: a strong one
- **Auto-confirm user**: yes

This is the only account that will be able to upload. The site doesn't expose a public signup.

## 6. Copy env vars into `.env.local`

In Supabase → **Project Settings** → **API**, copy:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Restart `npm run dev` so the new env vars are picked up.

## 7. Try it locally

1. Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Sign in with the user you just created
3. Upload your first painting
4. (Optional) Create a series at `/admin/series`, then re-upload or edit a piece to assign it
5. Visit `/gallery` and `/series` to see it live

## 8. Deploy to Vercel

1. Push the repo to GitHub (already done — repo is `ethanmoynihan/em-personal-website`)
2. [https://vercel.com](https://vercel.com) → New Project → import the repo
3. Framework preset: Next.js (auto-detected)
4. **Environment variables**: add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as `.env.local`)
5. Deploy

You'll get a `*.vercel.app` URL. Point a custom domain at it later via Vercel's domain settings if you want.

## Troubleshooting

**Images don't load on the deployed site.** Make sure the env vars are set in Vercel — `next.config.ts` reads `NEXT_PUBLIC_SUPABASE_URL` at build time to allowlist the image host. After adding/changing them, trigger a redeploy.

**"new row violates row-level security policy" on upload.** You're not logged in, or the auth cookie isn't being passed. Sign out and back in.

**Can't sign in.** Confirm the user exists in Supabase Auth and is confirmed (no pending email verification).