# Dashboards & Analytics System - Design Document

## Overview

The Dashboards & Analytics System provides comprehensive data visualization and monitoring capabilities for the Fluxera platform. It consists of two main components: a Team Dashboard for regular users to monitor their organization's metrics, and an Admin Super Dashboard for platform administrators to oversee multi-tenant operations and system health.

The design follows the established Makerkit architecture with Next.js 16 App Router, Supabase for data persistence, and Row Level Security (RLS) for authorization. The system leverages React Server Components for initial data loading, real-time subscriptions for live updates, and configurable widgets for personalized dashboard experiences.

## Architecture

### Technology Stack

- **Frontend**: Next.js 16 with React Server Components (RSC)
- **Backend**: Supabase (PostgreSQL with RLS)
- **Real-time**: Supabase Realtime for live metric updates
- **Validation**: Zod schemas
- **Charts**: Recharts library for data visualization
- **UI Components**: Shadcn UI with Tailwind CSS 4
- **State Management**: Server-side with React Query for client-side caching

### Multi-Tenant Model

Dashboards are scoped based on user context:
- **Team Dashboard**: Displays metrics filtered to the current team account
- **Admin Dashboard**: Aggregates data across all team accounts (super admin only)
- RLS policies automatically filter data based on user's team membership
- Super admin role grants access to platform-wide metrics

### Data Flow

```
User Request → Page Component (RSC) → Loader Function → Aggregate Queries → RLS Filter → Data
Real-time Updates → Supabase Realtime → Client Component → State Update → UI Refresh
Widget Config → User Preferences → Database → Loader → Dashboard Layout
```

## Components and Interfaces

### Database Schema

#### Dashboard Widgets Configuration

```sql
create table public.dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  widget_type varchar(100) not null,
  widget_config jsonb not null default '{}'::jsonb,
  position_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table public.dashboard_widgets is 'User-configurable dashboard widget preferences';

-- Indexes
create index idx_dashboard_widgets_account_id on public.dashboard_widgets(account_id);
create index idx_dashboard_widgets_user_id on public.dashboard_widgets(user_id);
create index idx_dashboard_widgets_position on public.dashboard_widgets(position_order);

-- Unique constraint: one config per user per widget type
create unique index idx_dashboard_widgets_unique 
  on public.dashboard_widgets(account_id, user_id, widget_type);

-- Timestamps trigger
create trigger set_dashboard_widgets_timestamps
  before insert or update on public.dashboard_widgets
  for each row execute function public.trigger_set_timestamps();
```

#### Dashboard Alerts

```sql
create table public.dashboard_alerts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  alert_type varchar(100) not null,
  severity varchar(20) not null,
  title varchar(255) not null,
  description text not null,
  action_url varchar(1000),
  action_label varchar(100),
  metadata jsonb default '{}'::jsonb,
  is_dismissed boolean not null default false,
  dismissed_by uuid references auth.users(id),
  dismissed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

comment on table public.dashboard_alerts is 'Dashboard alerts and notifications';

-- Indexes
create index idx_dashboard_alerts_account_id on public.dashboard_alerts(account_id);
create index idx_dashboard_alerts_severity on public.dashboard_alerts(severity);
create index idx_dashboard_alerts_dismissed on public.dashboard_alerts(is_dismissed);
create index idx_dashboard_alerts_created_at on public.dashboard_alerts(created_at desc);

-- Enum for alert severity
create type public.alert_severity as enum(
  'info',
  'warning',
  'critical'
);

-- Enum for alert types
create type public.alert_type as enum(
  'low_asset_availability',
  'expiring_licenses',
  'pending_maintenance',
  'unusual_activity',
  'system_health',
  'subscription_expiring',
  'usage_limit_approaching'
);
```

#### Platform Metrics Cache

