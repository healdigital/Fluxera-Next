-- Asset Management System Migration
-- This migration creates the complete schema for asset management including:
-- - Enums for asset categories, statuses, and event types
-- - Assets table with proper indexes and constraints
-- - Asset history table for audit trail
-- - RLS policies for multi-tenant access control
-- - Triggers for automatic history tracking

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Asset category types
create type public.asset_category as enum(
  'laptop',
  'desktop',
  'mobile_phone',
  'tablet',
  'monitor',
  'printer',
  'other_equipment'
);

-- Asset status types
create type public.asset_status as enum(
  'available',
  'assigned',
  'in_maintenance',
  'retired',
  'lost'
);

-- Asset event types for history tracking
create type public.asset_event_type as enum(
  'created',
  'updated',
  'status_changed',
  'assigned',
  'unassigned',
  'deleted'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Assets table
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name varchar(255) not null,
  category public.asset_category not null,
  status public.asset_status not null default 'available',
  description text,
  serial_number varchar(255),
  purchase_date date,
  warranty_expiry_date date,
  assigned_to uuid references auth.users(id) on delete set null,
  assigned_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

-- Asset history table for audit trail
create table public.asset_history (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  event_type public.asset_event_type not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Assets table indexes for performance
create index idx_assets_account_id on public.assets(account_id);
create index idx_assets_category on public.assets(category);
create index idx_assets_status on public.assets(status);
create index idx_assets_assigned_to on public.assets(assigned_to);
create index idx_assets_created_at on public.assets(created_at desc);

-- Asset history indexes
create index idx_asset_history_asset_id on public.asset_history(asset_id);
create index idx_asset_history_account_id on public.asset_history(account_id);
create index idx_asset_history_created_at on public.asset_history(created_at desc);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for automatic timestamp updates on assets
create trigger set_assets_timestamps
  before insert or update on public.assets
  for each row execute function public.trigger_set_timestamps();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically create history entries for asset changes
create or replace function public.create_asset_history_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_type_val public.asset_event_type;
  event_data_val jsonb;
begin
  -- Determine event type based on operation
  if (TG_OP = 'INSERT') then
    event_type_val := 'created';
    event_data_val := jsonb_build_object(
      'name', NEW.name,
      'category', NEW.category,
      'status', NEW.status,
      'description', NEW.description,
      'serial_number', NEW.serial_number
    );
  elsif (TG_OP = 'UPDATE') then
    -- Check for status change
    if (OLD.status != NEW.status) then
      event_type_val := 'status_changed';
      event_data_val := jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      );
    -- Check for assignment change
    elsif (OLD.assigned_to is distinct from NEW.assigned_to) then
      if (NEW.assigned_to is null) then
        event_type_val := 'unassigned';
        event_data_val := jsonb_build_object(
          'user_id', OLD.assigned_to,
          'unassigned_at', now()
        );
      else
        event_type_val := 'assigned';
        event_data_val := jsonb_build_object(
          'user_id', NEW.assigned_to,
          'assigned_at', NEW.assigned_at
        );
      end if;
    -- General update
    else
      event_type_val := 'updated';
      event_data_val := jsonb_build_object(
        'changes', jsonb_strip_nulls(jsonb_build_object(
          'name', CASE WHEN OLD.name != NEW.name THEN jsonb_build_object('old', OLD.name, 'new', NEW.name) ELSE null END,
          'category', CASE WHEN OLD.category != NEW.category THEN jsonb_build_object('old', OLD.category, 'new', NEW.category) ELSE null END,
          'description', CASE WHEN OLD.description IS DISTINCT FROM NEW.description THEN jsonb_build_object('old', OLD.description, 'new', NEW.description) ELSE null END,
          'serial_number', CASE WHEN OLD.serial_number IS DISTINCT FROM NEW.serial_number THEN jsonb_build_object('old', OLD.serial_number, 'new', NEW.serial_number) ELSE null END,
          'purchase_date', CASE WHEN OLD.purchase_date IS DISTINCT FROM NEW.purchase_date THEN jsonb_build_object('old', OLD.purchase_date, 'new', NEW.purchase_date) ELSE null END,
          'warranty_expiry_date', CASE WHEN OLD.warranty_expiry_date IS DISTINCT FROM NEW.warranty_expiry_date THEN jsonb_build_object('old', OLD.warranty_expiry_date, 'new', NEW.warranty_expiry_date) ELSE null END
        ))
      );
    end if;
  elsif (TG_OP = 'DELETE') then
    event_type_val := 'deleted';
    event_data_val := jsonb_build_object(
      'name', OLD.name,
      'category', OLD.category,
      'status', OLD.status,
      'deleted_at', now()
    );
  end if;

  -- Insert history entry
  insert into public.asset_history (
    asset_id,
    account_id,
    event_type,
    event_data,
    created_by
  ) values (
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.account_id, OLD.account_id),
    event_type_val,
    event_data_val,
    auth.uid()
  );

  return COALESCE(NEW, OLD);
end;
$$;

-- Trigger to create history entries on asset changes
create trigger asset_history_trigger
  after insert or update or delete on public.assets
  for each row execute function public.create_asset_history_entry();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on both tables
alter table public.assets enable row level security;
alter table public.asset_history enable row level security;

-- Assets: Users can view assets from their team accounts
create policy "Users can view team assets"
  on public.assets for select
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- Assets: Users can insert assets to their team accounts
create policy "Users can create team assets"
  on public.assets for insert
  to authenticated
  with check (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- Assets: Users can update assets in their team accounts
create policy "Users can update team assets"
  on public.assets for update
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

-- Assets: Users can delete assets from their team accounts
create policy "Users can delete team assets"
  on public.assets for delete
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- Asset History: Users can view history for their team's assets
create policy "Users can view team asset history"
  on public.asset_history for select
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- Asset History: System can insert history (via triggers)
create policy "System can insert asset history"
  on public.asset_history for insert
  to authenticated
  with check (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on table public.assets is 'IT assets managed by team accounts';
comment on table public.asset_history is 'Audit trail for all asset changes';
comment on column public.assets.account_id is 'Team account that owns this asset';
comment on column public.assets.assigned_to is 'User currently assigned to this asset';
comment on column public.assets.assigned_at is 'Timestamp when asset was assigned to current user';
comment on function public.create_asset_history_entry() is 'Automatically creates history entries for asset changes';
