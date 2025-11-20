import { NextRequest, NextResponse } from 'next/server';

/**
 * Export Chart Data
 * Exports trend chart data in CSV or PDF format
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountSlug = searchParams.get('accountSlug');
    const metricType = searchParams.get('metricType') || 'assets';
    const timeRange = searchParams.get('timeRange') || '30d';
    const format = searchParams.get('format') as 'csv' | 'pdf';

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

    // Fetch trend data (reusing the existing trends endpoint logic)
    const trendsResponse = await fetch(
      `${request.nextUrl.origin}/api/dashboard/trends?accountSlug=${accountSlug}&metricType=${metricType}&timeRange=${timeRange}`,
      {
        headers: request.headers,
      },
    );

    if (!trendsResponse.ok) {
      throw new Error('Failed to fetch trend data');
    }

    const trendData = await trendsResponse.json();

    if (format === 'csv') {
      const csv = generateTrendCSV(trendData, metricType, timeRange);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${metricType}-trend-${timeRange}.csv"`,
        },
      });
    } else {
      // For PDF, return a text representation
      const text = generateTrendText(trendData, metricType, timeRange);
      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${metricType}-trend-${timeRange}.txt"`,
        },
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export chart data' },
      { status: 500 },
    );
  }
}

/**
 * Generate CSV from trend data
 */
function generateTrendCSV(
  data: Array<{ date: string; value: number }>,
  metricType: string,
  timeRange: string,
): string {
  const rows = [['Date', metricType.charAt(0).toUpperCase() + metricType.slice(1), 'Time Range']];

  data.forEach((point) => {
    rows.push([point.date, point.value.toString(), timeRange]);
  });

  return rows.map((row) => row.join(',')).join('\n');
}

/**
 * Generate text representation of trend data
 */
function generateTrendText(
  data: Array<{ date: string; value: number }>,
  metricType: string,
  timeRange: string,
): string {
  const metricLabel = metricType.charAt(0).toUpperCase() + metricType.slice(1);
  const values = data.map((d) => d.value);
  const current = values[values.length - 1] ?? 0;
  const first = values[0] ?? 0;
  const change = current - first;
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const peak = Math.max(...values);

  let report = `
${metricLabel} Trend Report
Time Range: ${timeRange}
Generated: ${new Date().toLocaleString()}

SUMMARY
-------
Current Value: ${current}
Change: ${change > 0 ? '+' : ''}${change}
Average: ${average}
Peak: ${peak}

DETAILED DATA
-------------
`;

  data.forEach((point) => {
    report += `${point.date}: ${point.value}\n`;
  });

  return report;
}
