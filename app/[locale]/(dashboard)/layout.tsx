import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/navigation";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { LogoutButton } from "@/components/layout/LogoutButton";
import type { Locale } from "@/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(params.locale as Locale);
  await getTranslations("Sidebar"); // preload for client components

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "—";
  const email = user?.email ?? "";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col border-r border-[var(--border)] bg-[var(--card)] md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[var(--border)] px-6">
          <Link href="/" className="text-xl font-black tracking-widest text-white">
            KY<span className="text-brand-gold">MIZ</span>
          </Link>
        </div>

        {/* Navigation — Client Component for active state */}
        <SidebarNav />

        {/* User info + logout */}
        <div className="border-t border-[var(--border)] p-4">
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-purple text-xs font-black text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <p className="truncate text-xs text-gray-500">{email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4 md:hidden">
          <Link href="/" className="text-xl font-black tracking-widest text-white">
            KY<span className="text-brand-gold">MIZ</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple text-xs font-black text-white">
              {initials}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
