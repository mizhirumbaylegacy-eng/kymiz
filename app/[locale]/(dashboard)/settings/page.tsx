import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { UpdateProfileForm } from "@/components/dashboard/UpdateProfileForm";
import { CreateWorkspaceForm } from "@/components/dashboard/CreateWorkspaceForm";
import { ConnectLinkedInButton } from "@/components/dashboard/ConnectLinkedInButton";
import { Layers, Trash2, Share2, CheckCircle, AlertCircle } from "lucide-react";
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
  searchParams,
}: {
  params: { locale: string };
  searchParams: { linkedin?: string; linkedin_error?: string; account?: string };
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

  // Load social accounts for all workspaces
  const workspaceIds = workspaces?.map((w) => w.id) ?? [];
  const { data: socialAccounts } = workspaceIds.length
    ? await supabase
        .from("social_accounts")
        .select("*")
        .in("workspace_id", workspaceIds)
    : { data: [] };

  const displayName = user?.user_metadata?.full_name ?? "";
  const email       = user?.email ?? "";

  // LinkedIn connection state from OAuth redirect
  const linkedinSuccess = searchParams.linkedin === "connected";
  const linkedinError   = searchParams.linkedin_error;
  const linkedinAccount = searchParams.account ?? "";

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">{t("title")}</h1>
        <p className="mt-1 text-gray-400">{t("subtitle")}</p>
      </div>

      {/* LinkedIn OAuth banners */}
      {linkedinSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 max-w-2xl">
          <CheckCircle size={18} className="shrink-0 text-green-400" />
          <p className="text-sm text-green-300">
            LinkedIn conectado correctamente
            {linkedinAccount && <strong className="ml-1">({decodeURIComponent(linkedinAccount)})</strong>}
          </p>
        </div>
      )}
      {linkedinError && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-brand-red/30 bg-brand-red/10 px-5 py-4 max-w-2xl">
          <AlertCircle size={18} className="shrink-0 text-brand-red" />
          <p className="text-sm text-brand-red">
            Error al conectar LinkedIn: <code className="font-mono">{decodeURIComponent(linkedinError)}</code>
          </p>
        </div>
      )}

      <div className="grid max-w-2xl gap-8">

        {/* Profile */}
        <section className="card">
          <h2 className="mb-6 text-lg font-black text-white">{t("profileSection")}</h2>
          <UpdateProfileForm initialName={displayName} email={email} />
        </section>

        {/* Workspaces + Social accounts */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-brand-purple" />
              <h2 className="text-lg font-black text-white">{t("workspacesSection")}</h2>
            </div>
            <CreateWorkspaceForm />
          </div>

          {!workspaces?.length ? (
            <div className="card flex flex-col items-center py-8 text-center">
              <Layers size={36} className="mb-3 text-gray-600" />
              <p className="text-gray-400">{t("noWorkspaces")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workspaces.map((ws) => {
                const wsAccounts = (socialAccounts ?? []).filter(
                  (sa) => sa.workspace_id === ws.id
                );
                const linkedinAccount = wsAccounts.find(
                  (sa) => sa.platform === "linkedin"
                );

                return (
                  <div key={ws.id} className="card space-y-4">
                    {/* Workspace header */}
                    <div className="flex items-center justify-between">
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
                      <button
                        disabled
                        className="rounded-lg p-2 text-gray-600 opacity-40"
                        title={t("deleteWorkspaceDisabled")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Social accounts for this workspace */}
                    <div className="border-t border-[var(--border)] pt-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Share2 size={14} className="text-gray-500" />
                        <p className="text-xs font-black uppercase tracking-wider text-gray-500">
                          {t("socialAccounts")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <ConnectLinkedInButton
                          workspaceId={ws.id}
                          connected={!!linkedinAccount}
                          accountName={linkedinAccount?.account_name}
                        />
                        {/* Future: Instagram, Facebook, Twitter, TikTok */}
                        <span className="flex items-center rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-gray-600">
                          Instagram · Próximamente
                        </span>
                        <span className="flex items-center rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-gray-600">
                          X · Próximamente
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Danger zone */}
        <section className="card border-brand-red/30">
          <h2 className="mb-2 text-lg font-black text-white">{t("dangerZone")}</h2>
          <p className="mb-4 text-sm text-gray-400">{t("deleteWarning")}</p>
          <button
            disabled
            className="cursor-not-allowed rounded-lg border border-brand-red/50 px-4 py-2 text-sm font-black text-brand-red/50"
          >
            {t("deleteAccount")}
          </button>
        </section>
      </div>
    </main>
  );
}
