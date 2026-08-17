-- Secure workspace invitations: profile provenance, delivery lifecycle,
-- durable rate limiting, token hashing and server-only transactional helpers.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'profile_signup_origin') then
    create type public.profile_signup_origin as enum ('self_signup', 'workspace_invite');
  end if;
  if not exists (select 1 from pg_type where typname = 'profile_onboarding_status') then
    create type public.profile_onboarding_status as enum ('incomplete', 'complete');
  end if;
  if not exists (select 1 from pg_type where typname = 'invite_delivery_status') then
    create type public.invite_delivery_status as enum ('pending', 'sent', 'failed');
  end if;
end
$$;

alter table public.profiles
  add column if not exists email_normalized text,
  add column if not exists signup_origin public.profile_signup_origin,
  add column if not exists onboarding_status public.profile_onboarding_status,
  add column if not exists onboarding_completed_at timestamptz;

update public.profiles
set
  email_normalized = lower(btrim(email)),
  signup_origin = coalesce(signup_origin, 'self_signup'::public.profile_signup_origin),
  onboarding_status = coalesce(
    onboarding_status,
    case
      when nullif(btrim(full_name), '') is null then 'incomplete'::public.profile_onboarding_status
      else 'complete'::public.profile_onboarding_status
    end
  ),
  onboarding_completed_at = case
    when coalesce(
      onboarding_status,
      case
        when nullif(btrim(full_name), '') is null then 'incomplete'::public.profile_onboarding_status
        else 'complete'::public.profile_onboarding_status
      end
    ) = 'complete'
      then coalesce(onboarding_completed_at, updated_at, created_at)
    else null
  end;

alter table public.profiles
  alter column email_normalized set not null,
  alter column signup_origin set default 'self_signup',
  alter column signup_origin set not null,
  alter column onboarding_status set default 'incomplete',
  alter column onboarding_status set not null;

create unique index if not exists profiles_email_normalized_uidx
  on public.profiles (email_normalized);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_email_normalized_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_email_normalized_check
      check (email_normalized = lower(btrim(email_normalized)));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_onboarding_complete_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_onboarding_complete_check
      check (
        onboarding_status = 'incomplete'
        or (nullif(btrim(full_name), '') is not null and onboarding_completed_at is not null)
      );
  end if;
end
$$;

alter table public.workspace_invites
  add column if not exists email_normalized text,
  add column if not exists token_hash text,
  add column if not exists token_version integer,
  add column if not exists delivery_status public.invite_delivery_status,
  add column if not exists locale text,
  add column if not exists last_delivery_attempt_at timestamptz,
  add column if not exists sent_at timestamptz,
  add column if not exists accepted_by uuid references auth.users(id) on delete set null,
  add column if not exists cancelled_at timestamptz,
  add column if not exists delivery_error_code text,
  add column if not exists provider_message_id text,
  add column if not exists updated_at timestamptz not null default now();

update public.workspace_invites
set
  email_normalized = lower(btrim(email)),
  token_hash = encode(extensions.digest(token, 'sha256'), 'hex'),
  token_version = coalesce(token_version, 1),
  delivery_status = coalesce(delivery_status, 'sent'),
  locale = coalesce(locale, 'pt-BR'),
  sent_at = coalesce(sent_at, created_at),
  expires_at = coalesce(sent_at, created_at) + interval '24 hours',
  accepted_by = case
    when status = 'accepted' then coalesce(
      accepted_by,
      (
        select p.id
        from public.profiles p
        join public.workspace_members wm on wm.user_id = p.id
        where wm.workspace_id = workspace_invites.workspace_id
          and p.email_normalized = lower(btrim(workspace_invites.email))
        limit 1
      )
    )
    else accepted_by
  end,
  cancelled_at = case
    when status = 'cancelled' then coalesce(cancelled_at, accepted_at, created_at)
    else cancelled_at
  end,
  last_delivery_attempt_at = coalesce(last_delivery_attempt_at, created_at),
  updated_at = coalesce(updated_at, created_at);

with ranked_pending as (
  select
    id,
    row_number() over (
      partition by workspace_id, email_normalized
      order by created_at desc, id desc
    ) as position
  from public.workspace_invites
  where status = 'pending'
)
update public.workspace_invites as invite
set status = 'cancelled', cancelled_at = now(), updated_at = now()
from ranked_pending
where invite.id = ranked_pending.id
  and ranked_pending.position > 1;

alter table public.workspace_invites
  alter column email_normalized set not null,
  alter column token_hash set not null,
  alter column token_version set default 1,
  alter column token_version set not null,
  alter column delivery_status set default 'pending',
  alter column delivery_status set not null,
  alter column locale set default 'pt-BR',
  alter column locale set not null,
  alter column expires_at drop not null,
  alter column expires_at drop default;

alter table public.workspace_invites
  drop constraint if exists workspace_invites_workspace_id_email_status_key,
  drop constraint if exists workspace_invites_token_key,
  drop column if exists token,
  drop column if exists email;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'workspace_invites_email_normalized_check'
      and conrelid = 'public.workspace_invites'::regclass
  ) then
    alter table public.workspace_invites
      add constraint workspace_invites_email_normalized_check
      check (email_normalized = lower(btrim(email_normalized)));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'workspace_invites_token_version_check'
      and conrelid = 'public.workspace_invites'::regclass
  ) then
    alter table public.workspace_invites
      add constraint workspace_invites_token_version_check check (token_version > 0);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'workspace_invites_locale_check'
      and conrelid = 'public.workspace_invites'::regclass
  ) then
    alter table public.workspace_invites
      add constraint workspace_invites_locale_check check (locale in ('pt-BR', 'en'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'workspace_invites_delivery_check'
      and conrelid = 'public.workspace_invites'::regclass
  ) then
    alter table public.workspace_invites
      add constraint workspace_invites_delivery_check check (
        (delivery_status = 'sent' and sent_at is not null and expires_at = sent_at + interval '24 hours')
        or (delivery_status <> 'sent' and sent_at is null and expires_at is null)
      );
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'workspace_invites_accepted_check'
      and conrelid = 'public.workspace_invites'::regclass
  ) then
    alter table public.workspace_invites
      add constraint workspace_invites_accepted_check check (
        status <> 'accepted' or (accepted_at is not null and accepted_by is not null)
      ) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'workspace_invites_cancelled_check'
      and conrelid = 'public.workspace_invites'::regclass
  ) then
    alter table public.workspace_invites
      add constraint workspace_invites_cancelled_check check (
        status <> 'cancelled' or cancelled_at is not null
      );
  end if;
