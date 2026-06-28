"use client";

import {
  LayoutDashboard,
  FileText,
  Plus,
  BarChart2,
  Settings,
  CreditCard,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/navigation";

const NAV_ITEMS = [
  { href: "/dashboard",  icon: LayoutDashboard, key: "home" },
  { href: "/posts",      icon: FileText,         key: "posts" },
  { href: "/analytics",  icon: BarChart2,         key: "analytics" },
  { href: "/settings",   icon: Settings,          key: "settings" },
  { href: "/billing",    icon: CreditCard,         key: "billing" },
] as const;

export function SidebarNav() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-4">
      {/* New Post — highlighted */}
      <Link
        href="/posts/new"
        className="mb-3 flex items-center gap-3 rounded-lg border border-brand-gold/40 bg-brand-gold/10 px-3 py-2.5 text-sm font-black text-brand-gold transition-colors hover:bg-brand-gold/20"
      >
        <Plus size={15} />
        {t("newPost")}
      </Link>

      {NAV_ITEMS.map(({ href, icon: Icon, key }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive(href)
              ? "bg-brand-purple/20 text-white"
              : "text-gray-400 hover:bg-[var(--muted)] hover:text-white"
          }`}
        >
          <Icon size={15} />
          {t(key)}
        </Link>
      ))}
    </nav>
  );
}
