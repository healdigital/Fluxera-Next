# Frequently Asked Questions (FAQ)

Find answers to common questions about using Fluxera. Can't find what you're looking for? Contact your system administrator or check our [user guides](./index.md).

## Table of Contents

- [Getting Started](#getting-started)
- [Asset Management](#asset-management)
- [License Management](#license-management)
- [User Management](#user-management)
- [Dashboards & Reports](#dashboards--reports)
- [Account & Billing](#account--billing)
- [Security & Privacy](#security--privacy)
- [Technical Issues](#technical-issues)

---

## Getting Started

### How do I log in to Fluxera?

Navigate to your organization's Fluxera URL and enter your email and password. If you've forgotten your password, click "Forgot Password" to reset it.

### I received an invitation email. What do I do?

Click the "Accept Invitation" button in the email, create your password, and verify your email address. The invitation link expires after 7 days.

### What are the different user roles?

- **Owner**: Full access including billing
- **Admin**: Full operational access, cannot manage billing
- **Member**: Can create and manage assets/licenses
- **Viewer**: Read-only access

See [Roles & Permissions](./users/roles-permissions.md) for details.

### How do I change my password?

Go to your profile (click your avatar) > Settings > Security > Change Password.

### Can I use Fluxera on mobile devices?

Yes! Fluxera is fully responsive and works on smartphones and tablets. Download the mobile app or use your mobile browser.

---

## Asset Management

### How do I create a new asset?

1. Go to Assets
2. Click "Create Asset"
3. Fill in the required fields (name, category, status)
4. Add optional details
5. Click "Create Asset"

See [Creating Assets](./assets/creating-assets.md) for detailed instructions.

### Can I import multiple assets at once?

Yes! Click the "Import" button, download the CSV template, fill it in, and upload it back. See [Bulk Operations](./assets/creating-assets.md#bulk-operations).

### What asset categories are available?

- Laptops
- Desktops
- Monitors
- Peripherals
- Mobile Devices
- Networking Equipment
- Other (custom)

### How do I assign an asset to a user?

Open the asset detail page, click "Assign Asset", select the user, and confirm. See [Assigning Assets](./assets/assigning-assets.md).

### Can an asset be assigned to multiple users?

No, each asset can only be assigned to one user at a time. For shared equipment, assign to the primary user and document others in the notes.

### What happens when I delete an asset?

Deleted assets are permanently removed and cannot be recovered. The action is logged in the activity history. Consider changing status to "Retired" instead.

### How do I track asset maintenance?

Go to the asset detail page > Maintenance tab > Schedule Maintenance. See [Asset Maintenance](./assets/maintenance.md).

### Can I upload photos of assets?

Yes! When creating or editing an asset, click "Upload Image" and select a photo. Images are automatically optimized for performance.

### How do I search for a specific asset?

Use the search bar at the top of the Assets page. You can search by name, serial number, model, or manufacturer.

### What's the difference between "Available" and "Assigned" status?

- **Available**: Ready to be assigned to a user
- **Assigned**: Currently in use by a specific user

---

## License Management

### How do I add a new software license?

1. Go to Licenses
2. Click "Create License"
3. Enter license details (name, vendor, key, dates)
4. Click "Create License"

See [Managing Licenses](./licenses/managing-licenses.md).

### Are license keys stored securely?

Yes! All license keys are encrypted at rest and in transit. Access is logged for audit purposes.

### How do I assign a license to a user?

Open the license detail page, click "Assign to User", select the user, and confirm. See [License Assignments](./licenses/assignments.md).

### Can I assign a license to an asset instead of a user?

Yes! Some licenses (like operating systems) can be assigned to specific devices. Use "Assign to Asset" instead.

### What happens when a license expires?

The system marks it as expired and sends notifications. The license remains in your inventory for historical tracking. Renew it to reactivate.

### How do I set up expiration alerts?

Go to Settings > Notifications > Enable "License Expiration Alerts". Configure when you want to be notified (30, 14, 7 days before).

### Can I track trial licenses?

Yes! Select "Trial" as the license type and set the trial expiration date. You'll receive alerts before it expires.

### How many licenses can I assign?

It depends on the number of seats. For example, if you have 10 seats, you can assign the license to 10 users or assets.

### What if I need more license seats?

Contact your vendor to purchase additional seats, then update the license information in Fluxera.

### How do I handle license renewals?

When you receive an expiration alert, contact your vendor for a renewal quote, process the payment, and update the expiration date in Fluxera.

---

## User Management

### How do I invite a new team member?

1. Go to Users
2. Click "Invite User"
3. Enter their email and select a role
4. Click "Send Invitation"

See [Inviting Users](./users/inviting-users.md).

### Can I invite multiple users at once?

Yes! Use the "Bulk Invite" feature. Download the CSV template, fill it in with user details, and upload it.

### How long are invitation links valid?

Invitation links expire after 7 days. If expired, resend the invitation from the Invitations tab.

### How do I change a user's role?

Open the user detail page, click "Change Role", select the new role, and confirm. All role changes are logged.

### Can I deactivate a user temporarily?

Yes! Change their status to "Inactive". They won't be able to log in, but their data remains in the system. Reactivate them anytime.

### What happens to a user's assets when they're deactivated?

Assets remain assigned but should be manually unassigned. The assignment history is preserved.

### Can users change their own role?

No, only Owners and Admins can change user roles.

### How do I view a user's activity?

Open the user detail page and go to the Activity tab to see all their actions.

### Can I export user activity logs?

Yes! Go to the Activity tab and click "Export". Choose your format (CSV, PDF, or JSON).

### What's the difference between Owner and Admin?

Owners can manage billing and delete the workspace. Admins have full operational access but cannot access billing settings.

---

## Dashboards & Reports

### How do I customize my dashboard?

Click "Customize Dashboard", add/remove widgets, rearrange them, and save your changes. See [Dashboard Customization](./dashboards/customization.md).

### Can I export dashboard data?

Yes! Click the "Export" button and choose your format (PDF, Excel, CSV, or PNG).

### How often does the dashboard update?

Metrics update every 5 minutes, charts every 10 minutes, and alerts in real-time. You can manually refresh anytime.

### Can I create custom reports?

Yes! Go to Reports > Create Custom Report, select your data sources and filters, and generate the report.

### How do I schedule automatic reports?

When exporting a report, click "Schedule" and configure the frequency, format, and recipients.

### What date ranges are available for reports?

You can choose from presets (last 7/30/90 days) or select a custom date range.

### Can I share my dashboard layout with others?

Yes! Click "Share Dashboard" and send the link or configuration file to team members.

### Why don't I see certain widgets?

Widget availability depends on your role. Viewers have limited access to certain widgets.

---

## Account & Billing

### How do I upgrade my plan?

Owners can go to Settings > Billing > Upgrade Plan and select a new plan.

### What payment methods are accepted?

We accept major credit cards (Visa, Mastercard, American Express) and bank transfers for annual plans.

### Can I change my billing cycle?

Yes! Contact support to switch between monthly and annual billing.

### How do I add more user seats?

Go to Settings > Billing > Manage Seats and purchase additional seats.

### What happens if I exceed my user limit?

You'll be prompted to upgrade your plan or remove users to stay within your limit.

### Can I cancel my subscription?

Owners can cancel from Settings > Billing > Cancel Subscription. Your data is retained for 30 days.

### Do you offer discounts for annual plans?

Yes! Annual plans receive a 20% discount compared to monthly billing.

### How do I download invoices?

Go to Settings > Billing > Invoices and download any invoice as PDF.

---

## Security & Privacy

### Is my data secure?

Yes! We use industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit.

### Who can see my license keys?

Only users with Member role or higher can view license keys. All views are logged for audit purposes.

### Can I enable two-factor authentication?

Yes! Go to Profile > Security > Enable 2FA. We highly recommend enabling it for all users.

### How long are activity logs kept?

Activity logs are retained for 7 years by default for compliance purposes.

### Can I export my data?

Yes! Owners and Admins can export all data from Settings > Data Export.

### Is Fluxera GDPR compliant?

Yes! We comply with GDPR and other data protection regulations. See our Privacy Policy for details.

### What happens to my data if I cancel?

Your data is retained for 30 days after cancellation, then permanently deleted. Export your data before canceling.

### Can I delete specific user data?

Yes! Go to the user detail page > Actions > Delete User Data. This action cannot be undone.

---

## Technical Issues

### The page won't load. What should I do?

1. Check your internet connection
2. Refresh the page (F5 or Ctrl+R)
3. Clear your browser cache
4. Try a different browser
5. Contact support if the issue persists

### I'm getting an error message. What does it mean?

Error messages explain what went wrong and often include suggestions for fixing the issue. If unclear, contact support with the error message.

### Why can't I upload an image?

Check that:
- The file is an image (JPG, PNG, or WebP)
- The file size is under 10MB
- You have a stable internet connection
- Your browser allows file uploads

### The dashboard is loading slowly. How can I fix it?

1. Reduce the date range filter
2. Apply category or status filters
3. Clear your browser cache
4. Check your internet speed
5. Try using a different browser

### I can't find a feature. Where is it?

Use the search function (Ctrl+K or Cmd+K) to quickly find features. Check that your role has access to the feature.

### Why am I not receiving email notifications?

Check:
- Your notification settings (Settings > Notifications)
- Your email spam/junk folder
- Your email address is correct in your profile
- Email notifications are enabled for your account

### How do I report a bug?

Contact your system administrator or use the "Report Issue" button in the help menu. Include:
- What you were trying to do
- What happened instead
- Steps to reproduce the issue
- Screenshots if applicable

### Can I use Fluxera offline?

Limited functionality is available offline (viewing cached data). Full features require an internet connection.

### What browsers are supported?

Fluxera works best on:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

Internet Explorer is not supported.

### How do I clear my browser cache?

- **Chrome/Edge**: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
- **Firefox**: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
- **Safari**: Cmd+Option+E

Select "Cached images and files" and clear.

---

## Still Have Questions?

If you can't find the answer you're looking for:

1. **Check the User Guides**: Browse our comprehensive [documentation](./index.md)
2. **Watch Video Tutorials**: See step-by-step [video guides](./video-tutorials.md)
3. **Contact Support**: Reach out to your system administrator
4. **Community Forum**: Join discussions with other users (if available)

---

*Last updated: November 2025*
