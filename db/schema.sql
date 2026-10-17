-- RadCase.gg initial Supabase schema. Apply in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  public_slug text unique not null,
  riot_puuid text unique,
  game_name text,
  tagline text,
  region text,
  account_level integer check (account_level is null or account_level >= 0),
  rank_name text,
  rank_rr integer check (rank_rr is null or rank_rr between 0 and 100),
  share_publicly boolean not null default false,
  riot_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint public_slug_format check (public_slug ~ '^[a-z0-9-]{3,32}$')
);

create table if not exists public.profile_featured_skins (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  weapon_type text not null,
  skin_uuid text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (profile_id, weapon_type)
);

create table if not exists public.profile_skin_ownership (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skin_uuid text not null,
  source text not null default 'manual_demo' check (source in ('manual_demo','riot_approved')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (profile_id, skin_uuid)
);

create table if not exists public.profile_share_consents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  consent_version text not null,
  consented_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists profiles_public_slug_idx on public.profiles(public_slug) where share_publicly = true;
create index if not exists featured_skins_profile_idx on public.profile_featured_skins(profile_id);
create index if not exists skin_ownership_profile_idx on public.profile_skin_ownership(profile_id);

-- Deny direct client access by default. The server route uses the service-role key,
-- which must remain server-only and must never use a NEXT_PUBLIC_ prefix.
alter table public.profiles enable row level security;
alter table public.profile_featured_skins enable row level security;
alter table public.profile_skin_ownership enable row level security;
alter table public.profile_share_consents enable row level security;

-- Intentionally no anon/authenticated policies are created. Add narrowly scoped
-- owner policies only after the approved sign-in/session implementation exists.
-- Never store Riot passwords, client session tokens, or unsupported email-change counts.
