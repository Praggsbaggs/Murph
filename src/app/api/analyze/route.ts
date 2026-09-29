import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { AIPostMortemSchema, AIPostMortemReport } from "@/lib/gemini-schema";
import { checkRateLimit } from "@/lib/rate-limiter";

// Force Node.js runtime for API route
export const runtime = "nodejs";

const MAX_PAYLOAD_BYTES = 500 * 1024; // 500 KB limit for summary payload

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce payload size limit
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: "Payload exceeds maximum allowed size (500 KB)." },
        { status: 413 }
      );
    }

    // 2. Client IP Rate Limiting (10 requests per IP per hour)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";

    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. You can make up to ${rateLimit.limit} AI requests per hour. Please wait ${Math.ceil(
            rateLimit.resetInSeconds / 60
          )} minutes before trying again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetInSeconds),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 3. Check for GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your .env.local file or Vercel Environment Variables. See .env.example for guidance.",
        },
        { status: 500 }
      );
    }

    // 4. Parse incoming calculated summary (NEVER raw CSV)
    const body = await req.json();
    const { overall, ads, rowCount, dateRange, hasRevenue, isLowData, lowDataReasons } = body;

    if (!overall || !ads || !Array.isArray(ads) || ads.length === 0) {
      return NextResponse.json(
        { error: "Invalid request payload. Expected calculated campaign summary and ads array." },
        { status: 400 }
      );
    }

    // Prepare prompt data containing strictly pre-calculated summary numbers
    const summaryText = {
      overall: {
        total_spend: overall.total_spend,
        total_impressions: overall.total_impressions,
        total_clicks: overall.total_clicks,
        total_conversions: overall.total_conversions,
        total_revenue: hasRevenue ? overall.total_revenue : "Omitted / Not Provided",
        ctr: overall.kpis.ctr !== null ? `${(overall.kpis.ctr * 100).toFixed(2)}%` : "n/a",
        cpc: overall.kpis.cpc !== null ? `$${overall.kpis.cpc.toFixed(2)}` : "n/a",
        conversion_rate: overall.kpis.conversionRate !== null ? `${(overall.kpis.conversionRate * 100).toFixed(2)}%` : "n/a",
        cpa: overall.kpis.cpa !== null ? `$${overall.kpis.cpa.toFixed(2)}` : "n/a",
        roas: overall.kpis.roas !== null ? `${overall.kpis.roas.toFixed(2)}x` : "n/a",
      },
      campaign_scope: {
        row_count: rowCount,
        unique_ads_count: ads.length,
        date_range: dateRange ? `${dateRange.start} to ${dateRange.end}` : "Not specified",
        has_revenue_data: hasRevenue,
        low_data_warning: isLowData,
        low_data_reasons: lowDataReasons || [],
      },
      per_ad_kpis: ads.map((ad: {
        ad_name: string;
        platform: string;
        total_spend: number;
        total_impressions: number;
        total_clicks: number;
        total_conversions: number;
        total_revenue: number | null;
        kpis: {
          ctr: number | null;
          cpc: number | null;
          conversionRate: number | null;
          cpa: number | null;
          roas: number | null;
        };
      }) => ({
        ad_name: ad.ad_name,
        platform: ad.platform,
        spend: `$${ad.total_spend.toFixed(2)}`,
        impressions: ad.total_impressions,
        clicks: ad.total_clicks,
        conversions: ad.total_conversions,
        revenue: ad.total_revenue !== null ? `$${ad.total_revenue.toFixed(2)}` : "n/a",
        ctr: ad.kpis.ctr !== null ? `${(ad.kpis.ctr * 100).toFixed(2)}%` : "n/a",
        cpc: ad.kpis.cpc !== null ? `$${ad.kpis.cpc.toFixed(2)}` : "n/a",
        conversion_rate: ad.kpis.conversionRate !== null ? `${(ad.kpis.conversionRate * 100).toFixed(2)}%` : "n/a",
        cpa: ad.kpis.cpa !== null ? `$${ad.kpis.cpa.toFixed(2)}` : "n/a",
        roas: ad.kpis.roas !== null ? `${ad.kpis.roas.toFixed(2)}x` : "n/a",
      })),
    };

    const systemInstruction =
      "You are a digital marketing analyst. Use only the numbers provided. Do not invent data. Describe possible reasons as hypotheses, not facts. Recommend A/B tests that change one variable at a time. Return valid JSON only.";

    const prompt = `Analyze this digital marketing campaign summary and write a rigorous, actionable post-mortem report.
Do not recalculate or do any arithmetic; use only the calculated metrics provided below.
If there are fewer than 5 rows or fewer than about 100 total clicks (as indicated in campaign_scope.low_data_warning), you MUST explicitly state that the dataset is too small for statistically reliable conclusions and reflect this clearly in confidence_note.
If revenue is omitted or n/a, skip ROAS and base your analysis on CPA, CTR, and conversion rate.

Calculated Summary:
${JSON.stringify(summaryText, null, 2)}`;

    const ai = new GoogleGenAI({ apiKey });

    // Function to execute Gemini call
    const callGemini = async (): Promise<string | null> => {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: Type.OBJECT,
            properties: {
              headline: {
                type: Type.STRING,
                description: "Punchy, one-sentence executive summary of campaign outcome",
              },
              what_worked: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    ad: { type: Type.STRING },
                    insight: { type: Type.STRING },
                  },
                  required: ["ad", "insight"],
                },
              },
              what_didnt: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    ad: { type: Type.STRING },
                    insight: { type: Type.STRING },
                  },
                  required: ["ad", "insight"],
                },
              },
              possible_reasons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              next_tests: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hypothesis: { type: Type.STRING },
                    variable_to_change: { type: Type.STRING },
                    success_metric: { type: Type.STRING },
                  },
                  required: ["hypothesis", "variable_to_change", "success_metric"],
                },
              },
              confidence_note: {
                type: Type.STRING,
                description: "Assessment of sample size reliability and statistical validity",
              },
            },
            required: [
              "headline",
              "what_worked",
              "what_didnt",
              "possible_reasons",
              "next_tests",
              "confidence_note",
            ],
          },
        },
      });

      return response.text || null;
    };

    // 5. Attempt Gemini call with 1x retry on parse/schema failure
    let parsedReport: AIPostMortemReport | null = null;
    let attempts = 0;
    const maxAttempts = 2;
    let lastError: string | null = null;

    while (attempts < maxAttempts && !parsedReport) {
      attempts++;
      try {
        const rawOutput = await callGemini();
        if (!rawOutput) {
          throw new Error("Empty response returned by Gemini model.");
        }

        const json = JSON.parse(rawOutput);
        const validated = AIPostMortemSchema.safeParse(json);

        if (validated.success) {
          parsedReport = validated.data;
        } else {
          lastError = `Validation failed: ${validated.error.issues.map((i) => i.message).join(", ")}`;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : "Error executing Gemini request";
      }
    }

    if (!parsedReport) {
      return NextResponse.json(
        {
          error: `AI analysis generation failed after ${maxAttempts} attempts: ${lastError || "Invalid response shape"}. Please try again.`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        report: parsedReport,
        rateLimit: {
          remaining: rateLimit.remaining,
          resetInSeconds: rateLimit.resetInSeconds,
        },
      },
      {
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (error: unknown) {
    console.error("API Analyze Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
