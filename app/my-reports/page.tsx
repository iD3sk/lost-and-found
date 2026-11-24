"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav"; // hapus kalau BottomNav sudah ada di layout.tsx
import ReportCard from "@/components/ReportCard";
import { REPORTS } from "@/lib/mock-data";
import { Bot } from "lucide-react";

type FilterTab = "ALL" | "lost" | "found" | "RESOLVED";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "lost", label: "Lost" },
  { key: "found", label: "Found" },
  { key: "RESOLVED", label: "Resolved" },
];

export default function MyReportsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  // Placeholder: sebelum auth/backend tersambung, semua mock report dianggap milik user
  const myReports = REPORTS.filter((report) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "RESOLVED") return report.status === "RESOLVED";
    return report.type === activeTab;
  });

  return (
    <div className="min-h-dvh bg-background pb-28 flex flex-col">
      <PageHeader title="My Reports" backHref="/" />

      <main className="flex-1 px-4 pt-5 max-w-md md:max-w-3xl w-full mx-auto">
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-chip-inactive text-foreground/80"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Reports Grid */}
        {myReports.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
            {myReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center text-center gap-3">
            <p className="text-sm text-muted">No reports found in this category.</p>
            <Link
              href="/reports/new"
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold"
            >
              + Create a Report
            </Link>
          </div>
        )}
        <BottomNav />
      </main>
      
    </div>
  );
}