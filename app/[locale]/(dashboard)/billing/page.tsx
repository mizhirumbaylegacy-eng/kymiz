import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import type { Locale } from "@/i18n";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Billing" });
  return { title: t("title") };
}

export default async function BillingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Billing");

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">{t("title")}</h1>
        <p className="mt-1 text-gray-400">{t("subtitle")}</p>
      </div>

      <div className="grid max-w-2xl gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{t("currentPlan")}</p>
              <p className="text-2xl font-black text-white">Free</p>
            </div>
            <Link href="/pricing" className="btn-primary text-sm px-4 py-2">
              {t("upgrade")}
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-black text-white">{t("invoicesTitle")}</h2>
          <p className="text-sm text-gray-500">{t("noInvoices")}</p>
        </div>
      </div>
    </main>
  );
}
