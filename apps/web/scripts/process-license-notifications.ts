#!/usr/bin/env tsx

/**
 * License Notification Processing Script
 *
 * This script processes license renewal alerts and sends email notifications
 * to team administrators. It should be run after the expiration check script.
 *
 * Usage:
 *   pnpm tsx apps/web/scripts/process-license-notifications.ts
 *
 * Environment Variables:
 *   SUPABASE_SERVICE_ROLE_KEY - Required for admin access
 *   SUPABASE_URL - Supabase project URL
 *   EMAIL_SENDER - Email sender address
 *   NEXT_PUBLIC_SITE_URL - Base URL for license detail links
 *   NEXT_PUBLIC_PRODUCT_NAME - Product name for emails
 *
 * This script:
 * 1. Fetches all alerts created today
 * 2. For each alert, sends email to team administrators
 * 3. Logs results and statistics
 */
import { createClient } from '@supabase/supabase-js';

import { renderLicenseExpirationEmail } from '@kit/email-templates';
import { getMailer } from '@kit/mailers';

interface ProcessResult {
  success: boolean;
  totalAlerts: number;
  processedAlerts: number;
  emailsSent: number;
  emailsFailed: number;
  errors: string[];
}

interface Alert {
  id: string;
  license_id: string;
  account_id: string;
  alert_type: '30_day' | '7_day';
  sent_at: string;
  software_licenses: {
    id: string;
    name: string;
    vendor: string;
    expiration_date: string;
  };
}

interface Account {
  id: string;
  name: string;
  slug: string;
}

interface Admin {
  user_id: string;
  users: {
    id: string;
    email: string;
  };
}

async function processLicenseNotifications(): Promise<ProcessResult> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      success: false,
      totalAlerts: 0,
      processedAlerts: 0,
      emailsSent: 0,
      emailsFailed: 0,
      errors: [
        'Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      ],
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const errors: string[] = [];
  let emailsSent = 0;
  let emailsFailed = 0;

  try {
    console.log('Fetching license renewal alerts created today...');

    // Get today's date range
    const today = new Date().toISOString().split('T')[0];

    // Fetch all alerts created today
    const { data: alerts, error: alertsError } = await supabase
      .from('license_renewal_alerts')
      .select(
        `
        id,
        license_id,
        account_id,
        alert_type,
        sent_at,
        software_licenses (
          id,
          name,
          vendor,
          expiration_date
        )
      `,
      )
      .gte('sent_at', `${today}T00:00:00.000Z`)
      .lt('sent_at', `${today}T23:59:59.999Z`);

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      return {
        success: false,
        totalAlerts: 0,
        processedAlerts: 0,
        emailsSent: 0,
        emailsFailed: 0,
        errors: [`Failed to fetch alerts: ${alertsError.message}`],
      };
    }

    if (!alerts || alerts.length === 0) {
      console.log('No alerts to process today');
      return {
        success: true,
        totalAlerts: 0,
        processedAlerts: 0,
        emailsSent: 0,
        emailsFailed: 0,
        errors: [],
      };
    }

    console.log(`Found ${alerts.length} alerts to process`);

    // Get mailer instance
    const mailer = await getMailer();

    // Process each alert
    for (const alert of alerts as Alert[]) {
      try {
        const license = alert.software_licenses;

        if (!license) {
          console.warn(`License not found for alert ${alert.id}`);
          errors.push(`License not found for alert ${alert.id}`);
          continue;
        }

        console.log(`Processing alert for license: ${license.name}`);

        // Get account details
        const { data: account, error: accountError } = await supabase
          .from('accounts')
          .select('id, name, slug')
          .eq('id', alert.account_id)
          .single();

        if (accountError || !account) {
          console.error(
            `Account not found for alert ${alert.id}:`,
            accountError,
          );
          errors.push(`Account not found for alert ${alert.id}`);
          continue;
        }

        // Get team administrators
        const { data: admins, error: adminsError } = await supabase
          .from('accounts_memberships')
          .select(
            `
            user_id,
            users:user_id (
              id,
              email
            )
          `,
          )
          .eq('account_id', alert.account_id)
          .eq('role', 'owner');

        if (adminsError) {
          console.error(
            `Failed to fetch admins for alert ${alert.id}:`,
            adminsError,
          );
          errors.push(`Failed to fetch admins for alert ${alert.id}`);
          continue;
        }

        if (!admins || admins.length === 0) {
          console.warn(
            `No administrators found for account ${alert.account_id}`,
          );
          errors.push(
            `No administrators found for account ${alert.account_id}`,
          );
          continue;
        }

        // Calculate days until expiry
        const expirationDate = new Date(license.expiration_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil(
          (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Build license detail URL
        const licenseDetailUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/home/${(account as Account).slug}/licenses/${license.id}`;

        // Send email to each administrator
        for (const admin of admins as Admin[]) {
          const adminUser = admin.users;

          if (!adminUser?.email) {
            console.warn(`Administrator ${admin.user_id} has no email address`);
            continue;
          }

          try {
            // Render email
            const { html, subject } = await renderLicenseExpirationEmail({
              licenseName: license.name,
              vendor: license.vendor,
              expirationDate: license.expiration_date,
              daysUntilExpiry,
              licenseDetailUrl,
              alertType: alert.alert_type,
              productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'Fluxera',
            });

            // Send email
            await mailer.sendEmail({
              to: adminUser.email,
              from: process.env.EMAIL_SENDER || 'noreply@fluxera.app',
              subject,
              html,
            });

            console.log(
              `✓ Email sent to ${adminUser.email} for license ${license.name}`,
            );
            emailsSent++;
          } catch (emailError) {
            console.error(
              `✗ Failed to send email to ${adminUser.email}:`,
              emailError,
            );
            errors.push(
              `Failed to send email to ${adminUser.email}: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
            );
            emailsFailed++;
          }
        }
      } catch (alertError) {
        console.error(`Error processing alert ${alert.id}:`, alertError);
        errors.push(
          `Error processing alert ${alert.id}: ${alertError instanceof Error ? alertError.message : 'Unknown error'}`,
        );
      }
    }

    return {
      success: true,
      totalAlerts: alerts.length,
      processedAlerts: alerts.length,
      emailsSent,
      emailsFailed,
      errors,
    };
  } catch (error) {
    console.error('Unexpected error processing notifications:', error);
    return {
      success: false,
      totalAlerts: 0,
      processedAlerts: 0,
      emailsSent,
      emailsFailed,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('License Notification Processing Script');
  console.log('='.repeat(60));
  console.log();

  const result = await processLicenseNotifications();

  console.log();
  console.log('='.repeat(60));
  console.log('Result Summary');
  console.log('='.repeat(60));
  console.log(`Success: ${result.success}`);
  console.log(`Total Alerts: ${result.totalAlerts}`);
  console.log(`Processed Alerts: ${result.processedAlerts}`);
  console.log(`Emails Sent: ${result.emailsSent}`);
  console.log(`Emails Failed: ${result.emailsFailed}`);

  if (result.errors.length > 0) {
    console.log();
    console.log('Errors:');
    result.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  console.log();

  // Exit with appropriate code
  process.exit(result.success && result.emailsFailed === 0 ? 0 : 1);
}

main();
