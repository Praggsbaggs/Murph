import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CampaignProvider } from "@/context/CampaignContext";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Murph | AI Ad Campaign Analyst",
  description:
    "Upload your ad campaign CSV, automatically compute KPIs (CTR, CPC, CPA, ROAS), and generate plain-language AI post-mortems with actionable A/B test recommendations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        <CampaignProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-500 bg-white/50 dark:bg-slate-950/50 print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>Murph &bull; Digital Marketing Course Project</p>
              <p className="text-slate-400 dark:text-slate-600">
                100% In-Memory Processing &bull; No files stored &bull; Powered by Gemini 3.8 Flash
              </p>
            </div>
          </footer>
        </CampaignProvider>
      </body>
    </html>
  );
}
