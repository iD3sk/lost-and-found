import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";

interface PageHeaderProps {
  title?: string;
  /** Kalau diisi, tombol panah kembali tampil dan menuju path ini */
  backHref?: string;
  /** Mode merek: judul memakai font logo + ikon kaca pembesar kecil di kiri */
  brand?: boolean;
}

function LogoMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
      <line x1="10" y1="40" x2="22" y2="26" stroke="#F5EEDD" strokeWidth="5" strokeLinecap="round" />
      <circle cx="28" cy="19" r="13" fill="#84B3CE" stroke="#F5EEDD" strokeWidth="3.5" />
      <path
        d="M28 10 L30.5 16.5 L37 19 L30.5 21.5 L28 28 L25.5 21.5 L19 19 L25.5 16.5 Z"
        fill="#FEF0B6"
      />
    </svg>
  );
}

export default function PageHeader({ title, backHref, brand }: PageHeaderProps) {
  return (
    <header className="safe-top sticky top-0 z-40 rounded-b-3xl bg-primary text-primary-foreground shadow-lg">
      <div className="mx-auto grid h-16 w-full max-w-md grid-cols-[3rem_1fr_3rem] items-center px-2 md:max-w-3xl">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Kembali"
            className="flex h-11 w-11 items-center justify-center"
          >
            <ArrowLeft size={28} aria-hidden="true" />
          </Link>
        ) : brand ? (
          <span className="flex h-11 w-11 items-center justify-center">
            <LogoMark />
          </span>
        ) : (
          <span />
        )}

        <h1
          className={`truncate text-center ${
            brand ? "font-logo text-2xl" : "text-xl font-bold"
          }`}
        >
          {title}
        </h1>

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