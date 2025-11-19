# License Assignments

Learn how to assign software licenses to users and assets, track license utilization, and manage assignments effectively.

## Overview

License assignment helps you track which users or assets are using specific software licenses. This ensures compliance, prevents over-licensing, and helps optimize your software spending.

## Types of Assignments

Fluxera supports two types of license assignments:

### User Assignments
Assign licenses directly to users for:
- User-specific software (email, productivity tools)
- Cloud-based applications
- Personal development tools
- Individual subscriptions

### Asset Assignments
Assign licenses to specific devices for:
- Operating systems
- Device-specific software
- Machine-bound licenses
- Hardware-tied applications

## Assigning to Users

### Method 1: From License Detail Page

1. Navigate to **Licenses** from the main menu
2. Click on the license you want to assign
3. Click the **Assign to User** button
4. Select the user from the dropdown menu
5. Add optional notes about the assignment
6. Click **Confirm Assignment**

![Assign License to User Dialog](../images/assign-license-user-dialog.png)

### Method 2: From User Profile

1. Navigate to **Users** from the main menu
2. Click on the user you want to assign a license to
3. Go to the **Licenses** tab
4. Click **Assign License**
5. Select the license from the available licenses list
6. Add optional notes
7. Click **Confirm Assignment**

## Assigning to Assets

### Method 1: From License Detail Page

1. Navigate to **Licenses** from the main menu
2. Click on the license you want to assign
3. Click the **Assign to Asset** button
4. Select the asset from the dropdown menu
5. Add optional notes about the assignment
6. Click **Confirm Assignment**

![Assign License to Asset Dialog](../images/assign-license-asset-dialog.png)

### Method 2: From Asset Detail Page

1. Navigate to **Assets** from the main menu
2. Click on the asset you want to assign a license to
3. Go to the **Licenses** tab
4. Click **Assign License**
5. Select the license from the available licenses list
6. Add optional notes
7. Click **Confirm Assignment**

## What Happens When You Assign a License

When a license is assigned:

1. ✅ Assignment record is created with timestamp
2. ✅ User/asset receives notification (if enabled)
3. ✅ Assignment appears in license history
4. ✅ License appears in user/asset profile
5. ✅ Utilization metrics are updated
6. ✅ Compliance status is recalculated

## Assignment Information

Each assignment includes:

- **Assigned To**: The user or asset receiving the license
- **Assigned By**: The user who made the assignment
- **Assignment Date**: When the assignment was made
- **Notes**: Any additional information about the assignment
- **Status**: Current assignment status (Active or Revoked)

## Viewing Assignments

### View License Assignments

To see who/what a license is assigned to:

1. Open the license detail page
2. Navigate to the **Assignments** tab
3. View the list of all users and assets using this license

### View User's Licenses

To see all licenses assigned to a user:

1. Open the user detail page
2. Navigate to the **Licenses** tab
3. View the list of all assigned licenses

### View Asset's Licenses

To see all licenses assigned to an asset:

1. Open the asset detail page
2. Navigate to the **Licenses** tab
3. View the list of all assigned licenses

## Unassigning Licenses

When a user no longer needs a license or an asset is retired:

1. Open the license detail page
2. Navigate to the **Assignments** tab
3. Find the assignment you want to remove
4. Click the **Unassign** button
5. Add optional notes about the removal
6. Click **Confirm Unassignment**

The license becomes available for assignment to another user or asset.

## Assignment Limits

### Seat-Based Licenses

For licenses with a specific number of seats:

- The system tracks how many seats are assigned
- You cannot assign more than the available seats
- Unassign existing users to free up seats
- Consider upgrading if you need more seats

### Unlimited Licenses

For licenses without seat limits:
- Assign to as many users/assets as needed
- Track assignments for compliance purposes
- Monitor actual usage vs. license terms

## Assignment History

Every assignment and unassignment is recorded:

1. Open the license detail page
2. Navigate to the **History** tab
3. View the complete assignment timeline

History entries include:
- Who assigned/unassigned the license
- When the action occurred
- To whom/what it was assigned
- Any notes or comments

## Best Practices

✅ **Verify Availability**: Check seat availability before assigning

✅ **Document Assignments**: Always add notes explaining the assignment

✅ **Prompt Removal**: Unassign licenses promptly when no longer needed

