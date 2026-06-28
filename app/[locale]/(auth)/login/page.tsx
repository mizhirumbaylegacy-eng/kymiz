"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const t = useTranslations("Login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
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
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  {t("password")}
                </label>
                <Link href="/forgot-password" className="text-xs text-brand-gold hover:underline">
                  {t("forgotPassword")}
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                autoComplete="current-password"
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

          <div className="mt-4 text-center text-sm text-gray-500">
            {t("noAccount")}{" "}
            <Link href="/register" className="font-medium text-brand-gold hover:underline">
              {t("register")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
