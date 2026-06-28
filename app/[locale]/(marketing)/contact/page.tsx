import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Contact" });
  return { title: t("title") };
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Contact");

  return (
    <main className="section-container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-black text-white md:text-5xl">
          {t("title")}
        </h1>
        <p className="mb-12 text-lg text-gray-400">{t("subtitle")}</p>
      </div>

      <div className="mx-auto max-w-xl">
        <div className="card flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              {t("name")}
            </label>
            <input
              type="text"
              placeholder={t("namePlaceholder")}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-purple"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              {t("email")}
            </label>
            <input
              type="email"
              placeholder={t("emailPlaceholder")}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-purple"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              {t("message")}
            </label>
            <textarea
              rows={5}
              placeholder={t("messagePlaceholder")}
              className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-purple"
            />
          </div>
          <button className="btn-primary w-full">{t("submit")}</button>
        </div>
      </div>
    </main>
  );
}
