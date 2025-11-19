# Software Licenses Management System - Design Document

## Overview

The Software Licenses Management System enables organizations to track software license inventory, monitor expiration dates, assign licenses to users and assets, and receive renewal alerts within a multi-tenant SaaS application. It follows the established Makerkit architecture patterns with Next.js 16 App Router, Supabase for data persistence, and Row Level Security (RLS) for authorization.

The system leverages server-side rendering for data fetching, server actions for mutations, and maintains strict separation between client and server code. All data access is secured through Supabase RLS policies, ensuring team members can only access licenses belonging to their team account. The design integrates with the existing asset management system to enable license-to-asset assignments.

## Architecture

### Technology Stack

- **Frontend**: Next.js 16 with React Server Components (RSC)
- **Backend**: Supabase (PostgreSQL with RLS)
- **Validation**: Zod schemas
- **Forms**: react-hook-form with @kit/ui/form
- **UI Components**: Shadcn UI with Tailwind CSS 4
- **State Management**: Server-side with minimal client state
- **Notifications**: Email alerts via existing mailer package

### Multi-Tenant Model

Software licenses are scoped to team accounts using the existing `accounts` table:
- Each license belongs to exactly one team account via `account_id` foreign key
- RLS policies automatically filter licenses based on user's team membership
- Personal accounts are not supported for license management (team accounts only)

### Data Flow

```
User Request → Page Component (RSC) → Loader Function → Supabase Query → RLS Filter → Data
User Action → Form Submit → Server Action → Validation → Service Layer → Supabase Mutation → RLS Check
Background Job → Check Expirations → Generate Alerts → Send Notifications
```

## Components and Interfaces

### Database Schema

#### Software Licenses Table

```sql
create table public.software_licenses (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name varchar(255) not null,
  vendor varchar(255) not null,
  license_key text not null,
  license_type varchar(50) not null,
  purchase_date date not null,
  expiration_date date not null,
  cost numeric(10, 2),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  
  -- Ensure unique license keys per account
  constraint unique_license_key_per_account unique(account_id, license_key)
);

-- Indexes for performance
create index idx_software_licenses_account_id on public.software_licenses(account_id);
create index idx_software_licenses_expiration_date on public.software_licenses(expiration_date);
create index idx_software_licenses_vendor on public.software_licenses(vendor);
create index idx_software_licenses_license_type on public.software_licenses(license_type);

-- Timestamps trigger
create trigger set_software_licenses_timestamps
  before insert or update on public.software_licenses
  for each row execute function public.trigger_set_timestamps();

-- User tracking trigger
create trigger set_software_licenses_user_tracking
  before insert or update on public.software_licenses
  for each row execute function public.trigger_set_user_tracking();
```

#### License Assignments Table

```sql
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

-- Indexes for performance
create index idx_license_assignments_license_id on public.license_assignments(license_id);
create index idx_license_assignments_user on public.license_assignments(assigned_to_user);
create index idx_license_assignments_asset on public.license_assignments(assigned_to_asset);
create index idx_license_assignments_account_id on public.license_assignments(account_id);
```

#### License Renewal Alerts Table

```sql
create table public.license_renewal_alerts (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.software_licenses(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  alert_type varchar(20) not null, -- '30_day' or '7_day'
  sent_at timestamp with time zone default now(),
  
  -- Prevent duplicate alerts for same license and type
  constraint unique_alert_per_license unique(license_id, alert_type)
);

-- Index for querying alerts
create index idx_license_renewal_alerts_license_id on public.license_renewal_alerts(license_id);
create index idx_license_renewal_alerts_sent_at on public.license_renewal_alerts(sent_at desc);
```

#### Enums

```sql
create type public.license_type as enum(
  'perpetual',
  'subscription',
  'volume',
  'oem',
  'trial',
  'educational',
  'enterprise'
);

create type public.alert_type as enum(
  '30_day',
  '7_day'
);
```

### RLS Policies

```sql
-- Enable RLS
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
```

### Database Functions

```sql
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
  license_type varchar,
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
```

### File Structure

