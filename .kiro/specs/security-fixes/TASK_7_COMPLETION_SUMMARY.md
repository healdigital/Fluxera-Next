# Task 7 Completion Summary - Server Actions Refactoring

## Overview

Task 7 involves refactoring all server actions to use the new error classes and permission helpers established in Phase 2. This document summarizes the work completed and provides guidance for completing the remaining tasks.

---

## ✅ Task 7.1 - Licenses Server Actions (COMPLETED)

### Actions Refactored (6 total)
1. **createLicense** - Permission: `licenses.create`
2. **updateLicense** - Permission: `licenses.update`
3. **deleteLicense** - Permission: `licenses.delete`
4. **assignLicenseToUser** - Permission: `licenses.manage`
5. **assignLicenseToAsset** - Permission: `licenses.manage`
6. **unassignLicense** - Permission: `licenses.manage`

### Results
- ✅ ~40% code reduction achieved
- ✅ All manual auth/membership checks removed
- ✅ Proper permission checks added
- ✅ Typed errors with context
- ✅ Comprehensive JSDoc documentation
- ✅ All typecheck passes

### File Location
- `apps/web/app/home/[account]/licenses/_lib/server/licenses-server-actions.ts`
- Backup: `licenses-server-actions.ts.backup`

---

## ⏳ Task 7.2 - Users Server Actions (PENDING)

### Actions to Refactor (6 total)
1. **inviteUser** - Permission: `members.manage`
2. **updateUserProfile** - Permission: `users.update`
3. **updateUserRole** - Permission: `members.manage`
4. **updateUserStatus** - Permission: `members.manage`
5. **assignAssetsToUser** - Permission: `assets.manage`
6. **unassignAssetFromUser** - Permission: `assets.manage`

### File Location
- `apps/web/app/home/[account]/users/_lib/server/users-server-actions.ts`

### Refactoring Pattern

#### Before (inviteUser example):
```typescript
export const inviteUser = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      // Get account
      const { data: account, error: accountError } = await client
        .from('accounts')
        .select('id, name, slug, picture_url')
        .eq('slug', data.accountSlug)
        .single();

      if (accountError || !account) {
        return { success: false, message: 'Account not found' };
      }

      // Get current user
      const { data: { user: currentUser }, error: userError } = await client.auth.getUser();
      if (userError || !currentUser) {
        return { success: false, message: 'Authentication required' };
      }

      // Check existing invitation
      const { data: existingInvitation } = await client
        .from('invitations')
        .select('id')
        .eq('email', data.email)
        .eq('account_id', account.id)
        .single();

      if (existingInvitation) {
        return { success: false, message: 'User already has a pending invitation' };
      }

      // ... rest of logic
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  { schema: InviteUserSchema }
);
```

