# Asset Management System - Design Document

## Overview

The Asset Management System is a comprehensive solution for tracking IT assets within a multi-tenant SaaS application. It follows the established Makerkit architecture patterns with Next.js 16 App Router, Supabase for data persistence, and Row Level Security (RLS) for authorization. The system enables team accounts to manage their IT inventory through CRUD operations, categorization, user assignments, and complete audit trails.

The design leverages server-side rendering for data fetching, server actions for mutations, and maintains strict separation between client and server code. All data access is secured through Supabase RLS policies, ensuring team members can only access assets belonging to their team account.

## Architecture

### Technology Stack

- **Frontend**: Next.js 16 with React Server Components (RSC)
- **Backend**: Supabase (PostgreSQL with RLS)
- **Validation**: Zod schemas
- **Forms**: react-hook-form with @kit/ui/form
- **UI Components**: Shadcn UI with Tailwind CSS 4
- **State Management**: Server-side with minimal client state

### Multi-Tenant Model

Assets are scoped to team accounts using the existing `accounts` table:
- Each asset belongs to exactly one team account via `account_id` foreign key
- RLS policies automatically filter assets based on user's team membership
- Personal accounts are not supported for asset management (team accounts only)

### Data Flow

```
User Request → Page Component (RSC) → Loader Function → Supabase Query → RLS Filter → Data
User Action → Form Submit → Server Action → Validation → Service Layer → Supabase Mutation → RLS Check
```

## Components and Interfaces

### Database Schema

#### Assets Table

```sql
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name varchar(255) not null,
  category varchar(50) not null,
  status varchar(50) not null default 'available',
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

-- Indexes for performance
create index idx_assets_account_id on public.assets(account_id);
create index idx_assets_category on public.assets(category);
create index idx_assets_status on public.assets(status);
create index idx_assets_assigned_to on public.assets(assigned_to);

-- Timestamps trigger
create trigger set_assets_timestamps
  before insert or update on public.assets
  for each row execute function public.trigger_set_timestamps();

-- User tracking trigger
create trigger set_assets_user_tracking
  before insert or update on public.assets
  for each row execute function public.trigger_set_user_tracking();
```

#### Asset History Table

```sql
create table public.asset_history (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  event_type varchar(50) not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

-- Index for querying history by asset
create index idx_asset_history_asset_id on public.asset_history(asset_id);
create index idx_asset_history_created_at on public.asset_history(created_at desc);
```

#### Enums

```sql
create type public.asset_category as enum(
  'laptop',
  'desktop',
  'mobile_phone',
  'tablet',
  'monitor',
  'printer',
  'other_equipment'
);

create type public.asset_status as enum(
  'available',
  'assigned',
  'in_maintenance',
  'retired',
  'lost'
);

create type public.asset_event_type as enum(
  'created',
  'updated',
  'status_changed',
  'assigned',
  'unassigned',
  'deleted'
);
```

### RLS Policies

```sql
-- Enable RLS
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
```

### Database Functions

```sql
-- Function to automatically create history entries
create or replace function public.create_asset_history_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_type_val text;
  event_data_val jsonb;
begin
  -- Determine event type
  if (TG_OP = 'INSERT') then
    event_type_val := 'created';
    event_data_val := to_jsonb(NEW);
  elsif (TG_OP = 'UPDATE') then
    if (OLD.status != NEW.status) then
      event_type_val := 'status_changed';
      event_data_val := jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      );
    elsif (OLD.assigned_to is distinct from NEW.assigned_to) then
      if (NEW.assigned_to is null) then
        event_type_val := 'unassigned';
        event_data_val := jsonb_build_object('user_id', OLD.assigned_to);
      else
        event_type_val := 'assigned';
        event_data_val := jsonb_build_object('user_id', NEW.assigned_to);
      end if;
    else
      event_type_val := 'updated';
      event_data_val := jsonb_build_object(
        'changes', jsonb_build_object(
          'name', CASE WHEN OLD.name != NEW.name THEN NEW.name ELSE null END,
          'category', CASE WHEN OLD.category != NEW.category THEN NEW.category ELSE null END,
          'description', CASE WHEN OLD.description != NEW.description THEN NEW.description ELSE null END
        )
      );
    end if;
  elsif (TG_OP = 'DELETE') then
    event_type_val := 'deleted';
    event_data_val := to_jsonb(OLD);
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

-- Trigger to create history entries
create trigger asset_history_trigger
  after insert or update or delete on public.assets
  for each row execute function public.create_asset_history_entry();
```