✅ **Regular Audits**: Periodically verify assignments match actual usage

✅ **Track Utilization**: Monitor utilization to optimize license counts

✅ **Compliance First**: Ensure assignments comply with license terms

## Assignment Notifications

Users can receive notifications when:
- A license is assigned to them
- A license is about to expire
- A license is revoked or unassigned

To configure notifications:
1. Go to **Settings** > **Notifications**
2. Enable "License Assignment Notifications"
3. Choose notification preferences (email, in-app, or both)

## Bulk Assignment

To assign a license to multiple users at once:

1. Open the license detail page
2. Click **Bulk Assign**
3. Select multiple users from the list
4. Add optional notes
5. Click **Confirm Bulk Assignment**

Note: The license must have enough available seats for bulk assignment to work.

## License Utilization

### Viewing Utilization

To see how well licenses are being used:

1. Open the license detail page
2. View the utilization percentage
3. See the breakdown:
   - Total seats
   - Assigned seats
   - Available seats
   - Utilization rate

### Utilization Reports

Generate utilization reports:

1. Go to **Licenses** > **Reports**
2. Select "Utilization Report"
3. Choose date range and filters
4. Click **Generate Report**
5. Export as CSV or PDF

Reports include:
- Over-utilized licenses (need more seats)
- Under-utilized licenses (can reduce seats)
- Unused licenses (consider canceling)
- Utilization trends over time

## Compliance Management

### Preventing Over-Assignment

The system automatically prevents over-assignment:
- Cannot assign more than available seats
- Warning displayed when approaching limit
- Suggestions to upgrade or unassign

### Compliance Checks

Regular compliance checks help ensure:
- All users have required licenses
- No unauthorized software usage
- License terms are being followed
- Audit trail is complete

### Audit Preparation

To prepare for software audits:

1. Generate assignment reports
2. Export license inventory
3. Document all assignments
4. Verify all users are properly licensed
5. Review and update any discrepancies

## Troubleshooting

**Q: Why can't I assign a license?**
A: Check if the license has available seats. If all seats are assigned, unassign one or upgrade the license.

**Q: Can I assign one license to multiple users?**
A: Yes, if the license has multiple seats. Each assignment uses one seat.

**Q: What if I assign a license to the wrong user?**
A: Unassign the license from the wrong user and assign it to the correct user. Both actions are logged.

**Q: Can a user have multiple licenses?**
A: Yes, users can have as many licenses as needed for their role.

**Q: How do I track shared licenses?**
A: Assign to the primary user and document other users in the notes field, or use asset assignment if it's device-specific.

**Q: What happens to assignments when a license expires?**
A: Assignments remain in the system but are marked as expired. Renew the license to reactivate.

## Common Scenarios

### New Employee Onboarding

1. Create user account
2. Identify required software licenses
3. Assign all necessary licenses
4. Document assignments with onboarding date
5. Send welcome email with license information

### Employee Offboarding

1. Review all assigned licenses
2. Unassign each license
3. Document offboarding in notes
4. Reassign licenses to other users if needed
5. Update license utilization metrics

### Role Change

1. Review current license assignments
2. Unassign licenses no longer needed
3. Assign new licenses required for new role
4. Document role change in notes
5. Notify user of license changes

### Asset Replacement

1. Unassign licenses from old asset
2. Update old asset status
3. Assign licenses to new asset
4. Document replacement in notes
5. Verify all software is properly licensed

## Optimization Strategies

### Reduce Costs

- Identify and remove unused assignments
- Consolidate similar licenses
- Negotiate better terms based on actual usage
- Consider downgrading over-provisioned licenses

### Improve Utilization

- Regularly review assignment reports
- Reassign unused licenses
- Implement approval workflow for new assignments
- Track usage patterns to inform purchasing

### Ensure Compliance

- Maintain complete assignment records
- Regular audit of all assignments
- Document all changes in notes
- Keep license agreements accessible

## Next Steps

- [Learn about renewal alerts](./renewals.md)
- [Understand license compliance](./index.md#compliance-tips)
- [Generate license reports](./managing-licenses.md#license-compliance)

---

[← Back: Managing Licenses](./managing-licenses.md) | [Back to License Management](./index.md) | [Next: Renewal Alerts →](./renewals.md)
