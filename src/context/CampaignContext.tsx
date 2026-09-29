"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  RawCampaignRow,
  CampaignAnalysisSummary,
  aggregateCampaign,
} from "@/lib/kpi";
import { SAMPLE_CAMPAIGN_ROWS } from "@/lib/sample-data";
import { AIPostMortemReport } from "@/lib/gemini-schema";

interface CampaignContextType {
  summary: CampaignAnalysisSummary | null;
  report: AIPostMortemReport | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  isSampleData: boolean;
  loadSampleData: () => void;
  setCampaignRows: (rows: RawCampaignRow[], isSample?: boolean) => void;
  clearCampaign: () => void;
  setReport: (report: AIPostMortemReport | null) => void;
  generateReport: () => Promise<boolean>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<CampaignAnalysisSummary | null>(null);
  const [report, setReport] = useState<AIPostMortemReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSampleData, setIsSampleData] = useState(false);

  const loadSampleData = () => {
    const agg = aggregateCampaign(SAMPLE_CAMPAIGN_ROWS);
    setSummary(agg);
    setReport(null);
    setAnalysisError(null);
    setIsSampleData(true);
  };

  const setCampaignRows = (rows: RawCampaignRow[], isSample = false) => {
    const agg = aggregateCampaign(rows);
    setSummary(agg);
    setReport(null);
    setAnalysisError(null);
    setIsSampleData(isSample);
  };

  const clearCampaign = () => {
    setSummary(null);
    setReport(null);
    setAnalysisError(null);
    setIsSampleData(false);
  };

  const generateReport = async (): Promise<boolean> => {
    if (!summary) {
      setAnalysisError("No campaign data loaded to analyze.");
      return false;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Send ONLY calculated summary, never raw CSV rows
      const payload = {
        overall: summary.overall,
        ads: summary.ads,
        rowCount: summary.rowCount,
        dateRange: summary.dateRange,
        hasRevenue: summary.hasRevenue,
        isLowData: summary.isLowData,
        lowDataReasons: summary.lowDataReasons,
      };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Analysis failed (${res.status})`);
      }

      setReport(data.report);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate report";
      setAnalysisError(msg);
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <CampaignContext.Provider
      value={{
        summary,
        report,
        isAnalyzing,
        analysisError,
        isSampleData,
        loadSampleData,
        setCampaignRows,
        clearCampaign,
        setReport,
        generateReport,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error("useCampaign must be used within a CampaignProvider");
  }
  return context;
}
