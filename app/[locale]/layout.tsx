import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { locales, type Locale } from "@/i18n";
import "@/app/globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: "KYMIZ",
    template: "%s | KYMIZ",
  },
  description: "KYMIZ — Plataforma SaaS avanzada para equipos modernos",
  keywords: ["KYMIZ", "SaaS", "plataforma"],
  authors: [{ name: "KYMIZ" }],
  creator: "KYMIZ",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://kymiz.vercel.app"
  ),
  openGraph: {
    type: "website",
    siteName: "KYMIZ",
  },
  robots: { index: true, follow: true },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale as Locale;

  // Required for static rendering with next-intl
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={`dark ${montserrat.variable}`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster richColors position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
