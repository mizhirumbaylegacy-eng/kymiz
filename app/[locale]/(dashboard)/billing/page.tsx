import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { UpgradeButton } from "@/components/dashboard/UpgradeButton";
import { PLANS } from "@/lib/stripe";
import { CheckCircle, CreditCard } from "lucide-react";
import type { Locale } from "@/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Billing" });
  return { title: t("title") };
}

const PLAN_LABEL: Record<string, string> = {
  free:    "Free",
  starter: "Starter",
  pro:     "Pro",
  agency:  "Agency",
};

export default async function BillingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Billing");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get current plan from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user?.id ?? "")
    .single();

  const currentPlan = (profile?.plan ?? "free") as string;

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">{t("title")}</h1>
        <p className="mt-1 text-gray-400">{t("subtitle")}</p>
      </div>

      <div className="max-w-4xl space-y-8">

        {/* Current plan banner */}
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple/20">
            <CreditCard size={22} className="text-brand-purple" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-400">{t("currentPlan")}</p>
            <p className="text-2xl font-black text-white">
              {PLAN_LABEL[currentPlan] ?? currentPlan}
            </p>
          </div>
          {currentPlan === "free" && (
            <p className="text-xs text-gray-500">{t("freeHint")}</p>
          )}
        </div>

        {/* Pricing plans */}
        <div>
          <h2 className="mb-4 text-lg font-black text-white">{t("upgradePlans")}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`card flex flex-col gap-4 ${
                  plan.highlighted
                    ? "border-brand-purple ring-1 ring-brand-purple"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-flex w-fit rounded-full bg-brand-purple px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white">
                    {t("popular")}
                  </span>
                )}

                <div>
                  <p className="text-lg font-black text-white">{plan.name}</p>
                  <div className="mt-1 flex items-end gap-1">
                    <span className="text-3xl font-black text-white">
                      {plan.priceLabel}
                    </span>
                    <span className="mb-1 text-sm text-gray-500">/ mes</span>
                  </div>
                </div>

                <ul className="flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle
                        size={14}
                        className="mt-0.5 shrink-0 text-brand-gold"
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <UpgradeButton
                  planId={plan.id}
                  label={currentPlan === plan.id ? t("currentPlanBtn") : t("upgradeBtn", { plan: plan.name })}
                  highlighted={plan.highlighted}
                  currentPlan={currentPlan}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Invoices */}
        <div className="card">
          <h2 className="mb-4 text-lg font-black text-white">
            {t("invoicesTitle")}
          </h2>
          <p className="text-sm text-gray-500">{t("noInvoices")}</p>
        </div>

        {/* Stripe secure badge */}
        <p className="text-center text-xs text-gray-600">
          🔒 {t("securePayment")}
        </p>
      </div>
    </main>
  );
}
