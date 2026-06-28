import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import type { Locale } from "@/i18n";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Pricing" });
  return { title: t("title"), description: t("subtitle") };
}

const planKeys = ["free", "pro", "enterprise"] as const;

export default async function PricingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Pricing");

  return (
    <main className="section-container py-24">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-black text-white md:text-5xl">
          {t("title")}
        </h1>
        <p className="text-lg text-gray-400">{t("subtitle")}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {planKeys.map((key) => {
          const isHighlighted = key === "pro";
          const href = key === "enterprise" ? "/contact" : `/register${key === "pro" ? "?plan=pro" : ""}`;

          return (
            <div
              key={key}
              className={`card flex flex-col ${isHighlighted ? "border-brand-purple ring-1 ring-brand-purple" : ""}`}
            >
              {isHighlighted && (
                <span className="mb-4 inline-flex self-start rounded-full bg-brand-purple px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
                  {t("popular")}
                </span>
              )}

              <h2 className="text-2xl font-black text-white">
                {t(`plans.${key}.name`)}
              </h2>

              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-black text-white">
                  {t(`plans.${key}.price`)}
                </span>
                <span className="mb-1 text-gray-400">
                  {t(`plans.${key}.period`)}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-400">
                {t(`plans.${key}.desc`)}
              </p>

              <ul className="my-8 flex flex-1 flex-col gap-3">
                {(t.raw(`plans.${key}.features`) as string[]).map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-brand-gold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={href}
                className={isHighlighted ? "btn-primary text-center" : "btn-secondary text-center"}
              >
                {t(`plans.${key}.cta`)}
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
