# Asset Maintenance

Learn how to schedule, track, and manage maintenance activities for your assets to ensure optimal performance and longevity.

## Overview

Regular maintenance is essential for keeping your assets in good working condition. Fluxera helps you schedule maintenance, track service history, and ensure nothing falls through the cracks.

## Types of Maintenance

### Preventive Maintenance
Scheduled maintenance performed regularly to prevent issues:
- Software updates
- Hardware cleaning
- Battery replacement
- Performance optimization

### Corrective Maintenance
Repairs performed when issues arise:
- Hardware repairs
- Software troubleshooting
- Component replacement
- Damage repair

### Predictive Maintenance
Maintenance based on asset condition and usage patterns:
- Performance monitoring
- Wear and tear assessment
- Proactive replacement

## Scheduling Maintenance

### Creating a Maintenance Schedule

1. Open the asset detail page
2. Navigate to the **Maintenance** tab
3. Click **Schedule Maintenance**
4. Fill in the maintenance details:
   - **Type**: Preventive, Corrective, or Predictive
   - **Description**: What needs to be done
   - **Scheduled Date**: When the maintenance should occur
   - **Estimated Duration**: How long it will take
   - **Assigned To**: Who will perform the maintenance
   - **Priority**: Low, Medium, High, or Critical
   - **Notes**: Additional information

5. Click **Schedule** to save

![Schedule Maintenance Form](../images/schedule-maintenance.png)

### Recurring Maintenance

For regular maintenance tasks:

1. When scheduling maintenance, check **Recurring**
2. Select the frequency:
   - Weekly
   - Monthly
   - Quarterly
   - Annually
   - Custom interval

3. Set the end date or number of occurrences
4. Save the schedule

The system will automatically create future maintenance tasks based on your schedule.

## Managing Maintenance Tasks

### Viewing Scheduled Maintenance

To see all scheduled maintenance:

1. Go to **Assets** > **Maintenance**
2. View the maintenance calendar or list
3. Filter by:
   - Date range
   - Asset category
   - Priority
   - Status
   - Assigned technician

### Maintenance Statuses

Maintenance tasks can have the following statuses:

- **Scheduled**: Planned but not yet started
- **In Progress**: Currently being performed
- **Completed**: Finished successfully
- **Cancelled**: No longer needed
- **Overdue**: Past the scheduled date

### Updating Maintenance Status

When performing maintenance:

1. Open the maintenance task
2. Click **Start Maintenance**
3. Asset status automatically changes to "In Maintenance"
4. Perform the maintenance work
5. Click **Complete Maintenance**
6. Add completion notes and any findings
7. Asset status returns to previous state

## Maintenance History

### Viewing Maintenance History

To see all past maintenance for an asset:

1. Open the asset detail page
2. Navigate to the **Maintenance** tab
3. View the complete maintenance history

Each entry includes:
- Date performed
- Type of maintenance
- Description
- Technician
- Duration
- Cost (if applicable)
- Notes and findings

### Exporting Maintenance Records

To export maintenance history:

1. Open the asset maintenance tab
2. Click **Export History**
3. Choose format (CSV or PDF)
4. Select date range
5. Download the report

## Maintenance Notifications

### Setting Up Alerts

Configure notifications for upcoming maintenance:

1. Go to **Settings** > **Notifications**
2. Enable "Maintenance Reminders"
3. Set reminder timing:
   - 1 day before
   - 3 days before
   - 1 week before
   - Custom

4. Choose notification method (email, in-app, or both)

### Who Gets Notified

Notifications are sent to:
- Assigned technician
- Asset owner (if assigned)
- Maintenance managers
- System administrators

## Maintenance Costs

### Tracking Maintenance Expenses

Record costs associated with maintenance:

1. Open the completed maintenance task
2. Click **Add Cost**
3. Enter:
   - Labor cost
   - Parts cost
   - Service fees
   - Total cost