```sql
-- Materialized view for platform-wide metrics (admin dashboard)
create materialized view public.platform_metrics as
select
  count(distinct a.id) as total_accounts,
  count(distinct am.user_id) as total_users,
  count(distinct ast.id) as total_assets,
  count(distinct sl.id) as total_licenses,
  count(distinct case when a.created_at >= now() - interval '30 days' then a.id end) as new_accounts_30d,
  count(distinct case when am.created_at >= now() - interval '30 days' then am.user_id end) as new_users_30d,
  count(distinct case when ast.created_at >= now() - interval '30 days' then ast.id end) as new_assets_30d,
  now() as last_updated
from public.accounts a
left join public.accounts_memberships am on am.account_id = a.id
left join public.assets ast on ast.account_id = a.id
left join public.software_licenses sl on sl.account_id = a.id
where a.account_type = 'team';

comment on materialized view public.platform_metrics is 'Cached platform-wide metrics for admin dashboard';

-- Index for fast access
create unique index idx_platform_metrics_singleton on public.platform_metrics((true));

-- Refresh function
create or replace function public.refresh_platform_metrics()
returns void
language plpgsql
security definer
as $
begin
  refresh materialized view concurrently public.platform_metrics;
end;
$;

grant execute on function public.refresh_platform_metrics to authenticated;
```

### RLS Policies

```sql
-- Enable RLS
alter table public.dashboard_widgets enable row level security;
alter table public.dashboard_alerts enable row level security;

-- Dashboard Widgets: Users can view their own widget configs
create policy "Users can view own widget configs"
  on public.dashboard_widgets for select
  to authenticated
  using (
    user_id = auth.uid() and
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- Dashboard Widgets: Users can manage their own widget configs
create policy "Users can manage own widget configs"
  on public.dashboard_widgets for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Dashboard Alerts: Team members can view team alerts
create policy "Team members can view team alerts"
  on public.dashboard_alerts for select
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
    and is_dismissed = false
    and (expires_at is null or expires_at > now())
  );

-- Dashboard Alerts: Users can dismiss alerts
create policy "Users can dismiss alerts"
  on public.dashboard_alerts for update
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  )
  with check (is_dismissed = true and dismissed_by = auth.uid());

-- Dashboard Alerts: System can create alerts
create policy "System can create alerts"
  on public.dashboard_alerts for insert
  to authenticated
  with check (true);
```

### Database Functions

