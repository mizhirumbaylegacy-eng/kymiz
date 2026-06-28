import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "About" });
  return { title: t("title") };
}

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale as Locale);
  const t = await getTranslations("About");

  return (
    <main className="section-container py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-black text-white md:text-5xl">
          {t("title")}
        </h1>
        <p className="mb-8 text-lg text-gray-400">{t("mission")}</p>

        <div className="gradient-brand rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-black text-white">{t("valuesTitle")}</h2>
          <ul className="flex flex-col gap-3">
            {(t.raw("values") as string[]).map((value) => (
              <li key={value} className="flex items-center gap-2 text-white/90">
                <span className="text-brand-gold">✦</span>
                {value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