```
apps/web/app/home/[account]/licenses/
├── page.tsx                              # Licenses list page (RSC)
├── new/
│   └── page.tsx                          # Create license page
├── [id]/
│   ├── page.tsx                          # License detail page (RSC)
│   └── edit/
│       └── page.tsx                      # Edit license page
├── _components/
│   ├── licenses-list.tsx                 # Client component for list display
│   ├── license-card.tsx                  # Individual license card
│   ├── license-filters.tsx               # Filter controls (client)
│   ├── create-license-form.tsx           # Create form (client)
│   ├── edit-license-form.tsx             # Edit form (client)
│   ├── license-detail-view.tsx           # Detail view component
│   ├── license-stats-cards.tsx           # Statistics dashboard
│   ├── assign-license-dialog.tsx         # Assignment dialog
│   ├── license-assignments-list.tsx      # Assignments display
│   ├── delete-license-dialog.tsx         # Delete confirmation
│   └── expiration-badge.tsx              # Visual indicator for expiry status
└── _lib/
    ├── server/
    │   ├── licenses-page.loader.ts       # Data loader for list page
    │   ├── license-detail.loader.ts      # Data loader for detail page
    │   └── licenses-server-actions.ts    # Server actions for mutations
    └── schemas/
        └── license.schema.ts             # Zod validation schemas
```

### TypeScript Interfaces

```typescript
// Database types (generated by Supabase)
interface SoftwareLicense {
  id: string;
  account_id: string;
  name: string;
  vendor: string;
  license_key: string;
  license_type: LicenseType;
  purchase_date: string;
  expiration_date: string;
  cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface LicenseAssignment {
  id: string;
  license_id: string;
  account_id: string;
  assigned_to_user: string | null;
  assigned_to_asset: string | null;
  assigned_at: string;
  assigned_by: string | null;
  notes: string | null;
}

interface LicenseRenewalAlert {
  id: string;
  license_id: string;
  account_id: string;
  alert_type: '30_day' | '7_day';
  sent_at: string;
}

type LicenseType = 
  | 'perpetual'
  | 'subscription'
  | 'volume'
  | 'oem'
  | 'trial'
  | 'educational'
  | 'enterprise';

// View models with joined data
interface LicenseWithAssignments extends SoftwareLicense {
  assignments: LicenseAssignmentWithDetails[];
  assignment_count: number;
  days_until_expiry: number;
  is_expired: boolean;
}

interface LicenseAssignmentWithDetails extends LicenseAssignment {
  user?: {
    id: string;
    display_name: string;
    email: string;
    picture_url: string | null;
  };
  asset?: {
    id: string;
    name: string;
    category: string;
    serial_number: string | null;
  };
}

interface LicenseStats {
  total_licenses: number;
  expiring_soon: number;
  expired: number;
  total_assignments: number;
}

// Form data types
interface CreateLicenseData {
  name: string;
  vendor: string;
  license_key: string;
  license_type: LicenseType;
  purchase_date: string;
  expiration_date: string;
  cost?: number;
  notes?: string;
}

interface UpdateLicenseData extends CreateLicenseData {
  id: string;
}

interface AssignLicenseToUserData {
  license_id: string;
  user_id: string;
  notes?: string;
}

interface AssignLicenseToAssetData {
  license_id: string;
  asset_id: string;
  notes?: string;
}

interface UnassignLicenseData {
  assignment_id: string;
}
```

### Zod Schemas

```typescript
// apps/web/app/home/[account]/licenses/_lib/schemas/license.schema.ts
import { z } from 'zod';

export const LicenseTypeSchema = z.enum([
  'perpetual',
  'subscription',
  'volume',
  'oem',
  'trial',
  'educational',
  'enterprise',
]);

export const CreateLicenseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  vendor: z.string().min(1, 'Vendor is required').max(255),
  license_key: z.string().min(1, 'License key is required'),
  license_type: LicenseTypeSchema,
  purchase_date: z.string().date('Invalid purchase date'),
  expiration_date: z.string().date('Invalid expiration date'),
  cost: z.number().positive().optional(),
  notes: z.string().max(5000).optional(),
}).refine(
  (data) => new Date(data.expiration_date) > new Date(data.purchase_date),
  {
    message: 'Expiration date must be after purchase date',
    path: ['expiration_date'],
  }
);

export const UpdateLicenseSchema = CreateLicenseSchema.extend({
  id: z.string().uuid(),
});

export const AssignLicenseToUserSchema = z.object({
  license_id: z.string().uuid(),
  user_id: z.string().uuid(),
  notes: z.string().max(1000).optional(),
});

export const AssignLicenseToAssetSchema = z.object({
  license_id: z.string().uuid(),
  asset_id: z.string().uuid(),
  notes: z.string().max(1000).optional(),
});

export const UnassignLicenseSchema = z.object({
  assignment_id: z.string().uuid(),
});

export const DeleteLicenseSchema = z.object({
  id: z.string().uuid(),
});
```

