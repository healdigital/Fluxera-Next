import 'server-only';

import { renderLicenseExpirationEmail } from '@kit/email-templates';
import { getMailer } from '@kit/mailers';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

interface LicenseExpirationData {
  licenseId: string;
  licenseName: string;
  vendor: string;
  expirationDate: string;
  daysUntilExpiry: number;
  alertType: '30_day' | '7_day';
  accountId: string;
}

/**
 * Send license expiration notification emails to team administrators
 */
export async function sendLicenseExpirationNotification(
  data: LicenseExpirationData,
) {
  const logger = await getLogger();
  const client = getSupabaseServerClient();

  try {
    logger.info(
      {
        licenseId: data.licenseId,
        alertType: data.alertType,
        name: 'license-notifications.send',
      },
      'Sending license expiration notification...',
    );

    // Get account details
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, name, slug')
      .eq('id', data.accountId)
      .single();

    if (accountError || !account) {
      logger.error(
        {
          error: accountError,
          accountId: data.accountId,
          name: 'license-notifications.send',
        },
        'Failed to find account',
      );

      return {
        success: false,
        error: 'Account not found',
      };
    }

    // Get team administrators (users with 'owner' role)
    const { data: admins, error: adminsError } = await client
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
      .eq('account_id', data.accountId)
      .eq('role', 'owner');

    if (adminsError) {
      logger.error(
        {
          error: adminsError,
          accountId: data.accountId,
          name: 'license-notifications.send',
        },
        'Failed to fetch team administrators',
      );

      return {
        success: false,
        error: 'Failed to fetch team administrators',
      };
    }

    if (!admins || admins.length === 0) {
      logger.warn(
        {
          accountId: data.accountId,
          name: 'license-notifications.send',
        },
        'No team administrators found',
      );

      return {
        success: false,
        error: 'No team administrators found',
      };
    }

    // Build license detail URL
    const licenseDetailUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/home/${account.slug}/licenses/${data.licenseId}`;

    // Get mailer instance
    const mailer = await getMailer();

    // Send email to each administrator
    const emailPromises = admins.map(async (admin) => {
      const adminUser = admin.users as unknown as { id: string; email: string };

      if (!adminUser?.email) {
        logger.warn(
          {
            userId: admin.user_id,
            name: 'license-notifications.send',
          },
          'Administrator has no email address',
        );

        return null;
      }

      try {
        // Render email
        const { html, subject } = await renderLicenseExpirationEmail({
          licenseName: data.licenseName,
          vendor: data.vendor,
          expirationDate: data.expirationDate,
          daysUntilExpiry: data.daysUntilExpiry,
          licenseDetailUrl,
          alertType: data.alertType,
          productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'Fluxera',
        });

        // Send email
        await mailer.sendEmail({
          to: adminUser.email,
          from: process.env.EMAIL_SENDER || 'noreply@fluxera.app',
          subject,
          html,
        });

        logger.info(
          {
            email: adminUser.email,
            licenseId: data.licenseId,
            alertType: data.alertType,
            name: 'license-notifications.send',
          },
          'License expiration notification sent successfully',
        );

        return {
          email: adminUser.email,
          success: true,
        };
      } catch (emailError) {
        logger.error(
          {
            error: emailError,
            email: adminUser.email,
            licenseId: data.licenseId,
            name: 'license-notifications.send',
          },
          'Failed to send license expiration notification',
        );

        return {
          email: adminUser.email,
          success: false,
          error:
            emailError instanceof Error ? emailError.message : 'Unknown error',
        };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r?.success).length;
    const failureCount = results.filter((r) => r && !r.success).length;

    logger.info(
      {
        licenseId: data.licenseId,
        alertType: data.alertType,
        successCount,
        failureCount,
        totalRecipients: admins.length,
        name: 'license-notifications.send',
      },
      'License expiration notification batch completed',
    );

    return {
      success: true,
      successCount,
      failureCount,
      totalRecipients: admins.length,
    };
  } catch (error) {
    logger.error(
      {
        error,
        licenseId: data.licenseId,
        name: 'license-notifications.send',
      },
      'Unexpected error sending license expiration notification',
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    };
  }
}

/**
 * Process all pending license renewal alerts and send notifications
 * This function should be called by the background job after check_license_expirations()
 */
export async function processLicenseRenewalAlerts() {
  const logger = await getLogger();
  const client = getSupabaseServerClient();

  try {
    logger.info(
      {
        name: 'license-notifications.process',
      },
      'Processing license renewal alerts...',
    );

    // Get today's date range
    const today = new Date().toISOString().split('T')[0];

    // Fetch all alerts created today that haven't been processed yet
    const { data: alerts, error: alertsError } = await client
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
      logger.error(
        {
          error: alertsError,
          name: 'license-notifications.process',
        },
        'Failed to fetch license renewal alerts',
      );

      return {
        success: false,
        error: 'Failed to fetch license renewal alerts',
      };
    }

    if (!alerts || alerts.length === 0) {
      logger.info(
        {
          name: 'license-notifications.process',
        },
        'No license renewal alerts to process',
      );

      return {
        success: true,
        processedCount: 0,
      };
    }

    logger.info(
      {
        alertCount: alerts.length,
        name: 'license-notifications.process',
      },
      'Found license renewal alerts to process',
    );

    // Process each alert
    const results = await Promise.all(
      alerts.map(async (alert) => {
        const license = alert.software_licenses as unknown as {
          id: string;
          name: string;
          vendor: string;
          expiration_date: string;
        };

        if (!license) {
          logger.warn(
            {
              alertId: alert.id,
              licenseId: alert.license_id,
              name: 'license-notifications.process',
            },
            'License not found for alert',
          );

          return null;
        }

        // Calculate days until expiry
        const expirationDate = new Date(license.expiration_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil(
          (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Send notification
        return sendLicenseExpirationNotification({
          licenseId: license.id,
          licenseName: license.name,
          vendor: license.vendor,
          expirationDate: license.expiration_date,
          daysUntilExpiry,
          alertType: alert.alert_type as '30_day' | '7_day',
          accountId: alert.account_id,
        });
      }),
    );

    const successCount = results.filter((r) => r?.success).length;
    const failureCount = results.filter((r) => r && !r.success).length;

    logger.info(
      {
        totalAlerts: alerts.length,
        successCount,
        failureCount,
        name: 'license-notifications.process',
      },
      'License renewal alerts processing completed',
    );

    return {
      success: true,
      processedCount: alerts.length,
      successCount,
      failureCount,
    };
  } catch (error) {
    logger.error(
      {
        error,
        name: 'license-notifications.process',
      },
      'Unexpected error processing license renewal alerts',
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    };
  }
}