### File Structure

```
apps/web/app/home/[account]/assets/
├── page.tsx                              # Assets list page (RSC)
├── new/
│   └── page.tsx                          # Create asset page
├── [id]/
│   ├── page.tsx                          # Asset detail page (RSC)
│   └── edit/
│       └── page.tsx                      # Edit asset page
├── _components/
│   ├── assets-list.tsx                   # Client component for list display
│   ├── asset-card.tsx                    # Individual asset card
│   ├── asset-filters.tsx                 # Filter controls (client)
│   ├── create-asset-form.tsx             # Create form (client)
│   ├── edit-asset-form.tsx               # Edit form (client)
│   ├── asset-detail-view.tsx             # Detail view component
│   ├── asset-history-list.tsx            # History display
│   ├── assign-asset-dialog.tsx           # Assignment dialog
│   └── delete-asset-dialog.tsx           # Delete confirmation
└── _lib/
    ├── server/
    │   ├── assets-page.loader.ts         # Data loader for list page
    │   ├── asset-detail.loader.ts        # Data loader for detail page
    │   └── assets-server-actions.ts      # Server actions for mutations
    └── schemas/
        └── asset.schema.ts               # Zod validation schemas
```

### TypeScript Interfaces

```typescript
// Database types (generated by Supabase)
interface Asset {
  id: string;
  account_id: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  description: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_expiry_date: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface AssetHistory {
  id: string;
  asset_id: string;
  account_id: string;
  event_type: AssetEventType;
  event_data: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
}

type AssetCategory = 
  | 'laptop'
  | 'desktop'
  | 'mobile_phone'
  | 'tablet'
  | 'monitor'
  | 'printer'
  | 'other_equipment';

type AssetStatus = 
  | 'available'
  | 'assigned'
  | 'in_maintenance'
  | 'retired'
  | 'lost';

type AssetEventType =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'assigned'
  | 'unassigned'
  | 'deleted';

// View models with joined data
interface AssetWithUser extends Asset {
  assigned_user?: {
    id: string;
    display_name: string;
    email: string;
    picture_url: string | null;
  };
}

interface AssetHistoryWithUser extends AssetHistory {
  user?: {
    id: string;
    display_name: string;
    email: string;
  };
}

// Form data types
interface CreateAssetData {
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  description?: string;
  serial_number?: string;
  purchase_date?: string;
  warranty_expiry_date?: string;
}

interface UpdateAssetData extends CreateAssetData {
  id: string;
}

interface AssignAssetData {
  asset_id: string;
  user_id: string;
}
```

### Zod Schemas

```typescript
// apps/web/app/home/[account]/assets/_lib/schemas/asset.schema.ts
import { z } from 'zod';

export const AssetCategorySchema = z.enum([
  'laptop',
  'desktop',
  'mobile_phone',
  'tablet',
  'monitor',
  'printer',
  'other_equipment',
]);

export const AssetStatusSchema = z.enum([
  'available',
  'assigned',
  'in_maintenance',
  'retired',
  'lost',
]);

export const CreateAssetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  category: AssetCategorySchema,
  status: AssetStatusSchema.default('available'),
  description: z.string().max(5000).optional(),
  serial_number: z.string().max(255).optional(),
  purchase_date: z.string().date().optional(),
  warranty_expiry_date: z.string().date().optional(),
});

export const UpdateAssetSchema = CreateAssetSchema.extend({
  id: z.string().uuid(),
});

export const AssignAssetSchema = z.object({
  asset_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export const UnassignAssetSchema = z.object({
  asset_id: z.string().uuid(),
});

export const DeleteAssetSchema = z.object({
  id: z.string().uuid(),
});
```

## Data Models

### Asset Entity

The core entity representing an IT asset with the following properties:

- **Identity**: UUID primary key, unique serial number (optional)
- **Ownership**: Belongs to a team account via `account_id`
- **Classification**: Category and status enums
- **Details**: Name, description, purchase/warranty dates
- **Assignment**: Optional reference to assigned user with timestamp
- **Audit**: Created/updated timestamps and user tracking

