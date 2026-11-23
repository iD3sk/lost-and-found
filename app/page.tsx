import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ReportCard from "@/components/ReportCard";
import { getRecentReports } from "@/lib/mock-data";

function SadFace() {
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#FFD959" stroke="#4A2C1A" strokeWidth="3" />
      <circle cx="34" cy="42" r="5" fill="#4A2C1A" />
      <circle cx="66" cy="42" r="5" fill="#4A2C1A" />
      <path d="M42 66 L50 59 L58 66" fill="none" stroke="#4A2C1A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HappyFace() {
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#FFD959" stroke="#4A2C1A" strokeWidth="3" />
      <circle cx="34" cy="40" r="5" fill="#4A2C1A" />
      <circle cx="66" cy="40" r="5" fill="#4A2C1A" />
      <path d="M32 58 H68 Q66 74 50 74 Q34 74 32 58 Z" fill="#FFFFFF" stroke="#4A2C1A" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function ActionCard({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center rounded-3xl border-4 border-logo-dark bg-secondary px-2 pb-3 pt-4 text-center shadow-lg active:scale-[0.97]"
    >
      {children}
      <span className="mt-1 font-display text-2xl leading-tight text-action-text">
        {label}
      </span>
    </Link>
  );
}

export default function HomePage() {
  const recent = getRecentReports(4);

  return (
    <>
      <PageHeader title="Lost & Found" brand />

      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-4 md:max-w-3xl">
        <h2 className="text-3xl font-bold leading-tight">
          What can I do for you today?
        </h2>

        {/* Langsung ke form: type dibawa lewat query string */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ActionCard href="/reports/new?type=lost" label="I lost something">
            <SadFace />
          </ActionCard>
          <ActionCard href="/reports/new?type=found" label="I found something">
            <HappyFace />
          </ActionCard>
        </div>

        <div className="mt-6 flex items-baseline justify-between">
          <h2 className="text-xl font-bold">Recent Reports</h2>
          <Link href="/explore" className="text-sm font-semibold text-link">
            View all
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {recent.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      </main>
    </>
  );
}