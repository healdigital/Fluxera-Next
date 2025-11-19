# Managing Licenses

Learn how to create, track, and manage software licenses in Fluxera to ensure compliance and optimize your software spending.

## Overview

License management in Fluxera helps you maintain a complete inventory of all software licenses, track expiration dates, and ensure your organization stays compliant. The system provides alerts for expiring licenses and helps you optimize license utilization.

## Step-by-Step Guide

### 1. Navigate to Licenses

From the main navigation menu, click on **Licenses** to open the license management page.

### 2. Click Create License

Look for the **Create License** button in the top-right corner of the page and click it.

![Create License Button](../images/create-license-button.png)

### 3. Fill in License Information

Complete the license creation form with the following information:

#### Required Fields

- **Name**: Descriptive name for the license (e.g., "Microsoft Office 365 Business")
- **Vendor**: Software vendor or publisher (e.g., "Microsoft", "Adobe", "Atlassian")
- **License Key**: The actual license key or activation code
- **License Type**: Select from the dropdown
  - Perpetual: One-time purchase
  - Subscription: Recurring payment
  - Volume: Multiple licenses
  - Trial: Evaluation license
  - Open Source: Free software
- **Purchase Date**: When the license was acquired
- **Expiration Date**: When the license expires (for subscriptions and trials)

#### Optional Fields

- **Seats**: Number of users/devices covered by this license
- **Cost**: Purchase price or subscription cost
- **Renewal Cost**: Cost to renew (if different from initial cost)
- **Purchase Order**: PO number for tracking
- **Support Expiration**: When support coverage ends
- **Notes**: Additional information or special terms

### 4. Save the License

Click the **Create License** button at the bottom of the form to save your new license.

You'll see a success message confirming the license was created, and you'll be redirected to the license list where your new license will appear.

## License Form Tips

💡 **Secure Storage**: License keys are encrypted and stored securely

💡 **Expiration Dates**: Always set expiration dates for subscriptions to receive renewal alerts

💡 **Seat Tracking**: Record the number of seats to monitor license utilization

💡 **Cost Tracking**: Document costs to track software spending over time

💡 **Vendor Consistency**: Use consistent vendor names for better reporting

## Viewing License Details

After creating a license, you can view its full details:

1. Click on the license name in the license list
2. View all license information, assignments, and history
3. Use the tabs to navigate between different sections:
   - **Details**: Basic license information
   - **Assignments**: Users and assets using this license
   - **History**: Complete audit trail of changes

## Editing Licenses

To modify an existing license:

1. Navigate to the license detail page
2. Click the **Edit** button
3. Update the information as needed
4. Click **Save Changes**

All changes are automatically logged in the license history.

## License Status Indicators

Licenses are automatically categorized by their status:

### Active
- ✅ Valid license within the license period
- Green indicator
- No action required

### Expiring Soon
- ⚠️ Less than 30 days until expiration
- Yellow indicator
- Review and plan for renewal

### Expired
- ❌ Past the expiration date
- Red indicator
- Immediate action required

### Pending
- ⏳ Awaiting activation or approval
- Gray indicator
- Complete activation process

## Filtering and Searching

### Search Licenses

Use the search bar at the top of the license list to find licenses by:
- Name
- Vendor
- License key (partial match)

### Filter Licenses

Use the filter options to narrow down the license list:

- **License Type**: Show only specific types (perpetual, subscription, etc.)
- **Status**: Filter by expiration status (active, expiring soon, expired)
- **Vendor**: View licenses from specific vendors
- **Date Range**: Filter by purchase or expiration date

### Sort Licenses

Click on column headers to sort licenses by:
- Name (A-Z or Z-A)
- Expiration Date (soonest or latest)
- Vendor
- Cost

## Expiration Alerts

Fluxera automatically monitors license expiration dates and sends alerts:

### Alert Timeline

- **30 days before**: First warning notification
- **14 days before**: Second reminder
- **7 days before**: Urgent reminder
- **On expiration**: Final alert

### Configuring Alerts

To customize expiration alerts:

1. Go to **Settings** > **Notifications**
2. Enable "License Expiration Alerts"
3. Choose notification preferences:
   - Email notifications
   - In-app notifications
   - Both