end
$$;

create unique index if not exists workspace_invites_token_hash_uidx
  on public.workspace_invites (token_hash);
create unique index if not exists workspace_invites_one_pending_uidx
  on public.workspace_invites (workspace_id, email_normalized)
  where status = 'pending';
create index if not exists workspace_invites_workspace_status_idx
  on public.workspace_invites (workspace_id, status);
create index if not exists workspace_invites_email_status_idx
  on public.workspace_invites (email_normalized, status);
create index if not exists workspace_invites_expires_at_idx
  on public.workspace_invites (expires_at)
  where status = 'pending' and expires_at is not null;
create index if not exists workspace_invites_invited_by_created_at_idx
  on public.workspace_invites (invited_by, created_at desc);

create table if not exists private.workspace_invite_attempts (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid references public.workspace_invites(id) on delete set null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  recipient_fingerprint text not null,
  source_fingerprint text not null,
  operation text not null check (operation in ('create', 'resend', 'prepare_auth')),
  delivery_version integer,
  result text not null check (result in ('allowed', 'rate_limited', 'sent', 'failed')),
  provider_message_id text,
  error_code text,
  created_at timestamptz not null default now()
);

alter table private.workspace_invite_attempts enable row level security;

create index if not exists workspace_invite_attempts_invite_id_idx
  on private.workspace_invite_attempts (invite_id);
create index if not exists workspace_invite_attempts_actor_workspace_created_idx
  on private.workspace_invite_attempts (actor_id, workspace_id, created_at desc);
create index if not exists workspace_invite_attempts_recipient_workspace_created_idx
  on private.workspace_invite_attempts (recipient_fingerprint, workspace_id, created_at desc);
create index if not exists workspace_invite_attempts_source_created_idx
  on private.workspace_invite_attempts (source_fingerprint, created_at desc);

