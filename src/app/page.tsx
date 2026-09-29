"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCampaign } from "@/context/CampaignContext";
import {
  Upload,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  FlaskConical,
  Target,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { loadSampleData } = useCampaign();

  const handleTrySampleData = () => {
    loadSampleData();
    router.push("/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-amber-500/10 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Digital Marketing Course Project &bull; AI Ad Diagnostics</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Turn confusing ad dashboards into{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
              plain-language post-mortems
            </span>
          </h1>

          {/* One-paragraph explanation as requested */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Small businesses and students run ad campaigns across Meta and Google, but complex dashboards make it hard to know what actually worked. Interseller calculates your exact marketing KPIs in safe TypeScript code, then uses Google Gemini to write an objective, plain-language diagnostic: highlighting winners, breaking down underperformers, and prescribing rigorous one-variable A/B tests to run next.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleTrySampleData}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Zap className="w-5 h-5 text-amber-300" />
              <span>Try with sample data</span>
            </button>

            <Link
              href="/upload"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold text-base shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Upload your CSV</span>
            </Link>
          </div>

          {/* Guarantee banner */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              100% In-Memory Processing (No files saved)
            </span>
            <span>&bull;</span>
            <span>Max 2 MB CSV</span>
            <span>&bull;</span>
            <span>Meta & Google Compatible</span>
          </div>
        </div>
      </section>

      {/* 3-Step Flow Cards */}
      <section className="py-12 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              How Interseller Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Clear mathematical calculation paired with rigorous qualitative diagnosis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500" />
                Upload & Map
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Drag and drop your ad export CSV. Our intelligent column matcher maps headers like spend, impressions, clicks, conversions, and revenue automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-purple-300 dark:hover:border-purple-800 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Pure Math KPIs
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                CTR, CPC, Conversion Rate, CPA, and ROAS are computed via verified TypeScript functions with zero-denominator safety — no hallucinated math.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-amber-300 dark:hover:border-amber-800 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-500" />
                AI Post-Mortem
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Google Gemini interprets your calculated numbers into actionable hypotheses and isolates single-variable A/B test blueprints with 1-click PDF export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Reference Strip */}
      <section className="py-10 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">CTR</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Clicks &divide; Impressions</p>
            </div>
            <div className="hidden sm:block text-slate-300 dark:text-slate-700">&bull;</div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">CPC</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Spend &divide; Clicks</p>
            </div>
            <div className="hidden sm:block text-slate-300 dark:text-slate-700">&bull;</div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Conv. Rate</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Conversions &divide; Clicks</p>
            </div>
            <div className="hidden sm:block text-slate-300 dark:text-slate-700">&bull;</div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">CPA</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Spend &divide; Conversions</p>
            </div>
            <div className="hidden sm:block text-slate-300 dark:text-slate-700">&bull;</div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">ROAS</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Revenue &divide; Spend</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
