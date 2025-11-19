# User Management System - Design Document

## Overview

The User Management System provides comprehensive user administration capabilities within the Fluxera multi-tenant SaaS application. It leverages the existing Makerkit architecture with Next.js 16 App Router, Supabase for data persistence, and Row Level Security (RLS) for authorization. The system enables team account administrators to manage users, assign roles and permissions, track user activity, and assign assets to users.

The design follows established patterns with server-side rendering for data fetching, server actions for mutations, and strict separation between client and server code. All data access is secured through Supabase RLS policies, ensuring administrators can only manage users within their team accounts.

## Architecture

### Technology Stack

- **Frontend**: Next.js 16 with React Server Components (RSC)
- **Backend**: Supabase (PostgreSQL with RLS)
- **Validation**: Zod schemas
- **Forms**: react-hook-form with @kit/ui/form
- **UI Components**: Shadcn UI with Tailwind CSS 4
- **State Management**: Server-side with minimal client state

### Multi-Tenant Model

User management is scoped to team accounts using the existing infrastructure:
- Users belong to team accounts via `accounts_memberships` table
- Each user can be a member of multiple team accounts with different roles
- RLS policies automatically filter users based on the administrator's team membership
- Personal accounts are managed separately and not included in team user management

### Data Flow

```
User Request → Page Component (RSC) → Loader Function → Supabase Query → RLS Filter → Data
User Action → Form Submit → Server Action → Validation → Service Layer → Supabase Mutation → RLS Check
```

## Components and Interfaces

### Database Schema

#### User Profiles Extension

```sql
-- Extend auth.users with additional profile information
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(255),
  phone_number varchar(50),
  job_title varchar(255),
  department varchar(255),
  location varchar(255),
  bio text,
  avatar_url varchar(1000),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

comment on table public.user_profiles is 'Extended user profile information beyond auth.users';

-- Indexes
create index idx_user_profiles_display_name on public.user_profiles(display_name);
create index idx_user_profiles_department on public.user_profiles(department);

-- Timestamps trigger
create trigger set_user_profiles_timestamps
  before insert or update on public.user_profiles
  for each row execute function public.trigger_set_timestamps();

-- User tracking trigger
create trigger set_user_profiles_user_tracking
  before insert or update on public.user_profiles
  for each row execute function public.trigger_set_user_tracking();
```

#### User Status Management

```sql
-- User status tracking for team accounts
create table public.user_account_status (
  user_id uuid references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  status varchar(50) not null default 'active',
  status_reason text,
  status_changed_at timestamp with time zone default now(),
  status_changed_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (user_id, account_id)
);

comment on table public.user_account_status is 'Track user status within specific team accounts';

-- Indexes
create index idx_user_account_status_account_id on public.user_account_status(account_id);
create index idx_user_account_status_status on public.user_account_status(status);

-- Enum for user status
create type public.user_status as enum(
  'active',
  'inactive',
  'suspended',
  'pending_invitation'
);
```

#### User Activity Log

```sql
create table public.user_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete cascade not null,
  action_type varchar(100) not null,
  resource_type varchar(100),
  resource_id uuid,
  action_details jsonb default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  result_status varchar(50) not null,
  created_at timestamp with time zone default now()
);

comment on table public.user_activity_log is 'Audit log of user actions within team accounts';

-- Indexes for performance
create index idx_user_activity_log_user_id on public.user_activity_log(user_id);
create index idx_user_activity_log_account_id on public.user_activity_log(account_id);
create index idx_user_activity_log_created_at on public.user_activity_log(created_at desc);
create index idx_user_activity_log_action_type on public.user_activity_log(action_type);

-- Enum for action types
create type public.user_action_type as enum(
  'user_created',
  'user_updated',
  'user_deleted',
  'role_changed',
  'status_changed',
  'asset_assigned',
  'asset_unassigned',
  'login',
  'logout',
  'password_changed',
  'profile_updated'
);

-- Enum for result status
create type public.action_result_status as enum(
  'success',
  'failure',
  'partial'
);
```

