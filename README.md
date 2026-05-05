# תזונה וכושר AI

Full-stack RTL Hebrew nutrition + fitness tracker with AI parsing, behavior analytics, and goal modes (cutting / bulking / maintenance).

Built with Next.js 15 (App Router) · Supabase · Anthropic Claude · Tailwind RTL · TanStack Query · Recharts.

---

## What's in here

- **Frontend** — Next.js App Router, fully RTL Hebrew UI, mobile-first
- **Backend** — Next.js API routes (REST), Zod validation
- **Database** — Supabase (Postgres) with row-level security for multi-tenant isolation
- **Auth** — Supabase Auth with cookie session
- **AI** — Anthropic Claude for free-text meal parsing, activity parsing, and behavioral insights
- **Calc engine** — Mifflin–St Jeor TDEE, protein targets, weight forecasting, anomaly detection

### Screens

| Route        | Purpose                                                      |
| ------------ | ------------------------------------------------------------ |
| `/login`     | Sign-in                                                      |
| `/register`  | Sign-up                                                      |
| `/dashboard` | המסך הראשי — calorie balance, protein, weight forecast, meals/activities, AI add |
| `/weekly`    | 7-day calorie/protein/net charts + anomaly detection          |
| `/monthly`   | 30-day weight trend, calorie/protein, consistency             |
| `/insights`  | Claude-generated behavioral insights with severity tagging    |
| `/goal`      | Cutting / Bulking / Maintain selector + projection chart      |
| `/profile`   | Personal data driving TDEE                                    |

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run the contents of [`supabase/schema.sql`](./supabase/schema.sql). This creates all tables, triggers, and RLS policies.
3. Copy your project URL and `anon` key from **Project Settings → API**.

### 3. Anthropic API key

Get a key from [console.anthropic.com](https://console.anthropic.com).

### 4. Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

### 5. Run

```bash
npm run dev
```

Open <http://localhost:3000>. Register, fill out your profile, and start logging.

---

## API surface

All routes live under `/api`. Auth is via Supabase cookies; multi-tenant isolation is enforced at the database level by RLS.

| Method | Path                          | Purpose                              |
| ------ | ----------------------------- | ------------------------------------ |
| POST   | `/api/auth/register`          | Create account                       |
| POST   | `/api/auth/login`             | Sign in                              |
| POST   | `/api/auth/logout`            | Sign out                             |
| GET    | `/api/daily/today`            | Today's hero data (log + AI targets) |
| POST   | `/api/daily/clear`            | Wipe today's meals + activities      |
| POST   | `/api/meals`                  | Add meal                             |
| PATCH  | `/api/meals/:id`              | Edit meal                            |
| DELETE | `/api/meals/:id`              | Delete meal                          |
| POST   | `/api/activities`             | Add activity                         |
| DELETE | `/api/activities/:id`         | Delete activity                      |
| GET    | `/api/analytics/weekly`       | 7-day series + anomalies             |
| GET    | `/api/analytics/monthly`      | 30-day series + consistency          |
| GET    | `/api/analytics/insights`     | Cached Claude insights               |
| POST   | `/api/analytics/insights`     | Regenerate insights (calls Claude)   |
| GET    | `/api/goal`                   | Goal config                          |
| PUT    | `/api/goal`                   | Update goal                          |
| GET    | `/api/profile`                | Profile                              |
| PUT    | `/api/profile`                | Update profile                       |
| GET    | `/api/weight`                 | Weight history                       |
| POST   | `/api/weight`                 | Log weight                           |
| POST   | `/api/ai/parse-meal`          | Free-text → macros                   |
| POST   | `/api/ai/parse-activity`      | Free-text → workout estimate         |

---

## Architecture notes

**Multi-tenant isolation.** Every user-owned table has a `user_id uuid` column with an RLS policy `user_id = auth.uid()`. Users physically cannot read each other's rows even with a leaked anon key.

**Daily totals are auto-maintained.** When you insert/update/delete a meal or activity, a Postgres trigger calls `recompute_daily_totals(user_id, log_date)` which sums macros and updates the `daily_logs` row. The frontend never has to compute this.

**Generated columns.** `daily_logs.net_calories` is `calories_in - calories_out` as a `GENERATED ALWAYS AS ... STORED` column.

**TDEE.** Mifflin–St Jeor BMR × activity multiplier (1.2 sedentary → 1.9 very active). Defaults are conservative.

**Weight forecast.** 7700 kcal ≈ 1 kg fat; we project forward linearly. Short-term (<2 weeks) noise is dominated by water/glycogen so the projection is best read as a 4-8 week trend.

**Behavior signals → Claude.** `analyzeBehavior()` produces structured numbers (night-eating ratio, weekend overflow, protein deficit, inactive days). Those numbers — not raw meals — go to Claude, which writes 3-5 Hebrew insights with severity & recommendation. Insights are cached for 24h in `ai_insights`.

---

## To wrap as APK

This app is PWA-ready (`/manifest.webmanifest`, mobile-first responsive). To ship Android:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "תזונה AI" com.example.nutritionai --web-dir=out
# add `output: 'export'` to next.config.js, set all `(app)` pages dynamic=false
npx next build
npx cap add android
npx cap sync
npx cap open android   # → Android Studio
```

Note: Capacitor wants a static export, so server-rendered routes need to be reworked or proxied to a hosted backend. Easiest path is to deploy this Next.js app to Vercel and have Capacitor wrap a thin shell pointing at the hosted URL.

---

## File map

```
supabase/schema.sql                — DB schema + RLS
src/middleware.ts                  — refresh Supabase session, redirect on auth
src/app/api/...                    — REST routes
src/app/(app)/...                  — authed pages: dashboard, weekly, monthly, insights, goal, profile
src/app/login, /register           — auth pages
src/components/                    — UI primitives, charts, modals, nav
src/lib/supabase/                  — Supabase client/server/middleware helpers
src/lib/ai/                        — Claude prompts + parsers
src/lib/calc/                      — TDEE, protein target, forecast, behavior analysis
src/lib/constants.ts               — Hebrew strings (single source of truth)
src/lib/format.ts                  — Hebrew date/number formatting
src/types.ts                       — shared TS types
```
