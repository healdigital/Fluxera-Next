# Assigning Assets

Learn how to assign assets to team members and track asset assignments throughout their lifecycle.

## Overview

Asset assignment is a core feature that helps you track who is using which equipment. When you assign an asset to a user, the system automatically updates the asset status and creates a history record.

## Prerequisites

Before assigning an asset:
- The asset must exist in your inventory
- The asset status should be "Available"
- The user must have an active account

## Assigning an Asset

### Method 1: From Asset Detail Page

1. Navigate to **Assets** from the main menu
2. Click on the asset you want to assign
3. Click the **Assign Asset** button
4. Select the user from the dropdown menu
5. Add optional notes about the assignment
6. Click **Confirm Assignment**

![Assign Asset Dialog](../images/assign-asset-dialog.png)

### Method 2: From User Profile

1. Navigate to **Users** from the main menu
2. Click on the user you want to assign an asset to
3. Go to the **Assets** tab
4. Click **Assign Asset**
5. Select the asset from the available assets list
6. Add optional notes
7. Click **Confirm Assignment**

## What Happens When You Assign an Asset

When an asset is assigned:

1. ✅ Asset status changes to "Assigned"
2. ✅ Assignment record is created with timestamp
3. ✅ User receives notification (if enabled)
4. ✅ Assignment appears in asset history
5. ✅ Asset appears in user's asset list

## Assignment Information

Each assignment includes:

- **Assigned To**: The user receiving the asset
- **Assigned By**: The user who made the assignment
- **Assignment Date**: When the assignment was made
- **Notes**: Any additional information about the assignment
- **Status**: Current assignment status (Active or Returned)

## Viewing Assignments

### View Asset Assignments

To see who an asset is assigned to:

1. Open the asset detail page
2. Look for the "Assigned To" field in the details section
3. Click on the user name to view their profile

### View User Assignments

To see all assets assigned to a user:

1. Open the user detail page
2. Navigate to the **Assets** tab
3. View the list of all assigned assets

## Unassigning Assets

When a user returns an asset or no longer needs it:

1. Open the asset detail page
2. Click the **Unassign** button
3. Add optional notes about the return
4. Click **Confirm Unassignment**

The asset status will automatically change back to "Available" and can be assigned to another user.

## Assignment History

Every assignment and unassignment is recorded in the asset history:

1. Open the asset detail page
2. Navigate to the **History** tab
3. View the complete assignment timeline

History entries include:
- Who assigned/unassigned the asset
- When the action occurred
- Any notes or comments
- Previous and new status

## Best Practices

✅ **Document assignments**: Always add notes explaining why an asset is being assigned

✅ **Verify availability**: Check that the asset is available before attempting assignment

✅ **Prompt returns**: Unassign assets promptly when users return them

✅ **Regular audits**: Periodically verify that assignment records match physical reality

✅ **Track condition**: Note the asset condition at assignment and return

## Assignment Notifications

Users can receive notifications when:
- An asset is assigned to them
- An asset assignment is about to expire (if temporary)
- They need to return an asset

To configure notifications:
1. Go to **Settings** > **Notifications**
2. Enable "Asset Assignment Notifications"
3. Choose notification preferences (email, in-app, or both)

## Bulk Assignment

To assign multiple assets at once:

1. Go to the **Assets** page
2. Select multiple assets using the checkboxes
3. Click **Bulk Actions** > **Assign Assets**
4. Select the user
5. Confirm the bulk assignment

Note: All selected assets must be available for bulk assignment to work.

## Temporary Assignments

For temporary assignments (e.g., loaner equipment):

1. Assign the asset normally
2. Add a note indicating the expected return date
3. Set a reminder for the return date
4. Follow up with the user when the date approaches

## Assignment Reports

Generate reports on asset assignments:

1. Go to **Assets** > **Reports**
2. Select "Assignment Report"
3. Choose date range and filters
4. Click **Generate Report**
5. Export as CSV or PDF

Reports include:
- Currently assigned assets
- Assignment duration
- Assignment history
- Unassigned assets

## Troubleshooting

**Q: Why can't I assign an asset?**
A: The asset must have "Available" status. If it's already assigned, unassign it first.

**Q: Can I assign an asset to multiple users?**
A: No, each asset can only be assigned to one user at a time.

**Q: What if I assign an asset to the wrong user?**
A: Unassign the asset and then assign it to the correct user. Both actions will be logged in the history.

**Q: Can users see all assets or only their assigned assets?**
A: This depends on their role. Members can see all assets but viewers may only see their assigned assets.

**Q: How do I track assets that are shared between users?**
A: For shared assets, assign to the primary user and document other users in the notes field.

## Common Scenarios

### New Employee Onboarding

1. Create user account
2. Assign laptop, monitor, and peripherals
3. Document all assignments with onboarding date
4. Send welcome email with asset information

### Employee Offboarding

1. Collect all assigned assets
2. Unassign each asset
3. Inspect assets for damage
4. Update asset status (Available or In Maintenance)
5. Document condition in notes

### Equipment Upgrade

1. Unassign old equipment
2. Update old equipment status to "Retired"
3. Assign new equipment
4. Document upgrade in notes

## Next Steps

- [Learn about asset maintenance](./maintenance.md)
- [Generate asset reports](./reporting.md)
- [Understand asset history tracking](./creating-assets.md#viewing-asset-history)

---

[← Back: Creating Assets](./creating-assets.md) | [Back to Asset Management](./index.md) | [Next: Maintenance →](./maintenance.md)
