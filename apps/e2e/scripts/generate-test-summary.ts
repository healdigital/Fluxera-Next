#!/usr/bin/env node

/**
 * Generate a test summary from Playwright test results
 * This script reads the test-results.json file and generates a markdown summary
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

interface TestResult {
  suites: Array<{
    title: string;
    file: string;
    specs: Array<{
      title: string;
      tests: Array<{
        status: 'expected' | 'unexpected' | 'skipped' | 'flaky';
        duration: number;
      }>;
    }>;
  }>;
}

function generateTestSummary() {
  const resultsPath = join(process.cwd(), 'test-results.json');

  if (!existsSync(resultsPath)) {
    console.error('❌ Test results file not found:', resultsPath);
    console.error('Run tests first: pnpm test');
    process.exit(1);
  }

  const results: TestResult = JSON.parse(readFileSync(resultsPath, 'utf-8'));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  let flakyTests = 0;
  let totalDuration = 0;

  const failedSuites: Array<{
    suite: string;
    spec: string;
    status: string;
  }> = [];

  // Calculate statistics
  results.suites.forEach((suite) => {
    suite.specs.forEach((spec) => {
      spec.tests.forEach((test) => {
        totalTests++;
        totalDuration += test.duration;

        switch (test.status) {
          case 'expected':
            passedTests++;
            break;
          case 'unexpected':
            failedTests++;
            failedSuites.push({
              suite: suite.title,
              spec: spec.title,
              status: test.status,
            });
            break;
          case 'skipped':
            skippedTests++;
            break;
          case 'flaky':
            flakyTests++;
            break;
        }
      });
    });
  });

  // Generate summary
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';
  const avgDuration = totalTests > 0 ? (totalDuration / totalTests / 1000).toFixed(2) : '0';
  const totalDurationMin = (totalDuration / 1000 / 60).toFixed(2);

  console.log('\n📊 E2E Test Summary\n');
  console.log('═'.repeat(50));
  console.log(`\n✅ Passed:  ${passedTests}`);
  console.log(`❌ Failed:  ${failedTests}`);
  console.log(`⏭️  Skipped: ${skippedTests}`);
  console.log(`⚠️  Flaky:   ${flakyTests}`);
  console.log(`📈 Total:   ${totalTests}`);
  console.log(`\n🎯 Pass Rate: ${passRate}%`);
  console.log(`⏱️  Total Duration: ${totalDurationMin} minutes`);
  console.log(`⏱️  Average Test Duration: ${avgDuration} seconds`);

  if (failedSuites.length > 0) {
    console.log('\n❌ Failed Tests:\n');
    failedSuites.forEach(({ suite, spec }) => {
      console.log(`  • ${suite} > ${spec}`);
    });
  }

  console.log('\n' + '═'.repeat(50) + '\n');

  // Exit with error code if tests failed
  if (failedTests > 0) {
    process.exit(1);
  }
}

generateTestSummary();
