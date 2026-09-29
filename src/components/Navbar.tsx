"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useCampaign } from "@/context/CampaignContext";
import { BarChart3, Upload, FileText, Sparkles, RefreshCw } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { summary, isSampleData, clearCampaign } = useCampaign();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/upload", label: "Upload CSV", icon: Upload },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      badge: summary ? `${summary.ads.length} Ads` : undefined,
    },
    {
      href: "/report",
      label: "AI Report",
      icon: Sparkles,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                Inter<span className="text-indigo-600 dark:text-indigo-400">seller</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                AI Ad Analyst
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-xs px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-300 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {summary && (
            <div className="hidden lg:flex items-center gap-2">
              {isSampleData && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                  Sample Data Mode
                </span>
              )}
              <button
                onClick={clearCampaign}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Clear current campaign from memory"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Data
              </button>
            </div>
          )}

          <ThemeToggle />

          <Link
            href="/upload"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-600/20 transition-all hover:shadow"
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