## Data Models

### Software License Entity

The core entity representing a software license with the following properties:

- **Identity**: UUID primary key, unique license key per account
- **Ownership**: Belongs to a team account via `account_id`
- **Classification**: License type enum (perpetual, subscription, etc.)
- **Details**: Name, vendor, purchase/expiration dates, cost, notes
- **Audit**: Created/updated timestamps and user tracking

### License Assignment Entity

Represents the assignment of a license to either a user or an asset:

- **Target**: Either `assigned_to_user` OR `assigned_to_asset` (mutually exclusive)
- **Context**: Links to license and account
- **Metadata**: Assignment timestamp, assigning user, notes
- **Constraints**: Prevents duplicate assignments

### License Renewal Alert Entity

Immutable records of renewal alerts sent:

- **Alert Type**: 30-day or 7-day warning
- **Context**: Links to license and account
- **Timestamp**: When alert was sent
- **Uniqueness**: One alert per license per type

### Relationships

```
accounts (1) ──< (many) software_licenses
software_licenses (1) ──< (many) license_assignments
software_licenses (1) ──< (many) license_renewal_alerts
auth.users (1) ──< (many) license_assignments [assigned_to_user]
assets (1) ──< (many) license_assignments [assigned_to_asset]
auth.users (1) ──< (many) software_licenses [created_by, updated_by]
auth.users (1) ──< (many) license_assignments [assigned_by]
```

## Error Handling

### Validation Errors

- **Client-side**: Form validation using Zod schemas with react-hook-form
- **Server-side**: Schema validation in server actions via `enhanceAction`
- **Display**: Field-level error messages in forms
- **Business Rules**: Custom validation for date ranges, duplicate license keys

### Database Errors

```typescript
// In server actions
try {
  const { data, error } = await client
    .from('software_licenses')
    .insert(licenseData)
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new Error('A license with this key already exists');
    }
    console.error('Database error:', error);
    throw new Error('Failed to create license');
  }

  return { success: true, data };
} catch (error) {
  console.error('Unexpected error:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'An unexpected error occurred' 
  };
}
```

### Authorization Errors

- RLS policies automatically prevent unauthorized access
- No explicit permission checks needed in application code
- Failed queries return empty results or throw errors caught by error boundaries

### Assignment Errors

- **Duplicate Assignment**: "This license is already assigned to this user/asset"
- **Invalid Target**: "Assignment target not found"
- **Constraint Violation**: "License cannot be assigned to both user and asset"

### User-Facing Error Messages

- **Validation**: "Name is required", "Expiration date must be after purchase date"
- **Not Found**: "License not found"
- **Permission**: "You don't have permission to perform this action"
- **Duplicate**: "A license with this key already exists"
- **Generic**: "Something went wrong. Please try again."

## Testing Strategy

### Database Testing

- **Migrations**: Test migration up/down with `pnpm supabase:web:reset`
- **RLS Policies**: Write Supabase tests to verify policy enforcement
- **Functions**: Test expiration checking and statistics functions with sample data
- **Constraints**: Verify unique constraints and check constraints work correctly

### Integration Testing

- **Server Actions**: Test with valid/invalid data
- **Loaders**: Verify data fetching and filtering
- **RLS**: Ensure users can only access their team's licenses
- **Alert Generation**: Test expiration checking function with various dates

### E2E Testing (Playwright)

Focus on critical user flows:

1. **Create License Flow**
   - Navigate to licenses page
   - Click "New License"
   - Fill form with valid data
   - Submit and verify license appears in list

2. **Assign License to User Flow**
   - Select a license
   - Click "Assign to User"
   - Select a team member
   - Verify assignment appears in list

3. **Assign License to Asset Flow**
   - Select a license
   - Click "Assign to Asset"
   - Select an asset
   - Verify assignment appears in list

4. **View Expiring Licenses Flow**
   - Navigate to licenses page
   - Verify licenses expiring within 30 days are highlighted
   - Check alert badges display correctly

