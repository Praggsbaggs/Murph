"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCampaign } from "@/context/CampaignContext";
import { DashboardCharts } from "@/components/DashboardCharts";
import { AdPerformanceTable } from "@/components/AdPerformanceTable";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatROAS,
} from "@/lib/kpi";
import {
  Sparkles,
  Upload,
  AlertTriangle,
  Info,
  DollarSign,
  MousePointerClick,
  Target,
  Scale,
  TrendingUp,
  ArrowRight,
  Eye,
  Calendar,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { summary, isSampleData, loadSampleData, isAnalyzing } = useCampaign();

  if (!summary) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            No Campaign Data Loaded
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Upload your campaign CSV or load our 10-ad synthetic benchmark to explore the dashboard and generate an AI post-mortem.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                loadSampleData();
              }}
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Load 10-Ad Sample Dataset</span>
            </button>

            <Link
              href="/upload"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>Upload Your CSV</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { overall, ads, hasRevenue, isLowData, lowDataReasons, dateRange } = summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header with Title and Action CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Campaign Performance Dashboard
            </h1>
            {isSampleData && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Sample Data
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            <span>{ads.length} unique ads analyzed across {overall.totalRows} records</span>
            {dateRange && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {dateRange.start} &rarr; {dateRange.end}
              </span>
            )}
          </div>
        </div>

        <Link
          href="/report"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Generate AI Post-Mortem Report</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Low-data warning alert as required */}
      {isLowData && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold text-sm">Small Sample Size Warning</p>
            <p>
              Your dataset is too small for statistically reliable conclusions. AI post-mortem insights will note lower confidence.
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-300">
              {lowDataReasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Missing Revenue Alert */}
      {!hasRevenue && (
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900 dark:text-blue-200">
            <span className="font-semibold">Revenue column omitted:</span> ROAS (Return On Ad Spend) is skipped. Evaluation focuses on CPA (Cost Per Acquisition), CTR, and Conversion Rates.
          </p>
        </div>
      )}

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Spend
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(overall.total_spend)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Avg CPC: {formatCurrency(overall.kpis.cpc)}
          </p>
        </div>

        {/* Impressions & Clicks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Traffic & CTR
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatPercent(overall.kpis.ctr)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {formatNumber(overall.total_clicks)} clicks / {formatNumber(overall.total_impressions)} impr.
          </p>
        </div>

        {/* Conversions & CPA */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overall CPA
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(overall.kpis.cpa)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {formatNumber(overall.total_conversions)} conv. ({formatPercent(overall.kpis.conversionRate)} rate)
          </p>
        </div>

        {/* Overall ROAS or Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overall ROAS
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatROAS(overall.kpis.roas)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {hasRevenue
              ? `Revenue: ${formatCurrency(overall.total_revenue)}`
              : "Revenue not provided"}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <DashboardCharts ads={ads} hasRevenue={hasRevenue} />

      {/* Ad Performance Table */}
      <AdPerformanceTable ads={ads} hasRevenue={hasRevenue} />

      {/* Bottom CTA to Report */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            Ready for your plain-language diagnostic?
          </h3>
          <p className="text-xs text-indigo-200 max-w-xl">
            Google Gemini will interpret these calculated KPIs to explain what worked, what didn&apos;t, and formulate controlled single-variable A/B test hypotheses.
          </p>
        </div>

        <Link
          href="/report"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-950 hover:bg-slate-100 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          <span>Generate AI Report</span>
          <ArrowRight className="w-4 h-4 text-indigo-600" />
        </Link>
      </div>
    </div>
  );
}
