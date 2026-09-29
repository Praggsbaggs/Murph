import { describe, it, expect } from "vitest";
import {
  safeDivide,
  calculateKPIs,
  aggregateCampaign,
  formatCurrency,
  formatPercent,
  formatROAS,
  RawCampaignRow,
} from "./kpi";

describe("KPI Module Unit Tests", () => {
  describe("safeDivide", () => {
    it("safely divides positive numbers", () => {
      expect(safeDivide(10, 2)).toBe(5);
      expect(safeDivide(1, 4)).toBe(0.25);
    });

    it("returns null for zero denominator", () => {
      expect(safeDivide(10, 0)).toBeNull();
      expect(safeDivide(0, 0)).toBeNull();
    });

    it("returns null for non-finite values or NaN", () => {
      expect(safeDivide(NaN, 5)).toBeNull();
      expect(safeDivide(5, NaN)).toBeNull();
      expect(safeDivide(Infinity, 5)).toBeNull();
      expect(safeDivide(5, Infinity)).toBeNull();
    });
  });

  describe("calculateKPIs single entity formulas", () => {
    it("accurately computes standard marketing KPIs", () => {
      const result = calculateKPIs({
        spend: 100,
        impressions: 5000,
        clicks: 200,
        conversions: 10,
        revenue: 400,
      });

      // CTR = 200 / 5000 = 0.04
      expect(result.ctr).toBeCloseTo(0.04);
      // CPC = 100 / 200 = 0.50
      expect(result.cpc).toBeCloseTo(0.5);
      // Conversion Rate = 10 / 200 = 0.05
      expect(result.conversionRate).toBeCloseTo(0.05);
      // CPA = 100 / 10 = 10
      expect(result.cpa).toBeCloseTo(10);
      // ROAS = 400 / 100 = 4.0
      expect(result.roas).toBeCloseTo(4.0);
    });

    it("safely handles zero clicks and zero conversions without Infinity or NaN", () => {
      const result = calculateKPIs({
        spend: 50,
        impressions: 1000,
        clicks: 0,
        conversions: 0,
        revenue: 0,
      });

      expect(result.ctr).toBe(0);
      expect(result.cpc).toBeNull();
      expect(result.conversionRate).toBeNull();
      expect(result.cpa).toBeNull();
      expect(result.roas).toBe(0);
    });

    it("omits ROAS when revenue is null or undefined", () => {
      const result = calculateKPIs({
        spend: 50,
        impressions: 1000,
        clicks: 50,
        conversions: 5,
        revenue: undefined,
      });

      expect(result.roas).toBeNull();
    });
  });

  describe("aggregateCampaign with hand-checked multi-row dataset", () => {
    const handCheckedRows: RawCampaignRow[] = [
      {
        ad_name: "Spring Promo Video",
        platform: "Meta",
        date: "2026-03-01",
        spend: 100.0,
        impressions: 5000,
        clicks: 200,
        conversions: 10,
        revenue: 400.0,
      },
      {
        ad_name: "Search - High Intent",
        platform: "Google",
        date: "2026-03-02",
        spend: 250.0,
        impressions: 2500,
        clicks: 100,
        conversions: 5,
        revenue: 250.0,
      },
      {
        ad_name: "Zero Clicks Test Ad",
        platform: "Meta",
        date: "2026-03-03",
        spend: 20.0,
        impressions: 400,
        clicks: 0,
        conversions: 0,
        revenue: 0.0,
      },
    ];

    it("correctly aggregates totals and metrics across ads", () => {
      const summary = aggregateCampaign(handCheckedRows);

      // Overall totals
      // Spend: 100 + 250 + 20 = 370
      expect(summary.overall.total_spend).toBe(370);
      // Impressions: 5000 + 2500 + 400 = 7900
      expect(summary.overall.total_impressions).toBe(7900);
      // Clicks: 200 + 100 + 0 = 300
      expect(summary.overall.total_clicks).toBe(300);
      // Conversions: 10 + 5 + 0 = 15
      expect(summary.overall.total_conversions).toBe(15);
      // Revenue: 400 + 250 + 0 = 650
      expect(summary.overall.total_revenue).toBe(650);
      expect(summary.overall.hasRevenue).toBe(true);

      // Overall KPIs:
      // CTR: 300 / 7900 = 0.037974...
      expect(summary.overall.kpis.ctr).toBeCloseTo(300 / 7900, 4);
      // CPC: 370 / 300 = 1.2333...
      expect(summary.overall.kpis.cpc).toBeCloseTo(370 / 300, 2);
      // Conversion Rate: 15 / 300 = 0.05
      expect(summary.overall.kpis.conversionRate).toBeCloseTo(0.05, 4);
      // CPA: 370 / 15 = 24.666...
      expect(summary.overall.kpis.cpa).toBeCloseTo(24.67, 1);
      // ROAS: 650 / 370 = 1.7567...
      expect(summary.overall.kpis.roas).toBeCloseTo(1.757, 2);

      // Ads count
      expect(summary.ads).toHaveLength(3);

      // Verify Spring Promo Video
      const springAd = summary.ads.find((a) => a.ad_name === "Spring Promo Video")!;
      expect(springAd).toBeDefined();
      expect(springAd.kpis.roas).toBeCloseTo(4.0);
      expect(springAd.kpis.cpa).toBeCloseTo(10.0);
      expect(springAd.kpis.cpc).toBeCloseTo(0.5);

      // Verify Zero Clicks Ad safe nulls
      const zeroAd = summary.ads.find((a) => a.ad_name === "Zero Clicks Test Ad")!;
      expect(zeroAd).toBeDefined();
      expect(zeroAd.kpis.cpc).toBeNull();
      expect(zeroAd.kpis.conversionRate).toBeNull();
      expect(zeroAd.kpis.cpa).toBeNull();
      expect(zeroAd.kpis.roas).toBe(0);

      // Date range
      expect(summary.dateRange).toEqual({
        start: "2026-03-01",
        end: "2026-03-03",
      });
    });

    it("triggers low-data warnings for fewer than 5 rows", () => {
      const summary = aggregateCampaign(handCheckedRows);
      // rows.length is 3 (< 5), but clicks are 300 (>= 100)
      expect(summary.isLowData).toBe(true);
      expect(summary.lowDataReasons.some((r) => r.includes("fewer than 5") || r.includes("only 3 rows"))).toBe(true);
    });

    it("triggers low-data warning for fewer than 100 total clicks", () => {
      const fewClicks: RawCampaignRow[] = [
        { ad_name: "Ad 1", platform: "Meta", spend: 10, impressions: 200, clicks: 10, conversions: 1 },
        { ad_name: "Ad 2", platform: "Meta", spend: 10, impressions: 200, clicks: 10, conversions: 1 },
        { ad_name: "Ad 3", platform: "Meta", spend: 10, impressions: 200, clicks: 10, conversions: 1 },
        { ad_name: "Ad 4", platform: "Meta", spend: 10, impressions: 200, clicks: 10, conversions: 1 },
        { ad_name: "Ad 5", platform: "Meta", spend: 10, impressions: 200, clicks: 10, conversions: 1 },
        { ad_name: "Ad 6", platform: "Meta", spend: 10, impressions: 200, clicks: 10, conversions: 1 },
      ];
      const summary = aggregateCampaign(fewClicks);
      // 6 rows (>= 5), but 60 clicks (< 100)
      expect(summary.isLowData).toBe(true);
      expect(summary.lowDataReasons.some((r) => r.includes("Total clicks are 60"))).toBe(true);
    });

    it("handles dataset without revenue column", () => {
      const noRevRows: RawCampaignRow[] = [
        { ad_name: "Lead Ad 1", platform: "Meta", spend: 50, impressions: 1000, clicks: 50, conversions: 5 },
        { ad_name: "Lead Ad 2", platform: "Google", spend: 80, impressions: 1200, clicks: 60, conversions: 8 },
      ];
      const summary = aggregateCampaign(noRevRows);
      expect(summary.hasRevenue).toBe(false);
      expect(summary.overall.hasRevenue).toBe(false);
      expect(summary.overall.total_revenue).toBeNull();
      expect(summary.overall.kpis.roas).toBeNull();
      expect(summary.ads[0].kpis.roas).toBeNull();
    });
  });

  describe("Formatting helpers", () => {
    it("formats currency properly and falls back for null", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
      expect(formatCurrency(null)).toBe("n/a");
      expect(formatCurrency(undefined)).toBe("n/a");
      expect(formatCurrency(NaN)).toBe("n/a");
    });

    it("formats percentage properly and falls back for null", () => {
      expect(formatPercent(0.0456)).toBe("4.56%");
      expect(formatPercent(null)).toBe("n/a");
    });

    it("formats ROAS properly and falls back for null", () => {
      expect(formatROAS(3.456)).toBe("3.46x");
      expect(formatROAS(null)).toBe("n/a");
    });
  });
});
