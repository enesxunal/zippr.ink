# zippr.ink

All-in-one digital asset assistant: upload, compress, convert, and share with custom links like `zippr.ink/3kareajans`.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + Radix UI components
- **Supabase** (Auth + PostgreSQL)
- **Cloudflare R2** (S3-compatible storage)
- **Sharp** (image compression/conversion)
- **Tosla** (payment skeleton)
- **next-intl** — Deutsch (default), English, Türkçe

## Quick Start (Local)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase and R2 credentials in `.env.local`.

### 3. Supabase database

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run the file: `supabase/migrations/001_initial_schema.sql`
3. Enable **Email** and **Google** auth in Authentication → Providers
4. Add redirect URL: `http://localhost:3000/auth/callback`

### 4. Super Admin

After you register, run in Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Plans

| Plan | Price | Storage | Expiry |
|------|-------|---------|--------|
| Free | €0 | 5 GB | 7 days |
| Lite | €10/mo | 50 GB | None |
| Standard | €25/mo | 250 GB | None |
| Professional | €50/mo | 1 TB | None |
| Enterprise | Custom | Custom | None |

## Custom Links

Users set a slug like `3kareajans` → public URL: `zippr.ink/3kareajans`

## Cron Cleanup

Call daily with your `CRON_SECRET`:

```bash
curl -X POST http://localhost:3000/api/cron/cleanup \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## VPS Deploy (later)

```bash
git clone https://github.com/enesxunal/zippr.ink.git
cd zippr.ink
cp .env.example .env.local
# edit .env.local with production values
npm install
npm run build
npm start
```

## Project Structure

```
src/
  app/[locale]/     # Pages (de/en/tr)
  app/api/          # API routes
  components/       # UI components
  lib/              # Supabase, R2, plans
  i18n/             # Internationalization
messages/           # de.json, en.json, tr.json
supabase/           # SQL migrations
public/             # Logos & favicon
```
