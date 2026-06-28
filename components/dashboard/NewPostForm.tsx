"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sparkles, Calendar, CheckSquare, Square, ImagePlus } from "lucide-react";
import { createPost } from "@/app/actions/posts";
import { useRouter } from "@/lib/navigation";
import { PLATFORM_META } from "@/types/kymiz";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import type { Platform } from "@/types/kymiz";

const PLATFORMS = Object.values(PLATFORM_META);

const PLATFORM_ICONS: Record<Platform, string> = {
  instagram: "📸",
  facebook:  "👥",
  twitter:   "𝕏",
  linkedin:  "💼",
  tiktok:    "🎵",
};

export function NewPostForm({ workspaceId }: { workspaceId: string }) {
  const t  = useTranslations("NewPost");
  const ti = useTranslations("ImageUploader");
  const router = useRouter();

  const [content, setContent]           = useState("");
  const [platforms, setPlatforms]       = useState<Platform[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledAt, setScheduledAt]   = useState("");
  const [useAI, setUseAI]               = useState(false);
  const [aiPrompt, setAIPrompt]         = useState("");
  const [imageUrl, setImageUrl]         = useState<string | undefined>();
  const [showImage, setShowImage]       = useState(false);
  const [loading, setLoading]           = useState<"draft" | "scheduled" | null>(null);

  const maxChars =
    platforms.length > 0
      ? Math.min(...platforms.map((p) => PLATFORM_META[p].charLimit))
      : 2200;

  const charsLeft  = maxChars - content.length;
  const isOverLimit = charsLeft < 0;

  const togglePlatform = (id: Platform) =>
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const handleSubmit = async (status: "draft" | "scheduled") => {
    if (!content.trim()) { toast.error(t("contentRequired")); return; }
    if (platforms.length === 0) { toast.error(t("platformsRequired")); return; }
    if (isOverLimit) { toast.error(t("contentTooLong")); return; }
    if (status === "scheduled" && !scheduledAt) { toast.error(t("scheduleRequired")); return; }

    setLoading(status);
    const result = await createPost({
      workspaceId,
      content,
      platforms,
      scheduledAt: isScheduling && scheduledAt ? scheduledAt : undefined,
      status,
      imageUrl,
      aiGenerated: useAI,
      aiPrompt: useAI && aiPrompt ? aiPrompt : undefined,
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(null);
    } else {
      toast.success(t("success"));
      router.push("/posts");
    }
  };

  const handleGenerateAI = () => {
    if (!aiPrompt.trim()) return;
    setContent(`✨ ${aiPrompt}\n\n[${t("aiPlaceholder")}]\n\n#KYMIZ`);
    toast.success(t("aiGenerated"));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      {/* Quick AI prompt (inline, not full generator) */}
      <div className="card flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-brand-gold" />
          <div>
            <p className="text-sm font-black text-white">{t("ai")}</p>
            <p className="text-xs text-gray-500">{t("aiDesc")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setUseAI(!useAI)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            useAI ? "bg-brand-gold" : "bg-[var(--border)]"
          }`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            useAI ? "left-[22px]" : "left-0.5"
          }`} />
        </button>
      </div>

      {useAI && (
        <div className="card space-y-3">
          <label className="text-sm font-medium text-gray-300">{t("aiPrompt")}</label>
          <div className="flex gap-2">
            <input
              value={aiPrompt}
              onChange={(e) => setAIPrompt(e.target.value)}
              placeholder={t("aiPromptPlaceholder")}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-brand-gold"
            />
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={!aiPrompt.trim()}
              className="flex items-center gap-2 rounded-lg bg-brand-gold px-4 py-2.5 text-sm font-black text-black transition-all hover:brightness-110 disabled:opacity-40"
            >
              <Sparkles size={14} />
              {t("generate")}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="card space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">{t("content")}</label>
          <span className={`text-xs font-medium ${
            isOverLimit ? "text-brand-red" : charsLeft < 50 ? "text-brand-orange" : "text-gray-500"
          }`}>
            {charsLeft} {t("charsLeft")}
          </span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("contentPlaceholder")}
          rows={6}
          className={`w-full resize-none rounded-lg border bg-[var(--input)] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors ${
            isOverLimit
              ? "border-brand-red focus:border-brand-red"
              : "border-[var(--border)] focus:border-brand-purple"
          }`}
        />
      </div>

      {/* Image */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImagePlus size={16} className="text-brand-purple" />
            <label className="text-sm font-medium text-gray-300">{ti("addImage")}</label>
          </div>
          <button
            type="button"
            onClick={() => { setShowImage(!showImage); if (showImage) { setImageUrl(undefined); } }}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              showImage ? "bg-brand-purple" : "bg-[var(--border)]"
            }`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
              showImage ? "left-[22px]" : "left-0.5"
            }`} />
          </button>
        </div>
        {showImage && (
          <ImageUploader
            onUpload={(url) => setImageUrl(url)}
            onRemove={() => setImageUrl(undefined)}
            currentUrl={imageUrl}
          />
        )}
      </div>

      {/* Platforms */}
      <div className="card space-y-3">
        <label className="text-sm font-medium text-gray-300">{t("platforms")}</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PLATFORMS.map((platform) => {
            const selected = platforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                  selected
                    ? "border-brand-purple bg-brand-purple/20 text-white"
                    : "border-[var(--border)] text-gray-400 hover:border-brand-purple/50 hover:text-white"
                }`}
              >
                {selected
                  ? <CheckSquare size={14} className="text-brand-gold shrink-0" />
                  : <Square size={14} className="shrink-0" />
                }
                <span>{PLATFORM_ICONS[platform.id]}</span>
                <span>{platform.label}</span>
              </button>
            );
          })}
        </div>
        {platforms.length > 0 && (
          <p className="text-xs text-gray-500">
            {t("charLimitNote", { limit: maxChars.toLocaleString() })}
          </p>
        )}
      </div>

      {/* Schedule */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-brand-blue" />
            <label className="text-sm font-medium text-gray-300">{t("schedule")}</label>
          </div>
          <button
            type="button"
            onClick={() => setIsScheduling(!isScheduling)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              isScheduling ? "bg-brand-blue" : "bg-[var(--border)]"
            }`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
              isScheduling ? "left-[22px]" : "left-0.5"
            }`} />
          </button>
        </div>
        {isScheduling && (
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue [color-scheme:dark]"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={!!loading}
          onClick={() => handleSubmit("draft")}
          className="btn-secondary flex-1 disabled:opacity-50"
        >
          {loading === "draft" ? "..." : t("saveDraft")}
        </button>
        <button
          type="button"
          disabled={!!loading || !isScheduling}
          onClick={() => handleSubmit("scheduled")}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {loading === "scheduled" ? "..." : t("schedulePost")}
        </button>
      </div>
    </div>
  );
}
