"use client";

import { signOut } from "@/app/actions/auth";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const t = useTranslations("Sidebar");
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-500 transition-colors hover:bg-[var(--muted)] hover:text-brand-red"
      >
        {t("logout")}
      </button>
    </form>
  );
}
