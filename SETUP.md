# Quick setup

## 1. Install dependencies

```bash
cd "Gym app"
npm install
```

## 2. Create the Supabase project

1. Go to <https://supabase.com> → New Project.
2. Once provisioned, open **SQL Editor → New query** and paste the entire contents of `supabase/schema.sql`. Click **Run**.
3. **Project Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Authentication → Providers → Email** → make sure Email is enabled. For dev, you can disable "Confirm email" so registration logs you in immediately.

## 3. Anthropic API key

Visit <https://console.anthropic.com>, create a key, copy it to `.env.local` as `ANTHROPIC_API_KEY`.

## 4. .env.local

```bash
cp .env.example .env.local
# edit .env.local with the values above
```

## 5. Run

```bash
npm run dev
```

Open <http://localhost:3000>. Register → fill out profile (height, weight, gender, age, activity level) → return to the dashboard and start logging.

## 6. (Optional) Type-check

```bash
npm run typecheck
```

## Smoke test the AI

On the dashboard, tap "הוספת מזון/שתייה" and type something like:

> סלט יווני גדול עם פיתה ושני שיפודי עוף

Click "ניתוח עם AI". Within ~2s Claude will return calories/protein/carbs/fats. Edit if needed, save.

For activities, try:

> ריצה 30 דקות בקצב בינוני