```sql
-- Function to get team dashboard metrics
create or replace function public.get_team_dashboard_metrics(
  p_account_slug text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $
declare
  v_account_id uuid;
  v_metrics jsonb;
begin
  -- Get account ID from slug
  select id into v_account_id
  from public.accounts
  where slug = p_account_slug;

  -- Verify caller has access
  if not public.has_role_on_account(v_account_id) then
    raise exception 'Access denied';
  end if;

  -- Calculate metrics
  select jsonb_build_object(
    'total_assets', count(distinct ast.id),
    'available_assets', count(distinct case when ast.status = 'available' then ast.id end),
    'assigned_assets', count(distinct case when ast.status = 'assigned' then ast.id end),
    'maintenance_assets', count(distinct case when ast.status = 'in_maintenance' then ast.id end),
    'total_users', count(distinct am.user_id),
    'active_users', count(distinct case when uas.status = 'active' then am.user_id end),
    'total_licenses', count(distinct sl.id),
    'active_licenses', count(distinct case when sl.status = 'active' then sl.id end),
    'expiring_licenses_30d', count(distinct case when sl.expiry_date between now() and now() + interval '30 days' then sl.id end),
    'pending_maintenance', count(distinct m.id),
    'assets_growth_30d', (
      select count(*) from public.assets
      where account_id = v_account_id
      and created_at >= now() - interval '30 days'
    ),
    'users_growth_30d', (
      select count(*) from public.accounts_memberships
      where account_id = v_account_id
      and created_at >= now() - interval '30 days'
    )
  ) into v_metrics
  from public.accounts a
  left join public.assets ast on ast.account_id = a.id
  left join public.accounts_memberships am on am.account_id = a.id
  left join public.user_account_status uas on uas.user_id = am.user_id and uas.account_id = a.id
  left join public.software_licenses sl on sl.account_id = a.id
  left join public.asset_maintenance m on m.asset_id = ast.id and m.status = 'pending'
  where a.id = v_account_id;

  return v_metrics;
end;
$;

grant execute on function public.get_team_dashboard_metrics to authenticated;

-- Function to get asset status distribution
create or replace function public.get_asset_status_distribution(
  p_account_slug text
)
returns table (
  status text,
  count bigint,
  percentage numeric
)
language plpgsql
security definer
set search_path = public
as $
declare
  v_account_id uuid;
  v_total_assets bigint;
begin
  -- Get account ID from slug
  select id into v_account_id
  from public.accounts
  where slug = p_account_slug;

  -- Verify caller has access
  if not public.has_role_on_account(v_account_id) then
    raise exception 'Access denied';
  end if;

  -- Get total assets
  select count(*) into v_total_assets
  from public.assets
  where account_id = v_account_id;

  -- Return distribution
  return query
  select
    ast.status::text,
    count(*)::bigint,
    case when v_total_assets > 0 
      then round((count(*)::numeric / v_total_assets) * 100, 2)
      else 0
    end as percentage
  from public.assets ast
  where ast.account_id = v_account_id
  group by ast.status
  order by count(*) desc;
end;
$;

grant execute on function public.get_asset_status_distribution to authenticated;

-- Function to get trend data
create or replace function public.get_dashboard_trends(
  p_account_slug text,
  p_metric_type text,
  p_days int default 30
)
returns table (
  date date,
  value bigint
)
language plpgsql
security definer
set search_path = public
as $
declare
  v_account_id uuid;
begin
  -- Get account ID from slug
  select id into v_account_id
  from public.accounts
  where slug = p_account_slug;

  -- Verify caller has access
  if not public.has_role_on_account(v_account_id) then
    raise exception 'Access denied';
  end if;

  -- Return trend data based on metric type
  if p_metric_type = 'assets' then
    return query
    select
      d.date::date,
      count(ast.id)::bigint as value
    from generate_series(
      current_date - (p_days || ' days')::interval,
      current_date,
      '1 day'::interval
    ) d(date)
    left join public.assets ast on ast.account_id = v_account_id
      and ast.created_at::date <= d.date
    group by d.date
    order by d.date;
  elsif p_metric_type = 'users' then
    return query
    select
      d.date::date,
      count(am.user_id)::bigint as value
    from generate_series(
      current_date - (p_days || ' days')::interval,
      current_date,
      '1 day'::interval
    ) d(date)
    left join public.accounts_memberships am on am.account_id = v_account_id
      and am.created_at::date <= d.date
    group by d.date
    order by d.date;
  elsif p_metric_type = 'licenses' then
    return query
    select
      d.date::date,
      count(sl.id)::bigint as value
    from generate_series(
      current_date - (p_days || ' days')::interval,
      current_date,
      '1 day'::interval
    ) d(date)
    left join public.software_licenses sl on sl.account_id = v_account_id
      and sl.created_at::date <= d.date
    group by d.date
    order by d.date;
  end if;
end;
$;

grant execute on function public.get_dashboard_trends to authenticated;

-- Function to create dashboard alert
create or replace function public.create_dashboard_alert(
  p_account_id uuid,
  p_alert_type varchar,
  p_severity varchar,
  p_title varchar,
  p_description text,
  p_action_url varchar default null,
  p_action_label varchar default null,
  p_metadata jsonb default '{}'::jsonb,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $
declare
  v_alert_id uuid;
begin
  insert into public.dashboard_alerts (
    account_id,
    alert_type,
    severity,
    title,
    description,
    action_url,
    action_label,
    metadata,
    expires_at
  ) values (
    p_account_id,
    p_alert_type,
    p_severity,
    p_title,
    p_description,
    p_action_url,
    p_action_label,
    p_metadata,
    p_expires_at
  )
  returning id into v_alert_id;

  return v_alert_id;
end;
$;

grant execute on function public.create_dashboard_alert to authenticated;

-- Function to get admin platform metrics
create or replace function public.get_admin_platform_metrics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $
declare
  v_metrics jsonb;
begin
  -- Verify caller is super admin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Access denied: Super admin privileges required';
  end if;

  -- Get cached metrics
  select jsonb_build_object(
    'total_accounts', total_accounts,
    'total_users', total_users,
    'total_assets', total_assets,
    'total_licenses', total_licenses,
    'new_accounts_30d', new_accounts_30d,
    'new_users_30d', new_users_30d,
    'new_assets_30d', new_assets_30d,
    'last_updated', last_updated
  ) into v_metrics
  from public.platform_metrics;

  return v_metrics;
end;
$;

grant execute on function public.get_admin_platform_metrics to authenticated;

-- Function to get account activity list for admin
create or replace function public.get_account_activity_list(
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  account_id uuid,
  account_name text,
  account_slug text,
  user_count bigint,
  asset_count bigint,
  last_activity_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $
begin
  -- Verify caller is super admin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Access denied: Super admin privileges required';
  end if;

  return query
  select
    a.id as account_id,
    a.name::text as account_name,
    a.slug::text as account_slug,
    count(distinct am.user_id)::bigint as user_count,
    count(distinct ast.id)::bigint as asset_count,
    max(greatest(
      coalesce(max(ual.created_at), a.created_at),
      coalesce(max(ast.updated_at), a.created_at),
      coalesce(max(am.created_at), a.created_at)
    )) as last_activity_at,
    a.created_at
  from public.accounts a
  left join public.accounts_memberships am on am.account_id = a.id
  left join public.assets ast on ast.account_id = a.id
  left join public.user_activity_log ual on ual.account_id = a.id
  where a.account_type = 'team'
  group by a.id, a.name, a.slug, a.created_at
  order by last_activity_at desc nulls last
  limit p_limit
  offset p_offset;
end;
$;

grant execute on function public.get_account_activity_list to authenticated;
```

