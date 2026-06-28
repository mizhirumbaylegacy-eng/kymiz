"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createWorkspace } from "@/app/actions/workspaces";
import { useRouter } from "@/lib/navigation";

export function CreateWorkspaceForm() {
  const t = useTranslations("Settings");
  const tc = useTranslations("Common");
  const router = useRouter();

  const [open, setOpen]               = useState(false);
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const result = await createWorkspace(name.trim(), description.trim() || undefined);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t("workspaceCreated"));
      setName("");
      setDescription("");
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 btn-primary text-sm px-4 py-2"
      >
        <Plus size={14} />
        {t("createWorkspace")}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="font-black text-white">{t("createWorkspace")}</h3>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-300">
          {t("workspaceName")} *
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Mi marca / Cliente X"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-purple"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-300">
          {t("workspaceDescription")}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Descripción opcional..."
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-purple"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? "..." : t("createWorkspace")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-ghost"
        >
          {tc("cancel")}
        </button>
      </div>
    </form>
  );
}
