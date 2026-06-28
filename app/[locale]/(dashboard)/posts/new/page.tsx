import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewPostForm } from "@/components/dashboard/NewPostForm";
import { ArrowLeft } from "lucide-react";
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
  const t = await getTranslations("NewPost");
  const tp = await getTranslations("Posts");

  const supabase = await createClient();
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(1);

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

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href="/posts"
          className="mb-4 flex w-fit items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          {tp("title")}
        </Link>
        <h1 className="text-3xl font-black text-white">{t("title")}</h1>
        <p className="mt-1 text-gray-400">{t("subtitle")}</p>
      </div>

      <NewPostForm workspaceId={workspaceId} />
    </main>
  );
}
