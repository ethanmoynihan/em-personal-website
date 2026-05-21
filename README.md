# em-personal-website

Personal portfolio site — paintings, organized into series.

Stack: Next.js 16 (App Router) + Tailwind v4 + Supabase (DB, storage, auth) + Vercel.

- See [`PLAN.md`](./PLAN.md) for the design + decisions
- See [`SETUP.md`](./SETUP.md) for how to wire up Supabase and deploy

## Quick start

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase creds (see SETUP.md)
npm run dev
```

## Routes

| Route | What |
|---|---|
| `/` | Landing — recent work |
| `/gallery` | All published paintings |
| `/gallery/[id]` | Single painting |
| `/series` | Index of series |
| `/series/[slug]` | Single series |
| `/about` | Bio + contact |
| `/admin` | Auth-gated — upload + manage artworks |
| `/admin/series` | Auth-gated — create/edit series |
| `/admin/login` | Sign in |
