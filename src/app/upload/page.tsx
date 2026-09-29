"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useCampaign } from "@/context/CampaignContext";
import { RawCampaignRow } from "@/lib/kpi";
import { CSV_SAMPLE_TEMPLATE } from "@/lib/sample-data";
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
  HelpCircle,
} from "lucide-react";

interface FieldMapping {
  ad_name: string;
  platform: string;
  spend: string;
  impressions: string;
  clicks: string;
  conversions: string;
  revenue: string;
  date: string;
}

const REQUIRED_TARGETS: (keyof FieldMapping)[] = [
  "ad_name",
  "platform",
  "spend",
  "impressions",
  "clicks",
  "conversions",
];

const TARGET_LABELS: Record<keyof FieldMapping, { label: string; required: boolean; desc: string }> = {
  ad_name: { label: "Ad / Creative Name", required: true, desc: "Identifier for each ad" },
  platform: { label: "Platform", required: true, desc: "Meta, Google, TikTok, etc." },
  spend: { label: "Spend / Cost ($)", required: true, desc: "Amount spent on the ad" },
  impressions: { label: "Impressions", required: true, desc: "Times the ad was displayed" },
  clicks: { label: "Clicks", required: true, desc: "User clicks on the ad" },
  conversions: { label: "Conversions / Results", required: true, desc: "Leads, purchases, or goals" },
  revenue: { label: "Revenue ($)", required: false, desc: "Optional. Needed to calculate ROAS" },
  date: { label: "Date / Period", required: false, desc: "Optional. Used to compute date range" },
};

