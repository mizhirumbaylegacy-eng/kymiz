import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 text-8xl font-black text-brand-purple">404</span>
      <h1 className="mb-3 text-3xl font-black text-white">{t("title")}</h1>
      <p className="mb-8 text-gray-400">{t("subtitle")}</p>
      <Link href="/" className="btn-primary px-8 py-3">
        {t("cta")}
      </Link>
    </main>
  );
}
