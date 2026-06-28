import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Blog" });
  return { title: t("title") };
}

export default async function BlogPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Blog");

  return (
    <main className="section-container py-24">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-black text-white md:text-5xl">
          {t("title")}
        </h1>
        <p className="text-lg text-gray-400">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <article key={i} className="card hover:border-brand-purple/50 transition-colors">
            <div className="mb-4 h-40 rounded-lg bg-gradient-to-br from-brand-purple/30 to-brand-blue/30" />
            <span className="text-xs font-black uppercase tracking-wider text-brand-gold">
              {t("category")}
            </span>
            <h2 className="mt-2 text-lg font-black text-white">
              {t("postTitle")} {i}
            </h2>
            <p className="mt-2 text-sm text-gray-400 line-clamp-2">
              {t("postExcerpt")}
            </p>
            <p className="mt-4 text-xs text-gray-600">{t("readMore")} →</p>
          </article>
        ))}
      </div>
    </main>
  );
}
