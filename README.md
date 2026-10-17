# RadCase.gg — backend foundation v0.2

A phone-friendly handoff package for the next RadCase.gg development stage. It includes the existing v0.5 UI demo, a Next.js + TypeScript app, an API health check, a safe public-profile route, and a Supabase schema with default-deny row-level security.

## What's implemented
- `public/demo.html` — current interactive v0.5 UI prototype.
- `/api/health` — basic app health check.
- `/api/profile/[slug]` — returns only profiles explicitly marked `share_publicly = true`; returns 503 before Supabase is configured and 404 for non-public/missing profiles.
- `db/schema.sql` — profile, featured-skin, ownership, and consent tables. Direct anon/authenticated access is denied by default.
- `lib/supabase-admin.ts` — server-only Supabase client using the service-role key.
- `.env.example` — environment variable names only; no secrets.

## Important limits
This is not yet a live Riot integration. Riot Sign On, profile owner sessions, profile editing, inventory retrieval, rank/level retrieval, and email-change history are not active. The latter may not be available through any approved source. Do not represent demo data as verified account data. Do not collect Riot passwords, session cookies, or undocumented client tokens.

## Lowest-effort deployment plan (phone-friendly)
The user only needs to perform account authorization and copy/paste steps; do not share passwords or API secrets in chat.

### A. Create a GitHub repository
1. Open https://github.com in a browser and sign in or create an account.
2. Create a new **private** repository named `radcase-gg` (it can be made public later if desired).
3. Upload the contents of this folder, keeping the folder structure. GitHub's mobile website supports file upload, though uploading multiple files may be easier in desktop mode.

### B. Deploy the website
1. Open https://vercel.com and choose **Continue with GitHub**.
2. Import `radcase-gg`.
3. Keep the default Next.js settings and choose Deploy.
4. Vercel will provide a temporary `*.vercel.app` URL. The static demo is at `/demo.html`.

### C. Configure the database (only when ready)
1. Create a project at https://supabase.com.
2. Open SQL Editor and paste/run `db/schema.sql` from this package.
3. In Supabase project settings, copy the Project URL and service-role key. Add them in Vercel → Project → Settings → Environment Variables as `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
4. Redeploy in Vercel.
5. Keep the service-role key private and server-only. Never put it in a `NEXT_PUBLIC_` variable or commit it to GitHub.

### D. Riot integration later
Register the product and request Riot's approved API/RSO access. RSO activation requires Riot approval; approval is not guaranteed. Only implement exact fields/endpoints authorized for this product and approved scopes. The site must still work honestly when unsupported fields are unavailable.

## API smoke tests
- `/api/health` should return `{ "ok": true, ... }`.
- `/api/profile/example` should return `DATABASE_NOT_CONFIGURED` (503) until Supabase env vars exist.

## Official references
- https://developer.riotgames.com/docs/valorant
- https://support-developer.riotgames.com/hc/en-us/articles/22801670382739-RSO-Riot-Sign-On
