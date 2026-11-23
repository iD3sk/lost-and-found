import type { Report, ReportType } from "@/lib/mock-data";

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
    label = "Resolved";
    style = "bg-accent text-primary";
  } else if (report.status === "CLAIM_PENDING") {
    label = "Claim Pending";
    style = "bg-highlight text-primary";
  } else if (report.type === "lost") {
    label = "Still Lost";
    style = "bg-status-lost text-white";
  } else {
    label = "Unclaimed";
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