5. **Export Licenses Flow**
   - Apply filters
   - Click "Export"
   - Verify CSV file downloads with correct data

### Component Testing

- **Forms**: Test validation, submission, error handling
- **Lists**: Test rendering, filtering, sorting
- **Dialogs**: Test open/close, confirmation flows
- **Badges**: Test expiration status display logic

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns (account_id, expiration_date, vendor, license_type)
- Efficient RLS policies using indexed columns
- Database functions for complex queries (statistics, assignments)
- Composite unique indexes for constraint enforcement

### Data Fetching

- Use RSC for initial page loads (no client-side fetching)
- Implement pagination for large license lists
- Use Supabase's built-in filtering and sorting
- Leverage database functions for aggregated data

### Alert System

- Background job runs daily (not on every request)
- Efficient query using indexed expiration_date column
- Upsert pattern prevents duplicate alerts
- Batch email sending for multiple alerts

### Caching Strategy

- Next.js automatic caching for RSC
- Revalidate after mutations using `revalidatePath`
- Cache license statistics with reasonable TTL
- No client-side caching needed

## Security Considerations

### Row Level Security

- All data access controlled by RLS policies
- Policies verify team membership for all operations
- No manual authorization checks in application code
- Service role used only for background jobs (alert generation)

### Input Validation

- Zod schemas validate all user input
- Server-side validation in all server actions
- Prevent SQL injection through parameterized queries
- Sanitize license keys and sensitive data

### Sensitive Data

- License keys stored as text (consider encryption for production)
- Mask license keys in list views (show only last 4 characters)
- Full keys visible only in detail view to authorized users
- Audit trail for all license access and modifications

### Export Security

- Export limited to user's team data via RLS
- No sensitive data in export filenames
- Rate limiting on export operations
- Log export actions for audit purposes

## Notification System

### Email Alerts

```typescript
// Integration with existing mailer package
interface LicenseExpirationEmailData {
  licenseName: string;
  vendor: string;
  expirationDate: string;
  daysUntilExpiry: number;
  licenseDetailUrl: string;
}

// Send to all team administrators
async function sendExpirationAlert(
  accountId: string,
  licenseData: LicenseExpirationEmailData,
  alertType: '30_day' | '7_day'
) {
  const admins = await getTeamAdministrators(accountId);
  
  for (const admin of admins) {
    await sendEmail({
      to: admin.email,
      subject: `License Expiring Soon: ${licenseData.licenseName}`,
      template: 'license-expiration',
      data: licenseData,
    });
  }
}
```

### In-App Notifications

- Display alert count in navigation
- Dedicated notifications section showing recent alerts
- Visual indicators on license cards (badges, colors)
- Dismissible notifications after user acknowledgment

## Implementation Phases

### Phase 1: Database Foundation
- Create migrations for tables, enums, and functions
- Implement RLS policies
- Set up alert checking function
- Generate TypeScript types

### Phase 2: Core CRUD Operations
- Implement license list page with loader
- Create license creation form and server action
- Build license detail page
- Implement edit functionality
- Add delete operation with confirmation

### Phase 3: Assignment Features
- Build assignment dialogs (user and asset)
- Implement assign/unassign server actions
- Display assignments in detail view
- Add assignment filtering in list view

### Phase 4: Expiration Tracking
- Implement expiration badge component
- Add visual indicators for expiring licenses
- Create statistics dashboard
- Set up background job for alert generation

### Phase 5: Notifications and Export
- Integrate email notification system
- Build in-app notification display
- Implement CSV export functionality
- Add filtering and search capabilities

### Phase 6: Polish and Testing
- Add loading states
- Implement error boundaries
- Write E2E tests for critical flows
- Performance optimization
- Accessibility improvements
- Documentation

## Integration Points

### Asset Management System

- License assignments reference `assets` table
- Shared RLS patterns and authorization model
- Consistent UI/UX patterns
- Unified navigation structure

### User Management

- License assignments reference `auth.users`
- Display user information in assignments
- Filter assignable users by team membership

### Notification System

- Leverage existing mailer package
- Consistent email templates
- Unified notification preferences

### Billing System (Future)

- Track license costs
- Generate cost reports
- Budget alerts for renewals
- Integration with subscription management