4. Attach receipts or invoices (optional)
5. Save the cost information

### Maintenance Cost Reports

Generate cost reports:

1. Go to **Assets** > **Reports** > **Maintenance Costs**
2. Select date range
3. Filter by asset, category, or type
4. View total costs and breakdown
5. Export for accounting purposes

## Best Practices

✅ **Schedule proactively**: Don't wait for assets to break - schedule preventive maintenance

✅ **Document thoroughly**: Record all maintenance activities with detailed notes

✅ **Track costs**: Keep accurate records of maintenance expenses for budgeting

✅ **Set reminders**: Use notifications to ensure maintenance isn't forgotten

✅ **Review history**: Analyze maintenance patterns to identify problematic assets

✅ **Plan downtime**: Schedule maintenance during off-hours when possible

## Maintenance Workflows

### Routine Maintenance Workflow

1. System sends reminder notification
2. Technician reviews maintenance task
3. Technician starts maintenance (asset status → "In Maintenance")
4. Maintenance is performed
5. Technician completes task and adds notes
6. Asset status returns to previous state
7. Maintenance is logged in history

### Emergency Repair Workflow

1. Issue is reported
2. Create corrective maintenance task with high priority
3. Assign to available technician
4. Unassign asset from user (if necessary)
5. Perform repair
6. Test asset functionality
7. Complete maintenance and document findings
8. Reassign asset to user

## Maintenance Dashboard

View maintenance overview:

1. Go to **Assets** > **Maintenance Dashboard**
2. See key metrics:
   - Upcoming maintenance (next 7 days)
   - Overdue maintenance
   - Assets currently in maintenance
   - Maintenance costs (current month)
   - Most maintained assets

3. Click any metric to drill down into details

## Vendor Management

### Recording Vendor Information

For maintenance performed by external vendors:

1. Create maintenance task
2. Select **External Vendor**
3. Enter vendor details:
   - Company name
   - Contact person
   - Phone/email
   - Service agreement number

4. Attach service agreement or contract
5. Track vendor performance in notes

### Warranty Maintenance

For assets under warranty:

1. Check warranty status on asset detail page
2. Create maintenance task
3. Mark as **Warranty Service**
4. Record warranty claim number
5. Document any warranty-related information

## Troubleshooting

**Q: Can I schedule maintenance for multiple assets at once?**
A: Yes, use bulk actions to schedule the same maintenance for multiple assets.

**Q: What happens if maintenance is overdue?**
A: The task is marked as overdue and notifications are sent to relevant users.

**Q: Can I cancel scheduled maintenance?**
A: Yes, open the maintenance task and click "Cancel". Add a reason in the notes.

**Q: How do I handle emergency repairs?**
A: Create a new maintenance task with "Critical" priority and "Corrective" type.

**Q: Can users request maintenance for their assigned assets?**
A: Yes, users can submit maintenance requests which appear in the maintenance queue.

## Common Scenarios

### Laptop Battery Replacement

1. Schedule preventive maintenance
2. Order replacement battery
3. Unassign laptop from user
4. Perform battery replacement
5. Test laptop functionality
6. Complete maintenance with notes
7. Reassign to user

### Software Update

1. Schedule maintenance during off-hours
2. Notify user of scheduled downtime
3. Start maintenance
4. Perform software updates
5. Test functionality
6. Complete maintenance
7. Notify user of completion

### Equipment Cleaning

1. Schedule quarterly cleaning
2. Set as recurring maintenance
3. Perform cleaning
4. Document condition
5. Complete maintenance
6. Schedule next occurrence

## Next Steps

- [Learn about asset reporting](./reporting.md)
- [Understand asset lifecycle](./creating-assets.md)
- [Manage asset assignments](./assigning-assets.md)

---

[← Back: Assigning Assets](./assigning-assets.md) | [Back to Asset Management](./index.md) | [Next: Reporting →](./reporting.md)