### File Structure

```
apps/web/app/home/[account]/dashboard/
├── page.tsx                              # Team dashboard page (RSC)
├── _components/
│   ├── dashboard-grid.tsx                # Main dashboard layout
│   ├── dashboard-header.tsx              # Dashboard header with actions
│   ├── widget-container.tsx              # Wrapper for widgets
│   ├── configure-widgets-dialog.tsx      # Widget configuration modal
│   ├── widgets/
│   │   ├── metrics-summary-widget.tsx    # Key metrics display
│   │   ├── asset-status-widget.tsx       # Asset status pie chart
│   │   ├── trend-chart-widget.tsx        # Trend line charts
│   │   ├── alerts-widget.tsx             # Alerts list
│   │   ├── quick-actions-widget.tsx      # Quick action buttons
│   │   ├── recent-activity-widget.tsx    # Recent activity feed
│   │   ├── license-expiry-widget.tsx     # Expiring licenses
│   │   └── maintenance-schedule-widget.tsx # Upcoming maintenance
│   └── alert-card.tsx                    # Individual alert display
└── _lib/
    ├── server/
    │   ├── dashboard-page.loader.ts      # Data loader for dashboard
    │   └── dashboard-server-actions.ts   # Server actions for widgets
    └── schemas/
        └── dashboard.schema.ts           # Zod validation schemas

apps/web/app/admin/dashboard/
├── page.tsx                              # Admin super dashboard (RSC)
├── _components/
│   ├── admin-dashboard-grid.tsx          # Admin dashboard layout
│   ├── admin-metrics-overview.tsx        # Platform-wide metrics
│   ├── account-activity-list.tsx         # Team accounts list
│   ├── system-health-widget.tsx          # System health monitoring
│   ├── subscription-overview-widget.tsx  # Subscription metrics
│   ├── usage-statistics-widget.tsx       # Feature usage stats
│   └── platform-trends-widget.tsx        # Platform growth trends
└── _lib/
    ├── server/
    │   ├── admin-dashboard.loader.ts     # Data loader for admin dashboard
    │   └── admin-dashboard-actions.ts    # Admin-specific actions
    └── schemas/
        └── admin-dashboard.schema.ts     # Admin validation schemas
```

### TypeScript Interfaces

