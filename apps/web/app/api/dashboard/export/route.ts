import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

interface MetricsData {
  total_assets: number;
  available_assets: number;
  assets_growth_30d: number;
  total_users: number;
  active_users: number;
  users_growth_30d: number;
  total_licenses: number;
  active_licenses: number;
  expiring_licenses_30d: number;
}

/**
 * Export Dashboard Metrics
 * Exports metrics data in CSV or PDF format
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountSlug = searchParams.get('accountSlug');
    const format = searchParams.get('format') as 'csv' | 'pdf';
    const timeRange = searchParams.get('timeRange') || '30d';

    if (!accountSlug) {
      return NextResponse.json(
        { error: 'Account slug is required' },
        { status: 400 },
      );
    }

    if (!format || !['csv', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be csv or pdf' },
        { status: 400 },
      );
    }

    const client = getSupabaseServerClient();
    
    // Fetch metrics directly from database
    const { data: metricsData, error } = await client
      .rpc('get_team_dashboard_metrics', {
        p_account_slug: accountSlug,
      })
      .single();

    if (error || !metricsData) {
      throw new Error('Failed to fetch metrics');
    }

    const metrics = metricsData as unknown as MetricsData;

    if (format === 'csv') {
      const csv = generateMetricsCSV(metrics, timeRange);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="metrics-${timeRange}.csv"`,
        },
      });
    } else {
      // For PDF, we would use a library like jsPDF or puppeteer
      // For now, return a simple text representation
      const text = generateMetricsText(metrics, timeRange);
      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="metrics-${timeRange}.txt"`,
        },
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export metrics' },
      { status: 500 },
    );
  }
}

/**
 * Generate CSV from metrics data
 */
function generateMetricsCSV(
  metrics: MetricsData,
  timeRange: string,
): string {
  const rows = [
    ['Metric', 'Value', 'Time Range'],
    ['Total Assets', metrics.total_assets.toString(), timeRange],
    ['Available Assets', metrics.available_assets.toString(), timeRange],
    ['Assets Growth (30d)', metrics.assets_growth_30d.toString(), timeRange],
    ['Total Users', metrics.total_users.toString(), timeRange],
    ['Active Users', metrics.active_users.toString(), timeRange],
    ['Users Growth (30d)', metrics.users_growth_30d.toString(), timeRange],
    ['Total Licenses', metrics.total_licenses.toString(), timeRange],
    ['Active Licenses', metrics.active_licenses.toString(), timeRange],
    [
      'Expiring Licenses (30d)',
      metrics.expiring_licenses_30d.toString(),
      timeRange,
    ],
  ];

  return rows.map((row) => row.join(',')).join('\n');
}

/**
 * Generate text representation of metrics
 */
function generateMetricsText(
  metrics: MetricsData,
  timeRange: string,
): string {
  return `
Dashboard Metrics Report
Time Range: ${timeRange}
Generated: ${new Date().toLocaleString()}

ASSETS
------
Total Assets: ${metrics.total_assets}
Available Assets: ${metrics.available_assets}
Assets Growth (30d): ${metrics.assets_growth_30d}

USERS
-----
Total Users: ${metrics.total_users}
Active Users: ${metrics.active_users}
Users Growth (30d): ${metrics.users_growth_30d}

LICENSES
--------
Total Licenses: ${metrics.total_licenses}
Active Licenses: ${metrics.active_licenses}
Expiring Licenses (30d): ${metrics.expiring_licenses_30d}
`;
}
