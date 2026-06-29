"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Sparkles, PenLine, ArrowLeft } from "lucide-react";
import { NewPostForm } from "@/components/dashboard/NewPostForm";
import { AIPostGenerator } from "@/components/dashboard/AIPostGenerator";

export function NewPostShell({
  workspaceId,
  postsTitle,
  linkedinConnected,
}: {
  workspaceId: string;
  postsTitle: string;
  linkedinConnected: boolean;
}) {
  const t = useTranslations("NewPost");
  const [mode, setMode] = useState<"manual" | "ai">("manual");

  return (
    <main className="p-6 lg:p-8">
      <Link
        href="/posts"
        className="mb-6 flex w-fit items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        {postsTitle}
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">{t("title")}</h1>
        <p className="mt-1 text-gray-400">{t("subtitle")}</p>
      </div>

      {/* Mode toggle */}
      <div className="mb-8 flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)] p-1">
        <button
          onClick={() => setMode("manual")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-black transition-all ${
            mode === "manual"
              ? "bg-[var(--card)] text-white shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <PenLine size={15} />
          {t("modeManual")}
        </button>
        <button
          onClick={() => setMode("ai")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-black transition-all ${
            mode === "ai"
              ? "bg-brand-gold text-black shadow-sm"
              : "text-gray-400 hover:text-brand-gold"
          }`}
        >
          <Sparkles size={15} />
          {t("modeAI")}
        </button>
      </div>

      {mode === "manual" ? (
        <NewPostForm workspaceId={workspaceId} linkedinConnected={linkedinConnected} />
      ) : (
        <AIPostGenerator workspaceId={workspaceId} />
      )}
    </main>
  );
}
