-- Software Licenses Management System Migration
-- This migration creates the complete schema for software license management including:
-- - Enums for license types and alert types
-- - Software licenses table with proper indexes and constraints
-- - License assignments table for user and asset assignments
-- - License renewal alerts table for expiration notifications
-- - RLS policies for multi-tenant access control
-- - Database functions for expiration checking and statistics
-- - Triggers for automatic timestamp and user tracking

-- ============================================================================
-- ENUMS
-- ============================================================================

-- License type enum
create type public.license_type as enum(
  'perpetual',
  'subscription',
  'volume',
  'oem',
  'trial',
  'educational',
  'enterprise'
);

-- Alert type enum for renewal notifications
create type public.alert_type as enum(
  '30_day',
  '7_day'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Software licenses table
create table public.software_licenses (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name varchar(255) not null,
  vendor varchar(255) not null,
  license_key text not null,
  license_type public.license_type not null,
  purchase_date date not null,
  expiration_date date not null,
  cost numeric(10, 2),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  
  -- Ensure unique license keys per account
  constraint unique_license_key_per_account unique(account_id, license_key),
  
  -- Ensure expiration date is after purchase date
  constraint check_expiration_after_purchase check (expiration_date > purchase_date)
);

-- License assignments table
create table public.license_assignments (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.software_licenses(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  assigned_to_user uuid references auth.users(id) on delete cascade,
  assigned_to_asset uuid references public.assets(id) on delete cascade,
  assigned_at timestamp with time zone default now(),
  assigned_by uuid references auth.users(id),
  notes text,
  
  -- Ensure at least one assignment target
  constraint check_assignment_target check (
    (assigned_to_user is not null and assigned_to_asset is null) or
    (assigned_to_user is null and assigned_to_asset is not null)
  ),
  
  -- Prevent duplicate assignments
  constraint unique_user_license unique(license_id, assigned_to_user),
  constraint unique_asset_license unique(license_id, assigned_to_asset)
);

-- License renewal alerts table
create table public.license_renewal_alerts (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.software_licenses(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  alert_type public.alert_type not null,
  sent_at timestamp with time zone default now(),
  
  -- Prevent duplicate alerts for same license and type
  constraint unique_alert_per_license unique(license_id, alert_type)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Software licenses table indexes for performance
create index idx_software_licenses_account_id on public.software_licenses(account_id);
create index idx_software_licenses_expiration_date on public.software_licenses(expiration_date);
create index idx_software_licenses_vendor on public.software_licenses(vendor);
create index idx_software_licenses_license_type on public.software_licenses(license_type);

-- License assignments table indexes
create index idx_license_assignments_license_id on public.license_assignments(license_id);
create index idx_license_assignments_user on public.license_assignments(assigned_to_user);
create index idx_license_assignments_asset on public.license_assignments(assigned_to_asset);
create index idx_license_assignments_account_id on public.license_assignments(account_id);

-- License renewal alerts table indexes
create index idx_license_renewal_alerts_license_id on public.license_renewal_alerts(license_id);
create index idx_license_renewal_alerts_sent_at on public.license_renewal_alerts(sent_at desc);
create index idx_license_renewal_alerts_account_id on public.license_renewal_alerts(account_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for automatic timestamp updates on software_licenses
create trigger set_software_licenses_timestamps
  before insert or update on public.software_licenses
  for each row execute function public.trigger_set_timestamps();

-- Trigger for automatic user tracking on software_licenses
create trigger set_software_licenses_user_tracking
  before insert or update on public.software_licenses
  for each row execute function public.trigger_set_user_tracking();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check for expiring licenses and generate alerts
create or replace function public.check_license_expirations()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  license_record record;
  days_until_expiry integer;
begin
  -- Loop through all licenses
  for license_record in
    select id, account_id, name, expiration_date
    from public.software_licenses
    where expiration_date >= current_date
  loop
    -- Calculate days until expiry
    days_until_expiry := license_record.expiration_date - current_date;
    
    -- Check for 30-day alert
    if days_until_expiry <= 30 and days_until_expiry > 7 then
      -- Insert alert if not already sent
      insert into public.license_renewal_alerts (license_id, account_id, alert_type)
      values (license_record.id, license_record.account_id, '30_day')
      on conflict (license_id, alert_type) do nothing;
    end if;
    
    -- Check for 7-day alert
    if days_until_expiry <= 7 and days_until_expiry >= 0 then
      -- Insert alert if not already sent
      insert into public.license_renewal_alerts (license_id, account_id, alert_type)
      values (license_record.id, license_record.account_id, '7_day')
      on conflict (license_id, alert_type) do nothing;
    end if;
  end loop;
end;
$$;

-- Function to get license statistics for an account
create or replace function public.get_license_stats(p_account_id uuid)
returns table(
  total_licenses bigint,
  expiring_soon bigint,
  expired bigint,
  total_assignments bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    count(distinct sl.id) as total_licenses,
    count(distinct sl.id) filter (
      where sl.expiration_date between current_date and current_date + interval '30 days'
    ) as expiring_soon,
    count(distinct sl.id) filter (
      where sl.expiration_date < current_date
    ) as expired,
    count(distinct la.id) as total_assignments
  from public.software_licenses sl
  left join public.license_assignments la on la.license_id = sl.id
  where sl.account_id = p_account_id;
end;
$$;

-- Function to get licenses with assignment counts
create or replace function public.get_licenses_with_assignments(p_account_id uuid)
returns table(
  id uuid,
  name varchar,
  vendor varchar,
  license_type public.license_type,
  expiration_date date,
  days_until_expiry integer,
  assignment_count bigint,
  is_expired boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    sl.id,
    sl.name,
    sl.vendor,
    sl.license_type,
    sl.expiration_date,
    (sl.expiration_date - current_date)::integer as days_until_expiry,
    count(la.id) as assignment_count,
    (sl.expiration_date < current_date) as is_expired
  from public.software_licenses sl
  left join public.license_assignments la on la.license_id = sl.id
  where sl.account_id = p_account_id
  group by sl.id, sl.name, sl.vendor, sl.license_type, sl.expiration_date
  order by sl.expiration_date asc;
end;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table public.software_licenses enable row level security;
alter table public.license_assignments enable row level security;
alter table public.license_renewal_alerts enable row level security;

-- Software Licenses: Users can view licenses from their team accounts
create policy "Users can view team licenses"
  on public.software_licenses for select
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- Software Licenses: Users can insert licenses to their team accounts
create policy "Users can create team licenses"
  on public.software_licenses for insert
  to authenticated
  with check (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- Software Licenses: Users can update licenses in their team accounts
create policy "Users can update team licenses"
  on public.software_licenses for update
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  )
  with check (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- Software Licenses: Users can delete licenses from their team accounts
create policy "Users can delete team licenses"
  on public.software_licenses for delete
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- License Assignments: Users can view assignments for their team's licenses
create policy "Users can view team license assignments"
  on public.license_assignments for select
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- License Assignments: Users can create assignments for their team's licenses
create policy "Users can create team license assignments"
  on public.license_assignments for insert
  to authenticated
  with check (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- License Assignments: Users can delete assignments for their team's licenses
create policy "Users can delete team license assignments"
  on public.license_assignments for delete
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- License Renewal Alerts: Users can view alerts for their team's licenses
create policy "Users can view team license alerts"
  on public.license_renewal_alerts for select
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- License Renewal Alerts: System can insert alerts
create policy "System can insert license alerts"
  on public.license_renewal_alerts for insert
  to authenticated
  with check (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on table public.software_licenses is 'Software licenses managed by team accounts';
comment on table public.license_assignments is 'Assignments of licenses to users or assets';
comment on table public.license_renewal_alerts is 'Renewal alerts for expiring licenses';

comment on column public.software_licenses.account_id is 'Team account that owns this license';
comment on column public.software_licenses.license_key is 'Unique license key for the software';
comment on column public.software_licenses.expiration_date is 'Date when the license expires';

comment on column public.license_assignments.assigned_to_user is 'User assigned to this license (mutually exclusive with assigned_to_asset)';
comment on column public.license_assignments.assigned_to_asset is 'Asset assigned to this license (mutually exclusive with assigned_to_user)';

comment on column public.license_renewal_alerts.alert_type is 'Type of alert: 30_day or 7_day before expiration';

comment on function public.check_license_expirations() is 'Checks for expiring licenses and generates renewal alerts';
comment on function public.get_license_stats(uuid) is 'Returns license statistics for a team account';
comment on function public.get_licenses_with_assignments(uuid) is 'Returns licenses with assignment counts for a team account';
