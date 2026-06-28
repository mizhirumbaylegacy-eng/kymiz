import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { BarChart2, TrendingUp, Eye, Heart, Share2, MousePointerClick } from "lucide-react";
import type { Locale } from "@/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Analytics" });
  return { title: t("title") };
}

export default async function AnalyticsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Analytics");

  const supabase = await createClient();

  // Get default workspace
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1);

  const workspaceId = workspaces?.[0]?.id ?? null;

  // Get post IDs for analytics
  let totals = { impressions: 0, clicks: 0, likes: 0, shares: 0 };
  let totalPosts = 0;
  let publishedPosts = 0;

  if (workspaceId) {
    const { data: posts } = await supabase
      .from("posts")
      .select("id, status")
      .eq("workspace_id", workspaceId);

    totalPosts = posts?.length ?? 0;
    publishedPosts = posts?.filter((p) => p.status === "published").length ?? 0;

    const postIds = posts?.map((p) => p.id) ?? [];

    if (postIds.length > 0) {
      const { data: analyticsRows } = await supabase
        .from("analytics")
        .select("impressions, clicks, likes, shares")
        .in("post_id", postIds);

      totals = (analyticsRows ?? []).reduce(
        (acc, row) => ({
          impressions: acc.impressions + (row.impressions ?? 0),
          clicks:      acc.clicks + (row.clicks ?? 0),
          likes:       acc.likes + (row.likes ?? 0),
          shares:      acc.shares + (row.shares ?? 0),
        }),
        totals
      );
    }
  }

  const hasData = totals.impressions + totals.likes + totals.clicks + totals.shares > 0;

  const metricCards = [
    { key: "impressions", value: totals.impressions, icon: Eye,               color: "text-brand-blue",   bg: "bg-brand-blue/10" },
    { key: "likes",       value: totals.likes,       icon: Heart,             color: "text-brand-red",    bg: "bg-brand-red/10" },
    { key: "clicks",      value: totals.clicks,      icon: MousePointerClick, color: "text-brand-gold",   bg: "bg-brand-gold/10" },
    { key: "shares",      value: totals.shares,      icon: Share2,            color: "text-green-400",    bg: "bg-green-400/10" },
  ];

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">{t("title")}</h1>
        <p className="mt-1 text-gray-400">{t("subtitle")}</p>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(({ key, value, icon: Icon, color, bg }) => (
          <div key={key} className="card flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">{t(`metrics.${key}`)}</p>
              <p className={`text-3xl font-black ${color}`}>
                {value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Posts summary */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <BarChart2 size={18} className="text-brand-purple" />
            <h2 className="text-lg font-black text-white">{t("postsOverview")}</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-4 py-3">
              <span className="text-sm text-gray-300">{t("totalPosts")}</span>
              <span className="font-black text-white">{totalPosts}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-4 py-3">
              <span className="text-sm text-gray-300">{t("publishedPosts")}</span>
              <span className="font-black text-green-400">{publishedPosts}</span>
            </div>
          </div>
        </div>

        {!hasData && (
          <div className="card flex flex-col items-center justify-center py-10 text-center">
            <TrendingUp size={40} className="mb-4 text-gray-600" />
            <p className="font-black text-gray-400">{t("noData.title")}</p>
            <p className="mt-1 text-sm text-gray-600">{t("noData.subtitle")}</p>
          </div>
        )}
      </div>
    </main>
  );
}
