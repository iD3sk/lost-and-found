import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import NotificationList from "@/components/NotificationList";
import { browserUser } from "@/lib/server/auth/session";
import { notificationViews } from "@/lib/server/report-views";

async function Inbox() {
  const user = await browserUser();
  if (!user) {
    return <a href="/api/v1/auth/sso/login" className="text-sm font-semibold text-link">Sign in to view notifications</a>;
  }
  return <NotificationList initial={await notificationViews(user.npm)} />;
}

export default function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" backHref="/home" />
      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-3 md:max-w-3xl">
        <Suspense fallback={<p className="text-sm text-muted">Loading notifications…</p>}>
          <Inbox />
        </Suspense>
      </main>
    </>
  );
}
