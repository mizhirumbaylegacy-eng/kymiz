import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostFilterTabs } from "@/components/dashboard/PostFilterTabs";
import { DeletePostButton } from "@/components/dashboard/DeletePostButton";
import { Plus, FileText, Pencil } from "lucide-react";
import type { Locale } from "@/i18n";
import type { Post, PostStatus } from "@/types/kymiz";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Posts" });
  return { title: t("title") };
}

const STATUS_BADGE: Record<PostStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: "draft",     color: "text-gray-400",  bg: "bg-gray-400/10" },
  scheduled: { label: "scheduled", color: "text-brand-blue", bg: "bg-brand-blue/10" },
  published: { label: "published", color: "text-green-400",  bg: "bg-green-400/10" },
  failed:    { label: "failed",    color: "text-brand-red",  bg: "bg-brand-red/10" },
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸",
  facebook:  "👥",
  twitter:   "𝕏",
  linkedin:  "💼",
  tiktok:    "🎵",
};

export default async function PostsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { filter?: string };
}) {
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Posts");

  const supabase = await createClient();

  // Get default workspace
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(1);

  if (!workspaces?.length) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <FileText size={48} className="mb-4 text-gray-600" />
        <h1 className="mb-2 text-2xl font-black text-white">
          {t("noWorkspace.title")}
        </h1>
        <p className="mb-6 text-gray-400">{t("noWorkspace.subtitle")}</p>
        <Link href="/settings" className="btn-primary">
          {t("noWorkspace.cta")}
        </Link>
      </main>
    );
  }

  const workspaceId = workspaces[0].id;
  const filter = searchParams?.filter ?? "all";

  let query = supabase
    .from("posts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("status", filter);
  }

  const { data: posts } = await query;
  const allPosts: Post[] = posts ?? [];

  return (
    <main className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-400">
            {workspaces[0].name}
          </p>
        </div>
        <Link href="/posts/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          {t("newPost")}
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="mb-6">
        <PostFilterTabs />
      </div>

      {/* Posts table */}
      {allPosts.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <FileText size={48} className="mb-4 text-gray-600" />
          <p className="text-lg font-black text-gray-400">{t("empty.title")}</p>
          <p className="mt-1 text-sm text-gray-600">{t("empty.subtitle")}</p>
          <Link href="/posts/new" className="btn-primary mt-6">
            {t("newPost")}
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          {/* Table header */}
          <div className="hidden grid-cols-[48px_1fr_140px_130px_100px_80px] gap-4 border-b border-[var(--border)] px-5 py-3 text-xs font-black uppercase tracking-wider text-gray-500 md:grid">
            <span></span>
            <span>{t("table.content")}</span>
            <span>{t("table.platforms")}</span>
            <span>{t("table.date")}</span>
            <span>{t("table.status")}</span>
            <span>{t("table.actions")}</span>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {allPosts.map((post) => {
              const cfg = STATUS_BADGE[post.status as PostStatus];
              const date = post.scheduled_at
                ? new Date(post.scheduled_at).toLocaleString(
                    locale === "es" ? "es-ES" : "en-US",
                    { dateStyle: "short", timeStyle: "short" }
                  )
                : new Date(post.created_at).toLocaleDateString(
                    locale === "es" ? "es-ES" : "en-US",
                    { dateStyle: "short" }
                  );

              return (
                <div
                  key={post.id}
                  className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[48px_1fr_140px_130px_100px_80px] md:items-center md:gap-4"
                >
                  {/* Image thumbnail */}
                  <div className="hidden md:block">
                    {post.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.image_url}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover ring-1 ring-[var(--border)]"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--muted)]">
                        <FileText size={14} className="text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0">
                    {post.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.image_url}
                        alt=""
                        className="mb-2 h-24 w-full rounded-lg object-cover md:hidden"
                      />
                    )}
                    <p className="line-clamp-2 text-sm text-white md:line-clamp-1">
                      {post.ai_generated && (
                        <span className="mr-1.5 text-brand-gold">✨</span>
                      )}
                      {post.content}
                    </p>
                  </div>

                  {/* Platforms */}
                  <div className="flex flex-wrap gap-1">
                    {(post.platforms as string[]).map((p) => (
                      <span
                        key={p}
                        className="rounded-md bg-[var(--muted)] px-1.5 py-0.5 text-xs"
                        title={p}
                      >
                        {PLATFORM_ICONS[p] ?? p}
                      </span>
                    ))}
                  </div>

                  {/* Date */}
                  <span className="text-xs text-gray-500">{date}</span>

                  {/* Status */}
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-black ${cfg.color} ${cfg.bg}`}
                  >
                    {t(`status.${post.status}`)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-brand-purple/10 hover:text-white"
                      title={t("edit")}
                    >
                      <Pencil size={14} />
                    </Link>
                    <DeletePostButton postId={post.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
