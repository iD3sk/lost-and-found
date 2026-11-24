"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, Home, Plus, Search, User } from "lucide-react";

const LEFT = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/explore", label: "Explore", Icon: Search },
];
const RIGHT = [
  { href: "/my-reports", label: "My Reports", Icon: Archive },
  { href: "/profile", label: "Profile", Icon: User },
];
const ADD_HREF = "/reports/new";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-opacity ${
        active ? "opacity-100" : "opacity-70"
      }`}
    >
      <Icon size={26} strokeWidth={2} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md md:max-w-3xl"
    >
      <div className="relative flex items-end rounded-t-3xl bg-primary px-2 pt-3 text-primary-foreground safe-bottom">
        {LEFT.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}

        {}
        <div className="w-20 shrink-0" aria-hidden="true" />

        {RIGHT.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}

        {}
        <Link
          href={ADD_HREF}
          aria-label="Buat laporan baru"
          className="absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-background bg-[#D9D9D9] text-primary shadow-md active:scale-95"
        >
          <Plus size={36} strokeWidth={3} aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}