### RLS Policies

```sql
-- Enable RLS
alter table public.user_profiles enable row level security;
alter table public.user_account_status enable row level security;
alter table public.user_activity_log enable row level security;

-- User Profiles: Users can view their own profile
create policy "Users can view own profile"
  on public.user_profiles for select
  to authenticated
  using (id = auth.uid());

-- User Profiles: Team members can view profiles of users in their team
create policy "Team members can view team user profiles"
  on public.user_profiles for select
  to authenticated
  using (
    id in (
      select m1.user_id
      from public.accounts_memberships m1
      where m1.account_id in (
        select m2.account_id
        from public.accounts_memberships m2
        where m2.user_id = auth.uid()
      )
    )
  );

-- User Profiles: Users can update their own profile
create policy "Users can update own profile"
  on public.user_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- User Profiles: Admins with members.manage permission can update team member profiles
create policy "Admins can update team member profiles"
  on public.user_profiles for update
  to authenticated
  using (
    exists (
      select 1
      from public.accounts_memberships m
      where m.user_id = auth.uid()
        and public.has_permission(auth.uid(), m.account_id, 'members.manage'::public.app_permissions)
        and m.account_id in (
          select account_id
          from public.accounts_memberships
          where user_id = user_profiles.id
        )
    )
  );

-- User Account Status: Team members can view status of users in their team
create policy "Team members can view user status"
  on public.user_account_status for select
  to authenticated
  using (
    account_id in (
      select account_id
      from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- User Account Status: Admins can manage user status
create policy "Admins can manage user status"
  on public.user_account_status for all
  to authenticated
  using (
    public.has_permission(auth.uid(), account_id, 'members.manage'::public.app_permissions)
  )
  with check (
    public.has_permission(auth.uid(), account_id, 'members.manage'::public.app_permissions)
  );

-- User Activity Log: Users can view their own activity
create policy "Users can view own activity"
  on public.user_activity_log for select
  to authenticated
  using (user_id = auth.uid());

-- User Activity Log: Admins can view team activity
create policy "Admins can view team activity"
  on public.user_activity_log for select
  to authenticated
  using (
    public.has_permission(auth.uid(), account_id, 'members.manage'::public.app_permissions)
  );

-- User Activity Log: System can insert activity logs
create policy "System can insert activity logs"
  on public.user_activity_log for insert
  to authenticated
  with check (true);
```

### Database Functions

