"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black tracking-widest text-white">
            KYMIZ
          </Link>
          <h1 className="mt-6 text-3xl font-black text-white">{t("title")}</h1>
          <p className="mt-2 text-sm text-gray-400">{t("subtitle")}</p>
        </div>

        <div className="card">
          {sent ? (
            <div className="py-4 text-center">
              <span className="mb-4 block text-4xl">📧</span>
              <p className="mb-6 text-sm text-gray-300">{t("successMessage")}</p>
              <Link href="/login" className="btn-primary w-full text-center">
                {t("backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                  {t("email")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-purple"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-brand-red/20 px-4 py-3 text-sm text-brand-red">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary mt-2 w-full disabled:opacity-50">
                {loading ? t("loading") : t("submit")}
              </button>
            </form>
          )}

          <div className="mt-4 text-center text-sm text-gray-500">
            <Link href="/login" className="text-brand-gold hover:underline">
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