```typescript
// Database types
interface DashboardWidget {
  id: string;
  account_id: string;
  user_id: string | null;
  widget_type: WidgetType;
  widget_config: Record<string, unknown>;
  position_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

interface DashboardAlert {
  id: string;
  account_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  action_url: string | null;
  action_label: string | null;
  metadata: Record<string, unknown>;
  is_dismissed: boolean;
  dismissed_by: string | null;
  dismissed_at: string | null;
  created_at: string;
  expires_at: string | null;
}

type WidgetType =
  | 'metrics_summary'
  | 'asset_status'
  | 'trend_chart'
  | 'alerts'
  | 'quick_actions'
  | 'recent_activity'
  | 'license_expiry'
  | 'maintenance_schedule';

type AlertType =
  | 'low_asset_availability'
  | 'expiring_licenses'
  | 'pending_maintenance'
  | 'unusual_activity'
  | 'system_health'
  | 'subscription_expiring'
  | 'usage_limit_approaching';

type AlertSeverity = 'info' | 'warning' | 'critical';

// Metrics types
interface TeamDashboardMetrics {
  total_assets: number;
  available_assets: number;
  assigned_assets: number;
  maintenance_assets: number;
  total_users: number;
  active_users: number;
  total_licenses: number;
  active_licenses: number;
  expiring_licenses_30d: number;
  pending_maintenance: number;
  assets_growth_30d: number;
  users_growth_30d: number;
}

interface AssetStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface TrendDataPoint {
  date: string;
  value: number;
}

interface PlatformMetrics {
  total_accounts: number;
  total_users: number;
  total_assets: number;
  total_licenses: number;
  new_accounts_30d: number;
  new_users_30d: number;
  new_assets_30d: number;
  last_updated: string;
}

interface AccountActivity {
  account_id: string;
  account_name: string;
  account_slug: string;
  user_count: number;
  asset_count: number;
  last_activity_at: string;
  created_at: string;
}

// Form data types
interface UpdateWidgetConfigData {
  widget_id: string;
  widget_config: Record<string, unknown>;
  position_order?: number;
  is_visible?: boolean;
}

interface DismissAlertData {
  alert_id: string;
}
```

### Zod Schemas

```typescript
// apps/web/app/home/[account]/dashboard/_lib/schemas/dashboard.schema.ts
import { z } from 'zod';

export const WidgetTypeSchema = z.enum([
  'metrics_summary',
  'asset_status',
  'trend_chart',
  'alerts',
  'quick_actions',
  'recent_activity',
  'license_expiry',
  'maintenance_schedule',
]);

export const AlertSeveritySchema = z.enum(['info', 'warning', 'critical']);

export const UpdateWidgetConfigSchema = z.object({
  widget_id: z.string().uuid(),
  widget_config: z.record(z.unknown()).optional(),
  position_order: z.number().int().nonnegative().optional(),
  is_visible: z.boolean().optional(),
});

export const DismissAlertSchema = z.object({
  alert_id: z.string().uuid(),
});

export const TrendTimeRangeSchema = z.enum(['7d', '30d', '90d', '1y']);

export const GetTrendsSchema = z.object({
  metric_type: z.enum(['assets', 'users', 'licenses']),
  time_range: TrendTimeRangeSchema.default('30d'),
});
```

## Data Models

### Dashboard Widget Entity

User-configurable widget preferences:

- **Identity**: UUID primary key
- **Ownership**: Belongs to account and optionally specific user
- **Configuration**: Widget type and JSON configuration
- **Layout**: Position order and visibility flag
- **Audit**: Created/updated timestamps

### Dashboard Alert Entity

Notifications and alerts for users:

- **Identity**: UUID primary key
- **Ownership**: Belongs to account
- **Content**: Type, severity, title, description
- **Action**: Optional URL and label for action button
- **State**: Dismissal tracking
- **Lifecycle**: Creation and expiration timestamps

### Relationships

```
accounts (1) ──< (many) dashboard_widgets
auth.users (1) ──< (many) dashboard_widgets
accounts (1) ──< (many) dashboard_alerts
```

## Error Handling

### Validation Errors

- **Client-side**: Form validation using Zod schemas
- **Server-side**: Schema validation in server actions
- **Display**: Toast notifications for errors

### Database Errors

```typescript
// In server actions
try {
  const { data, error } = await client.rpc('get_team_dashboard_metrics', {
    p_account_slug: accountSlug,
  });

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to load dashboard metrics');
  }

  return { success: true, data };
} catch (error) {
  console.error('Unexpected error:', error);
  return { 
    success: false, 
    error: 'Failed to load dashboard' 
  };
}
```