```sql
-- Function to log user activity
create or replace function public.log_user_activity(
  p_user_id uuid,
  p_account_id uuid,
  p_action_type varchar,
  p_resource_type varchar default null,
  p_resource_id uuid default null,
  p_action_details jsonb default '{}'::jsonb,
  p_result_status varchar default 'success'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_activity_log (
    user_id,
    account_id,
    action_type,
    resource_type,
    resource_id,
    action_details,
    ip_address,
    result_status
  ) values (
    p_user_id,
    p_account_id,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_action_details,
    inet_client_addr(),
    p_result_status
  );
end;
$$;

grant execute on function public.log_user_activity to authenticated;

-- Function to get team members with profiles
create or replace function public.get_team_members(
  p_account_slug text,
  p_search text default null,
  p_role text default null,
  p_status text default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  user_id uuid,
  email text,
  display_name text,
  avatar_url text,
  role_name text,
  status text,
  last_sign_in_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
begin
  -- Get account ID from slug
  select id into v_account_id
  from public.accounts
  where slug = p_account_slug;

  -- Verify caller has access to this account
  if not public.has_role_on_account(v_account_id) then
    raise exception 'Access denied';
  end if;

  return query
  select
    u.id as user_id,
    u.email::text,
    coalesce(up.display_name, u.email)::text as display_name,
    up.avatar_url::text,
    m.account_role::text as role_name,
    coalesce(us.status, 'active')::text as status,
    u.last_sign_in_at,
    m.created_at
  from auth.users u
  inner join public.accounts_memberships m on m.user_id = u.id
  left join public.user_profiles up on up.id = u.id
  left join public.user_account_status us on us.user_id = u.id and us.account_id = m.account_id
  where m.account_id = v_account_id
    and (p_search is null or up.display_name ilike '%' || p_search || '%' or u.email ilike '%' || p_search || '%')
    and (p_role is null or m.account_role = p_role)
    and (p_status is null or coalesce(us.status, 'active') = p_status)
  order by m.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

grant execute on function public.get_team_members to authenticated;

-- Function to update user status
create or replace function public.update_user_status(
  p_user_id uuid,
  p_account_id uuid,
  p_status varchar,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Verify caller has permission
  if not public.has_permission(auth.uid(), p_account_id, 'members.manage'::public.app_permissions) then
    raise exception 'Access denied';
  end if;

  -- Prevent self-deactivation
  if p_user_id = auth.uid() and p_status = 'inactive' then
    raise exception 'You cannot deactivate your own account';
  end if;

  -- Insert or update status
  insert into public.user_account_status (
    user_id,
    account_id,
    status,
    status_reason,
    status_changed_by
  ) values (
    p_user_id,
    p_account_id,
    p_status,
    p_reason,
    auth.uid()
  )
  on conflict (user_id, account_id)
  do update set
    status = excluded.status,
    status_reason = excluded.status_reason,
    status_changed_at = now(),
    status_changed_by = auth.uid();

  -- Log the activity
  perform public.log_user_activity(
    p_user_id,
    p_account_id,
    'status_changed',
    'user',
    p_user_id,
    jsonb_build_object('new_status', p_status, 'reason', p_reason)
  );
end;
$$;

grant execute on function public.update_user_status to authenticated;
```

### File Structure

```
apps/web/app/home/[account]/users/
├── page.tsx                              # Users list page (RSC)
├── new/
│   └── page.tsx                          # Invite user page
├── [id]/
│   ├── page.tsx                          # User detail page (RSC)
│   ├── edit/
│   │   └── page.tsx                      # Edit user profile page
│   └── activity/
│       └── page.tsx                      # User activity log page
├── _components/
│   ├── users-list.tsx                    # Client component for list display
│   ├── user-card.tsx                     # Individual user card
│   ├── user-filters.tsx                  # Filter controls (client)
│   ├── invite-user-form.tsx              # Invite form (client)
│   ├── edit-user-profile-form.tsx        # Profile edit form (client)
│   ├── user-detail-view.tsx              # Detail view component
│   ├── user-activity-list.tsx            # Activity log display
│   ├── assign-role-dialog.tsx            # Role assignment dialog
│   ├── change-status-dialog.tsx          # Status change dialog
│   ├── assign-assets-dialog.tsx          # Asset assignment dialog
│   └── user-permissions-view.tsx         # Permissions display
└── _lib/
    ├── server/
    │   ├── users-page.loader.ts          # Data loader for list page
    │   ├── user-detail.loader.ts         # Data loader for detail page
    │   ├── user-activity.loader.ts       # Data loader for activity page
    │   └── users-server-actions.ts       # Server actions for mutations
    └── schemas/
        └── user.schema.ts                # Zod validation schemas
```

### TypeScript Interfaces

