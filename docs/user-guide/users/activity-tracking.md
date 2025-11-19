# Activity Tracking

Learn how to monitor user actions, view activity logs, and maintain audit trails for compliance and security purposes.

## Overview

Fluxera automatically tracks all user actions within the system, creating a comprehensive audit trail. This helps with compliance, security monitoring, troubleshooting, and understanding how your team uses the system.

## What is Tracked

### User Actions

The system logs all significant actions:

**Asset Management:**
- Asset created, edited, deleted
- Asset assigned or unassigned
- Asset status changed
- Maintenance scheduled or completed
- Asset images uploaded

**License Management:**
- License created, edited, deleted
- License assigned or unassigned
- License renewed
- License keys viewed
- Expiration dates updated

**User Management:**
- User invited
- Invitation accepted or declined
- User role changed
- User activated or deactivated
- Profile updated
- Password changed

**System Actions:**
- Login and logout
- Failed login attempts
- Settings changed
- Reports generated
- Data exported
- Integrations configured

### Activity Information

Each activity log entry includes:

- **Action**: What was done
- **User**: Who performed the action
- **Timestamp**: When it occurred (date and time)
- **IP Address**: Where it came from
- **Details**: Specific information about the change
- **Before/After**: Previous and new values (for edits)

## Viewing Activity Logs

### User Activity

To view a specific user's activity:

1. Navigate to **Users**
2. Click on the user's name
3. Go to the **Activity** tab
4. View chronological list of all actions

![User Activity Log](../images/user-activity-log.png)

### Asset Activity

To view activity for a specific asset:

1. Navigate to **Assets**
2. Click on the asset name
3. Go to the **History** tab
4. View all changes and assignments

### License Activity

To view activity for a specific license:

1. Navigate to **Licenses**
2. Click on the license name
3. Go to the **History** tab
4. View all changes and assignments

### System-Wide Activity

To view all activity across the workspace:

1. Go to **Settings** > **Activity Log**
2. View comprehensive activity feed
3. Filter by user, action type, or date
4. Search for specific events

## Filtering Activity

### Filter Options

Use filters to find specific activities:

**By User:**
- Select specific user from dropdown
- View only their actions
- Compare activity between users

**By Action Type:**
- Asset actions
- License actions
- User management
- System changes
- Login events

**By Date Range:**
- Today
- Last 7 days
- Last 30 days
- Last 90 days
- Custom date range

**By Resource:**
- Specific asset
- Specific license
- Specific user
- All resources

### Search Activity

Use the search bar to find:
- Specific asset or license names
- User names or emails
- IP addresses
- Action descriptions
- Notes or comments

## Activity Details

### Viewing Details

To see full details of an activity:

1. Click on any activity entry
2. View expanded information:
   - Complete action description
   - All changed fields
   - Before and after values
   - Related resources
   - User information
   - Session details

### Change History

For edit actions, see exactly what changed:

```
Field: Status
Previous Value: Available
New Value: Assigned
Changed By: John Doe
Changed At: 2024-11-18 14:30:00
```

## Exporting Activity Logs

### Export Options

Export activity logs for:
- Compliance audits
- Security reviews
- Performance analysis
- Backup purposes
- External reporting

### How to Export

1. Go to **Settings** > **Activity Log**
2. Apply desired filters
3. Click **Export**
4. Choose format:
   - CSV (for spreadsheets)
   - JSON (for data processing)
   - PDF (for reports)
5. Select date range
6. Click **Download**

### Export Contents

Exported files include:
- All filtered activity entries
- Complete details for each entry
- User information
- Timestamps
- IP addresses
- Change details

## Activity Alerts

### Setting Up Alerts

Get notified of specific activities:

1. Go to **Settings** > **Activity Alerts**
2. Click **Create Alert**
3. Configure:
   - Activity type to monitor
   - Users to monitor (or all)
   - Alert recipients
   - Notification method
4. Save alert

### Alert Examples

**Security Alerts:**
- Failed login attempts (3+ in 10 minutes)
- User role changes
- User deactivations
- Settings changes

**Operational Alerts:**
- High-value asset assignments
- License deletions
- Bulk operations
- Data exports

**Compliance Alerts:**
- License key views
- Data exports
- User access changes
- Permission modifications

## Activity Reports

### Generating Reports

Create activity reports:

1. Go to **Settings** > **Activity Log**
2. Click **Generate Report**
3. Select:
   - Report type
   - Date range
   - Users to include
   - Activity types
4. Click **Generate**
5. View or export report

### Report Types

**User Activity Report:**
- Actions per user
- Most active users
- Login frequency
- Feature usage

**Asset Activity Report:**
- Most modified assets
- Assignment frequency
- Status changes
- Maintenance history

**License Activity Report:**
- License changes
- Assignment patterns
- Key access logs
- Renewal activity

**Security Report:**
- Login attempts
- Failed authentications
- Permission changes
- Suspicious activity

## Compliance and Auditing

### Audit Trail

Maintain complete audit trail for:
- Regulatory compliance (SOX, HIPAA, etc.)
- Internal audits
- Security investigations
- Dispute resolution
- Performance reviews

