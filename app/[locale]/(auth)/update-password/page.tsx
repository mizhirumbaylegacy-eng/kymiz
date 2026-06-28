"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const t = useTranslations("UpdatePassword");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setError(t("mismatch"));
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-300">
                {t("password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-purple"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-gray-300">
                {t("confirm")}
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={t("confirmPlaceholder")}
                autoComplete="new-password"
                required
                minLength={6}
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
        </div>
      </div>
    </main>
  );
}
