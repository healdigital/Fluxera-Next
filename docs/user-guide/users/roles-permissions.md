# Roles & Permissions

Understand the different user roles in Fluxera and how to manage permissions effectively to maintain security and control.

## Overview

Fluxera uses a role-based access control (RBAC) system to manage what users can see and do. Each role has a specific set of permissions designed for different levels of responsibility within your organization.

## User Roles

### Owner

The Owner role has complete control over the workspace.

**Key Characteristics:**
- Full access to all features and data
- Can manage billing and subscriptions
- Can delete the entire workspace
- Cannot be removed by other users
- Only one Owner per workspace

**Permissions:**
- ✅ All Admin permissions
- ✅ Manage billing and payments
- ✅ Cancel subscription
- ✅ Delete workspace
- ✅ Transfer ownership
- ✅ View billing history

**Best For:**
- Workspace creator
- Primary business owner
- Person responsible for billing

**Limitations:**
- Cannot be removed by Admins
- Cannot have role changed by others
- Must transfer ownership to change role

### Admin

Admins have full operational control but cannot manage billing.

**Key Characteristics:**
- Full access to all operational features
- Can manage users and settings
- Cannot access billing information
- Can be managed by Owner
- Multiple Admins allowed

**Permissions:**
- ✅ View, create, edit, delete assets
- ✅ View, create, edit, delete licenses
- ✅ Invite and manage users
- ✅ Change user roles (except Owner)
- ✅ Manage workspace settings
- ✅ View all reports and analytics
- ✅ Export all data
- ✅ Configure integrations
- ❌ Manage billing
- ❌ Delete workspace

**Best For:**
- IT managers
- Department heads
- Operations managers
- System administrators

**Limitations:**
- Cannot access billing settings
- Cannot delete workspace
- Cannot change Owner's role

### Member

Members can actively use the system but have limited administrative access.

**Key Characteristics:**
- Can create and manage assets and licenses
- Can be assigned assets and licenses
- Cannot manage users or settings
- Standard operational access
- Most common role for employees

**Permissions:**
- ✅ View all assets and licenses
- ✅ Create new assets and licenses
- ✅ Edit assets and licenses they created
- ✅ Assign assets and licenses
- ✅ View reports and dashboards
- ✅ Export their own data
- ✅ Update their own profile
- ❌ Delete assets or licenses
- ❌ Manage users
- ❌ Change settings
- ❌ View billing

**Best For:**
- Regular employees
- Team members
- Department staff
- Asset coordinators

**Limitations:**
- Cannot delete data
- Cannot manage other users
- Cannot change workspace settings
- Limited export capabilities

### Viewer

Viewers have read-only access to the system.

**Key Characteristics:**
- Can view data but not modify it
- Cannot create or delete anything
- Can see their own assigned assets
- Ideal for stakeholders and auditors
- Lowest level of access

**Permissions:**
- ✅ View assets and licenses
- ✅ View their assigned assets
- ✅ View reports and dashboards
- ✅ View their own profile
- ❌ Create anything
- ❌ Edit anything
- ❌ Delete anything
- ❌ Export data
- ❌ Manage users
- ❌ Change settings

**Best For:**
- Executives and stakeholders
- External auditors
- Contractors (limited engagement)
- Temporary access needs
- Compliance reviewers

**Limitations:**
- Cannot modify any data
- Cannot export data
- Cannot create reports
- Cannot manage anything

## Permission Matrix

Complete breakdown of permissions by role:

| Feature | Owner | Admin | Member | Viewer |
|---------|-------|-------|--------|--------|
| **Assets** |
| View assets | ✅ | ✅ | ✅ | ✅ |
| Create assets | ✅ | ✅ | ✅ | ❌ |
| Edit any asset | ✅ | ✅ | ✅ | ❌ |
| Edit own assets | ✅ | ✅ | ✅ | ❌ |
| Delete assets | ✅ | ✅ | ❌ | ❌ |
| Assign assets | ✅ | ✅ | ✅ | ❌ |
| View asset history | ✅ | ✅ | ✅ | ✅ |
| **Licenses** |
| View licenses | ✅ | ✅ | ✅ | ✅ |
| Create licenses | ✅ | ✅ | ✅ | ❌ |
| Edit any license | ✅ | ✅ | ✅ | ❌ |
| Edit own licenses | ✅ | ✅ | ✅ | ❌ |
| Delete licenses | ✅ | ✅ | ❌ | ❌ |
| Assign licenses | ✅ | ✅ | ✅ | ❌ |
| View license keys | ✅ | ✅ | ✅ | ❌ |
| **Users** |
| View users | ✅ | ✅ | ✅ | ✅ |
| Invite users | ✅ | ✅ | ❌ | ❌ |
| Edit user profiles | ✅ | ✅ | Own only | Own only |
| Change user roles | ✅ | ✅ | ❌ | ❌ |
| Deactivate users | ✅ | ✅ | ❌ | ❌ |
| View user activity | ✅ | ✅ | Own only | Own only |
| **Reports** |
| View dashboards | ✅ | ✅ | ✅ | ✅ |
| View reports | ✅ | ✅ | ✅ | ✅ |
| Create reports | ✅ | ✅ | ✅ | ❌ |
| Export data | ✅ | ✅ | Limited | ❌ |
| Schedule reports | ✅ | ✅ | ❌ | ❌ |
| **Settings** |
| View settings | ✅ | ✅ | ❌ | ❌ |
| Edit settings | ✅ | ✅ | ❌ | ❌ |
| Manage integrations | ✅ | ✅ | ❌ | ❌ |
| View billing | ✅ | ❌ | ❌ | ❌ |
| Manage billing | ✅ | ❌ | ❌ | ❌ |
| Delete workspace | ✅ | ❌ | ❌ | ❌ |