### Asset History Entity

Immutable audit log entries tracking all asset changes:

- **Event Tracking**: Type of event (created, updated, assigned, etc.)
- **Event Data**: JSONB field storing relevant change details
- **Context**: Links to asset and account, includes user who performed action
- **Chronology**: Timestamp for ordering events

### Relationships

```
accounts (1) ──< (many) assets
assets (1) ──< (many) asset_history
auth.users (1) ──< (many) assets [assigned_to]
auth.users (1) ──< (many) assets [created_by]
auth.users (1) ──< (many) assets [updated_by]
```

## Error Handling

### Validation Errors

- **Client-side**: Form validation using Zod schemas with react-hook-form
- **Server-side**: Schema validation in server actions via `enhanceAction`
- **Display**: Field-level error messages in forms

### Database Errors

```typescript
// In server actions
try {
  const { data, error } = await client
    .from('assets')
    .insert(assetData)
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to create asset');
  }

  return { success: true, data };
} catch (error) {
  console.error('Unexpected error:', error);
  return { 
    success: false, 
    error: 'An unexpected error occurred' 
  };
}
```

### Authorization Errors

- RLS policies automatically prevent unauthorized access
- No explicit permission checks needed in application code
- Failed queries return empty results or throw errors caught by error boundaries

### User-Facing Error Messages

- **Validation**: "Name is required", "Invalid date format"
- **Not Found**: "Asset not found"
- **Permission**: "You don't have permission to perform this action"
- **Generic**: "Something went wrong. Please try again."

## Testing Strategy

### Database Testing

- **Migrations**: Test migration up/down with `pnpm supabase:web:reset`
- **RLS Policies**: Write Supabase tests to verify policy enforcement
- **Functions**: Test triggers and functions with sample data

### Integration Testing

- **Server Actions**: Test with valid/invalid data
- **Loaders**: Verify data fetching and filtering
- **RLS**: Ensure users can only access their team's assets

### E2E Testing (Playwright)

Focus on critical user flows:

1. **Create Asset Flow**
   - Navigate to assets page
   - Click "New Asset"
   - Fill form with valid data
   - Submit and verify asset appears in list

2. **Assign Asset Flow**
   - Select an available asset
   - Click "Assign"
   - Select a team member
   - Verify status changes to "Assigned"

3. **View History Flow**
   - Open asset detail page
   - Verify history entries are displayed
   - Check chronological order

4. **Filter Assets Flow**
   - Apply category filter
   - Apply status filter
   - Verify filtered results

### Component Testing

- **Forms**: Test validation, submission, error handling
- **Lists**: Test rendering, filtering, sorting
- **Dialogs**: Test open/close, confirmation flows

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns (account_id, category, status, assigned_to)
- Efficient RLS policies using indexed columns
- Limit history queries with pagination

### Data Fetching

- Use RSC for initial page loads (no client-side fetching)
- Implement pagination for large asset lists
- Use Supabase's built-in filtering and sorting

### Caching Strategy

- Next.js automatic caching for RSC
- Revalidate after mutations using `revalidatePath`
- No client-side caching needed

## Security Considerations

### Row Level Security

- All data access controlled by RLS policies
- Policies verify team membership for all operations
- No manual authorization checks in application code

### Input Validation

- Zod schemas validate all user input
- Server-side validation in all server actions
- Prevent SQL injection through parameterized queries

### Audit Trail

- All changes tracked in asset_history table
- User attribution for all operations
- Immutable history records

## Implementation Phases

### Phase 1: Database Foundation
- Create migrations for tables, enums, and functions
- Implement RLS policies
- Set up triggers for history tracking
- Generate TypeScript types

### Phase 2: Core CRUD Operations
- Implement asset list page with loader
- Create asset creation form and server action
- Build asset detail page
- Implement edit functionality
- Add delete operation with confirmation

### Phase 3: Assignment Features
- Build assignment dialog
- Implement assign/unassign server actions
- Add assigned user display in list
- Update status automatically on assignment

### Phase 4: History and Filtering
- Display asset history on detail page
- Implement category and status filters
- Add search functionality
- Optimize queries with proper indexes

### Phase 5: Polish and Testing
- Add loading states
- Implement error boundaries
- Write E2E tests for critical flows
- Performance optimization
- Accessibility improvements
