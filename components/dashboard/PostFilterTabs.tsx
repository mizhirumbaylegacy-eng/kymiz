"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/lib/navigation";
import { useSearchParams } from "next/navigation";

const FILTERS = ["all", "draft", "scheduled", "published", "failed"] as const;

const STATUS_COLORS: Record<string, string> = {
  draft:     "text-gray-400",
  scheduled: "text-brand-blue",
  published: "text-green-400",
  failed:    "text-brand-red",
};

export function PostFilterTabs() {
  const t = useTranslations("Posts");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("filter") ?? "all";

  const setFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filter === "all") params.delete("filter");
    else params.set("filter", filter);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-[var(--muted)] p-1">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          onClick={() => setFilter(filter)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            current === filter
              ? "bg-[var(--card)] text-white shadow-sm"
              : `${STATUS_COLORS[filter] ?? "text-gray-400"} hover:text-white`
          }`}
        >
          {t(`filter.${filter}`)}
        </button>
      ))}
    </div>
  );
}
