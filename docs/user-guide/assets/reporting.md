# Asset Reporting

Learn how to generate reports, analyze asset data, and export information for auditing and decision-making purposes.

## Overview

Fluxera provides comprehensive reporting capabilities to help you understand your asset portfolio, track utilization, and make informed decisions about asset management.

## Available Reports

### Asset Inventory Report

Complete list of all assets with detailed information.

**Includes:**
- Asset name and category
- Serial number and model
- Current status
- Assigned user (if applicable)
- Purchase date and cost
- Warranty information
- Location

**Use cases:**
- Annual inventory audits
- Insurance documentation
- Budget planning
- Compliance reporting

### Assignment Report

Track which assets are assigned to which users.

**Includes:**
- Asset details
- Assigned user information
- Assignment date
- Assignment duration
- Previous assignments

**Use cases:**
- Employee onboarding/offboarding
- Asset utilization analysis
- Accountability tracking
- Department allocation

### Maintenance Report

Overview of all maintenance activities.

**Includes:**
- Maintenance type and description
- Scheduled vs. actual dates
- Technician information
- Costs and expenses
- Completion status

**Use cases:**
- Maintenance cost analysis
- Preventive maintenance tracking
- Vendor performance evaluation
- Budget forecasting

### Utilization Report

Analyze how effectively assets are being used.

**Includes:**
- Assignment rates by category
- Average assignment duration
- Idle assets
- High-demand assets
- Utilization trends

**Use cases:**
- Optimize asset allocation
- Identify underutilized assets
- Plan future purchases
- Reduce waste

### Financial Report

Track asset-related costs and depreciation.

**Includes:**
- Purchase costs
- Maintenance expenses
- Total cost of ownership
- Depreciation calculations
- Cost per asset category

**Use cases:**
- Budget planning
- Financial audits
- Cost optimization
- ROI analysis

## Generating Reports

### Step-by-Step Guide

1. Navigate to **Assets** > **Reports**
2. Select the report type you want to generate
3. Configure report parameters:
   - **Date Range**: Select start and end dates
   - **Filters**: Apply category, status, or location filters
   - **Grouping**: Group by category, status, or user
   - **Sort Order**: Choose how to sort the data

4. Click **Preview Report** to see a preview
5. Review the data and adjust filters if needed
6. Click **Generate Report** to create the final version

![Report Configuration](../images/report-configuration.png)

### Report Filters

Apply filters to focus on specific data:

**By Category:**
- Laptops
- Desktops
- Monitors
- Peripherals
- Mobile Devices
- Networking
- Other

**By Status:**
- Available
- Assigned
- In Maintenance
- Retired

**By Date:**
- Purchase date range
- Assignment date range
- Maintenance date range
- Custom date range

**By Location:**
- Office locations
- Departments
- Buildings
- Custom locations

**By User:**
- Specific users
- Departments
- Roles
- Teams

## Exporting Reports

### Export Formats

Reports can be exported in multiple formats:

**CSV (Comma-Separated Values)**
- Best for data analysis in Excel or Google Sheets
- Includes all data fields
- Easy to manipulate and filter

**Excel (XLSX)**
- Formatted spreadsheet with styling
- Multiple sheets for complex reports
- Charts and graphs included

**PDF**
- Professional formatted document
- Ideal for printing and sharing
- Includes company branding

**JSON**
- Machine-readable format
- For integration with other systems
- Includes all metadata

### Exporting Steps

1. Generate your report
2. Click the **Export** button
3. Select your preferred format
4. Choose export options:
   - Include charts/graphs
   - Include summary statistics
   - Include filters applied
   - Page orientation (PDF only)

5. Click **Download**
6. The file will download to your device

## Scheduled Reports

### Setting Up Automated Reports

Generate and send reports automatically:

1. Go to **Assets** > **Reports** > **Scheduled Reports**
2. Click **Create Schedule**
3. Configure the schedule:
   - **Report Type**: Select which report to generate
   - **Frequency**: Daily, Weekly, Monthly, or Quarterly
   - **Day/Time**: When to generate the report
   - **Recipients**: Who should receive the report
   - **Format**: Export format (CSV, Excel, or PDF)
   - **Filters**: Apply any default filters

4. Click **Save Schedule**

