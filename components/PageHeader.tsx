import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";

interface PageHeaderProps {
  title?: string;
  /** Kalau diisi, tombol panah kembali tampil dan menuju path ini */
  backHref?: string;
}

export default function PageHeader({ title, backHref }: PageHeaderProps) {
  return (
    <header className="safe-top rounded-b-3xl bg-primary text-primary-foreground shadow-lg">
      <div className="mx-auto grid h-16 w-full max-w-md grid-cols-[3rem_1fr_3rem] items-center px-2 md:max-w-3xl">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Kembali"
            className="flex h-11 w-11 items-center justify-center"
          >
            <ArrowLeft size={28} aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}

        <h1 className="truncate text-center text-xl font-bold">{title}</h1>

        <Link
          href="/notifications"
          aria-label="Notifikasi"
          className="flex h-11 w-11 items-center justify-center justify-self-end"
        >
          <Bell size={26} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}