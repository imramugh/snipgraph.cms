"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Content", match: (path: string) => path === "/admin" || path.startsWith("/admin/pages") },
  { href: "/admin/structure", label: "Structure", match: (path: string) => path.startsWith("/admin/structure") },
  { href: "/admin/media", label: "Media", match: (path: string) => path.startsWith("/admin/media") },
  { href: "/admin/settings", label: "Site settings", match: (path: string) => path.startsWith("/admin/settings") },
  { href: "/reference", label: "Reference catalog", match: (path: string) => path.startsWith("/reference") },
];

export function AdminNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin navigation">
      {links.map((link) => (
        <Link className={link.match(pathname) ? "nav-active" : undefined} href={link.href} key={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