### Audit Best Practices

✅ **Regular Reviews**: Review activity logs weekly

✅ **Retention Policy**: Keep logs for required period (typically 7 years)

✅ **Access Control**: Limit who can view activity logs

✅ **Export Regularly**: Backup activity logs monthly

✅ **Investigate Anomalies**: Follow up on unusual activity

✅ **Document Findings**: Record audit results

### Compliance Requirements

For compliance purposes, activity logs provide:

- **Who**: User identification
- **What**: Action performed
- **When**: Precise timestamp
- **Where**: IP address and location
- **Why**: Context and notes
- **How**: Method and tool used

## Security Monitoring

### Monitoring for Security

Watch for suspicious activities:

**Red Flags:**
- Multiple failed login attempts
- Unusual access times (late night, weekends)
- Bulk data exports
- Rapid permission changes
- Access from unusual locations
- Multiple simultaneous sessions

**Response Actions:**
1. Investigate immediately
2. Contact the user
3. Review related activity
4. Take protective action if needed
5. Document the incident

### Security Alerts

Configure automatic alerts for:
- Failed login attempts (threshold)
- User role changes
- Data exports
- Settings modifications
- Unusual activity patterns

## Activity Analytics

### Usage Insights

Analyze activity to understand:

**User Engagement:**
- Most active users
- Feature adoption
- Login frequency
- Time spent in system

**System Usage:**
- Peak usage times
- Most used features
- Common workflows
- Bottlenecks

**Operational Efficiency:**
- Time to complete tasks
- Approval workflows
- Assignment patterns
- Response times

### Generating Insights

1. Go to **Settings** > **Activity Analytics**
2. Select analysis type
3. Choose date range
4. View visualizations:
   - Activity heatmaps
   - User engagement charts
   - Feature usage graphs
   - Trend analysis

## Retention and Privacy

### Data Retention

Activity logs are retained according to:
- Workspace settings
- Compliance requirements
- Legal obligations
- Storage capacity

**Default Retention:**
- Active logs: Indefinite
- Archived logs: 7 years
- Deleted user logs: 90 days after deletion

### Privacy Considerations

Activity tracking respects privacy:
- Only work-related actions are logged
- Personal information is protected
- Access is role-based
- Logs can be anonymized for analysis
- Users can view their own activity

### GDPR Compliance

For GDPR compliance:
- Users can request their activity data
- Activity logs can be exported
- User data can be anonymized
- Logs can be deleted upon request (with exceptions)

## Troubleshooting with Activity Logs

### Common Use Cases

**"Who changed this asset?"**
1. Open asset detail page
2. Go to History tab
3. Find the change
4. See who made it and when

**"When was this license assigned?"**
1. Open license detail page
2. Go to History tab
3. Find assignment entry
4. View complete details

**"Why can't this user log in?"**
1. Go to user detail page
2. Check Activity tab
3. Look for failed login attempts
4. Check if account is deactivated

**"Who exported data yesterday?"**
1. Go to Activity Log
2. Filter by "Data Export"
3. Set date to yesterday
4. View all export activities

## Best Practices

✅ **Regular Monitoring**: Review activity logs weekly

✅ **Investigate Anomalies**: Follow up on unusual patterns

✅ **Document Incidents**: Record security events

✅ **Train Users**: Educate team about activity tracking

✅ **Set Up Alerts**: Configure alerts for critical actions

✅ **Export Regularly**: Backup activity logs monthly

✅ **Compliance Ready**: Maintain logs per regulations

✅ **Privacy Aware**: Respect user privacy while monitoring

## Common Questions

**Q: Can users see their own activity?**
A: Yes, all users can view their own activity in their profile.

**Q: Can activity logs be deleted?**
A: Only Owners can delete logs, and only after the retention period. Some logs cannot be deleted for compliance.

**Q: Are login attempts tracked?**
A: Yes, both successful and failed login attempts are logged.

**Q: Can I see who viewed a license key?**
A: Yes, all license key views are logged with user and timestamp.

**Q: How long are activity logs kept?**
A: Default is 7 years, but this can be configured based on your compliance needs.

**Q: Can I export activity logs for specific users?**
A: Yes, filter by user and then export the filtered results.

**Q: Are deleted items tracked?**
A: Yes, deletions are logged with details about what was deleted and by whom.

**Q: Can I restore deleted items from activity logs?**
A: No, activity logs are for tracking only. Deleted items cannot be restored.

## Advanced Features

### API Access

For advanced users:
- Access activity logs via API
- Integrate with SIEM systems
- Automate compliance reporting
- Build custom dashboards

### Webhooks

Set up webhooks to:
- Send activity to external systems
- Trigger automated workflows
- Integrate with monitoring tools
- Real-time activity streaming

### Custom Reports

Create custom activity reports:
- Define specific metrics
- Schedule automatic generation
- Distribute to stakeholders
- Archive for compliance

## Next Steps

- [Understand roles and permissions](./roles-permissions.md)
- [Learn about user invitations](./inviting-users.md)
- [Explore security settings](../index.md#support)

---

[← Back: Roles & Permissions](./roles-permissions.md) | [Back to User Management](./index.md)
