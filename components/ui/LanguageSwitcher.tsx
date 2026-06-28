"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/navigation";
import { locales, type Locale } from "@/i18n";

const labels: Record<Locale, string> = {
  es: "ES",
  en: "EN",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (next: Locale) => {
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="flex items-center rounded-lg border border-[var(--border)] p-0.5">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`rounded-md px-2.5 py-1 text-xs font-black transition-all ${
            locale === loc
              ? "bg-brand-purple text-white"
              : "text-gray-400 hover:text-white"
          }`}
          aria-label={`Switch to ${loc}`}
        >
          {labels[loc]}
        </button>
      ))}
    </div>
  );
}
