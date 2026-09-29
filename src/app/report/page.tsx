"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCampaign } from "@/context/CampaignContext";
import {
  formatCurrency,
  formatPercent,
  formatROAS,
  formatNumber,
} from "@/lib/kpi";
import {
  Printer,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Lightbulb,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Layers,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function ReportPage() {
  const router = useRouter();
  const {
    summary,
    report,
    isAnalyzing,
    analysisError,
    generateReport,
    loadSampleData,
    isSampleData,
  } = useCampaign();

  // If user navigated directly to report and has data but no report yet, auto-trigger generation
  useEffect(() => {
    if (summary && !report && !isAnalyzing && !analysisError) {
      generateReport();
    }
  }, [summary, report, isAnalyzing, analysisError, generateReport]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!summary) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            No Campaign Data Found
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Please upload a CSV or load our sample benchmark before generating an AI post-mortem.
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
              Upload Campaign CSV
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { overall, dateRange, ads, hasRevenue, isLowData } = summary;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Action Navigation Strip (hidden during print) */}
      <div className="print-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to KPI Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          {report && (
            <>
              <button
                onClick={() => generateReport()}
                disabled={isAnalyzing}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                <span>Regenerate</span>
              </button>

              <button
                onClick={handlePrint}
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Export as PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-950 animate-pulse" />
            <div className="w-16 h-16 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400 absolute inset-0 m-auto" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Synthesizing AI Post-Mortem...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Gemini 3.8 Flash is analyzing your computed KPIs, comparing creative efficiency, formulating hypotheses, and structuring controlled A/B tests.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Server-side API processing &bull; Zero raw data stored</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isAnalyzing && analysisError && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold">Failed to Generate Post-Mortem</h3>
              <p className="text-xs leading-relaxed">{analysisError}</p>
            </div>
          </div>

          {analysisError.includes("GEMINI_API_KEY") && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 text-xs space-y-2 text-slate-700 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">
                How to configure GEMINI_API_KEY:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                <li>Create a <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">.env.local</code> file in the project root.</li>
                <li>Add your key: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">GEMINI_API_KEY=AIzaSy...</code></li>
                <li>Restart the development server (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">npm run dev</code>).</li>
              </ol>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => generateReport()}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Analysis</span>
            </button>
          </div>
        </div>
      )}

      {/* Ready to generate prompt (if error cleared or initial) */}
      {!isAnalyzing && !report && !analysisError && (
        <div className="text-center p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Ready to Generate Post-Mortem Report
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Click below to transmit calculated summary metrics to Gemini 3.8 Flash.
          </p>
          <button
            onClick={() => generateReport()}
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Post-Mortem</span>
          </button>
        </div>
      )}

      {/* AI Post-Mortem Report Document */}
      {!isAnalyzing && report && (
        <article className="space-y-8 print:space-y-6">
          {/* Executive Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm print-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Interseller
                </span>
                {isSampleData && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Sample Data
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                {dateRange && <span>Period: {dateRange.start} &rarr; {dateRange.end}</span>}
                <span>Spend: {formatCurrency(overall.total_spend)}</span>
                {hasRevenue && <span>ROAS: {formatROAS(overall.kpis.roas)}</span>}
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {report.headline}
            </h1>

            {/* Quick Metrics Strip */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 print-card">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Spend</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(overall.total_spend)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 print-card">
                <p className="text-[10px] uppercase font-bold text-slate-400">Clicks / CTR</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatNumber(overall.total_clicks)} ({formatPercent(overall.kpis.ctr)})
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 print-card">
                <p className="text-[10px] uppercase font-bold text-slate-400">Conversions / CPA</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatNumber(overall.total_conversions)} ({formatCurrency(overall.kpis.cpa)})
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 print-card">
                <p className="text-[10px] uppercase font-bold text-slate-400">Efficiency</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {hasRevenue ? `${formatROAS(overall.kpis.roas)} ROAS` : `${formatPercent(overall.kpis.conversionRate)} Conv. Rate`}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence Note Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 print-break-inside-avoid ${
              isLowData
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200"
                : "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-200"
            }`}
          >
            <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Data Reliability & Confidence Assessment:
              </span>
              <p className="leading-relaxed">{report.confidence_note}</p>
            </div>
          </div>

          {/* What Worked & What Didn't (Side by Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print-break-inside-avoid">
            {/* What Worked */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 shadow-sm print-card space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 border-b border-emerald-100 dark:border-emerald-950 pb-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h2 className="text-lg font-bold">What Worked (Winners)</h2>
              </div>

              <div className="space-y-3">
                {report.what_worked.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5"
                  >
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold text-xs">
                      {item.ad}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* What Didn't Work */}
            <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 shadow-sm print-card space-y-4">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 border-b border-rose-100 dark:border-rose-950 pb-3">
                <XCircle className="w-5 h-5 shrink-0" />
                <h2 className="text-lg font-bold">What Didn&apos;t (Underperformers)</h2>
              </div>

              <div className="space-y-3">
                {report.what_didnt.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1.5"
                  >
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold text-xs">
                      {item.ad}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Possible Reasons (Hypotheses) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm print-card space-y-4 print-break-inside-avoid">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Lightbulb className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Possible Reasons (Market Hypotheses)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formulated as objective hypotheses based strictly on metric patterns:
            </p>

            <ul className="space-y-2.5">
              {report.possible_reasons.map((reason, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Next Tests (Single Variable A/B Tests) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm print-card space-y-4 print-break-inside-avoid">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FlaskConical className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Recommended Next A/B Tests (Single-Variable Isolation)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Controlled experiments designed to change only one variable at a time with quantifiable success metrics:
            </p>

            <div className="grid grid-cols-1 gap-4">
              {report.next_tests.map((test, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Experiment #{idx + 1}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium">
                        Variable: {test.variable_to_change}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                        Metric: {test.success_metric}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    &ldquo;{test.hypothesis}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Limitations Section as requested */}
          <div className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-3 print-card print-break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              Methodological Limitations & Caveats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2">
              <div className="space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  1. Correlation &ne; Causation
                </p>
                <p className="leading-relaxed">
                  External variables such as weekend seasonality, product stock fluctuations, or competitor bidding shifts can produce performance anomalies that are not inherent to the ad creative itself.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  2. Small Sample Variance
                </p>
                <p className="leading-relaxed">
                  Ads with low impressions or fewer than 50-100 conversions suffer from high statistical volatility. A single lucky purchase can temporarily inflate ROAS without true significance.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  3. Attribution Nuances
                </p>
                <p className="leading-relaxed">
                  Meta and Google operate on distinct attribution windows (e.g., 7-day click vs last non-direct click). Cross-channel journey overlap can cause conversions to be claimed multiple times.
                </p>
              </div>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
