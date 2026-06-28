import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import type { Locale } from "@/i18n";

const featureKeys = [
  "speed",
  "security",
  "analytics",
  "integrations",
  "multiregion",
  "support",
] as const;

const featureMeta: Record<
  (typeof featureKeys)[number],
  { icon: string; color: string }
> = {
  speed: { icon: "⚡", color: "#FFD912" },
  security: { icon: "🔐", color: "#1851A2" },
  analytics: { icon: "📊", color: "#650D57" },
  integrations: { icon: "🔗", color: "#EA3E11" },
  multiregion: { icon: "🌍", color: "#C2232E" },
  support: { icon: "🤝", color: "#AE100F" },
};

export default function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale as Locale);

  const t = useTranslations("Home");

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-32 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-brand-purple/20 blur-3xl" />
          <div className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-brand-blue/20 blur-3xl" />
        </div>

        <span className="mb-6 inline-flex items-center rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1.5 text-xs font-black tracking-widest text-brand-gold uppercase">
          {t("badge")}
        </span>

        <h1 className="mb-6 text-5xl font-black tracking-tight text-white md:text-7xl lg:text-8xl">
          {t("heroTitle")}{" "}
          <span className="gradient-text">{t("heroHighlight")}</span>
        </h1>

        <p className="mb-10 max-w-2xl text-lg font-medium text-gray-400 md:text-xl">
          {t("heroSubtitle")}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/register" className="btn-primary text-base px-8 py-4">
            {t("ctaPrimary")}
          </Link>
          <Link href="/pricing" className="btn-secondary text-base px-8 py-4">
            {t("ctaSecondary")}
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-600">{t("noCreditCard")}</p>
      </section>

      {/* Features */}
      <section className="section-container py-24">
        <h2 className="mb-4 text-center text-3xl font-black text-white md:text-4xl">
          {t("featuresTitle")}
        </h2>
        <p className="mb-16 text-center text-gray-400">{t("featuresSubtitle")}</p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((key) => {
            const meta = featureMeta[key];
            return (
              <div
                key={key}
                className="card transition-colors duration-200 hover:border-brand-purple/50"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                  style={{ backgroundColor: meta.color + "20" }}
                >
                  {meta.icon}
                </div>
                <h3 className="mb-2 text-lg font-black text-white">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="text-sm text-gray-400">
                  {t(`features.${key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="section-container py-24">
        <div className="gradient-brand rounded-2xl p-12 text-center">
          <h2 className="mb-4 text-3xl font-black text-white md:text-4xl">
            {t("ctaTitle")}
          </h2>
          <p className="mb-8 text-white/80">{t("ctaSubtitle")}</p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-brand-gold px-8 py-4 text-base font-black text-black transition-all hover:brightness-110 active:scale-95"
          >
            {t("ctaButton")}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="section-container flex flex-col items-center justify-between gap-4 text-sm text-gray-600 sm:flex-row">
          <span className="font-black tracking-widest text-white">KYMIZ</span>
          <span>
            © {new Date().getFullYear()} KYMIZ. {t("footerRights")}
          </span>
          <nav className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white">
              {t("footerPrivacy")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              {t("footerTerms")}
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
