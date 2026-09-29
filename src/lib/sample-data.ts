import { RawCampaignRow } from "./kpi";

export const SAMPLE_DATA_LABEL = "Sample data, not real campaign results";

export const SAMPLE_CAMPAIGN_ROWS: RawCampaignRow[] = [
  {
    ad_name: "Spring Sale - Carousel - Lifestyle",
    platform: "Meta",
    date: "2026-03-01",
    spend: 420.0,
    impressions: 28500,
    clicks: 890,
    conversions: 58,
    revenue: 1980.0,
  },
  {
    ad_name: "Brand Search - Exact Match",
    platform: "Google",
    date: "2026-03-02",
    spend: 210.0,
    impressions: 4800,
    clicks: 610,
    conversions: 62,
    revenue: 1860.0,
  },
  {
    ad_name: "Retargeting - Dynamic Product Ads",
    platform: "Meta",
    date: "2026-03-03",
    spend: 310.0,
    impressions: 11200,
    clicks: 450,
    conversions: 39,
    revenue: 1540.0,
  },
  {
    ad_name: "Non-Brand Search - Running Shoes",
    platform: "Google",
    date: "2026-03-04",
    spend: 650.0,
    impressions: 14200,
    clicks: 520,
    conversions: 31,
    revenue: 2150.0,
  },
  {
    ad_name: "Founder Story - Video Reel",
    platform: "Meta",
    date: "2026-03-05",
    spend: 380.0,
    impressions: 32000,
    clicks: 640,
    conversions: 24,
    revenue: 1120.0,
  },
  {
    ad_name: "Lookalike 1% - Feature Spotlight",
    platform: "Meta",
    date: "2026-03-06",
    spend: 520.0,
    impressions: 22000,
    clicks: 480,
    conversions: 19,
    revenue: 760.0,
  },
  {
    ad_name: "Performance Max - All Products",
    platform: "Google",
    date: "2026-03-07",
    spend: 780.0,
    impressions: 34500,
    clicks: 810,
    conversions: 28,
    revenue: 990.0,
  },
  {
    ad_name: "Broad UGC Test - Unboxing Clip",
    platform: "Meta",
    date: "2026-03-08",
    spend: 490.0,
    impressions: 26000,
    clicks: 390,
    conversions: 11,
    revenue: 380.0,
  },
  {
    ad_name: "Competitor Keywords - Search",
    platform: "Google",
    date: "2026-03-09",
    spend: 440.0,
    impressions: 6100,
    clicks: 190,
    conversions: 4,
    revenue: 160.0,
  },
  {
    ad_name: "Display Network - Contextual Banners",
    platform: "Google",
    date: "2026-03-10",
    spend: 340.0,
    impressions: 48000,
    clicks: 210,
    conversions: 2,
    revenue: 85.0,
  },
];

export const CSV_SAMPLE_TEMPLATE = `ad_name,platform,date,spend,impressions,clicks,conversions,revenue
Spring Sale - Carousel - Lifestyle,Meta,2026-03-01,420.00,28500,890,58,1980.00
Brand Search - Exact Match,Google,2026-03-02,210.00,4800,610,62,1860.00
Retargeting - Dynamic Product Ads,Meta,2026-03-03,310.00,11200,450,39,1540.00
Non-Brand Search - Running Shoes,Google,2026-03-04,650.00,14200,520,31,2150.00
Founder Story - Video Reel,Meta,2026-03-05,380.00,32000,640,24,1120.00
Lookalike 1% - Feature Spotlight,Meta,2026-03-06,520.00,22000,480,19,760.00
Performance Max - All Products,Google,2026-03-07,780.00,34500,810,28,990.00
Broad UGC Test - Unboxing Clip,Meta,2026-03-08,490.00,26000,390,11,380.00
Competitor Keywords - Search,Google,2026-03-09,440.00,6100,190,4,160.00
Display Network - Contextual Banners,Google,2026-03-10,340.00,48000,210,2,85.00
`;