Reports will be automatically generated and emailed to recipients according to the schedule.

### Managing Scheduled Reports

View and manage your scheduled reports:

1. Go to **Scheduled Reports**
2. See all active schedules
3. Edit, pause, or delete schedules as needed
4. View history of generated reports

## Custom Reports

### Creating Custom Reports

Build reports tailored to your specific needs:

1. Go to **Assets** > **Reports** > **Custom Reports**
2. Click **Create Custom Report**
3. Select data fields to include:
   - Asset information
   - User information
   - Assignment data
   - Maintenance records
   - Financial data

4. Configure calculations:
   - Totals and subtotals
   - Averages
   - Counts
   - Custom formulas

5. Set up grouping and sorting
6. Add charts and visualizations
7. Save the custom report template

### Sharing Custom Reports

Share your custom reports with team members:

1. Open the custom report
2. Click **Share**
3. Select users or roles to share with
4. Set permissions (view only or edit)
5. Click **Share Report**

## Report Visualizations

### Charts and Graphs

Reports can include visual elements:

**Pie Charts**
- Asset distribution by category
- Status breakdown
- Cost allocation

**Bar Charts**
- Assets by location
- Maintenance frequency
- Monthly acquisitions

**Line Charts**
- Asset growth over time
- Maintenance costs trend
- Utilization rates

**Heat Maps**
- Asset density by location
- Maintenance frequency
- Cost concentration

### Customizing Visualizations

1. Generate a report with data
2. Click **Add Visualization**
3. Select chart type
4. Choose data fields for X and Y axes
5. Configure colors and labels
6. Add to report

## Report Best Practices

✅ **Regular reporting**: Generate key reports on a consistent schedule

✅ **Filter appropriately**: Use filters to focus on relevant data

✅ **Document assumptions**: Note any filters or calculations used

✅ **Verify accuracy**: Review reports before sharing with stakeholders

✅ **Archive reports**: Keep historical reports for trend analysis

✅ **Automate when possible**: Use scheduled reports for routine reporting

## Common Report Scenarios

### Monthly Management Report

**Purpose**: Provide management with asset overview

**Configuration:**
- Report Type: Asset Inventory + Utilization
- Frequency: Monthly
- Format: PDF with charts
- Recipients: Management team

**Includes:**
- Total asset count and value
- New acquisitions
- Assignments and returns
- Maintenance summary
- Key metrics and trends

### Quarterly Financial Audit

**Purpose**: Support financial audits

**Configuration:**
- Report Type: Financial Report
- Frequency: Quarterly
- Format: Excel
- Recipients: Finance team

**Includes:**
- Asset purchase costs
- Depreciation calculations
- Maintenance expenses
- Total cost of ownership
- Cost by department

### Annual Inventory Audit

**Purpose**: Complete inventory verification

**Configuration:**
- Report Type: Asset Inventory
- Frequency: Annually
- Format: Excel + PDF
- Recipients: Audit team

**Includes:**
- Complete asset list
- Serial numbers
- Current locations
- Assigned users
- Condition notes

## Troubleshooting

**Q: Why is my report empty?**
A: Check your filters - you may have applied filters that exclude all data.

**Q: Can I edit a report after generating it?**
A: No, but you can adjust filters and regenerate. Export to Excel for manual editing.

**Q: How long are reports stored?**
A: Generated reports are stored for 90 days. Scheduled reports are stored for 1 year.

**Q: Can I schedule reports to multiple recipients?**
A: Yes, add multiple email addresses when configuring the schedule.

**Q: Why don't my charts appear in the PDF export?**
A: Ensure "Include charts/graphs" is checked in export options.

## Advanced Reporting

### API Access

For advanced users, reports can be accessed via API:

```
GET /api/reports/assets
GET /api/reports/assignments
GET /api/reports/maintenance
```

See API documentation for details.

### Integration with BI Tools

Export data to business intelligence tools:

1. Generate report in JSON format
2. Import into your BI tool (Tableau, Power BI, etc.)
3. Create custom dashboards and visualizations

## Next Steps

- [Return to Asset Management](./index.md)
- [Learn about dashboards](../dashboards/overview.md)
- [Explore user management](../users/index.md)

---

[← Back: Maintenance](./maintenance.md) | [Back to Asset Management](./index.md)
