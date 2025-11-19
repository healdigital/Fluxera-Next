#!/usr/bin/env tsx
/**
 * Lighthouse Accessibility Audit Script
 *
 * This script runs Lighthouse accessibility audits on all main pages
 * and generates a comprehensive accessibility report.
 *
 * Requirements: 6.1 - WCAG 2.1 Level AA accessibility standards
 *
 * Usage:
 *   pnpm run lighthouse:accessibility
 */
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import lighthouse from 'lighthouse';
import path from 'path';

interface AuditResult {
  url: string;
  accessibilityScore: number;
  violations: Array<{
    id: string;
    title: string;
    description: string;
    score: number | null;
  }>;
  timestamp: string;
}

const BASE_URL = process.env.LIGHTHOUSE_URL || 'http://localhost:3000';

// Pages to audit
const PAGES_TO_AUDIT = [
  { path: '/home/test-account', name: 'Dashboard' },
  { path: '/home/test-account/assets', name: 'Assets List' },
  { path: '/home/test-account/licenses', name: 'Licenses List' },
  { path: '/home/test-account/users', name: 'Users List' },
];

async function runLighthouseAudit(
  url: string,
): Promise<lighthouse.RunnerResult | undefined> {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options: lighthouse.Flags = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['accessibility'],
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(url, options);
    await chrome.kill();
    return runnerResult;
  } catch (error) {
    console.error(`Error running Lighthouse for ${url}:`, error);
    await chrome.kill();
    return undefined;
  }
}

function extractAccessibilityIssues(
  lhr: lighthouse.Result,
): AuditResult['violations'] {
  const violations: AuditResult['violations'] = [];

  if (lhr.categories.accessibility && lhr.categories.accessibility.auditRefs) {
    for (const auditRef of lhr.categories.accessibility.auditRefs) {
      const audit = lhr.audits[auditRef.id];

      // Only include failed audits
      if (audit && audit.score !== null && audit.score < 1) {
        violations.push({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: audit.score,
        });
      }
    }
  }

  return violations;
}

async function main() {
  console.log('🔍 Starting Lighthouse Accessibility Audit...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const results: AuditResult[] = [];
  let allPassed = true;

  for (const page of PAGES_TO_AUDIT) {
    const url = `${BASE_URL}${page.path}`;
    console.log(`\n📊 Auditing: ${page.name}`);
    console.log(`   URL: ${url}`);

    const runnerResult = await runLighthouseAudit(url);

    if (!runnerResult || !runnerResult.lhr) {
      console.error(`   ❌ Failed to audit ${page.name}`);
      allPassed = false;
      continue;
    }

    const lhr = runnerResult.lhr;
    const accessibilityScore = lhr.categories.accessibility?.score ?? 0;
    const violations = extractAccessibilityIssues(lhr);

    const result: AuditResult = {
      url,
      accessibilityScore: accessibilityScore * 100,
      violations,
      timestamp: new Date().toISOString(),
    };

    results.push(result);

    // Display results
    console.log(`   Score: ${result.accessibilityScore.toFixed(0)}/100`);

    if (result.accessibilityScore === 100) {
      console.log('   ✅ Perfect accessibility score!');
    } else if (result.accessibilityScore >= 90) {
      console.log('   ✅ Good accessibility score');
    } else {
      console.log('   ⚠️  Accessibility improvements needed');
      allPassed = false;
    }

    if (violations.length > 0) {
      console.log(`   Issues found: ${violations.length}`);
      violations.forEach((violation, index) => {
        console.log(
          `     ${index + 1}. ${violation.title} (Score: ${violation.score})`,
        );
      });
    }
  }

  // Generate report
  const reportDir = path.join(process.cwd(), 'lighthouse-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(
    reportDir,
    `accessibility-audit-${new Date().toISOString().replace(/:/g, '-')}.json`,
  );

  const report = {
    summary: {
      totalPages: PAGES_TO_AUDIT.length,
      averageScore:
        results.reduce((sum, r) => sum + r.accessibilityScore, 0) /
        results.length,
      allPassed,
      timestamp: new Date().toISOString(),
    },
    results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 ACCESSIBILITY AUDIT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total pages audited: ${report.summary.totalPages}`);
  console.log(
    `Average accessibility score: ${report.summary.averageScore.toFixed(1)}/100`,
  );
  console.log(`Report saved to: ${reportPath}`);

  if (allPassed) {
    console.log('\n✅ All pages meet accessibility standards!');
  } else {
    console.log('\n⚠️  Some pages need accessibility improvements.');
    console.log('Review the detailed report for specific issues.');
  }

  console.log('\n' + '='.repeat(60));

  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
