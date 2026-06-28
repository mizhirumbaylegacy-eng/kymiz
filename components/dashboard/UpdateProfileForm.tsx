"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/auth";

export function UpdateProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const t = useTranslations("Settings");
  const [name, setName]     = useState(initialName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile({ fullName: name });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t("profileUpdated"));
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-300">
          {t("name")}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-brand-purple"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-300">
          {t("email")}
        </label>
        <input
          value={email}
          disabled
          className="w-full cursor-not-allowed rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-white/40 outline-none"
        />
        <p className="mt-1 text-xs text-gray-600">{t("emailNotEditable")}</p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? "..." : t("saveChanges")}
        </button>
      </div>
    </form>
  );
}
