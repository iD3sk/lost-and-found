import PageHeader from "@/components/PageHeader";
import NotificationList from "@/components/NotificationList";
import { NOTIFICATIONS } from "@/lib/mock-data";

export default function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" backHref="/home" />
      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-3 md:max-w-3xl">
        <NotificationList initial={NOTIFICATIONS} />
      </main>
    </>
  );
}