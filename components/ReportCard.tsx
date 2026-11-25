import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Report } from "@/lib/report-data";
import { StatusPill, TypeBadge } from "@/components/ReportBadges";

// Pemakaian: <ReportCard report={r} />  (BUKAN id/title/location terpisah)
export default function ReportCard({ report }: { report: Report }) {
  const cover = report.images[0];
  const extra = report.locations.length - 1;

  return (
    <Link
      href={`/reports/${report.id}`}
      className="flex flex-col rounded-3xl bg-card p-3 shadow-md active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-border-soft">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={report.itemName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
        <TypeBadge type={report.type} className="absolute right-2 top-2" />
      </div>

      <h3 className="mt-2 truncate text-base font-bold">{report.itemName}</h3>

      <p className="mt-0.5 flex items-center gap-1 text-sm">
        <MapPin size={14} aria-hidden="true" className="shrink-0" />
        <span className="truncate">
          {report.locations[0]}
          {extra > 0 ? ` +${extra}` : ""}
        </span>
      </p>

      <StatusPill report={report} className="mt-2" />
    </Link>
  );
}
