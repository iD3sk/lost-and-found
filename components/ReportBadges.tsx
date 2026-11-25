import type { Report, ReportType } from "@/lib/report-data";

export function TypeBadge({
  type,
  className = "",
}: {
  type: ReportType;
  className?: string;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        type === "lost" ? "bg-badge-lost text-white" : "bg-badge-found text-primary"
      } ${className}`}
    >
      {type === "lost" ? "Lost Item" : "Found Item"}
    </span>
  );
}

// Label status: OPEN -> Still Lost, CLAIM_PENDING -> Claim Pending, RESOLVED -> Found
// (sama seperti pill "Still Lost" di Figma, baik untuk laporan lost maupun found)
export function StatusPill({
  report,
  className = "",
}: {
  report: Pick<Report, "type" | "status">;
  className?: string;
}) {
  let label: string;
  let style: string;

  if (report.status === "RESOLVED") {
    label = "Found";
    style = "bg-accent text-primary";
  } else if (report.status === "CLAIM_PENDING") {
    label = "Claim Pending";
    style = "bg-highlight text-primary";
  } else {
    label = "Still Lost";
    style = "bg-status-lost text-white";
  }

  return (
    <span
      className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${style} ${className}`}
    >
      {label}
    </span>
  );
}
