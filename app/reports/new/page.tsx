import { Suspense } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ReportForm from "@/components/ReportForm";

type SearchParams = Promise<{ type?: string }>;

// searchParams dibaca di dalam <Suspense> karena next.config.ts
// mengaktifkan cacheComponents (data runtime harus dibungkus Suspense).
export default function NewReportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<PageHeader title="New Report" backHref="/home" />}>
      <NewReportContent searchParams={searchParams} />
    </Suspense>
  );
}

async function NewReportContent({ searchParams }: { searchParams: SearchParams }) {
  const { type } = await searchParams;

  // Ada ?type=lost atau ?type=found -> langsung tampilkan form
  if (type === "lost" || type === "found") {
    return (
      <>
        <PageHeader
          title={type === "lost" ? "Lost Form" : "Found Form"}
          backHref="/home"
        />
        <ReportForm type={type} />
      </>
    );
  }

  // Tanpa ?type (datang dari tombol +) -> pilih dulu
  return (
    <>
      <PageHeader title="New Report" backHref="/home" />
      <main className="mx-auto w-full max-w-md px-4 pt-6 md:max-w-3xl">
        <h2 className="text-3xl font-bold leading-tight">
          What would you like to report?
        </h2>
        <div className="mt-5 flex flex-col gap-3">
          <Link
            href="/reports/new?type=lost"
            className="flex min-h-14 items-center justify-center rounded-3xl border-4 border-logo-dark bg-secondary font-display text-2xl text-action-text shadow-lg active:scale-[0.98]"
          >
            I lost something
          </Link>
          <Link
            href="/reports/new?type=found"
            className="flex min-h-14 items-center justify-center rounded-3xl border-4 border-logo-dark bg-secondary font-display text-2xl text-action-text shadow-lg active:scale-[0.98]"
          >
            I found something
          </Link>
        </div>
      </main>
    </>
  );
}