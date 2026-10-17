-- Run this migration in Supabase SQL Editor after the initial schema.
-- Ownership is tied to Supabase Auth, never to a client-supplied user id.
alter table public.profiles
  add column if not exists owner_user_id uuid references auth.users(id) on delete cascade;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_owner_user_id_key'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_owner_user_id_key unique (owner_user_id);
  end if;
end
$$;

create index if not exists profiles_owner_user_id_idx
  on public.profiles(owner_user_id)
  where owner_user_id is not null;

-- Keep RLS enabled and do not create anon/authenticated write policies.
-- Profile writes are performed by server routes that verify the Supabase Auth user
-- before using the server-only service-role client.
