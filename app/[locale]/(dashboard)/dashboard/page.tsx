import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";
import { Plus, FileText, Clock, CheckCircle, Wifi } from "lucide-react";
import type { Locale } from "@/i18n";
import type { Post, PostStatus } from "@/types/kymiz";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  return { title: t("title") };
}

const STATUS_CONFIG: Record<
  PostStatus,
  { label: string; color: string; bg: string }
> = {
  draft:     { label: "draft",     color: "text-gray-400",   bg: "bg-gray-400/10" },
  scheduled: { label: "scheduled", color: "text-brand-blue",  bg: "bg-brand-blue/10" },
  published: { label: "published", color: "text-green-400",   bg: "bg-green-400/10" },
  failed:    { label: "failed",    color: "text-brand-red",   bg: "bg-brand-red/10" },
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸",
  facebook:  "👥",
  twitter:   "𝕏",
  linkedin:  "💼",
  tiktok:    "🎵",
};

export default async function DashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Usuario";

  // Get workspaces
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true });

  // Empty state — no workspace yet
  if (!workspaces?.length) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-purple/20">
          <Wifi size={36} className="text-brand-purple" />
        </div>
        <h1 className="mb-2 text-3xl font-black text-white">
          {t("noWorkspace.title")}, {displayName}! 👋
        </h1>
        <p className="mb-8 max-w-md text-gray-400">
          {t("noWorkspace.subtitle")}
        </p>
        <Link href="/settings" className="btn-primary px-8 py-3 text-base">
          {t("noWorkspace.cta")}
        </Link>
      </main>
    );
  }

  const defaultWorkspace = workspaces[0];

  // Get posts for this workspace
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("workspace_id", defaultWorkspace.id)
    .order("created_at", { ascending: false });

  const allPosts: Post[] = posts ?? [];

  const stats = {
    total:     allPosts.length,
    scheduled: allPosts.filter((p) => p.status === "scheduled").length,
    published: allPosts.filter((p) => p.status === "published").length,
  };

  const recentPosts = allPosts.slice(0, 5);

  return (
    <main className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">
            {t("title")}, {displayName} 👋
          </h1>
          <p className="mt-1 text-gray-400">
            {defaultWorkspace.name}
          </p>
        </div>
        <Link href="/posts/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          {t("newPost")}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple/20">
            <FileText size={22} className="text-brand-purple" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">{t("stats.totalPosts")}</p>
            <p className="text-3xl font-black text-white">{stats.total}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/20">
            <Clock size={22} className="text-brand-blue" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">{t("stats.scheduled")}</p>
            <p className="text-3xl font-black text-brand-blue">{stats.scheduled}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-400/10">
            <CheckCircle size={22} className="text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">{t("stats.published")}</p>
            <p className="text-3xl font-black text-green-400">{stats.published}</p>
          </div>
        </div>
      </div>

      {/* Recent posts */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-white">{t("recentPosts")}</h2>
          <Link href="/posts" className="text-sm text-brand-gold hover:underline">
            {t("viewAll")} →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="card flex flex-col items-center py-12 text-center">
            <FileText size={36} className="mb-3 text-gray-600" />
            <p className="font-medium text-gray-400">{t("noPosts")}</p>
            <p className="mt-1 text-sm text-gray-600">{t("noPostsHint")}</p>
            <Link href="/posts/new" className="btn-primary mt-4 text-sm">
              {t("newPost")}
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="divide-y divide-[var(--border)]">
              {recentPosts.map((post) => {
                const cfg = STATUS_CONFIG[post.status as PostStatus];
                return (
                  <div
                    key={post.id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm text-white">
                        {post.content}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex gap-1">
                          {(post.platforms as string[]).map((p) => (
                            <span key={p} className="text-xs">
                              {PLATFORM_ICONS[p] ?? p}
                            </span>
                          ))}
                        </div>
                        {post.scheduled_at && (
                          <span className="text-xs text-gray-500">
                            {new Date(post.scheduled_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-black ${cfg.color} ${cfg.bg}`}
                    >
                      {t(`status.${post.status}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
