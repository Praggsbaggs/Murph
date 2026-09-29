/**
 * Campaign KPI Calculation Engine
 * Pure TypeScript functions for calculating digital marketing performance metrics.
 * 
 * Formulas:
 * - CTR = clicks / impressions
 * - CPC = spend / clicks
 * - Conversion rate = conversions / clicks
 * - CPA = spend / conversions
 * - ROAS = revenue / spend (null if revenue is missing or omitted)
 * 
 * Safety:
 * - Zero denominators return null (never Infinity or NaN)
 * - Safe numeric coercion and aggregation per ad and overall
 */

export interface RawCampaignRow {
  ad_name: string;
  platform: string;
  date?: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue?: number | null;
}

export interface CalculatedKPIs {
  ctr: number | null;            // clicks / impressions (ratio, e.g. 0.025 for 2.5%)
  cpc: number | null;            // spend / clicks ($)
  conversionRate: number | null; // conversions / clicks (ratio, e.g. 0.05 for 5%)
  cpa: number | null;            // spend / conversions ($)
  roas: number | null;           // revenue / spend (multiplier, e.g. 3.2x)
}

export interface AdKPIs {
  ad_name: string;
  platform: string;
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: number | null;
  kpis: CalculatedKPIs;
  rowCount: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface OverallKPIs {
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: number | null;
  hasRevenue: boolean;
  kpis: CalculatedKPIs;
  totalRows: number;
  uniqueAdsCount: number;
  dateRange: DateRange | null;
  isLowData: boolean;
  lowDataReasons: string[];
}

export interface CampaignAnalysisSummary {
  overall: OverallKPIs;
  ads: AdKPIs[];
  hasRevenue: boolean;
  isLowData: boolean;
  lowDataReasons: string[];
  rowCount: number;
  dateRange: DateRange | null;
}

/**
 * Safely divides numerator by denominator.
 * Returns null if denominator is 0, negative/invalid, or if result is not finite.
 */
export function safeDivide(numerator: number, denominator: number): number | null {
  if (
    denominator === 0 ||
    !isFinite(denominator) ||
    isNaN(denominator) ||
    !isFinite(numerator) ||
    isNaN(numerator)
  ) {
    return null;
  }
  const result = numerator / denominator;
  if (!isFinite(result) || isNaN(result)) {
    return null;
  }
  return result;
}

/**
 * Calculate the 5 core KPIs given aggregate raw totals.
 */
export function calculateKPIs(params: {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue?: number | null;
}): CalculatedKPIs {
  const { spend, impressions, clicks, conversions, revenue } = params;

  const ctr = safeDivide(clicks, impressions);
  const cpc = safeDivide(spend, clicks);
  const conversionRate = safeDivide(conversions, clicks);
  const cpa = safeDivide(spend, conversions);
  const roas = revenue !== null && revenue !== undefined && !isNaN(revenue)
    ? safeDivide(revenue, spend)
    : null;

  return {
    ctr,
    cpc,
    conversionRate,
    cpa,
    roas,
  };
}

/**
 * Aggregates raw campaign rows per ad and overall.
 */
export function aggregateCampaign(rows: RawCampaignRow[]): CampaignAnalysisSummary {
  if (!rows || rows.length === 0) {
    const emptyKPIs: CalculatedKPIs = {
      ctr: null,
      cpc: null,
      conversionRate: null,
      cpa: null,
      roas: null,
    };
    const emptyOverall: OverallKPIs = {
      total_spend: 0,
      total_impressions: 0,
      total_clicks: 0,
      total_conversions: 0,
      total_revenue: null,
      hasRevenue: false,
      kpis: emptyKPIs,
      totalRows: 0,
      uniqueAdsCount: 0,
      dateRange: null,
      isLowData: true,
      lowDataReasons: ["No campaign rows found."],
    };
    return {
      overall: emptyOverall,
      ads: [],
      hasRevenue: false,
      isLowData: true,
      lowDataReasons: ["No campaign rows found."],
      rowCount: 0,
      dateRange: null,
    };
  }

  // Check if revenue column has at least one valid number
  let hasRevenue = false;
  for (const r of rows) {
    if (r.revenue !== undefined && r.revenue !== null && !isNaN(Number(r.revenue))) {
      hasRevenue = true;
      break;
    }
  }

  // Aggregation buckets by ad_name + platform
  const adMap = new Map<
    string,
    {
      ad_name: string;
      platform: string;
      total_spend: number;
      total_impressions: number;
      total_clicks: number;
      total_conversions: number;
      total_revenue: number;
      hasAdRevenue: boolean;
      rowCount: number;
    }
  >();

  let total_spend = 0;
  let total_impressions = 0;
  let total_clicks = 0;
  let total_conversions = 0;
  let total_revenue = 0;

  const validDates: string[] = [];

  for (const row of rows) {
    const spend = Number(row.spend) || 0;
    const impressions = Number(row.impressions) || 0;
    const clicks = Number(row.clicks) || 0;
    const conversions = Number(row.conversions) || 0;
    const rowHasRev =
      row.revenue !== undefined && row.revenue !== null && !isNaN(Number(row.revenue));
    const revenue = rowHasRev ? Number(row.revenue) : 0;

    total_spend += spend;
    total_impressions += impressions;
    total_clicks += clicks;
    total_conversions += conversions;
    if (rowHasRev) {
      total_revenue += revenue;
    }

    if (row.date && typeof row.date === "string" && row.date.trim() !== "") {
      validDates.push(row.date.trim());
    }

    const key = `${row.ad_name}___${row.platform || "Unknown"}`;
    const existing = adMap.get(key);
    if (!existing) {
      adMap.set(key, {
        ad_name: row.ad_name || "Unnamed Ad",
        platform: row.platform || "Other",
        total_spend: spend,
        total_impressions: impressions,
        total_clicks: clicks,
        total_conversions: conversions,
        total_revenue: revenue,
        hasAdRevenue: rowHasRev,
        rowCount: 1,
      });
    } else {
      existing.total_spend += spend;
      existing.total_impressions += impressions;
      existing.total_clicks += clicks;
      existing.total_conversions += conversions;
      if (rowHasRev) {
        existing.total_revenue += revenue;
        existing.hasAdRevenue = true;
      }
      existing.rowCount += 1;
    }
  }

  // Calculate per-ad KPIs
  const ads: AdKPIs[] = Array.from(adMap.values()).map((ad) => ({
    ad_name: ad.ad_name,
    platform: ad.platform,
    total_spend: roundTo(ad.total_spend, 2),
    total_impressions: Math.round(ad.total_impressions),
    total_clicks: Math.round(ad.total_clicks),
    total_conversions: Math.round(ad.total_conversions),
    total_revenue: hasRevenue || ad.hasAdRevenue ? roundTo(ad.total_revenue, 2) : null,
    kpis: calculateKPIs({
      spend: ad.total_spend,
      impressions: ad.total_impressions,
      clicks: ad.total_clicks,
      conversions: ad.total_conversions,
      revenue: hasRevenue || ad.hasAdRevenue ? ad.total_revenue : null,
    }),
    rowCount: ad.rowCount,
  }));

  // Date range detection
  let dateRange: DateRange | null = null;
  if (validDates.length > 0) {
    const sorted = [...validDates].sort();
    dateRange = {
      start: sorted[0],
      end: sorted[sorted.length - 1],
    };
  }

  // Low data warning check: < 5 rows OR < 100 total clicks
  const lowDataReasons: string[] = [];
  if (rows.length < 5) {
    lowDataReasons.push(`Campaign contains only ${rows.length} rows (minimum 5 recommended for statistical significance).`);
  }
  if (total_clicks < 100) {
    lowDataReasons.push(`Total clicks are ${total_clicks} (at least 100 recommended to reduce statistical noise).`);
  }
  const isLowData = lowDataReasons.length > 0;

  const overallKPIs = calculateKPIs({
    spend: total_spend,
    impressions: total_impressions,
    clicks: total_clicks,
    conversions: total_conversions,
    revenue: hasRevenue ? total_revenue : null,
  });

  const overall: OverallKPIs = {
    total_spend: roundTo(total_spend, 2),
    total_impressions: Math.round(total_impressions),
    total_clicks: Math.round(total_clicks),
    total_conversions: Math.round(total_conversions),
    total_revenue: hasRevenue ? roundTo(total_revenue, 2) : null,
    hasRevenue,
    kpis: overallKPIs,
    totalRows: rows.length,
    uniqueAdsCount: ads.length,
    dateRange,
    isLowData,
    lowDataReasons,
  };

  return {
    overall,
    ads,
    hasRevenue,
    isLowData,
    lowDataReasons,
    rowCount: rows.length,
    dateRange,
  };
}

/**
 * Format helpers
 */
export function formatCurrency(val: number | null | undefined, fallback = "n/a"): string {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return fallback;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatPercent(val: number | null | undefined, decimals = 2, fallback = "n/a"): string {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return fallback;
  return `${(val * 100).toFixed(decimals)}%`;
}

export function formatNumber(val: number | null | undefined, fallback = "n/a"): string {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return fallback;
  return new Intl.NumberFormat("en-US").format(val);
}

export function formatROAS(val: number | null | undefined, fallback = "n/a"): string {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return fallback;
  return `${val.toFixed(2)}x`;
}

function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}