```typescript
// Database types
interface UserProfile {
  id: string;
  display_name: string | null;
  phone_number: string | null;
  job_title: string | null;
  department: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface UserAccountStatus {
  user_id: string;
  account_id: string;
  status: UserStatus;
  status_reason: string | null;
  status_changed_at: string;
  status_changed_by: string | null;
  created_at: string;
  updated_at: string;
}

interface UserActivityLog {
  id: string;
  user_id: string;
  account_id: string;
  action_type: string;
  resource_type: string | null;
  resource_id: string | null;
  action_details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  result_status: string;
  created_at: string;
}

type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_invitation';

// View models with joined data
interface TeamMember {
  user_id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role_name: string;
  status: UserStatus;
  last_sign_in_at: string | null;
  created_at: string;
}

interface TeamMemberDetail extends TeamMember {
  profile: UserProfile;
  permissions: string[];
  assigned_assets: Array<{
    id: string;
    name: string;
    category: string;
    assigned_at: string;
  }>;
}

interface UserActivityWithDetails extends UserActivityLog {
  user: {
    display_name: string;
    email: string;
    avatar_url: string | null;
  };
}

// Form data types
interface InviteUserData {
  email: string;
  role: string;
  send_invitation: boolean;
}

interface UpdateUserProfileData {
  display_name?: string;
  phone_number?: string;
  job_title?: string;
  department?: string;
  location?: string;
  bio?: string;
}

interface UpdateUserRoleData {
  user_id: string;
  account_id: string;
  role: string;
}

interface UpdateUserStatusData {
  user_id: string;
  account_id: string;
  status: UserStatus;
  reason?: string;
}
```

### Zod Schemas

```typescript
// apps/web/app/home/[account]/users/_lib/schemas/user.schema.ts
import { z } from 'zod';

export const UserStatusSchema = z.enum([
  'active',
  'inactive',
  'suspended',
  'pending_invitation',
]);

export const InviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  send_invitation: z.boolean().default(true),
});

export const UpdateUserProfileSchema = z.object({
  display_name: z.string().max(255).optional(),
  phone_number: z.string().max(50).optional(),
  job_title: z.string().max(255).optional(),
  department: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  bio: z.string().max(5000).optional(),
});

export const UpdateUserRoleSchema = z.object({
  user_id: z.string().uuid(),
  account_id: z.string().uuid(),
  role: z.string().min(1, 'Role is required'),
});

export const UpdateUserStatusSchema = z.object({
  user_id: z.string().uuid(),
  account_id: z.string().uuid(),
  status: UserStatusSchema,
  reason: z.string().max(1000).optional(),
});

export const AssignAssetsSchema = z.object({
  user_id: z.string().uuid(),
  asset_ids: z.array(z.string().uuid()).min(1, 'At least one asset must be selected'),
});

export const UserActivityFilterSchema = z.object({
  user_id: z.string().uuid().optional(),
  action_type: z.string().optional(),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
});
```

## Data Models

### User Profile Entity

Extended user information beyond the core auth.users table:

- **Identity**: UUID matching auth.users.id
- **Personal Info**: Display name, phone, job title, department, location
- **Profile**: Bio, avatar URL
- **Metadata**: JSONB field for extensible custom data
- **Audit**: Created/updated timestamps and user tracking

### User Account Status Entity

Tracks user status within specific team accounts:

- **Relationship**: Links user to account
- **Status**: Current status (active, inactive, suspended, pending)
- **Context**: Reason for status change, who changed it, when
- **Audit**: Timestamps for tracking

### User Activity Log Entity

Immutable audit log of user actions:

- **Event Tracking**: Action type, resource type, resource ID
- **Event Data**: JSONB field storing action details
- **Context**: IP address, user agent, result status
- **Chronology**: Timestamp for ordering events

### Relationships

