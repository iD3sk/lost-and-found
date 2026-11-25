import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import ExploreView from "@/components/ExploreView";
import BottomNav from "@/components/BottomNav";
import { campusLocationOptions, listReportViews } from "@/lib/server/report-views";

async function ExploreReports() {
  const [reports, locations] = await Promise.all([listReportViews(), campusLocationOptions()]);
  return <ExploreView reports={reports} locations={locations} />;
}

export default function ExplorePage() {
  return (
    <>
      <PageHeader title="Explore" backHref="/home" />
      <Suspense fallback={<p className="mx-auto mt-4 max-w-md px-4 text-sm text-muted">Loading reports…</p>}>
        <ExploreReports />
      </Suspense>
      <BottomNav />
    </>
  );
}
