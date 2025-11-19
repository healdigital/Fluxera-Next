# Inviting Users

Learn how to invite team members to your Fluxera workspace, manage invitations, and handle user accounts.

## Overview

User invitations allow you to add team members to your Fluxera workspace. When you invite a user, they receive an email with instructions to create their account and join your organization.

## Prerequisites

To invite users, you must have:
- Owner or Admin role
- Active workspace
- Available user seats (if on a limited plan)

## Sending Invitations

### Step-by-Step Guide

1. Navigate to **Users** from the main menu
2. Click the **Invite User** button in the top-right corner
3. Fill in the invitation form:
   - **Email Address**: The user's email (required)
   - **Role**: Select the appropriate role (required)
   - **First Name**: User's first name (optional)
   - **Last Name**: User's last name (optional)
   - **Message**: Personal message to include in invitation (optional)
4. Click **Send Invitation**

![Invite User Form](../images/invite-user-form.png)

### What Happens Next

When you send an invitation:

1. ✅ Invitation record is created in the system
2. ✅ Email is sent to the user's email address
3. ✅ Invitation appears in the pending invitations list
4. ✅ User has 7 days to accept the invitation
5. ✅ You receive notification when user accepts

## Invitation Email

The invitation email includes:

- Your organization name
- Who sent the invitation
- The role they're being invited as
- Personal message (if included)
- "Accept Invitation" button
- Link to create account
- Expiration date (7 days)

## Managing Invitations

### Viewing Pending Invitations

To see all pending invitations:

1. Go to **Users**
2. Click the **Invitations** tab
3. View list of pending invitations with:
   - Email address
   - Role
   - Sent date
   - Expiration date
   - Status

### Resending Invitations

If a user didn't receive the invitation:

1. Go to **Users** > **Invitations**
2. Find the invitation
3. Click **Resend**
4. A new invitation email will be sent

### Canceling Invitations

To cancel a pending invitation:

1. Go to **Users** > **Invitations**
2. Find the invitation
3. Click **Cancel**
4. Confirm the cancellation
5. The invitation link will be invalidated

## User Roles

When inviting users, choose the appropriate role:

### Owner
- Full access to all features
- Can manage billing and subscriptions
- Can delete the workspace
- Cannot be removed by other users
- Only one owner per workspace

**Best for**: Workspace creator, primary administrator

### Admin
- Full access to all features except billing
- Can invite and manage users
- Can create, edit, and delete assets and licenses
- Can view all reports and analytics
- Can manage workspace settings

**Best for**: IT managers, department heads

### Member
- Can view and create assets and licenses
- Can be assigned assets and licenses
- Can view reports and dashboards
- Cannot manage users or settings
- Cannot delete data

**Best for**: Regular team members, employees

### Viewer
- Read-only access to assets and licenses
- Cannot create or modify data
- Can view reports and dashboards
- Can see their own assigned assets
- Ideal for stakeholders

**Best for**: Executives, external auditors, contractors

## Bulk Invitations

To invite multiple users at once:

1. Click **Invite Users** > **Bulk Invite**
2. Download the CSV template
3. Fill in user information:
   - Email (required)
   - Role (required)
   - First Name (optional)
   - Last Name (optional)
4. Upload the completed CSV file
5. Review the list
6. Click **Send All Invitations**

### Bulk Invitation Tips

💡 **Validate Emails**: Ensure all email addresses are correct before uploading

💡 **Consistent Roles**: Group users by role for easier management

💡 **Test First**: Try with a small batch before sending many invitations

💡 **Track Responses**: Monitor which invitations are accepted

## Invitation Expiration

### Expiration Policy

- Invitations expire after 7 days
- Expired invitations cannot be accepted
- Users must request a new invitation
- Expired invitations are automatically archived

### Handling Expired Invitations

If an invitation expires:

1. Go to **Users** > **Invitations**
2. Filter by "Expired"
3. Select the expired invitation
4. Click **Resend** to send a new invitation
5. The new invitation will have a fresh 7-day expiration

## User Activation

### When Users Accept

When a user accepts an invitation:

1. They create their account with password
2. They verify their email address
3. Their account is activated
4. They gain access to the workspace
5. You receive a notification
6. They appear in the active users list

### First Login

On first login, users should:

1. Complete their profile information
2. Set up two-factor authentication (recommended)
3. Review their assigned role and permissions
4. Explore the workspace
5. Contact admin with any questions

## Managing User Accounts

### Viewing User Details

To see user information:

1. Go to **Users**
2. Click on a user's name
3. View their profile with:
   - Contact information
   - Role and permissions
   - Assigned assets and licenses
   - Activity history
   - Account status

### Editing User Information

To update user details:

1. Open the user detail page
2. Click **Edit Profile**
3. Update information:
   - Name
   - Email
   - Phone number
   - Department
   - Job title
4. Click **Save Changes**

### Changing User Roles

To change a user's role:

1. Open the user detail page
2. Click **Change Role**
3. Select the new role
4. Add a reason for the change (optional)
5. Click **Confirm**

All role changes are logged in the activity history.

## Deactivating Users

### When to Deactivate

Deactivate users when:
- Employee leaves the organization
- Contractor engagement ends
- User no longer needs access
- Security concern requires immediate action

### Deactivation Process

To deactivate a user:

1. Open the user detail page
2. Click **Change Status**
3. Select "Inactive"
4. Add a reason (optional)
5. Click **Confirm**

### What Happens When Deactivated

When a user is deactivated:

1. ❌ User cannot log in
2. ❌ User loses access to all data
3. ✅ User's data remains in the system
4. ✅ Assignment history is preserved
5. ✅ Activity logs are retained
6. ✅ User can be reactivated later

### Reactivating Users

To reactivate a deactivated user:

1. Go to **Users**
2. Filter by "Inactive"
3. Open the user detail page
4. Click **Change Status**
5. Select "Active"
6. Click **Confirm**

The user will regain access immediately.

## User Permissions

### Understanding Permissions

Each role has specific permissions:

| Permission | Owner | Admin | Member | Viewer |
|------------|-------|-------|--------|--------|
| View assets | ✅ | ✅ | ✅ | ✅ |
| Create assets | ✅ | ✅ | ✅ | ❌ |
| Edit assets | ✅ | ✅ | ✅ | ❌ |
| Delete assets | ✅ | ✅ | ❌ | ❌ |
| View licenses | ✅ | ✅ | ✅ | ✅ |
| Create licenses | ✅ | ✅ | ✅ | ❌ |
| Edit licenses | ✅ | ✅ | ✅ | ❌ |
| Delete licenses | ✅ | ✅ | ❌ | ❌ |
| View users | ✅ | ✅ | ✅ | ✅ |
| Invite users | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ✅ | ❌ | ❌ |
| View reports | ✅ | ✅ | ✅ | ✅ |
| Export data | ✅ | ✅ | ✅ | ❌ |
| Manage settings | ✅ | ✅ | ❌ | ❌ |
| Manage billing | ✅ | ❌ | ❌ | ❌ |

### Custom Permissions

For more granular control:

1. Go to **Settings** > **Roles & Permissions**
2. Create custom roles
3. Define specific permissions
4. Assign custom roles to users

## Best Practices

✅ **Verify Email Addresses**: Double-check emails before sending invitations

✅ **Assign Appropriate Roles**: Give users the minimum permissions they need

✅ **Welcome New Users**: Send a welcome message with getting started tips

✅ **Monitor Invitations**: Track which invitations are accepted

✅ **Prompt Deactivation**: Deactivate accounts immediately when users leave

✅ **Regular Audits**: Review user list quarterly to remove inactive accounts

✅ **Document Changes**: Keep records of role changes and deactivations

## Security Considerations

🔒 **Email Verification**: All users must verify their email address

🔒 **Strong Passwords**: Enforce strong password requirements

🔒 **Two-Factor Authentication**: Encourage or require 2FA

🔒 **Session Management**: Automatic logout after inactivity

🔒 **Access Logs**: All user actions are logged for audit

🔒 **Immediate Deactivation**: Deactivate accounts immediately upon termination

## Troubleshooting

**Q: User didn't receive invitation email. What should I do?**
A: Check spam folder, verify email address is correct, and resend the invitation.

**Q: Can I change the invitation expiration period?**
A: No, invitations always expire after 7 days for security reasons.

**Q: What if I invite someone with the wrong role?**
A: Cancel the invitation and send a new one with the correct role, or change their role after they accept.

**Q: Can I invite users from outside my organization?**
A: Yes, you can invite anyone with an email address. Consider using the Viewer role for external users.

**Q: How many users can I invite?**
A: This depends on your subscription plan. Check Settings > Billing for your user limit.

**Q: Can users change their own role?**
A: No, only Owners and Admins can change user roles.

**Q: What happens to a user's data when they're deactivated?**
A: All data remains in the system. Assets and licenses are unassigned but history is preserved.

## Common Scenarios

### Onboarding New Employee

1. Send invitation with Member role
2. Include welcome message with resources
3. Assign necessary assets and licenses
4. Schedule onboarding session
5. Monitor first login and activity

### Adding External Auditor

1. Send invitation with Viewer role
2. Set expiration reminder for engagement end
3. Limit access to specific data if needed
4. Deactivate when audit is complete
5. Export activity log for records

### Promoting User to Admin

1. Review user's current permissions
2. Change role to Admin
3. Document reason for promotion
4. Notify user of new responsibilities
5. Provide admin training if needed

## Next Steps

- [Learn about roles and permissions](./roles-permissions.md)
- [Understand activity tracking](./activity-tracking.md)
- [Manage user assignments](../assets/assigning-assets.md)

---

[← Back to User Management](./index.md) | [Next: Roles & Permissions →](./roles-permissions.md)
