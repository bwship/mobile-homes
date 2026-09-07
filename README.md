# MH Marketplace

A self-contained mobile & manufactured home listings platform forked from the Fearless Naturals stack (Vue 3 + Convex). Browse homes on a map, view listing details, and let approved sellers publish inventory.

## Stack

- **Frontend**: Vue 3, Pinia, Tailwind, Vite, Google Maps
- **Backend**: Convex (auth, listings, organizations, favorites)
- **Roles**: `ADMIN`, `SELLER` (dealers — post listings after approval), `BUYER` (browse & save)

## Quick start

```bash
cd mobile-homes
npm install
cd frontend && npm install && cd ..

# Create a new Convex project (do NOT point at Fearless prod)
npx convex dev

# In another terminal
npm run frontend:dev
```

Copy `.env.example` → `.env.local` at the **mobile-homes** root and set:

- `VITE_CONVEX_URL` — from `npx convex dev`
- `VITE_GOOGLE_MAPS_API_KEY` — Maps JavaScript + Geocoding API

Optional: `RESEND_API_KEY` + `SITE_URL` for password reset emails.

## Seed demo data

After Convex is running:

```bash
npm run seed
```

Demo accounts (passwords min 8 chars):

| Email | Password | Role |
|-------|----------|------|
| `admin@mhm.com` | `admin12345` | Admin |
| `seller@mhm.com` | `seller12345` | Approved seller |
| `dealer@mhm.com` | `seller12345` | Approved seller |

Sample listings include FL and TX coordinates for map testing.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage hero, stats, featured listings |
| `/search` | Map + list split view |
| `/listings/:id` | Listing detail + contact form |
| `/dealers/:id` | Dealer company page & listing management |
| `/admin/listings` | Approve pending listings |
| `/admin/users` | All users |
| `/admin/dealers` | Dealer directory |
| `/favorites` | Saved homes |

## Deployment

### 1. GitHub repository

```bash
git init
git remote add origin git@github.com:bwship/mobile-homes.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. Convex (GitHub Actions)

The workflow in `.github/workflows/deploy-convex.yml` deploys the backend to **Convex production** on pushes to `main` when `convex/` changes.

**One-time Convex setup:**

1. In the [Convex dashboard](https://dashboard.convex.dev), open your project and create or select the **production** deployment.
2. Go to **Settings → Deploy Keys** and create a key with **Deploy** permission for production.
3. In GitHub: **Settings → Secrets and variables → Actions** → add:

| Secret | Description |
|--------|-------------|
| `CONVEX_DEPLOY_KEY` | Production deploy key from Convex |

**Convex environment variables** (dashboard → Settings → Environment Variables → Production):

| Variable | Required | Description |
|----------|----------|-------------|
| `SITE_URL` | Yes (prod) | Your Vercel site URL, e.g. `https://mobile-homes.vercel.app` |
| `RESEND_API_KEY` | Optional | Resend API key for password-reset emails |

Trigger a deploy manually from the GitHub Actions tab via **Run workflow**, or push to `main`.

### 3. Vercel (frontend)

In the Vercel project settings:

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `cd .. && pnpm install` (or `npm install` from repo root) |

**Vercel environment variables** (Production — required before deploy will succeed):

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | **Yes** | Production Convex URL from the dashboard, e.g. `https://confident-ermine-366.convex.cloud` |
| `VITE_GOOGLE_MAPS_API_KEY` | Yes | Google Maps JavaScript + Places + Geocoding APIs |

Add these under **Vercel → Project → Settings → Environment Variables**, scope **Production**, then **Redeploy**.

`frontend/vercel.json` includes SPA rewrites for Vue Router.

After the first Convex prod deploy, copy the production `CONVEX_URL` from the Convex dashboard into Vercel as `VITE_CONVEX_URL`, then redeploy Vercel.

## Moving to its own repo

1. Copy the entire `mobile-homes/` folder to a new git repository
2. Run `git init`, commit, and push
3. Create a **new** Convex project: `npx convex dev` and deploy
4. Update `.env.local` / hosting env vars
5. Remove or ignore this folder from the Fearless monorepo when done

## Out of scope (phase 2)

- Mobile home parks / communities directory
- Dealer directory as separate entity
- Floor plan catalog, paid featured listings, in-app messaging
- Cart, checkout, Stripe

## Project layout

```
mobile-homes/
├── convex/          # Schema, auth, listings API, seed
├── frontend/        # Vue SPA
├── package.json
├── convex.json
└── .env.example
```
