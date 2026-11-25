import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Calendar, MapPin, MessageCircle, Package } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { StatusPill, TypeBadge } from "@/components/ReportBadges";
import { formatDate, formatDateTime } from "@/lib/report-data";
import { findReportView } from "@/lib/server/report-views";

type Params = Promise<{ id: string }>;

// params dibaca di dalam <Suspense> karena cacheComponents aktif.
export default function ReportDetailPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PageHeader title="Report Detail" backHref="/explore" />}>
      <ReportDetail params={params} />
    </Suspense>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0 text-primary">{icon}</div>
      <div className="min-w-0">
        <dt className="text-sm font-bold">{label}</dt>
        <dd className="break-words">{children}</dd>
      </div>
    </div>
  );
}

async function ReportDetail({ params }: { params: Params }) {
  const { id } = await params;
  const report = await findReportView(id);
  if (!report) notFound();

  const isLost = report.type === "lost";

  return (
    <>
      <PageHeader title="Report Detail" backHref="/explore" />

      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-4 md:max-w-3xl">
        {/* Galeri foto (geser ke samping kalau lebih dari satu) */}
        <div className="relative">
          {report.images.length > 0 ? (
            <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-3xl">
              {report.images.map((src, i) => (
                <li key={src} className="aspect-[4/3] w-full shrink-0 snap-center bg-border-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${report.itemName} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="aspect-[4/3] w-full rounded-3xl bg-border-soft" />
          )}
          <TypeBadge type={report.type} className="absolute right-3 top-3" />
          {report.images.length > 1 ? (
            <p className="mt-1 text-center text-xs text-muted">
              {report.images.length} photos — swipe to see more
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <h2 className="text-2xl font-bold leading-tight">{report.itemName}</h2>
          <StatusPill report={report} className="mt-1 shrink-0" />
        </div>
        <p className="mt-1 text-sm text-muted">Category: {report.category}</p>

        <p className="mt-4 whitespace-pre-line">{report.description}</p>

        <dl className="mt-5 flex flex-col gap-4 rounded-3xl bg-card p-4 shadow-md">
          <InfoRow
            icon={<MapPin size={20} aria-hidden="true" />}
            label={isLost ? "Last seen at" : "Found at"}
          >
            {report.locations.join(", ")}
            {report.locationDetail ? ` — ${report.locationDetail}` : ""}
          </InfoRow>

          <InfoRow
            icon={<Calendar size={20} aria-hidden="true" />}
            label={isLost ? "Possibly lost" : "Found on"}
          >
            {report.eventTimeKnown === false ? formatDate(report.eventDate) : formatDateTime(report.eventDate)}
            {isLost && report.eventUntil ? ` – ${formatDateTime(report.eventUntil)}` : ""}
          </InfoRow>

          {!isLost && report.currentPosition ? (
            <InfoRow icon={<Package size={20} aria-hidden="true" />} label="Item is currently">
              {report.currentPosition}
            </InfoRow>
          ) : null}

          <InfoRow icon={<MessageCircle size={20} aria-hidden="true" />} label="Contact">
            {report.contact}
          </InfoRow>
        </dl>

        <p className="mt-4 text-xs text-muted">
          Posted {formatDateTime(report.createdAt)}
        </p>
      </main>
    </>
  );
}