create or replace function private.normalize_email(p_email text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select lower(btrim(p_email));
$$;

create or replace function private.hash_invite_token(p_token text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

create or replace function private.fingerprint(p_value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select encode(extensions.digest(p_value, 'sha256'), 'hex');
$$;

create or replace function private.has_members_permission(
  p_actor_id uuid,
  p_workspace_id uuid,
  p_action text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.workspaces w
      where w.id = p_workspace_id and w.superuser_id = p_actor_id
    )
    or exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = p_workspace_id
        and wm.user_id = p_actor_id
        and wm.role = 'administrador'
        and coalesce(
          (
            select case p_action
              when 'create' then wmp.can_create
              when 'update' then wmp.can_update
              when 'delete' then wmp.can_delete
              else false
            end
            from public.workspace_member_permissions wmp
            where wmp.workspace_id = p_workspace_id
              and wmp.user_id = p_actor_id
              and wmp.resource = 'members'
          ),
          (
            select case p_action
              when 'create' then wrp.can_create
              when 'update' then wrp.can_update
              when 'delete' then wrp.can_delete
              else false
            end
            from public.workspace_role_permissions wrp
            where wrp.workspace_id = p_workspace_id
              and wrp.role = wm.role::text
              and wrp.resource = 'members'
          ),
          false
        )
    );
$$;

create or replace function private.consume_workspace_invite_rate_limit(
  p_invite_id uuid,
  p_workspace_id uuid,
  p_actor_id uuid,
  p_email_normalized text,
  p_source text,
  p_operation text,
  p_actor_limit integer,
  p_recipient_limit integer,
  p_source_limit integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient_fingerprint text := private.fingerprint(p_email_normalized);
  v_source_fingerprint text := private.fingerprint(coalesce(nullif(btrim(p_source), ''), 'unknown'));
  v_window_start timestamptz := now() - interval '1 hour';
  v_limited boolean;
  v_oldest timestamptz;
  v_retry_after integer;
begin
  select
    (p_actor_id is not null and count(*) filter (
      where actor_id = p_actor_id and workspace_id = p_workspace_id
    ) >= p_actor_limit)
    or count(*) filter (
      where recipient_fingerprint = v_recipient_fingerprint and workspace_id = p_workspace_id
    ) >= p_recipient_limit
    or count(*) filter (
      where source_fingerprint = v_source_fingerprint
    ) >= p_source_limit,
    min(created_at)
  into v_limited, v_oldest
  from private.workspace_invite_attempts
  where created_at >= v_window_start;

  v_retry_after := greatest(1, ceil(extract(epoch from ((coalesce(v_oldest, now()) + interval '1 hour') - now())))::integer);

  insert into private.workspace_invite_attempts (
    invite_id,
    workspace_id,
    actor_id,
    recipient_fingerprint,
    source_fingerprint,
    operation,
    result
  ) values (
    p_invite_id,
    p_workspace_id,
    p_actor_id,
    v_recipient_fingerprint,
    v_source_fingerprint,
    p_operation,
    case when v_limited then 'rate_limited' else 'allowed' end
  );

  return case when v_limited then v_retry_after else 0 end;
end;
$$;

create or replace function private.rotate_workspace_invite_core(
  p_operation text,
  p_actor_id uuid,
  p_workspace_id uuid,
  p_invite_id uuid,
  p_email text,
  p_role public.workspace_role,
  p_locale text,
  p_source text,
  p_actor_limit integer,
  p_recipient_limit integer,
  p_source_limit integer
)
returns table (
  result_status text,
  invite_id uuid,
  raw_token text,
  delivery_version integer,
  retry_after integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite public.workspace_invites%rowtype;
  v_email_normalized text;
  v_raw_token text;
  v_retry_after integer;
  v_action text;
begin
  if p_operation not in ('create', 'resend') then
    raise exception 'invalid_operation' using errcode = '22023';
  end if;
  if p_locale not in ('pt-BR', 'en') then
    raise exception 'invalid_locale' using errcode = '22023';
  end if;

  if p_operation = 'resend' then
    select * into v_invite
    from public.workspace_invites wi
    where wi.id = p_invite_id
    for update;

    if not found or v_invite.status <> 'pending' then
      raise exception 'invite_not_available' using errcode = 'P0002';
    end if;
    if p_workspace_id is not null and p_workspace_id <> v_invite.workspace_id then
      raise exception 'workspace_mismatch' using errcode = '22023';
    end if;
    v_email_normalized := v_invite.email_normalized;
    p_workspace_id := v_invite.workspace_id;
    v_action := 'update';
  else
    if p_workspace_id is null or p_email is null or p_role is null then
      raise exception 'missing_create_fields' using errcode = '22023';
    end if;
    v_email_normalized := private.normalize_email(p_email);
    v_action := 'create';
  end if;

  if not private.has_members_permission(p_actor_id, p_workspace_id, v_action) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  v_retry_after := private.consume_workspace_invite_rate_limit(
    p_invite_id,
    p_workspace_id,
    p_actor_id,
    v_email_normalized,
    p_source,
    p_operation,
    p_actor_limit,
    p_recipient_limit,
    p_source_limit
  );
  if v_retry_after > 0 then
    return query select 'rate_limited', p_invite_id, null::text, null::integer, v_retry_after;
    return;
  end if;

  if p_operation = 'create' then
    if exists (
      select 1
      from public.profiles p
      join public.workspace_members wm on wm.user_id = p.id
      where wm.workspace_id = p_workspace_id
        and p.email_normalized = v_email_normalized
    ) then
      return query select 'already_member', null::uuid, null::text, null::integer, 0;
      return;
    end if;

    select * into v_invite
    from public.workspace_invites wi
    where wi.workspace_id = p_workspace_id
      and wi.email_normalized = v_email_normalized
      and wi.status = 'pending';
    if found then
      if v_invite.delivery_status <> 'failed' then
        return query select 'existing_pending_invite', v_invite.id, null::text, v_invite.token_version, 0;
        return;
      end if;

      v_raw_token := encode(extensions.gen_random_bytes(32), 'hex');
      update public.workspace_invites
      set
        invited_by = p_actor_id,
        role = p_role,
        token_hash = private.hash_invite_token(v_raw_token),
        token_version = token_version + 1,
        delivery_status = 'pending',
        locale = p_locale,
        expires_at = null,
        sent_at = null,
        last_delivery_attempt_at = null,
        delivery_error_code = null,
        provider_message_id = null,
        updated_at = now()
      where id = v_invite.id
      returning * into v_invite;
    else
      v_raw_token := encode(extensions.gen_random_bytes(32), 'hex');
      insert into public.workspace_invites (
        workspace_id,
        invited_by,
        email_normalized,
        role,
        token_hash,
        token_version,
        status,
        delivery_status,
        locale,
        expires_at,
        sent_at
      ) values (
        p_workspace_id,
        p_actor_id,
        v_email_normalized,
        p_role,
        private.hash_invite_token(v_raw_token),
        1,
        'pending',
        'pending',
        p_locale,
        null,
        null
      ) returning * into v_invite;
    end if;
  else
    v_raw_token := encode(extensions.gen_random_bytes(32), 'hex');
    update public.workspace_invites
    set
      token_hash = private.hash_invite_token(v_raw_token),
      token_version = token_version + 1,
      delivery_status = 'pending',
      locale = p_locale,
      expires_at = null,
      sent_at = null,
      last_delivery_attempt_at = null,
      delivery_error_code = null,
      provider_message_id = null,
      updated_at = now()
    where id = v_invite.id
    returning * into v_invite;
  end if;

  update private.workspace_invite_attempts
  set invite_id = v_invite.id, delivery_version = v_invite.token_version
  where id = (
    select attempt.id
    from private.workspace_invite_attempts attempt
    where attempt.workspace_id = v_invite.workspace_id
      and attempt.actor_id = p_actor_id
      and attempt.recipient_fingerprint = private.fingerprint(v_invite.email_normalized)
      and attempt.operation = p_operation
      and attempt.result = 'allowed'
    order by attempt.created_at desc
    limit 1
  );

  return query select 'ready', v_invite.id, v_raw_token, v_invite.token_version, 0;
end;
$$;

create or replace function public.rotate_workspace_invite(
  p_operation text,
  p_actor_id uuid,
  p_workspace_id uuid default null,
  p_invite_id uuid default null,
  p_email text default null,
  p_role public.workspace_role default null,
  p_locale text default 'pt-BR',
  p_source text default 'unknown',
  p_actor_limit integer default 10,
  p_recipient_limit integer default 3,
  p_source_limit integer default 30
)
returns table (
  result_status text,
  invite_id uuid,
  raw_token text,
  delivery_version integer,
  retry_after integer
)
language sql
set search_path = ''
as $$
  select *
  from private.rotate_workspace_invite_core(
    p_operation,
    p_actor_id,
    p_workspace_id,
    p_invite_id,
    p_email,
    p_role,
    p_locale,
    p_source,
    p_actor_limit,
    p_recipient_limit,
    p_source_limit
  );
$$;

create or replace function private.record_workspace_invite_delivery_core(
  p_invite_id uuid,
  p_delivery_version integer,
  p_succeeded boolean,
  p_provider_message_id text,
  p_error_code text
)
returns public.workspace_invites
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite public.workspace_invites%rowtype;
  v_sent_at timestamptz := statement_timestamp();
begin
  update public.workspace_invites
  set
    delivery_status = case
      when p_succeeded then 'sent'::public.invite_delivery_status
      else 'failed'::public.invite_delivery_status
    end,
    last_delivery_attempt_at = v_sent_at,
    sent_at = case when p_succeeded then v_sent_at else null end,
    expires_at = case when p_succeeded then v_sent_at + interval '24 hours' else null end,
    provider_message_id = case when p_succeeded then p_provider_message_id else null end,
    delivery_error_code = case when p_succeeded then null else coalesce(p_error_code, 'provider_error') end,
    updated_at = v_sent_at
  where id = p_invite_id
    and token_version = p_delivery_version
    and status = 'pending'
    and delivery_status = 'pending'
  returning * into v_invite;

  if not found then
    raise exception 'stale_delivery_attempt' using errcode = '40001';
  end if;

  update private.workspace_invite_attempts
  set
    result = case when p_succeeded then 'sent' else 'failed' end,
    delivery_version = p_delivery_version,
    provider_message_id = case when p_succeeded then p_provider_message_id else null end,
    error_code = case when p_succeeded then null else coalesce(p_error_code, 'provider_error') end
  where id = (
    select attempt.id
    from private.workspace_invite_attempts attempt
    where attempt.invite_id = p_invite_id
      and attempt.operation in ('create', 'resend')
      and attempt.result = 'allowed'
    order by attempt.created_at desc
    limit 1
  );

  return v_invite;
end;
$$;

create or replace function public.record_workspace_invite_delivery(
  p_invite_id uuid,
  p_delivery_version integer,
  p_succeeded boolean,
  p_provider_message_id text default null,
  p_error_code text default null
)
returns public.workspace_invites
language sql
set search_path = ''
as $$
  select private.record_workspace_invite_delivery_core(
    p_invite_id,
    p_delivery_version,
    p_succeeded,
    p_provider_message_id,
    p_error_code
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace_id uuid;
  v_email_normalized text := private.normalize_email(new.email);
  v_from_invite boolean;
  v_full_name text := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
begin
  select exists (
    select 1
    from public.workspace_invites wi
    where wi.email_normalized = v_email_normalized
      and wi.status = 'pending'
  ) into v_from_invite;

  insert into public.profiles (
    id,
    email,
    email_normalized,
    full_name,
    lgpd_consent_at,
    signup_origin,
    onboarding_status,
    onboarding_completed_at
  ) values (
    new.id,
    new.email,
    v_email_normalized,
    v_full_name,
    case
      when (new.raw_user_meta_data ->> 'lgpd_consent')::boolean is true then now()
      else null
    end,
    case
      when v_from_invite then 'workspace_invite'::public.profile_signup_origin
      else 'self_signup'::public.profile_signup_origin
    end,
    case
      when v_full_name is null then 'incomplete'::public.profile_onboarding_status
      else 'complete'::public.profile_onboarding_status
    end,
    case when v_full_name is null then null else now() end
  ) on conflict (id) do nothing;

  if v_from_invite then
    return new;
  end if;

  insert into public.workspaces (name, superuser_id)
  values (coalesce(v_full_name, split_part(new.email, '@', 1)) || '''s workspace', new.id)
  returning id into v_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, new.id, 'administrador');

  insert into public.categories (workspace_id, name, type, is_default)
  select v_workspace_id, name, type, true
  from public.categories
  where workspace_id is null and is_default = true;

  return new;
end;
$$;

revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on function public.rotate_workspace_invite(text, uuid, uuid, uuid, text, public.workspace_role, text, text, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.record_workspace_invite_delivery(uuid, integer, boolean, text, text) from public, anon, authenticated;
grant usage on schema private to service_role;
grant execute on function private.rotate_workspace_invite_core(text, uuid, uuid, uuid, text, public.workspace_role, text, text, integer, integer, integer) to service_role;
grant execute on function private.record_workspace_invite_delivery_core(uuid, integer, boolean, text, text) to service_role;
grant execute on function public.rotate_workspace_invite(text, uuid, uuid, uuid, text, public.workspace_role, text, text, integer, integer, integer) to service_role;
grant execute on function public.record_workspace_invite_delivery(uuid, integer, boolean, text, text) to service_role;

grant select, update on public.profiles to authenticated;
grant select on public.workspace_invites to authenticated;
grant select, insert, update, delete on public.workspace_invites to service_role;

create or replace function private.preview_workspace_invite_core(
  p_token text,
  p_user_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_invite public.workspace_invites%rowtype;
  v_user_email text;
  v_workspace public.workspaces%rowtype;
  v_inviter public.profiles%rowtype;
  v_onboarding public.profile_onboarding_status;
begin
  if p_user_id is null or p_token !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('status', 'invalid', 'error_code', 'invalid_invite');
  end if;

  select private.normalize_email(u.email) into v_user_email
  from auth.users u
  where u.id = p_user_id;
  if v_user_email is null then
    return jsonb_build_object('status', 'failed', 'error_code', 'unauthorized');
  end if;

  select * into v_invite
  from public.workspace_invites wi
  where wi.token_hash = private.hash_invite_token(p_token);
  if not found then
    return jsonb_build_object('status', 'invalid', 'error_code', 'invalid_invite');
  end if;
  if v_invite.email_normalized <> v_user_email then
    return jsonb_build_object('status', 'email_mismatch', 'error_code', 'email_mismatch');
  end if;
  if v_invite.status = 'expired' or (
    v_invite.status = 'pending' and v_invite.expires_at is not null and v_invite.expires_at <= statement_timestamp()
  ) then
    return jsonb_build_object('status', 'expired', 'error_code', 'invite_expired');
  end if;
  if v_invite.status = 'cancelled' then
    return jsonb_build_object('status', 'cancelled', 'error_code', 'invite_cancelled');
  end if;
  if v_invite.status = 'accepted' then
    return jsonb_build_object('status', 'already_accepted', 'error_code', 'invite_already_accepted');
  end if;
  if v_invite.delivery_status <> 'sent' or v_invite.expires_at is null then
    return jsonb_build_object('status', 'failed', 'error_code', 'invite_not_delivered');
  end if;

  select * into v_workspace from public.workspaces where id = v_invite.workspace_id;
  select * into v_inviter from public.profiles where id = v_invite.invited_by;
  select onboarding_status into v_onboarding from public.profiles where id = p_user_id;

  return jsonb_build_object(
    'status', 'valid',
    'workspace', jsonb_build_object('id', v_workspace.id, 'name', v_workspace.name),
    'inviter', jsonb_build_object(
      'display_name', coalesce(nullif(btrim(v_inviter.full_name), ''), v_inviter.email)
    ),
    'role', v_invite.role,
    'expires_at', v_invite.expires_at,
    'profile_onboarding_status', coalesce(v_onboarding, 'incomplete'::public.profile_onboarding_status)
  );
end;
$$;

create or replace function private.accept_workspace_invite_core(
  p_token text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite public.workspace_invites%rowtype;
  v_user auth.users%rowtype;
  v_email_normalized text;
  v_workspace public.workspaces%rowtype;
  v_existing_role public.workspace_role;
  v_onboarding public.profile_onboarding_status;
  v_now timestamptz := statement_timestamp();
begin
  if p_user_id is null or p_token !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('status', 'invalid', 'error_code', 'invalid_invite');
  end if;

  select * into v_user from auth.users where id = p_user_id;
  if not found or v_user.email is null then
    return jsonb_build_object('status', 'failed', 'error_code', 'unauthorized');
  end if;
  v_email_normalized := private.normalize_email(v_user.email);

  select * into v_invite
  from public.workspace_invites wi
  where wi.token_hash = private.hash_invite_token(p_token)
  for update;
  if not found then
    return jsonb_build_object('status', 'invalid', 'error_code', 'invalid_invite');
  end if;
  if v_invite.email_normalized <> v_email_normalized then
    return jsonb_build_object('status', 'email_mismatch', 'error_code', 'email_mismatch');
  end if;
  if v_invite.status = 'cancelled' then
    return jsonb_build_object('status', 'cancelled', 'error_code', 'invite_cancelled');
  end if;
  if v_invite.status = 'accepted' then
    return jsonb_build_object('status', 'already_accepted', 'error_code', 'invite_already_accepted');
  end if;
  if v_invite.status = 'expired' or v_invite.expires_at is null or v_invite.expires_at <= v_now then
    if v_invite.status = 'pending' then
      update public.workspace_invites
      set status = 'expired', updated_at = v_now
      where id = v_invite.id;
    end if;
    return jsonb_build_object('status', 'expired', 'error_code', 'invite_expired');
  end if;
  if v_invite.delivery_status <> 'sent' then
    return jsonb_build_object('status', 'failed', 'error_code', 'invite_not_delivered');
  end if;

  insert into public.profiles (
    id, email, email_normalized, full_name, signup_origin,
    onboarding_status, onboarding_completed_at
  ) values (
    v_user.id,
    v_user.email,
    v_email_normalized,
    nullif(btrim(v_user.raw_user_meta_data ->> 'full_name'), ''),
    'workspace_invite',
    case
      when nullif(btrim(v_user.raw_user_meta_data ->> 'full_name'), '') is null then 'incomplete'::public.profile_onboarding_status
      else 'complete'::public.profile_onboarding_status
    end,
    case when nullif(btrim(v_user.raw_user_meta_data ->> 'full_name'), '') is null then null else v_now end
  ) on conflict (id) do nothing;

  select role into v_existing_role
  from public.workspace_members
  where workspace_id = v_invite.workspace_id and user_id = v_user.id;

  if v_existing_role is null then
    insert into public.workspace_members (workspace_id, user_id, role)
    values (v_invite.workspace_id, v_user.id, v_invite.role);

    if jsonb_typeof(v_invite.permissions) = 'array' then
      insert into public.workspace_member_permissions (
        workspace_id, user_id, resource, can_read, can_create,
        can_update, can_delete, updated_by
      )
      select
        v_invite.workspace_id,
        v_user.id,
        item ->> 'resource',
        coalesce((item ->> 'can_read')::boolean, false),
        coalesce((item ->> 'can_create')::boolean, false),
        coalesce((item ->> 'can_update')::boolean, false),
        coalesce((item ->> 'can_delete')::boolean, false),
        v_invite.invited_by
      from jsonb_array_elements(v_invite.permissions) item
      where item ->> 'resource' in (
        'transactions', 'installments', 'recurring', 'categories',
        'settings', 'members', 'permissions'
      )
      on conflict (workspace_id, user_id, resource) do nothing;
    end if;
  end if;

  update public.workspace_invites
  set status = 'accepted', accepted_at = v_now, accepted_by = v_user.id, updated_at = v_now
  where id = v_invite.id;

  select * into v_workspace from public.workspaces where id = v_invite.workspace_id;
  select onboarding_status into v_onboarding from public.profiles where id = v_user.id;

  return jsonb_build_object(
    'status', case when v_existing_role is null then 'accepted' else 'already_member' end,
    'workspace', jsonb_build_object('id', v_workspace.id, 'name', v_workspace.name),
    'role', coalesce(v_existing_role, v_invite.role),
    'profile_onboarding_status', v_onboarding
  );
end;
$$;

create or replace function public.preview_workspace_invite(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select private.preview_workspace_invite_core(p_token, auth.uid());
$$;

create or replace function public.accept_workspace_invite(p_token text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select private.accept_workspace_invite_core(p_token, auth.uid());
$$;

create or replace function private.prepare_workspace_invite_auth_core(
  p_token text,
  p_source text,
  p_recipient_limit integer default 6,
  p_source_limit integer default 30
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite public.workspace_invites%rowtype;
  v_source_fingerprint text := private.fingerprint(coalesce(nullif(btrim(p_source), ''), 'unknown'));
  v_recipient_fingerprint text;
  v_retry_after integer := 0;
  v_oldest timestamptz;
begin
  if p_token !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('status', 'invalid', 'error_code', 'invalid_invite');
  end if;

  select * into v_invite
  from public.workspace_invites wi
  where wi.token_hash = private.hash_invite_token(p_token);
  if not found then
    return jsonb_build_object('status', 'invalid', 'error_code', 'invalid_invite');
  end if;
  if v_invite.status = 'expired' or (
    v_invite.status = 'pending' and v_invite.expires_at is not null and v_invite.expires_at <= statement_timestamp()
  ) then
    return jsonb_build_object('status', 'expired', 'error_code', 'invite_expired');
  end if;
  if v_invite.status = 'cancelled' then
    return jsonb_build_object('status', 'cancelled', 'error_code', 'invite_cancelled');
  end if;
  if v_invite.status = 'accepted' then
    return jsonb_build_object('status', 'already_accepted', 'error_code', 'invite_already_accepted');
  end if;
  if v_invite.delivery_status <> 'sent' or v_invite.expires_at is null then
    return jsonb_build_object('status', 'failed', 'error_code', 'invite_not_delivered');
  end if;

  v_recipient_fingerprint := private.fingerprint(v_invite.email_normalized);
  if (
    select count(*) from private.workspace_invite_attempts attempt
    where attempt.workspace_id = v_invite.workspace_id
      and attempt.recipient_fingerprint = v_recipient_fingerprint
      and attempt.operation = 'prepare_auth'
      and attempt.created_at > statement_timestamp() - interval '1 hour'
  ) >= p_recipient_limit then
    select min(created_at) into v_oldest
    from private.workspace_invite_attempts attempt
    where attempt.workspace_id = v_invite.workspace_id
      and attempt.recipient_fingerprint = v_recipient_fingerprint
      and attempt.operation = 'prepare_auth'
      and attempt.created_at > statement_timestamp() - interval '1 hour';
    v_retry_after := greatest(1, ceil(extract(epoch from (v_oldest + interval '1 hour' - statement_timestamp())))::integer);
  end if;
  if (
    select count(*) from private.workspace_invite_attempts attempt
    where attempt.source_fingerprint = v_source_fingerprint
      and attempt.operation = 'prepare_auth'
      and attempt.created_at > statement_timestamp() - interval '1 hour'
  ) >= p_source_limit then
    select min(created_at) into v_oldest
    from private.workspace_invite_attempts attempt
    where attempt.source_fingerprint = v_source_fingerprint
      and attempt.operation = 'prepare_auth'
      and attempt.created_at > statement_timestamp() - interval '1 hour';
    v_retry_after := greatest(v_retry_after, greatest(1, ceil(extract(epoch from (v_oldest + interval '1 hour' - statement_timestamp())))::integer));
  end if;

  insert into private.workspace_invite_attempts (
    invite_id, workspace_id, actor_id, recipient_fingerprint,
    source_fingerprint, operation, delivery_version, result
  ) values (
    v_invite.id, v_invite.workspace_id, null, v_recipient_fingerprint,
    v_source_fingerprint, 'prepare_auth', v_invite.token_version,
    case when v_retry_after > 0 then 'rate_limited' else 'allowed' end
  );

  if v_retry_after > 0 then
    return jsonb_build_object('status', 'rate_limited', 'error_code', 'rate_limited', 'retry_after', v_retry_after);
  end if;
  return jsonb_build_object('status', 'ready', 'email_normalized', v_invite.email_normalized);
end;
$$;

create or replace function public.prepare_workspace_invite_auth(
  p_token text,
  p_source text,
  p_recipient_limit integer default 6,
  p_source_limit integer default 30
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select private.prepare_workspace_invite_auth_core(p_token, p_source, p_recipient_limit, p_source_limit);
$$;

revoke all on function private.preview_workspace_invite_core(text, uuid) from public, anon, authenticated;
revoke all on function private.accept_workspace_invite_core(text, uuid) from public, anon, authenticated;
revoke all on function private.prepare_workspace_invite_auth_core(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.preview_workspace_invite(text) from public, anon;
revoke all on function public.accept_workspace_invite(text) from public, anon;
revoke all on function public.prepare_workspace_invite_auth(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.preview_workspace_invite(text) to authenticated;
grant execute on function public.accept_workspace_invite(text) to authenticated;
grant execute on function public.prepare_workspace_invite_auth(text, text, integer, integer) to service_role;

create or replace function private.has_workspace_permission(
  p_workspace_id uuid,
  p_resource text,
  p_action text,
  p_user_id uuid default auth.uid()
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_permission boolean;
begin
  if p_user_id is null
    or p_resource not in ('transactions', 'installments', 'recurring', 'categories', 'settings', 'members', 'permissions')
    or p_action not in ('read', 'create', 'update', 'delete') then
    return false;
  end if;

  if exists (
    select 1 from public.workspaces workspace
    where workspace.id = p_workspace_id and workspace.superuser_id = p_user_id
  ) then
    return true;
  end if;

  select case p_action
    when 'read' then permission.can_read
    when 'create' then permission.can_create
    when 'update' then permission.can_update
    when 'delete' then permission.can_delete
  end into v_permission
  from public.workspace_member_permissions permission
  where permission.workspace_id = p_workspace_id
    and permission.user_id = p_user_id
    and permission.resource = p_resource;
  if found then
    return coalesce(v_permission, false);
  end if;

  select case p_action
    when 'read' then permission.can_read
    when 'create' then permission.can_create
    when 'update' then permission.can_update
    when 'delete' then permission.can_delete
  end into v_permission
  from public.workspace_members member
  join public.workspace_role_permissions permission
    on permission.workspace_id = member.workspace_id
   and permission.role = member.role::text
   and permission.resource = p_resource
  where member.workspace_id = p_workspace_id
    and member.user_id = p_user_id;

  return coalesce(v_permission, false);
end;
$$;

create or replace function private.seed_workspace_permissions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workspace_role_permissions (
    workspace_id, role, resource, can_read, can_create, can_update, can_delete
  )
  select new.id, defaults.role, defaults.resource,
    defaults.can_read, defaults.can_create, defaults.can_update, defaults.can_delete
  from (values
    ('administrador', 'transactions', true, true, true, true),
    ('administrador', 'installments', true, true, true, true),
    ('administrador', 'recurring', true, true, true, true),
    ('administrador', 'categories', true, true, true, true),
    ('administrador', 'settings', true, true, true, true),
    ('administrador', 'members', true, true, true, true),
    ('administrador', 'permissions', false, false, false, false),
    ('operador', 'transactions', true, true, true, true),
    ('operador', 'installments', true, true, true, true),
    ('operador', 'recurring', true, true, true, true),
    ('operador', 'categories', true, false, false, false),
    ('operador', 'settings', false, false, false, false),
    ('operador', 'members', false, false, false, false),
    ('operador', 'permissions', false, false, false, false),
    ('visualizador', 'transactions', true, false, false, false),
    ('visualizador', 'installments', true, false, false, false),
    ('visualizador', 'recurring', true, false, false, false),
    ('visualizador', 'categories', true, false, false, false),
    ('visualizador', 'settings', false, false, false, false),
    ('visualizador', 'members', false, false, false, false),
    ('visualizador', 'permissions', false, false, false, false)
  ) as defaults(role, resource, can_read, can_create, can_update, can_delete)
  on conflict (workspace_id, role, resource) do nothing;
  return new;
end;
$$;

drop trigger if exists seed_workspace_permissions_after_insert on public.workspaces;
create trigger seed_workspace_permissions_after_insert
after insert on public.workspaces
for each row execute function private.seed_workspace_permissions();

do $$
declare
  target regclass;
  policy record;
begin
  foreach target in array array[
    'public.workspaces'::regclass,
    'public.workspace_members'::regclass,
    'public.workspace_invites'::regclass,
    'public.categories'::regclass,
    'public.transactions'::regclass,
    'public.recurring_expenses'::regclass,
    'public.installments'::regclass,
    'public.insights'::regclass,
    'public.workspace_role_permissions'::regclass,
    'public.workspace_member_permissions'::regclass
  ] loop
    for policy in select policyname from pg_policies where schemaname = 'public' and tablename = target::text
    loop
      execute format('drop policy if exists %I on %s', policy.policyname, target);
    end loop;
  end loop;
end;
$$;

create policy workspaces_member_read on public.workspaces for select
using (public.is_workspace_member(id));
create policy workspaces_settings_update on public.workspaces for update
using (private.has_workspace_permission(id, 'settings', 'update'))
with check (private.has_workspace_permission(id, 'settings', 'update'));

create policy members_effective_read on public.workspace_members for select
using (private.has_workspace_permission(workspace_id, 'members', 'read'));
create policy members_effective_create on public.workspace_members for insert
with check (private.has_workspace_permission(workspace_id, 'members', 'create'));
create policy members_effective_update on public.workspace_members for update
using (private.has_workspace_permission(workspace_id, 'members', 'update'))
with check (private.has_workspace_permission(workspace_id, 'members', 'update'));
create policy members_effective_delete on public.workspace_members for delete
using (private.has_workspace_permission(workspace_id, 'members', 'delete'));

create policy invites_effective_read on public.workspace_invites for select
using (private.has_workspace_permission(workspace_id, 'members', 'read'));

create policy categories_effective_read on public.categories for select
using (workspace_id is null or private.has_workspace_permission(workspace_id, 'categories', 'read'));
create policy categories_effective_create on public.categories for insert
with check (workspace_id is not null and private.has_workspace_permission(workspace_id, 'categories', 'create'));
create policy categories_effective_update on public.categories for update
using (workspace_id is not null and private.has_workspace_permission(workspace_id, 'categories', 'update'))
with check (workspace_id is not null and private.has_workspace_permission(workspace_id, 'categories', 'update'));
create policy categories_effective_delete on public.categories for delete
using (workspace_id is not null and private.has_workspace_permission(workspace_id, 'categories', 'delete'));

create policy transactions_effective_read on public.transactions for select
using (private.has_workspace_permission(workspace_id, 'transactions', 'read'));
create policy transactions_effective_create on public.transactions for insert
with check (created_by = (select auth.uid()) and private.has_workspace_permission(workspace_id, 'transactions', 'create'));
create policy transactions_effective_update on public.transactions for update
using (private.has_workspace_permission(workspace_id, 'transactions', 'update'))
with check (private.has_workspace_permission(workspace_id, 'transactions', 'update'));
create policy transactions_effective_delete on public.transactions for delete
using (private.has_workspace_permission(workspace_id, 'transactions', 'delete'));

create policy recurring_effective_read on public.recurring_expenses for select
using (private.has_workspace_permission(workspace_id, 'recurring', 'read'));
create policy recurring_effective_create on public.recurring_expenses for insert
with check (created_by = (select auth.uid()) and private.has_workspace_permission(workspace_id, 'recurring', 'create'));
create policy recurring_effective_update on public.recurring_expenses for update
using (private.has_workspace_permission(workspace_id, 'recurring', 'update'))
with check (private.has_workspace_permission(workspace_id, 'recurring', 'update'));
create policy recurring_effective_delete on public.recurring_expenses for delete
using (private.has_workspace_permission(workspace_id, 'recurring', 'delete'));

create policy installments_effective_read on public.installments for select
using (private.has_workspace_permission(workspace_id, 'installments', 'read'));
create policy installments_effective_create on public.installments for insert
with check (created_by = (select auth.uid()) and private.has_workspace_permission(workspace_id, 'installments', 'create'));
create policy installments_effective_update on public.installments for update
using (private.has_workspace_permission(workspace_id, 'installments', 'update'))
with check (private.has_workspace_permission(workspace_id, 'installments', 'update'));
create policy installments_effective_delete on public.installments for delete
using (private.has_workspace_permission(workspace_id, 'installments', 'delete'));

create policy insights_effective_read on public.insights for select
using (private.has_workspace_permission(workspace_id, 'transactions', 'read'));
create policy insights_effective_create on public.insights for insert
with check (user_id = (select auth.uid()) and private.has_workspace_permission(workspace_id, 'transactions', 'create'));
create policy insights_effective_update on public.insights for update
using (private.has_workspace_permission(workspace_id, 'transactions', 'update'))
with check (private.has_workspace_permission(workspace_id, 'transactions', 'update'));
create policy insights_effective_delete on public.insights for delete
using (private.has_workspace_permission(workspace_id, 'transactions', 'delete'));

create policy role_permissions_member_read on public.workspace_role_permissions for select
using (public.is_workspace_member(workspace_id));
create policy role_permissions_effective_create on public.workspace_role_permissions for insert
with check (private.has_workspace_permission(workspace_id, 'permissions', 'create'));
create policy role_permissions_effective_update on public.workspace_role_permissions for update
using (private.has_workspace_permission(workspace_id, 'permissions', 'update'))
with check (private.has_workspace_permission(workspace_id, 'permissions', 'update'));
create policy role_permissions_effective_delete on public.workspace_role_permissions for delete
using (private.has_workspace_permission(workspace_id, 'permissions', 'delete'));

create policy member_permissions_own_read on public.workspace_member_permissions for select
using (user_id = (select auth.uid()) or private.has_workspace_permission(workspace_id, 'permissions', 'read'));
create policy member_permissions_effective_create on public.workspace_member_permissions for insert
with check (private.has_workspace_permission(workspace_id, 'permissions', 'create'));
create policy member_permissions_effective_update on public.workspace_member_permissions for update
using (private.has_workspace_permission(workspace_id, 'permissions', 'update'))
with check (private.has_workspace_permission(workspace_id, 'permissions', 'update'));
create policy member_permissions_effective_delete on public.workspace_member_permissions for delete
using (private.has_workspace_permission(workspace_id, 'permissions', 'delete'));

revoke all on function private.has_workspace_permission(uuid, text, text, uuid) from public, anon;
grant execute on function private.has_workspace_permission(uuid, text, text, uuid) to authenticated, service_role;

grant select, update on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select on public.workspace_invites to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert, update, delete on public.recurring_expenses to authenticated;
grant select, insert, update, delete on public.installments to authenticated;
grant select, insert, update, delete on public.insights to authenticated;
grant select, insert, update, delete on public.workspace_role_permissions to authenticated;
grant select, insert, update, delete on public.workspace_member_permissions to authenticated;

create or replace function private.cancel_workspace_invite_core(
  p_invite_id uuid,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite public.workspace_invites%rowtype;
  v_now timestamptz := statement_timestamp();
begin
  select * into v_invite
  from public.workspace_invites invite
  where invite.id = p_invite_id
  for update;
  if not found then
    return jsonb_build_object('status', 'not_found', 'error_code', 'invite_not_found');
  end if;
  if not private.has_members_permission(p_actor_id, v_invite.workspace_id, 'delete') then
    return jsonb_build_object('status', 'forbidden', 'error_code', 'forbidden');
  end if;
  if v_invite.status = 'cancelled' then
    return jsonb_build_object('status', 'already_cancelled', 'invite_id', v_invite.id);
  end if;
  if v_invite.status <> 'pending' then
    return jsonb_build_object('status', 'not_available', 'error_code', 'invite_not_available');
  end if;

  update public.workspace_invites
  set status = 'cancelled', cancelled_at = v_now, updated_at = v_now
  where id = v_invite.id;
  return jsonb_build_object('status', 'cancelled', 'invite_id', v_invite.id);
end;
$$;

create or replace function public.cancel_workspace_invite(p_invite_id uuid, p_actor_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select private.cancel_workspace_invite_core(p_invite_id, p_actor_id);
$$;

revoke all on function private.cancel_workspace_invite_core(uuid, uuid) from public, anon, authenticated;
revoke all on function public.cancel_workspace_invite(uuid, uuid) from public, anon, authenticated;
grant execute on function public.cancel_workspace_invite(uuid, uuid) to service_role;
