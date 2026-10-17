# RadCase.gg profile ownership and email sign-in

This change adds Supabase email magic-link sign-in, a basic profile editor, owner-only profile writes, and a public profile page. It does **not** connect Riot or claim that manually entered data is Riot-verified.

## 1. Apply the database migration

In Supabase Dashboard → SQL Editor, run the contents of `db/migrations/20261017_profile_owners.sql`.

The original schema has already been applied, so use this migration rather than rerunning the original schema.

## 2. Configure Supabase Auth

In Supabase Dashboard → Authentication → URL Configuration:
- Set **Site URL** to `https://radcase-gg.vercel.app`.
- Add `https://radcase-gg.vercel.app/dashboard` to the allowed Redirect URLs.
- For local development, also allow `http://localhost:3000/dashboard`.

In Authentication → Sign In / Providers, enable Email and magic-link / OTP sign-in.

## 3. Add the public anon key to Vercel

In Vercel → Project → Settings → Environment Variables, add:

- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: the project's Supabase **Publishable key** / legacy **anon public key**
- Environments: Production, Preview, Development as appropriate

Do not use the service-role key here. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only, exactly as it is now. The anon key is designed to be public; the service-role key is not.

## 4. Deploy and test

Merge this branch / pull request, apply the SQL migration, set the environment variable, and let Vercel redeploy.

Then:
1. Open `/login` and request a magic link.
2. Open the email and follow the link to `/dashboard`.
3. Enter profile details and save privately first.
4. Enable public sharing and save; confirm the browser prompt.
5. Open the shown public profile URL in a private/incognito browser.

The form currently stores manually entered profile details only. Skins, Riot Sign On, and Riot-approved APIs remain separate future work.
