import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { UpdateProfileForm } from "@/components/dashboard/UpdateProfileForm";
import { CreateWorkspaceForm } from "@/components/dashboard/CreateWorkspaceForm";
import { Layers, Trash2 } from "lucide-react";
import type { Locale } from "@/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Settings" });
  return { title: t("title") };
}

export default async function SettingsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Settings");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true });

  const displayName = user?.user_metadata?.full_name ?? "";
  const email = user?.email ?? "";

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">{t("title")}</h1>
        <p className="mt-1 text-gray-400">{t("subtitle")}</p>
      </div>

      <div className="grid max-w-2xl gap-8">
        {/* Profile section */}
        <section className="card">
          <h2 className="mb-6 text-lg font-black text-white">{t("profileSection")}</h2>
          <UpdateProfileForm initialName={displayName} email={email} />
        </section>

        {/* Workspaces section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-brand-purple" />
              <h2 className="text-lg font-black text-white">
                {t("workspacesSection")}
              </h2>
            </div>
            <CreateWorkspaceForm />
          </div>

          {!workspaces?.length ? (
            <div className="card flex flex-col items-center py-8 text-center">
              <Layers size={36} className="mb-3 text-gray-600" />
              <p className="text-gray-400">{t("noWorkspaces")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="card flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 text-sm font-black text-brand-purple">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-white">{ws.name}</p>
                      {ws.description && (
                        <p className="text-xs text-gray-500">{ws.description}</p>
                      )}
                    </div>
                  </div>
                  {/* Delete is intentionally a placeholder — destructive action */}
                  <button
                    disabled
                    className="rounded-lg p-2 text-gray-600 opacity-40"
                    title={t("deleteWorkspaceDisabled")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Danger zone */}
        <section className="card border-brand-red/30">
          <h2 className="mb-2 text-lg font-black text-white">{t("dangerZone")}</h2>
          <p className="mb-4 text-sm text-gray-400">{t("deleteWarning")}</p>
          <button
            disabled
            className="rounded-lg border border-brand-red/50 px-4 py-2 text-sm font-black text-brand-red/50 cursor-not-allowed"
          >
            {t("deleteAccount")}
          </button>
        </section>
      </div>
    </main>
  );
}
