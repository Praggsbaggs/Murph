"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { AdKPIs, formatCurrency, formatROAS } from "@/lib/kpi";

interface DashboardChartsProps {
  ads: AdKPIs[];
  hasRevenue: boolean;
}

export function DashboardCharts({ ads, hasRevenue }: DashboardChartsProps) {
  const [metric, setMetric] = useState<"roas" | "cpa">(hasRevenue ? "roas" : "cpa");

  // Filter or transform ads for chart display
  const chartData = ads.map((ad) => ({
    name: ad.ad_name.length > 22 ? `${ad.ad_name.slice(0, 20)}...` : ad.ad_name,
    fullName: ad.ad_name,
    platform: ad.platform,
    roas: ad.kpis.roas !== null ? Number(ad.kpis.roas.toFixed(2)) : 0,
    cpa: ad.kpis.cpa !== null ? Number(ad.kpis.cpa.toFixed(2)) : 0,
    spend: ad.total_spend,
  }));

  // Sort descending for roas (higher is better), ascending for cpa (lower is better)
  const sortedData = [...chartData].sort((a, b) => {
    if (metric === "roas") {
      return b.roas - a.roas;
    } else {
      return a.cpa - b.cpa;
    }
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Ad Performance Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compare creative efficiency across {metric === "roas" ? "ROAS (Return On Ad Spend)" : "CPA (Cost Per Acquisition)"}
          </p>
        </div>

        {/* Metric Selector Toggle */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          {hasRevenue && (
            <button
              onClick={() => setMetric("roas")}
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                metric === "roas"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Compare by ROAS
            </button>
          )}

          <button
            onClick={() => setMetric("cpa")}
            type="button"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              metric === "cpa"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Compare by CPA
          </button>
        </div>
      </div>

      <div className="h-80 w-full pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 10, right: 10, left: 10, bottom: 45 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
            />
            <XAxis
              dataKey="name"
              angle={-25}
              textAnchor="end"
              interval={0}
              height={50}
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-slate-500 dark:text-slate-400"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-slate-500 dark:text-slate-400"
              tickFormatter={(val) => (metric === "roas" ? `${val}x` : `$${val}`)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white dark:bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-bold text-sm text-slate-100">{data.fullName}</p>
                      <p className="text-slate-400">Platform: {data.platform}</p>
                      <p className="text-slate-400">Spend: {formatCurrency(data.spend)}</p>
                      <p className="font-semibold text-indigo-400 pt-1 border-t border-slate-700">
                        {metric === "roas" ? `ROAS: ${data.roas}x` : `CPA: $${data.cpa}`}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey={metric}
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            >
              {sortedData.map((entry, index) => {
                // Color highlight for top and bottom performers
                let fillColor = "#6366f1"; // default indigo
                if (metric === "roas") {
                  if (index === 0) fillColor = "#10b981"; // Best ROAS (green)
                  if (index >= sortedData.length - 2) fillColor = "#f43f5e"; // Lowest ROAS (rose)
                } else {
                  if (index === 0) fillColor = "#10b981"; // Lowest CPA (best = green)
                  if (index >= sortedData.length - 2) fillColor = "#f43f5e"; // Highest CPA (worst = rose)
                }
                return <Cell key={`cell-${index}`} fill={fillColor} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Top Performer
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" /> Solid Performer
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> Underperformer
          </span>
        </div>
        <span>{ads.length} Ads Analyzed</span>
      </div>
    </div>
  );
}