```
auth.users (1) ──< (many) user_profiles
auth.users (1) ──< (many) accounts_memberships
auth.users (1) ──< (many) user_account_status
auth.users (1) ──< (many) user_activity_log
accounts (1) ──< (many) user_account_status
accounts (1) ──< (many) user_activity_log
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
  const { data, error } = await client.rpc('get_team_members', {
    p_account_slug: accountSlug,
    p_search: searchTerm,
  });

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch team members');
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
- Database functions verify permissions before executing operations
- Failed operations throw exceptions with descriptive messages

### User-Facing Error Messages

- **Validation**: "Invalid email address", "Role is required"
- **Not Found**: "User not found"
- **Permission**: "You don't have permission to manage users"
- **Self-Action**: "You cannot deactivate your own account"
- **Generic**: "Something went wrong. Please try again."

## Testing Strategy

### Database Testing

- **Migrations**: Test migration up/down with `pnpm supabase:web:reset`
- **RLS Policies**: Write Supabase tests to verify policy enforcement
- **Functions**: Test database functions with various permission scenarios

### Integration Testing

- **Server Actions**: Test with valid/invalid data and different permission levels
- **Loaders**: Verify data fetching and filtering
- **RLS**: Ensure users can only access their team's data

### E2E Testing (Playwright)

Focus on critical user flows:

1. **Invite User Flow**
   - Navigate to users page
   - Click "Invite User"
   - Fill form with valid email and role
   - Submit and verify invitation sent

2. **Update User Role Flow**
   - Select a team member
   - Click "Change Role"
   - Select new role
   - Verify role updated in list

3. **Change User Status Flow**
   - Select a team member
   - Click "Change Status"
   - Select inactive status with reason
   - Verify status changes

4. **View Activity Log Flow**
   - Open user detail page
   - Navigate to activity tab
   - Verify activity entries displayed
   - Test filtering by date range

### Component Testing

- **Forms**: Test validation, submission, error handling
- **Lists**: Test rendering, filtering, sorting, search
- **Dialogs**: Test open/close, confirmation flows

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns (user_id, account_id, status, action_type)
- Efficient RLS policies using indexed columns
- Database functions for complex queries to reduce round trips
- Pagination for large user lists and activity logs

### Data Fetching

- Use RSC for initial page loads (no client-side fetching)
- Implement pagination for user lists and activity logs
- Use database functions for optimized queries with joins

### Caching Strategy

- Next.js automatic caching for RSC
- Revalidate after mutations using `revalidatePath`
- Cache user profile data at component level when appropriate

## Security Considerations

### Row Level Security

- All data access controlled by RLS policies
- Policies verify team membership and permissions
- Database functions enforce additional authorization checks

### Input Validation

- Zod schemas validate all user input
- Server-side validation in all server actions
- Prevent SQL injection through parameterized queries

### Audit Trail

- All user management actions tracked in activity log
- User attribution for all operations
- Immutable activity records

### Sensitive Operations

- Prevent self-deactivation
- Require confirmation for status changes
- Log all permission and role changes
- Protect primary account owner from removal

## Integration with Asset Management

### Asset Assignment

- Users can view assets assigned to them
- Administrators can assign/unassign assets from user detail page
- Asset assignments logged in user activity
- User status affects asset assignment eligibility

### Cross-Feature Queries

```typescript
// Get user with assigned assets
interface UserWithAssets {
  user: TeamMemberDetail;
  assets: Array<{
    id: string;
    name: string;
    category: string;
    status: string;
    assigned_at: string;
  }>;
}
```

## Implementation Phases

### Phase 1: Database Foundation
- Create migrations for user_profiles, user_account_status, user_activity_log
- Implement RLS policies
- Create database functions for user management
- Generate TypeScript types

### Phase 2: User Listing and Search
- Implement users list page with loader
- Build user card components
- Add search and filter functionality
- Implement pagination

### Phase 3: User Invitation
- Create invitation form and server action
- Integrate with existing invitation system
- Send invitation emails
- Handle invitation acceptance

### Phase 4: Profile Management
- Build user detail page
- Implement profile edit form
- Add profile update server action
- Display user information

### Phase 5: Role and Status Management
- Implement role change dialog and action
- Build status change dialog and action
- Add permission display
- Integrate with existing role system

### Phase 6: Activity Logging
- Implement activity log display
- Add filtering and search
- Create activity logging middleware
- Display activity on user detail page

### Phase 7: Asset Integration
- Display assigned assets on user profile
- Implement asset assignment from user page
- Add asset assignment to activity log
- Cross-link with asset management feature

### Phase 8: Polish and Testing
- Add loading states
- Implement error boundaries
- Write E2E tests for critical flows
- Performance optimization
- Accessibility improvements
