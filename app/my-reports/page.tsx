import { Suspense } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import ReportCard from "@/components/ReportCard";
import { browserUser } from "@/lib/server/auth/session";
import { listReportViews } from "@/lib/server/report-views";

type FilterTab = "ALL" | "lost" | "found" | "RESOLVED";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "lost", label: "Lost" },
  { key: "found", label: "Found" },
  { key: "RESOLVED", label: "Resolved" },
];

type SearchParams = Promise<{ tab?: string | string[] }>;

async function OwnedReports({ searchParams }: { searchParams: SearchParams }) {
  const [{ tab }, user] = await Promise.all([searchParams, browserUser()]);
  if (!user) {
    return <a href="/api/v1/auth/sso/login" className="text-sm font-semibold text-link">Sign in to view your reports</a>;
  }
  const activeTab = TABS.find(({ key }) => key === tab)?.key ?? "ALL";
  const myReports = await listReportViews({
    userNpm: user.npm,
    status: activeTab === "RESOLVED" ? "RESOLVED" : undefined,
    type: activeTab === "lost" ? "LOST" : activeTab === "found" ? "FOUND" : undefined,
  });

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.key === "ALL" ? "/my-reports" : `/my-reports?tab=${tab.key}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center px-4 rounded-full text-xs font-semibold transition shrink-0 ${
                active ? "bg-primary text-primary-foreground" : "bg-chip-inactive text-foreground/80"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {myReports.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
          {myReports.map((report) => <ReportCard key={report.id} report={report} />)}
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
    </>
  );
}

export default function MyReportsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="min-h-dvh bg-background pb-28 flex flex-col">
      <PageHeader title="My Reports" backHref="/home" />
      <main className="flex-1 px-4 pt-5 max-w-md md:max-w-3xl w-full mx-auto">
        <Suspense fallback={<p className="text-sm text-muted">Loading your reports…</p>}>
          <OwnedReports searchParams={searchParams} />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
