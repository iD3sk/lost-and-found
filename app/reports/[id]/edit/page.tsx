import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import EditReportForm from "@/components/EditReportForm";
import PageHeader from "@/components/PageHeader";
import { browserUser } from "@/lib/server/auth/session";
import { campusLocationOptions, findReportView } from "@/lib/server/report-views";

type Params = Promise<{ id: string }>;

export default function EditReportPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PageHeader title="Edit Report" backHref="/my-reports" />}>
      <EditReport params={params} />
    </Suspense>
  );
}

async function EditReport({ params }: { params: Params }) {
  const [{ id }, user] = await Promise.all([params, browserUser()]);
  if (!user) redirect("/");
  const detail = await findReportView(id);
  if (!detail) notFound();

  const { ownerNpm, ...report } = detail;
  if (ownerNpm !== user.npm) notFound();
  const locations = await campusLocationOptions();

  return (
    <>
      <PageHeader title="Edit Report" backHref={`/reports/${id}`} />
      <main className="mx-auto w-full max-w-md px-4 pb-12 pt-4 md:max-w-3xl">
        <EditReportForm report={report} locations={locations} />
      </main>
    </>
  );
}
