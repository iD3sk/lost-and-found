import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function ReportNotFound() {
  return (
    <>
      <PageHeader title="Report Detail" backHref="/explore" />
      <main className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-4 pt-16 text-center">
        <p className="text-xl font-bold">Report not found</p>
        <p className="text-sm text-muted">The report may have been removed.</p>
        <Link
          href="/explore"
          className="mt-2 flex min-h-11 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground"
        >
          Back to Explore
        </Link>
      </main>
    </>
  );
}