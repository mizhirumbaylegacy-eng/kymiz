import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewPostShell } from "@/components/dashboard/NewPostShell";
import type { Locale } from "@/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "NewPost" });
  return { title: t("title") };
}

export default async function NewPostPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale as Locale);

  const supabase = await createClient();
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(1);

  const tp = await getTranslations("Posts");

  if (!workspaces?.length) {
    return (
      <main className="p-6 lg:p-8">
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="mb-4 text-gray-400">{tp("noWorkspace.subtitle")}</p>
          <Link href="/settings" className="btn-primary">
            {tp("noWorkspace.cta")}
          </Link>
        </div>
      </main>
    );
  }

  const workspaceId = workspaces[0].id;

  // Check if LinkedIn is connected for this workspace
  const { data: linkedinAccount } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("platform", "linkedin")
    .maybeSingle();

  return (
    <NewPostShell
      workspaceId={workspaceId}
      postsTitle={tp("title")}
      linkedinConnected={!!linkedinAccount}
    />
  );
}