## Changing User Roles

### How to Change Roles

To change a user's role:

1. Navigate to **Users**
2. Click on the user's name
3. Click **Change Role**
4. Select the new role from the dropdown
5. Add a reason for the change (optional but recommended)
6. Click **Confirm**

![Change Role Dialog](../images/change-role-dialog.png)

### What Happens When Roles Change

When you change a user's role:

1. ✅ Permissions update immediately
2. ✅ User is notified of the change
3. ✅ Change is logged in activity history
4. ✅ User's access adjusts automatically
5. ✅ Active sessions remain valid

### Role Change Restrictions

- Only Owners and Admins can change roles
- Admins cannot change the Owner's role
- Admins cannot promote users to Owner
- Users cannot change their own role
- Role changes require confirmation

## Permission Inheritance

### How Permissions Work

Permissions follow a hierarchical model:

```
Owner (All Permissions)
  ↓
Admin (All except billing)
  ↓
Member (Operational access)
  ↓
Viewer (Read-only access)
```

Higher roles include all permissions of lower roles, plus additional capabilities.

### Special Permissions

Some permissions have special rules:

**Own Data Access:**
- All users can view and edit their own profile
- Members can edit assets/licenses they created
- All users can view their own activity history

**Assigned Assets:**
- All users can view assets assigned to them
- Users cannot unassign their own assets
- Assignment history is always visible

**License Keys:**
- Viewers cannot see license keys
- Members and above can view license keys
- All views are logged for security

## Best Practices

### Assigning Roles

✅ **Principle of Least Privilege**: Give users the minimum permissions they need

✅ **Regular Reviews**: Audit user roles quarterly

✅ **Document Decisions**: Record why users have specific roles

✅ **Temporary Elevation**: Use time-limited role changes for special projects

✅ **Separation of Duties**: Don't give everyone Admin access

### Role Management

✅ **Clear Criteria**: Define criteria for each role in your organization

✅ **Onboarding Process**: Assign appropriate roles during onboarding

✅ **Role Changes**: Document all role changes with reasons

✅ **Offboarding**: Deactivate rather than delete users

✅ **Emergency Access**: Have multiple Admins for redundancy

### Security

🔒 **Limit Admins**: Only promote trusted users to Admin

🔒 **Monitor Changes**: Review role change logs regularly

🔒 **Protect Owner**: Owner should enable 2FA

🔒 **Audit Access**: Regularly review who has access to what

🔒 **Immediate Action**: Change roles immediately when job roles change

## Custom Roles (Advanced)

### Creating Custom Roles

For organizations with specific needs:

1. Go to **Settings** > **Roles & Permissions**
2. Click **Create Custom Role**
3. Name the role
4. Select specific permissions
5. Save the custom role
6. Assign to users as needed

### Custom Role Examples

**Asset Manager:**
- Full asset permissions
- Limited license permissions
- No user management
- View-only reports

**License Administrator:**
- Full license permissions
- Limited asset permissions
- No user management
- Export capabilities

**Report Viewer:**
- View all data
- Generate and export reports
- No create/edit permissions
- No user management

## Role-Based Workflows

### Approval Workflows

Configure approval requirements by role:

1. Go to **Settings** > **Workflows**
2. Define approval rules:
   - Members must get Admin approval for deletions
   - High-value purchases require Owner approval
   - Role changes require Owner approval
3. Save workflow rules

### Notification Rules

Set up role-based notifications:

1. Go to **Settings** > **Notifications**
2. Configure who receives what:
   - Admins: All system alerts
   - Members: Assignment notifications
   - Viewers: Read-only updates
3. Save notification rules

## Troubleshooting

**Q: Can I have multiple Owners?**
A: No, only one Owner per workspace. Use Admin role for additional administrators.

**Q: How do I transfer ownership?**
A: Go to Settings > Workspace > Transfer Ownership. The new Owner must accept.

**Q: Can Admins see billing information?**
A: No, only the Owner can access billing settings and payment information.

**Q: What happens if the Owner leaves?**
A: The Owner should transfer ownership before leaving. Contact support if needed.

**Q: Can I temporarily elevate a user's permissions?**
A: Yes, change their role temporarily and change it back when done. Document the change.

**Q: Why can't a Member delete assets?**
A: This prevents accidental data loss. Only Admins and Owners can delete data.

**Q: Can Viewers export data?**
A: No, Viewers have read-only access and cannot export data.

## Common Scenarios

### New Employee

**Scenario**: Hiring a new team member

**Solution**:
1. Invite with Member role
2. Assign necessary assets and licenses
3. Provide training on their permissions
4. Review after 90 days

### Promotion to Manager

**Scenario**: Employee promoted to management

**Solution**:
1. Change role from Member to Admin
2. Document reason for promotion
3. Provide Admin training
4. Update responsibilities

### Contractor Engagement

**Scenario**: Hiring external contractor

**Solution**:
1. Invite with Viewer role
2. Limit to specific data if possible
3. Set calendar reminder for engagement end
4. Deactivate when contract ends

### Temporary Project Lead

**Scenario**: Member needs Admin access for a project

**Solution**:
1. Change role to Admin temporarily
2. Document project and duration
3. Set reminder to revert role
4. Change back to Member when project ends

## Next Steps

- [Learn about activity tracking](./activity-tracking.md)
- [Understand user invitations](./inviting-users.md)
- [Manage user assignments](../assets/assigning-assets.md)

---

[← Back: Inviting Users](./inviting-users.md) | [Back to User Management](./index.md) | [Next: Activity Tracking →](./activity-tracking.md)
