"use client";

import React, { useState } from "react";
import {
  AdKPIs,
  formatCurrency,
  formatPercent,
  formatNumber,
  formatROAS,
} from "@/lib/kpi";
import { ArrowUpDown, Award, AlertTriangle, ShieldAlert } from "lucide-react";

interface AdPerformanceTableProps {
  ads: AdKPIs[];
  hasRevenue: boolean;
}

type SortField =
  | "ad_name"
  | "platform"
  | "total_spend"
  | "total_impressions"
  | "total_clicks"
  | "ctr"
  | "cpc"
  | "total_conversions"
  | "conversionRate"
  | "cpa"
  | "roas";

export function AdPerformanceTable({ ads, hasRevenue }: AdPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>(hasRevenue ? "roas" : "cpa");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(hasRevenue ? "desc" : "asc");

  // Determine winners and losers for highlighting
  // Primary metric is ROAS if available, else CPA
  const sortedByEfficiency = [...ads].sort((a, b) => {
    if (hasRevenue) {
      const roasA = a.kpis.roas ?? -1;
      const roasB = b.kpis.roas ?? -1;
      return roasB - roasA;
    } else {
      const cpaA = a.kpis.cpa ?? 999999;
      const cpaB = b.kpis.cpa ?? 999999;
      return cpaA - cpaB;
    }
  });

  const topAdNames = new Set(
    sortedByEfficiency.slice(0, Math.min(2, Math.ceil(ads.length * 0.25))).map((a) => a.ad_name)
  );
  const bottomAdNames = new Set(
    sortedByEfficiency
      .slice(Math.max(0, sortedByEfficiency.length - Math.min(2, Math.ceil(ads.length * 0.25))))
      .map((a) => a.ad_name)
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      // Default desc for volume/rates/revenue/roas, asc for cpc/cpa
      if (field === "cpc" || field === "cpa") {
        setSortOrder("asc");
      } else {
        setSortOrder("desc");
      }
    }
  };

  const getSortValue = (ad: AdKPIs, field: SortField) => {
    switch (field) {
      case "ad_name":
        return ad.ad_name.toLowerCase();
      case "platform":
        return ad.platform.toLowerCase();
      case "total_spend":
        return ad.total_spend;
      case "total_impressions":
        return ad.total_impressions;
      case "total_clicks":
        return ad.total_clicks;
      case "ctr":
        return ad.kpis.ctr ?? -1;
      case "cpc":
        return ad.kpis.cpc ?? 999999;
      case "total_conversions":
        return ad.total_conversions;
      case "conversionRate":
        return ad.kpis.conversionRate ?? -1;
      case "cpa":
        return ad.kpis.cpa ?? 999999;
      case "roas":
        return ad.kpis.roas ?? -1;
      default:
        return 0;
    }
  };

  const sortedAds = [...ads].sort((a, b) => {
    const valA = getSortValue(a, sortField);
    const valB = getSortValue(b, sortField);
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Ad Performance Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Highlighted: Best performers (green badge) and worst performers (rose badge) based on {hasRevenue ? "ROAS" : "CPA"}.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-medium">
            <Award className="w-3.5 h-3.5" /> Best Performer
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> Underperformer
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th
                onClick={() => handleSort("ad_name")}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Ad Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("platform")}
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Platform</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("total_spend")}
                className="py-3.5 px-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Spend</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("total_impressions")}
                className="py-3.5 px-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Impr.</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("total_clicks")}
                className="py-3.5 px-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Clicks</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("ctr")}
                className="py-3.5 px-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>CTR</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("cpc")}
                className="py-3.5 px-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>CPC</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("total_conversions")}
                className="py-3.5 px-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Conv.</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("conversionRate")}
                className="py-3.5 px-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Conv. %</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("cpa")}
                className="py-3.5 px-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>CPA</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              {hasRevenue && (
                <th
                  onClick={() => handleSort("roas")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>ROAS</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedAds.map((ad, idx) => {
              const isTop = topAdNames.has(ad.ad_name);
              const isBottom = bottomAdNames.has(ad.ad_name);

              return (
                <tr
                  key={`${ad.ad_name}-${idx}`}
                  className={`transition-colors ${
                    isTop
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30"
                      : isBottom
                      ? "bg-rose-50/30 dark:bg-rose-950/15 hover:bg-rose-50/50 dark:hover:bg-rose-950/25"
                      : "hover:bg-slate-50/75 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      {isTop && (
                        <span className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300" title="Top Performer">
                          <Award className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {isBottom && (
                        <span className="p-1 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300" title="Underperformer">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className="truncate max-w-[220px]" title={ad.ad_name}>
                        {ad.ad_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                      {ad.platform}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    {formatCurrency(ad.total_spend)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-400">
                    {formatNumber(ad.total_impressions)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-400">
                    {formatNumber(ad.total_clicks)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    {formatPercent(ad.kpis.ctr)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    {formatCurrency(ad.kpis.cpc)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatNumber(ad.total_conversions)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    {formatPercent(ad.kpis.conversionRate)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(ad.kpis.cpa)}
                  </td>
                  {hasRevenue && (
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          ad.kpis.roas && ad.kpis.roas >= 3
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/70"
                            : ad.kpis.roas && ad.kpis.roas < 1
                            ? "text-rose-700 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-950/70"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {formatROAS(ad.kpis.roas)}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