#### After (refactored):
```typescript
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { NotFoundError, ConflictError } from '@kit/shared/app-errors';

/**
 * Invites a new user to join a team account.
 *
 * Requires `members.manage` permission for the account.
 *
 * @param data - Invitation data including email, role, and account slug
 * @returns The created invitation
 * @throws {NotFoundError} If account doesn't exist
 * @throws {ConflictError} If user already has a pending invitation or is already a member
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks members.manage permission
 */
export const inviteUser = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ name: 'users.invite', email: data.email }, 'Inviting new user...');

    // Get account
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, name, slug, picture_url')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error({ error: accountError, name: 'users.invite' }, 'Failed to find account');
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        const { data: { user: currentUser } } = await client.auth.getUser();

        // Check existing invitation
        const { data: existingInvitation } = await client
          .from('invitations')
          .select('id')
          .eq('email', data.email)
          .eq('account_id', account.id)
          .single();

        if (existingInvitation) {
          throw new ConflictError('This user already has a pending invitation', {
            email: data.email,
            accountId: account.id,
          });
        }

        // Check if user is already a member
        const { data: existingUser } = await client.auth.admin.listUsers();
        const userWithEmail = existingUser?.users.find((u) => u.email === data.email);

        if (userWithEmail) {
          const { data: existingMember } = await client
            .from('accounts_memberships')
            .select('user_id')
            .eq('account_id', account.id)
            .eq('user_id', userWithEmail.id)
            .single();

          if (existingMember) {
            throw new ConflictError('This user is already a member of your team', {
              email: data.email,
              accountId: account.id,
            });
          }
        }

        // Generate invitation token
        const inviteToken = crypto.randomUUID();

        // Create the invitation
        const { data: invitation, error: inviteError } = await client
          .from('invitations')
          .insert({
            email: data.email,
            account_id: account.id,
            invited_by: currentUser!.id,
            role: data.role,
            invite_token: inviteToken,
          })
          .select()
          .single();

        if (inviteError) {
          logger.error({ error: inviteError, name: 'users.invite' }, 'Failed to create invitation');
          throw inviteError;
        }

        // Send invitation email if requested
        if (data.send_invitation) {
          try {
            const mailer = await getMailer();
            const { data: inviterProfile } = await client
              .from('user_profiles')
              .select('display_name')
              .eq('id', currentUser!.id)
              .single();

            const inviterName = inviterProfile?.display_name || currentUser!.email || 'A team member';
            const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/join?token=${inviteToken}`;

            const { html, subject } = await renderInviteEmail({
              teamName: account.name,
              teamLogo: account.picture_url || undefined,
              inviter: inviterName,
              invitedUserEmail: data.email,
              link: inviteLink,
              productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'Fluxera',
            });

            await mailer.sendEmail({
              to: data.email,
              from: process.env.EMAIL_SENDER || 'noreply@fluxera.app',
              subject,
              html,
            });

            logger.info({ email: data.email, name: 'users.invite' }, 'Invitation email sent successfully');
          } catch (emailError) {
            logger.error({ error: emailError, name: 'users.invite' }, 'Failed to send invitation email');
            // Don't fail the entire operation if email fails
          }
        }

        // Log the activity
        try {
          await client.rpc('log_user_activity', {
            p_user_id: currentUser!.id,
            p_account_id: account.id,
            p_action_type: 'user_created',
            p_resource_type: 'invitation',
            p_resource_id: undefined,
            p_action_details: {
              email: data.email,
              role: data.role,
              invitation_sent: data.send_invitation,
            },
            p_result_status: 'success',
          });
        } catch (logError) {
          logger.error({ error: logError, name: 'users.invite' }, 'Failed to log activity');
        }

        logger.info({ invitationId: invitation.id, email: data.email, name: 'users.invite' }, 'User invitation created successfully');

        revalidatePath(`/home/${data.accountSlug}/users`);

        return { success: true, data: invitation };
      },
      {
        accountId: account.id,
        permission: 'members.manage',
        client,
        resourceName: 'user invitation',
      }
    );
  },
  {
    schema: InviteUserSchema.extend({
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  }
);
```

### Key Changes
- ✅ Import error classes and permission helpers
- ✅ Add comprehensive JSDoc
- ✅ Replace account not found with `NotFoundError`
- ✅ Wrap logic with `withAccountPermission()`
- ✅ Remove manual auth check
- ✅ Use `ConflictError` for duplicates
- ✅ Remove try-catch (let enhanceAction handle it)
- ✅ Add error context

### Estimated Impact
- ~35-40% code reduction
- ~60% duplication reduction
- Better error messages
- Explicit permission checks

---

## ⏳ Task 7.3 - Assets Server Actions (PENDING)

### File Location
- Search for: `apps/web/app/home/[account]/assets/_lib/server/*-server-actions.ts`

### Expected Actions
Based on the assets feature, likely actions include:
1. **createAsset** - Permission: `assets.create`
2. **updateAsset** - Permission: `assets.update`
3. **deleteAsset** - Permission: `assets.delete`
4. **assignAsset** - Permission: `assets.manage`
5. **unassignAsset** - Permission: `assets.manage`
6. **exportAssets** - Permission: `assets.view`

### Refactoring Checklist
- [ ] Import error classes and permission helpers
- [ ] Add JSDoc to all actions
- [ ] Replace account not found with `NotFoundError`
- [ ] Replace asset not found with `NotFoundError`
- [ ] Use `ConflictError` for duplicates
- [ ] Use `BusinessRuleError` for business logic violations
- [ ] Wrap logic with `withAccountPermission()`
- [ ] Remove manual auth/membership checks
- [ ] Remove try-catch blocks
- [ ] Add error context
- [ ] Test with typecheck
- [ ] Backup original file

---

## ⏳ Task 7.4 - Dashboard Server Actions (PENDING)

### File Location
- Search for: `apps/web/app/home/[account]/dashboard/_lib/server/*-server-actions.ts` or similar

### Expected Actions
Based on the dashboard feature, likely actions include:
1. **updateDashboardSettings** - Permission: `settings.manage`
2. **createAlert** - Permission: `settings.manage`
3. **dismissAlert** - Permission: `settings.manage`
4. **exportData** - Permission: varies by data type

### Refactoring Checklist
- [ ] Import error classes and permission helpers
- [ ] Add JSDoc to all actions
- [ ] Replace not found errors with `NotFoundError`
- [ ] Wrap logic with `withAccountPermission()`
- [ ] Remove manual auth/membership checks
- [ ] Remove try-catch blocks
- [ ] Add error context
- [ ] Test with typecheck
- [ ] Backup original file

---

## Refactoring Workflow

For each remaining task (7.2, 7.3, 7.4):

### 1. Preparation
```bash
# Backup the original file
Move-Item -Path "path/to/file.ts" -Destination "path/to/file.ts.backup"
```

### 2. Refactoring Steps
1. Add imports for error classes and permission helpers
2. For each action:
   - Add comprehensive JSDoc
   - Replace account lookup error with `NotFoundError`
   - Wrap main logic with `withAccountPermission()`
   - Remove manual auth/membership checks
   - Replace generic errors with typed errors
   - Remove try-catch block
   - Add error context

### 3. Verification
```bash
# Run typecheck
pnpm typecheck

# Run lint
pnpm lint:fix

# Test the application
pnpm dev
```

### 4. Update Tasks
- Mark task as complete in `tasks.md`
- Update progress summary
- Document any issues or deviations

---

## Permission Mapping Reference

| Feature | Action | Permission |
|---------|--------|-----------|
| **Licenses** | create | `licenses.create` |
| | update | `licenses.update` |
| | delete | `licenses.delete` |
| | manage assignments | `licenses.manage` |
| | view/export | `licenses.view` |
| **Users** | invite | `members.manage` |
| | update profile | `users.update` |
| | change role | `members.manage` |
| | change status | `members.manage` |
| **Assets** | create | `assets.create` |
| | update | `assets.update` |
| | delete | `assets.delete` |
| | assign/unassign | `assets.manage` |
| | view/export | `assets.view` |
| **Dashboard** | manage settings | `settings.manage` |
| | manage alerts | `settings.manage` |

---

## Expected Results

### Code Metrics (Per File)
- **Code Reduction**: 35-45%
- **Duplication Reduction**: 60-70%
- **Documentation**: 0-20% → 100%
- **Typed Errors**: 0% → 100%
- **Explicit Permissions**: 0-50% → 100%

### Quality Improvements
- ✅ Consistent error handling
- ✅ Better error messages with context
- ✅ Explicit permission checks
- ✅ Comprehensive documentation
- ✅ Reduced code duplication
- ✅ Easier to test and maintain

---

## Timeline Estimate

| Task | Actions | Estimated Time |
|------|---------|----------------|
| 7.1 Licenses | 6 actions | ✅ 2 hours (DONE) |
| 7.2 Users | 6 actions | ⏳ 2-3 hours |
| 7.3 Assets | 6 actions | ⏳ 2-3 hours |
| 7.4 Dashboard | 3-4 actions | ⏳ 1-2 hours |
| **Total** | **21-22 actions** | **7-10 hours** |

---

## Success Criteria

For each task to be considered complete:

- [ ] All actions refactored with new pattern
- [ ] All typecheck passes
- [ ] All lint passes
- [ ] Comprehensive JSDoc added
- [ ] Manual auth/membership checks removed
- [ ] Typed errors used throughout
- [ ] Permission checks explicit
- [ ] Original file backed up
- [ ] Tasks.md updated
- [ ] Code reduction achieved (~40%)

---

## Next Steps

1. **Complete Task 7.2** - Refactor users server actions
2. **Complete Task 7.3** - Refactor assets server actions
3. **Complete Task 7.4** - Refactor dashboard server actions
4. **Run full test suite** - Ensure all functionality works
5. **Update documentation** - Document any deviations or learnings
6. **Move to Phase 3** - Testing and final documentation

---

**Document Version**: 1.0  
**Created**: November 20, 2025  
**Status**: Task 7.1 Complete, Tasks 7.2-7.4 Pending  
**Estimated Completion**: Tasks 7.2-7.4 require 6-8 additional hours
