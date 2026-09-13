# Falcon Forecast

**Falcon Forecast** (falconforecast.com) is a multi-vendor football tips marketplace: a platform-run free/VIP tip stream plus independent verified tipsters who publish their own picks and set their own subscription pricing (80/20 revenue split in the tipster's favor).

Built with **Vite + React 19 + TypeScript + Tailwind CSS v4**, backed by **Supabase** (Postgres + Auth + Row Level Security) and **Vercel** (static hosting + serverless functions).

## Features

- **Real fixtures & results** (`/matches` and league routes) — live via a football-data.org proxy, including real scores and league standings.
- **Free & VIP tips** (`/tips`, `/premium-tips`, `/vip`) — platform picks gated by a sitewide VIP subscription; tipster picks gated per-tipster (pay that specific tipster to unlock their premium tips, or they can mark a tip free).
- **Tipster marketplace** (`/tipsters`) — browse verified tipsters, subscribe weekly/monthly.
- **Tipster dashboard** (`/tipster-dashboard`) — post odds on real upcoming fixtures, manage pricing, view real subscribers and revenue.
- **Admin panel** (`/admin`, admin-only) — approve/suspend tipsters, manage predictions, view platform-wide revenue.
- **Google sign-in** via Supabase's hosted OAuth flow, plus email/password auth with password reset.
- **Match comments** — real, persisted discussion threads per prediction, with per-user likes.
- **PWA** — installable, service worker, plus a Capacitor config for wrapping as a native app.

## Not yet built

- **Real payments** are wired up via Kentapay (M-Pesa STK push collect + automatic tipster payout) — see `api/kentapay/*.js`, `src/lib/payments.ts`, and the `payments` table in `supabase_schema.sql`. Needs sandbox/production credentials from developer.kentapay.com set as Vercel env vars (see `.env.example`) before it's live.
- **Real bookmaker odds comparison** (`/odds-comparison`) — needs a paid odds data source; currently illustrative.

## Tech stack

- **Frontend**: Vite, React 19, TypeScript, React Router v7, Tailwind CSS v4, Lucide icons
- **Backend**: Supabase (Postgres, Auth, RLS, SECURITY DEFINER RPCs for safe public aggregates)
- **Match/league data**: football-data.org, proxied server-side via `api/matches.js` / `api/standings.js` (Vercel serverless functions; mirrored for local dev in `vite.config.ts`)
- **State**: React Context (`AuthContext`, `PredictionsContext`, `TipstersContext`, `BetSlipContext`) backed by Supabase, with a localStorage cache layer for fast first paint

## Local development

1. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID`, and `FOOTBALL_DATA_API_KEY` (the last one is server-side only — no `VITE_` prefix, so it's never bundled into the client).
2. Run the schema: paste `supabase_schema.sql` into the Supabase SQL Editor. It's idempotent — safe to re-run any time you pull schema changes.
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Deploying

Deploys to Vercel on push to `main`. `FOOTBALL_DATA_API_KEY` must be set in the Vercel project's Environment Variables (Production + Preview) separately from `.env` — it's intentionally not committed to the repo since this is a public GitHub repository.
