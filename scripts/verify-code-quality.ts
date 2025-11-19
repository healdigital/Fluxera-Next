#!/usr/bin/env tsx

/**
 * Script de Vérification de la Qualité du Code
 * 
 * Ce script exécute toutes les vérifications de qualité du code :
 * - TypeScript type checking
 * - ESLint
 * - Prettier formatting
 * 
 * Usage:
 *   pnpm tsx scripts/verify-code-quality.ts
 *   pnpm tsx scripts/verify-code-quality.ts --fix
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

interface CheckResult {
  name: string;
  success: boolean;
  duration: number;
  output?: string;
  warnings?: number;
  errors?: number;
}

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(80));
  log(title, COLORS.bright + COLORS.cyan);
  console.log('='.repeat(80) + '\n');
}

function logSuccess(message: string) {
  log(`✅ ${message}`, COLORS.green);
}

function logError(message: string) {
  log(`❌ ${message}`, COLORS.red);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, COLORS.yellow);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, COLORS.blue);
}

function runCommand(
  command: string,
  description: string,
): CheckResult {
  const startTime = Date.now();
  
  try {
    logInfo(`Running: ${description}...`);
    
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    
    const duration = Date.now() - startTime;
    
    // Parse warnings and errors from output
    const warnings = (output.match(/warning/gi) || []).length;
    const errors = (output.match(/error/gi) || []).length;
    
    logSuccess(`${description} completed in ${(duration / 1000).toFixed(2)}s`);
    
    if (warnings > 0) {
      logWarning(`Found ${warnings} warning(s)`);
    }
    
    return {
      name: description,
      success: true,
      duration,
      output,
      warnings,
      errors,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const output = error.stdout || error.stderr || error.message;
    
    logError(`${description} failed after ${(duration / 1000).toFixed(2)}s`);
    
    return {
      name: description,
      success: false,
      duration,
      output,
      errors: 1,
    };
  }
}

function generateReport(results: CheckResult[]): string {
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const totalWarnings = results.reduce((sum, r) => sum + (r.warnings || 0), 0);
  const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);
  const allPassed = results.every((r) => r.success);
  
  let report = '# Code Quality Verification Report\n\n';
  report += `**Date**: ${new Date().toISOString()}\n`;
  report += `**Status**: ${allPassed ? '✅ PASSED' : '❌ FAILED'}\n`;
  report += `**Duration**: ${(totalDuration / 1000).toFixed(2)}s\n\n`;
  
  report += '## Summary\n\n';
  report += `- Total Checks: ${results.length}\n`;
  report += `- Passed: ${results.filter((r) => r.success).length}\n`;
  report += `- Failed: ${results.filter((r) => !r.success).length}\n`;
  report += `- Warnings: ${totalWarnings}\n`;
  report += `- Errors: ${totalErrors}\n\n`;
  
  report += '## Detailed Results\n\n';
  
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    const duration = (result.duration / 1000).toFixed(2);
    
    report += `### ${status} ${result.name}\n\n`;
    report += `- Duration: ${duration}s\n`;
    
    if (result.warnings) {
      report += `- Warnings: ${result.warnings}\n`;
    }
    
    if (result.errors) {
      report += `- Errors: ${result.errors}\n`;
    }
    
    report += '\n';
  }
  
  return report;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  
  logSection('🔍 Code Quality Verification');
  
  if (shouldFix) {
    logInfo('Running in FIX mode - will attempt to auto-fix issues');
  } else {
    logInfo('Running in CHECK mode - use --fix to auto-fix issues');
  }
  
  const results: CheckResult[] = [];
  
  // 1. TypeScript Type Checking
  logSection('1️⃣  TypeScript Type Checking');
  results.push(
    runCommand(
      'pnpm typecheck',
      'TypeScript Type Check',
    ),
  );
  
  // 2. ESLint
  logSection('2️⃣  ESLint');
  const lintCommand = shouldFix ? 'pnpm lint:fix' : 'pnpm lint';
  results.push(
    runCommand(
      lintCommand,
      shouldFix ? 'ESLint (with auto-fix)' : 'ESLint',
    ),
  );
  
  // 3. Prettier
  logSection('3️⃣  Prettier Formatting');
  const formatCommand = shouldFix ? 'pnpm format:fix' : 'pnpm format';
  results.push(
    runCommand(
      formatCommand,
      shouldFix ? 'Prettier (with auto-fix)' : 'Prettier Check',
    ),
  );
  
  // Generate Report
  logSection('📊 Final Report');
  
  const allPassed = results.every((r) => r.success);
  const totalWarnings = results.reduce((sum, r) => sum + (r.warnings || 0), 0);
  const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);
  
  console.log('\n');
  
  for (const result of results) {
    if (result.success) {
      logSuccess(`${result.name}: PASSED`);
      if (result.warnings && result.warnings > 0) {
        logWarning(`  └─ ${result.warnings} warning(s)`);
      }
    } else {
      logError(`${result.name}: FAILED`);
      if (result.errors && result.errors > 0) {
        logError(`  └─ ${result.errors} error(s)`);
      }
    }
  }
  
  console.log('\n');
  
  if (allPassed) {
    logSuccess('All checks passed! 🎉');
    
    if (totalWarnings > 0) {
      logWarning(`Note: ${totalWarnings} warning(s) found (non-blocking)`);
    }
  } else {
    logError('Some checks failed! ❌');
    logInfo('Run with --fix to attempt auto-fixing issues');
  }
  
  // Save report
  const report = generateReport(results);
  const reportPath = join(process.cwd(), '.kiro', 'specs', 'LAST_VERIFICATION_REPORT.md');
  
  try {
    writeFileSync(reportPath, report);
    logInfo(`Report saved to: ${reportPath}`);
  } catch (error) {
    logWarning('Could not save report file');
  }
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  logError('Unexpected error:');
  console.error(error);
  process.exit(1);
});
