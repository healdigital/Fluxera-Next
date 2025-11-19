#!/usr/bin/env tsx

/**
 * Combined License Alerts Script
 *
 * This script runs both the expiration check and notification processing
 * in sequence. This is the recommended way to run the complete alert workflow.
 *
 * Usage:
 *   pnpm tsx apps/web/scripts/run-license-alerts.ts
 *
 * What it does:
 * 1. Checks for expiring licenses and creates alerts
 * 2. Processes alerts and sends email notifications
 * 3. Reports combined results
 *
 * This script is ideal for:
 * - Scheduled cron jobs
 * - Manual execution
 * - CI/CD pipelines
 * - Testing the complete workflow
 */
import { execSync } from 'child_process';

interface StepResult {
  success: boolean;
  output: string;
  error?: string;
}

async function runStep(name: string, command: string): Promise<StepResult> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${name}`);
  console.log('='.repeat(60));

  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    console.log(output);

    return {
      success: true,
      output,
    };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    const errorOutput = err.stdout || err.stderr || err.message;
    console.error(errorOutput);

    return {
      success: false,
      output: errorOutput,
      error: error.message,
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('License Alerts Workflow');
  console.log('='.repeat(60));
  console.log();
  console.log('This script will:');
  console.log('1. Check for expiring licenses and create alerts');
  console.log('2. Process alerts and send email notifications');
  console.log();

  const startTime = Date.now();

  // Step 1: Check for expiring licenses
  const checkResult = await runStep(
    'Step 1: Check License Expirations',
    'pnpm tsx apps/web/scripts/check-license-expirations.ts',
  );

  if (!checkResult.success) {
    console.error('\n❌ License expiration check failed. Aborting workflow.');
    process.exit(1);
  }

  console.log('\n✓ License expiration check completed successfully');

  // Step 2: Process notifications
  const notifyResult = await runStep(
    'Step 2: Process License Notifications',
    'pnpm tsx apps/web/scripts/process-license-notifications.ts',
  );

  if (!notifyResult.success) {
    console.error('\n⚠️  Notification processing completed with errors');
  } else {
    console.log('\n✓ Notification processing completed successfully');
  }

  // Summary
  const duration = Date.now() - startTime;

  console.log('\n' + '='.repeat(60));
  console.log('Workflow Summary');
  console.log('='.repeat(60));
  console.log(`Total Duration: ${duration}ms`);
  console.log(
    `Step 1 (Expiration Check): ${checkResult.success ? '✓ Success' : '✗ Failed'}`,
  );
  console.log(
    `Step 2 (Notifications): ${notifyResult.success ? '✓ Success' : '⚠️  Completed with errors'}`,
  );
  console.log();

  // Exit with appropriate code
  const overallSuccess = checkResult.success && notifyResult.success;
  process.exit(overallSuccess ? 0 : 1);
}

main();
