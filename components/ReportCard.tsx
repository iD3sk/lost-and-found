import Link from "next/link";
import { MapPin } from "lucide-react";

export type ReportType = "lost" | "found";
export type ReportStatus = "still_lost" | "resolved";

export interface ReportCardProps {
  id: string | number;
  title: string;
  location: string;
  type: ReportType;
  status?: ReportStatus;
  imageUrl?: string | null;
}

const TYPE_LABEL: Record<ReportType, string> = {
  lost: "Lost Item",
  found: "Found Item",
};

const TYPE_STYLE: Record<ReportType, string> = {
  lost: "bg-badge-lost text-white",
  found: "bg-badge-found text-primary",
};

const STATUS_LABEL: Record<ReportStatus, string> = {
  still_lost: "Still Lost",
  resolved: "Resolved",
};

const STATUS_STYLE: Record<ReportStatus, string> = {
  still_lost: "bg-status-lost text-white",
  resolved: "bg-accent text-primary",
};

export default function ReportCard({
  id,
  title,
  location,
  type,
  status = "still_lost",
  imageUrl,
}: ReportCardProps) {
  return (
    <Link
      href={`/reports/${id}`}
      className="flex flex-col rounded-3xl bg-card p-3 shadow-md active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-border-soft">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
        <span
          className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_STYLE[type]}`}
        >
          {TYPE_LABEL[type]}
        </span>
      </div>

      <h3 className="mt-2 truncate text-base font-bold">{title}</h3>

      <p className="mt-0.5 flex items-center gap-1 text-sm">
        <MapPin size={14} aria-hidden="true" className="shrink-0" />
        <span className="truncate">{location}</span>
      </p>

      <span
        className={`mt-2 w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}
      >
        {STATUS_LABEL[status]}
      </span>
    </Link>
  );
}