4. Set custom alert thresholds if needed

### Viewing Alerts

To see all active license alerts:

1. Navigate to the **Dashboard**
2. Look for the "License Alerts" widget
3. Click on any alert to view details and take action

Or:

1. Go to **Licenses**
2. Look for the alert banner at the top
3. Click "View All Alerts" to see the complete list

## Bulk Operations

### Importing Licenses

To import multiple licenses at once:

1. Click the **Import** button
2. Download the CSV template
3. Fill in license information in the template
4. Upload the completed CSV file
5. Review and confirm the import

### Exporting Licenses

To export your license inventory:

1. Apply any desired filters
2. Click the **Export** button
3. Choose your format (CSV or Excel)
4. The file will download automatically

## License Compliance

### Monitoring Utilization

Track how many licenses are being used:

1. Open the license detail page
2. View the "Assignments" tab
3. See the utilization percentage (assigned seats / total seats)

### Compliance Reports

Generate compliance reports:

1. Go to **Licenses** > **Reports**
2. Select "Compliance Report"
3. Choose date range and filters
4. Click **Generate Report**
5. Export as CSV or PDF

Reports include:
- Total licenses by type
- Expiring licenses
- Over/under-utilized licenses
- Cost analysis

## Renewal Management

### Planning Renewals

To plan for upcoming renewals:

1. Filter licenses by "Expiring Soon"
2. Review each license for continued need
3. Contact vendors for renewal quotes
4. Update renewal costs in the system
5. Set reminders for renewal dates

### Renewal Workflow

1. Receive expiration alert
2. Evaluate continued need for the license
3. Get renewal quote from vendor
4. Approve renewal budget
5. Process renewal payment
6. Update license with new expiration date
7. Document renewal in notes

## Cost Tracking

### Viewing Costs

To see software spending:

1. Go to **Licenses** > **Reports**
2. Select "Cost Analysis"
3. View total spending by:
   - Vendor
   - License type
   - Time period
   - Department

### Budget Planning

Use cost data to plan budgets:

1. Export cost report
2. Identify recurring costs (subscriptions)
3. Project annual spending
4. Identify optimization opportunities
5. Plan for upcoming renewals

## Common Questions

**Q: Can I store license keys securely?**
A: Yes, all license keys are encrypted at rest and in transit for maximum security.

**Q: What happens when a license expires?**
A: The system marks it as expired and sends notifications. The license remains in your inventory for historical tracking.

**Q: Can I track trial licenses?**
A: Yes, select "Trial" as the license type and set the trial expiration date.

**Q: How do I handle volume licenses?**
A: Create one license entry and set the "Seats" field to the number of licenses included.

**Q: Can I delete a license?**
A: Yes, but only if it has no assignments. Unassign all users/assets first, then delete.

**Q: How do I track license renewals?**
A: Update the expiration date when you renew. The old expiration date is preserved in the history.

## Best Practices

✅ **Complete Information**: Fill in all fields for comprehensive tracking

✅ **Regular Reviews**: Audit licenses quarterly to identify unused subscriptions

✅ **Proactive Renewals**: Start renewal process 60 days before expiration

✅ **Document Everything**: Use notes field to record important details

✅ **Track Costs**: Always document costs for budget planning

✅ **Monitor Utilization**: Ensure you're not paying for unused licenses

✅ **Vendor Relationships**: Maintain good relationships with vendors for better renewal terms

## Optimization Tips

📊 **Identify Unused Licenses**: Regularly review assignments to find unused licenses

📊 **Consolidate Vendors**: Consider consolidating to fewer vendors for better pricing

📊 **Right-Size Subscriptions**: Adjust seat counts based on actual usage

📊 **Negotiate Renewals**: Use usage data to negotiate better renewal terms

📊 **Consider Alternatives**: Evaluate if open-source alternatives meet your needs

## Next Steps

- [Learn how to assign licenses](./assignments.md)
- [Set up renewal alerts](./renewals.md)
- [Understand license compliance](./index.md#compliance-tips)

---

[← Back to License Management](./index.md) | [Next: License Assignments →](./assignments.md)