export default function UploadPage() {
  const router = useRouter();
  const { setCampaignRows } = useCampaign();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<FieldMapping>({
    ad_name: "",
    platform: "",
    spend: "",
    impressions: "",
    clicks: "",
    conversions: "",
    revenue: "",
    date: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "map">("upload");

  // Guess best column matches based on normalized names
  const autoDetectMapping = (headers: string[]): FieldMapping => {
    const normalized = headers.map((h) => ({
      orig: h,
      clean: h.toLowerCase().trim().replace(/[\s_-]+/g, ""),
    }));

    const findMatch = (candidates: string[]) => {
      for (const cand of candidates) {
        const match = normalized.find((n) => n.clean === cand);
        if (match) return match.orig;
      }
      for (const cand of candidates) {
        const match = normalized.find((n) => n.clean.includes(cand));
        if (match) return match.orig;
      }
      return "";
    };

    return {
      ad_name: findMatch(["adname", "ad", "creativename", "campaignname", "name", "headline"]),
      platform: findMatch(["platform", "channel", "source", "network", "publisher"]),
      spend: findMatch(["spend", "cost", "amountspent", "adspend", "budget"]),
      impressions: findMatch(["impressions", "impr", "views", "impressioncount"]),
      clicks: findMatch(["clicks", "linkclicks", "totalclicks"]),
      conversions: findMatch(["conversions", "results", "purchases", "leads", "actions", "conv"]),
      revenue: findMatch(["revenue", "conversionvalue", "convvalue", "sales", "purchaseroasvalue"]),
      date: findMatch(["date", "day", "reportingstarts", "startdate"]),
    };
  };

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);

    // Validate size (max 2 MB = 2 * 1024 * 1024 bytes)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage(`File size is ${(file.size / (1024 * 1024)).toFixed(2)} MB. Maximum allowed size is 2.00 MB.`);
      return;
    }

    // Validate extension/type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMessage("Please upload a valid CSV (.csv) file.");
      return;
    }

    setSelectedFile(file);

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors && results.errors.length > 0 && results.data.length === 0) {
          setErrorMessage(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }

        const headers = results.meta.fields || [];
        if (headers.length === 0) {
          setErrorMessage("CSV file appears to have no headers or columns.");
          return;
        }

        if (results.data.length === 0) {
          setErrorMessage("CSV file contains no data rows.");
          return;
        }

        setRawHeaders(headers);
        setRawRows(results.data);

        const detected = autoDetectMapping(headers);
        setMapping(detected);

        // Check if all required fields were matched with 100% confidence
        const missingRequired = REQUIRED_TARGETS.filter((req) => !detected[req]);
        if (missingRequired.length === 0) {
          // Headers match, but still allow reviewing or auto proceed
          setStep("map");
        } else {
          setStep("map");
        }
      },
      error: (err) => {
        setErrorMessage(`Failed to read file: ${err.message}`);
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_SAMPLE_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "campaign_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProcessCampaign = () => {
    setErrorMessage(null);

    // Validate that all required fields are mapped
    const unmapped = REQUIRED_TARGETS.filter((f) => !mapping[f]);
    if (unmapped.length > 0) {
      setErrorMessage(`Please select a column for: ${unmapped.map((u) => TARGET_LABELS[u].label).join(", ")}`);
      return;
    }

    // Convert raw rows to typed RawCampaignRow
    const parsedRows: RawCampaignRow[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const r = rawRows[i];
      const ad_name = String(r[mapping.ad_name] || "").trim();
      const platform = String(r[mapping.platform] || "Other").trim();
      const spend = parseFloat(String(r[mapping.spend]).replace(/[^0-9.-]+/g, "")) || 0;
      const impressions = parseInt(String(r[mapping.impressions]).replace(/[^0-9]+/g, ""), 10) || 0;
      const clicks = parseInt(String(r[mapping.clicks]).replace(/[^0-9]+/g, ""), 10) || 0;
      const conversions = parseInt(String(r[mapping.conversions]).replace(/[^0-9]+/g, ""), 10) || 0;

      let revenue: number | null = null;
      if (mapping.revenue && r[mapping.revenue] !== undefined && r[mapping.revenue] !== null && String(r[mapping.revenue]).trim() !== "") {
        const revVal = parseFloat(String(r[mapping.revenue]).replace(/[^0-9.-]+/g, ""));
        if (!isNaN(revVal)) {
          revenue = revVal;
        }
      }

      let date: string | undefined = undefined;
      if (mapping.date && r[mapping.date]) {
        date = String(r[mapping.date]).trim();
      }

      if (ad_name) {
        parsedRows.push({
          ad_name,
          platform,
          spend,
          impressions,
          clicks,
          conversions,
          revenue,
          date,
        });
      }
    }

    if (parsedRows.length === 0) {
      setErrorMessage("No valid rows could be extracted. Please ensure ad_name contains values.");
      return;
    }

    setCampaignRows(parsedRows, false);
    router.push("/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Upload Campaign CSV
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Upload ad exports from Meta Ads Manager, Google Ads, or TikTok Ads. We parse everything locally in your browser.
        </p>
      </div>

      {/* In-memory privacy banner */}
      <div className="mb-8 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
          <span className="font-bold">100% In-Memory Processing:</span> We never save or store your files, rows, or financial data on servers or databases. Calculations run in memory, and only aggregated performance summaries are transmitted for AI post-mortem interpretation.
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm text-rose-900 dark:text-rose-200 font-medium">
            {errorMessage}
          </div>
        </div>
      )}

      {step === "upload" ? (
        <div className="space-y-6">
          {/* Dropzone */}
          <div
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30"
                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Upload className="w-7 h-7" />
            </div>

            <p className="text-base font-semibold text-slate-900 dark:text-white">
              Click to select or drag and drop your CSV
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports CSV exports up to 2 MB (ad_name, platform, spend, impressions, clicks, conversions)
            </p>
          </div>

          {/* Template Download Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Need a starting template?
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Download our formatted CSV with pre-populated Meta and Google column headers.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadTemplate}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Template</span>
            </button>
          </div>
        </div>
      ) : (
        /* Column Mapping Step */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Step 2 of 2
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Verify Column Mapping
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Uploaded: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedFile?.name}</span> ({rawRows.length} rows detected)
              </p>
            </div>

            <button
              onClick={() => {
                setStep("upload");
                setSelectedFile(null);
              }}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Choose different file
            </button>
          </div>

          <div className="py-6 space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                We matched recognized headers automatically. Adjust any dropdown below if your exported column names differ.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(TARGET_LABELS) as (keyof FieldMapping)[]).map((fieldKey) => {
                const info = TARGET_LABELS[fieldKey];
                const currentVal = mapping[fieldKey];
                const isMatched = !!currentVal;

                return (
                  <div
                    key={fieldKey}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      isMatched
                        ? "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                        : info.required
                        ? "border-amber-300 dark:border-amber-900/70 bg-amber-50/30 dark:bg-amber-950/20"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor={`select-${fieldKey}`}
                        className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5"
                      >
                        {info.label}
                        {info.required ? (
                          <span className="text-xs text-rose-500">*</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                        )}
                      </label>
                      {isMatched ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Matched
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not selected</span>
                      )}
                    </div>

                    <select
                      id={`select-${fieldKey}`}
                      value={currentVal}
                      onChange={(e) =>
                        setMapping((prev) => ({
                          ...prev,
                          [fieldKey]: e.target.value,
                        }))
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">-- Choose CSV Column --</option>
                      {rawHeaders.map((hdr) => (
                        <option key={hdr} value={hdr}>
                          {hdr}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {info.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Note if revenue is omitted */}
            {!mapping.revenue && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-300">
                Notice: Revenue column is unmapped. ROAS (Return On Ad Spend) will be skipped, but CTR, CPC, Conversion Rate, and CPA will still be calculated.
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={() => setStep("upload")}
              type="button"
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleProcessCampaign}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <span>Calculate KPIs & View Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