### Authorization Errors

- RLS policies prevent unauthorized access
- Database functions verify permissions
- Admin dashboard checks super admin role

### User-Facing Error Messages

- **Loading**: "Loading dashboard..."
- **Error**: "Failed to load dashboard metrics"
- **Permission**: "You don't have permission to access this dashboard"
- **No Data**: "No data available for this period"

## Testing Strategy

### Database Testing

- **Migrations**: Test with `pnpm supabase:web:reset`
- **RLS Policies**: Verify widget and alert access control
- **Functions**: Test metric calculations with sample data
- **Materialized Views**: Test refresh mechanism

### Integration Testing

- **Server Actions**: Test widget configuration updates
- **Loaders**: Verify metric aggregation
- **Real-time**: Test live metric updates

### E2E Testing (Playwright)

Critical user flows:

1. **View Dashboard Flow**
   - Navigate to dashboard
   - Verify all widgets load
   - Check metric values display

2. **Configure Widgets Flow**
   - Open widget configuration
   - Reorder widgets
   - Hide/show widgets
   - Save configuration

3. **Dismiss Alert Flow**
   - View alert in widget
   - Click dismiss
   - Verify alert removed

4. **View Trends Flow**
   - Select time range
   - Verify chart updates
   - Hover over data points

### Component Testing

- **Widgets**: Test rendering with various data states
- **Charts**: Test data visualization
- **Real-time Updates**: Test subscription handling

## Performance Considerations

### Database Optimization

- Materialized views for expensive aggregations
- Indexes on frequently queried columns
- Efficient RLS policies
- Scheduled refresh of platform metrics

### Data Fetching

- Use RSC for initial dashboard load
- Implement real-time subscriptions for live updates
- Cache widget configurations
- Lazy load non-critical widgets

### Caching Strategy

- Next.js automatic caching for RSC
- Client-side caching with React Query
- Revalidate after mutations
- Cache platform metrics for 5 minutes

### Real-time Updates

```typescript
// Subscribe to metric changes
const subscription = supabase
  .channel('dashboard_metrics')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'assets',
    filter: `account_id=eq.${accountId}`,
  }, () => {
    // Refresh metrics
    refetchMetrics();
  })
  .subscribe();
```

## Security Considerations

### Row Level Security

- All data access controlled by RLS policies
- Widget configs scoped to user and account
- Alerts scoped to account membership
- Admin functions verify super admin role

### Input Validation

- Zod schemas validate all user input
- Server-side validation in all actions
- Sanitize widget configurations

### Audit Trail

- Widget configuration changes logged
- Alert dismissals tracked
- Admin dashboard access logged

## Implementation Phases

### Phase 1: Database Foundation
- Create migrations for tables and views
- Implement RLS policies
- Create database functions for metrics
- Set up materialized views
- Generate TypeScript types

### Phase 2: Team Dashboard Core
- Implement dashboard page with loader
- Build dashboard grid layout
- Create metrics summary widget
- Add loading states

### Phase 3: Data Visualization Widgets
- Implement asset status distribution widget
- Build trend chart widget
- Add chart interactions
- Optimize chart performance

### Phase 4: Alerts and Actions
- Create alerts widget
- Implement alert dismissal
- Build quick actions widget
- Add alert generation logic

### Phase 5: Widget Configuration
- Build widget configuration dialog
- Implement drag-and-drop reordering
- Add show/hide functionality
- Save user preferences

### Phase 6: Real-time Updates
- Set up Supabase Realtime subscriptions
- Implement automatic metric refresh
- Add live update indicators
- Optimize subscription performance

### Phase 7: Admin Super Dashboard
- Create admin dashboard page
- Implement platform metrics display
- Build account activity list
- Add system health monitoring

### Phase 8: Admin Advanced Features
- Implement subscription overview
- Add usage statistics
- Build platform trends
- Create admin quick actions

### Phase 9: Polish and Testing
- Add loading skeletons
- Implement error boundaries
- Write E2E tests
- Performance optimization
- Accessibility improvements
- Mobile responsiveness

