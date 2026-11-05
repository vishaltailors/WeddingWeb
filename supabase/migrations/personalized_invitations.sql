-- Personalized wedding invitations.
--
-- Guest invitations live only in this table and are never exposed as a list.
-- A guest page resolves a single active invitation through the bearer token in
-- its own link, and never accepts a name or message from the URL.

create schema if not exists private;
create extension if not exists pgcrypto with schema extensions;

-- Administrators are listed by the verified email on their Supabase account.
-- The owner manages this list in the SQL editor; the browser never reads it.
create table if not exists private.invitation_admins (
  email text primary key check (email = lower(email))
);
alter table private.invitation_admins enable row level security;

create or replace function public.is_invitation_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.invitation_admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_invitation_admin() from public, anon;
grant execute on function public.is_invitation_admin() to authenticated;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(extensions.gen_random_bytes(32), 'hex'),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  message text not null default '' check (char_length(message) <= 2000),
  side text not null check (side in ('groom', 'bride')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitation_token_format check (token ~ '^[0-9a-f]{64}$')
);
alter table public.invitations enable row level security;
revoke all on public.invitations from public, anon;
grant select, insert, update, delete on public.invitations to authenticated;

drop policy if exists "Only allowlisted admins manage invitations" on public.invitations;
create policy "Only allowlisted admins manage invitations"
  on public.invitations for all to authenticated
  using ((select public.is_invitation_admin()))
  with check ((select public.is_invitation_admin()));

-- Resolves one active invitation from its bearer token and locked side.
-- Returning a set keeps a wrong token indistinguishable from a missing one.
create or replace function public.resolve_invitation(
  invitation_token text,
  invitation_side text
)
returns table (name text, message text, side text)
language sql
stable
security definer
set search_path = ''
as $$
  select i.name, i.message, i.side
  from public.invitations i
  where invitation_token ~ '^[0-9a-f]{64}$'
    and i.token = invitation_token
    and i.side = invitation_side
    and i.active = true
  limit 1;
$$;
revoke all on function public.resolve_invitation(text, text) from public;
grant execute on function public.resolve_invitation(text, text) to anon, authenticated;

create or replace function private.invitation_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists invitation_updated_at on public.invitations;
create trigger invitation_updated_at before update on public.invitations
  for each row execute function private.invitation_updated_at();

-- Guest pages read the current name and message on every page load, so edits
-- made in the admin page appear on the guest's next refresh. No push channel
-- is used, and no guest data is ever broadcast.
drop trigger if exists notify_invitation_change on public.invitations;
drop function if exists private.notify_invitation_change();
