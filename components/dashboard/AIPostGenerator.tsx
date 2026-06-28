"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  CheckSquare,
  Square,
  Save,
  ImagePlus,
} from "lucide-react";
import { createPost } from "@/app/actions/posts";
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

const TONES = [
  { value: "professional",  labelEs: "Profesional",  labelEn: "Professional" },
  { value: "casual",        labelEs: "Casual",        labelEn: "Casual" },
  { value: "motivational",  labelEs: "Motivacional",  labelEn: "Motivational" },
  { value: "urgent",        labelEs: "Urgente",       labelEn: "Urgent" },
  { value: "educational",   labelEs: "Educativo",     labelEn: "Educational" },
];

type GeneratedPosts = Partial<Record<Platform, string>>;

// ── Char counter ─────────────────────────────────────────────
function CharCounter({ value, limit }: { value: string; limit: number }) {
  const pct = value.length / limit;
  const color =
    pct >= 1 ? "text-brand-red" : pct >= 0.85 ? "text-brand-orange" : "text-green-400";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {value.length} / {limit.toLocaleString()}
    </span>
  );
}

// ── Copy button ───────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-[var(--muted)] hover:text-white"
    >
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────
export function AIPostGenerator({ workspaceId }: { workspaceId: string }) {
  const t  = useTranslations("AIGenerator");
  const ti = useTranslations("ImageUploader");
  const locale = useLocale();

  const [prompt, setPrompt]                     = useState("");
  const [tone, setTone]                         = useState("professional");
  const [language, setLanguage]                 = useState(locale === "en" ? "en" : "es");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["instagram", "facebook", "twitter", "linkedin"]);
  const [isLoading, setIsLoading]               = useState(false);
  const [generatedPosts, setGeneratedPosts]     = useState<GeneratedPosts>({});
  const [editedPosts, setEditedPosts]           = useState<GeneratedPosts>({});
  const [activeTab, setActiveTab]               = useState<Platform>("instagram");
  const [savingPlatform, setSavingPlatform]     = useState<Platform | null>(null);
  const [imageUrl, setImageUrl]                 = useState<string | undefined>();
  const [showImage, setShowImage]               = useState(false);

  const togglePlatform = (p: Platform) =>
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error(t("promptRequired")); return; }
    if (selectedPlatforms.length === 0) { toast.error(t("platformRequired")); return; }

    setIsLoading(true);
    setGeneratedPosts({});
    setEditedPosts({});
    setImageUrl(undefined);
    setShowImage(false);

    try {
      const res = await fetch("/api/ai/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, platforms: selectedPlatforms, tone, language }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? t("generateError")); return; }
      setGeneratedPosts(data.posts);
      setEditedPosts(data.posts);
      setActiveTab(selectedPlatforms[0]);
      toast.success(t("generateSuccess"));
    } catch {
      toast.error(t("generateError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async (platform: Platform) => {
    const content = editedPosts[platform] ?? "";
    if (!content.trim()) return;

    setSavingPlatform(platform);
    const result = await createPost({
      workspaceId,
      content,
      platforms: [platform],
      status: "draft",
      imageUrl,
      aiGenerated: true,
      aiPrompt: prompt,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t("savedDraft", { platform: PLATFORM_META[platform].label }));
    }
    setSavingPlatform(null);
  };

  const hasResults = Object.keys(generatedPosts).length > 0;
  const activePlatformsWithContent = selectedPlatforms.filter((p) => generatedPosts[p]);

  return (
    <div className="space-y-6">

      {/* ── Generator form ── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-brand-gold" />
          <h2 className="font-black text-white">{t("title")}</h2>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">{t("promptLabel")}</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("promptPlaceholder")}
            rows={3}
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-gold"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">{t("tone")}</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-2.5 text-sm text-white outline-none focus:border-brand-purple [color-scheme:dark]"
            >
              {TONES.map((tn) => (
                <option key={tn.value} value={tn.value}>
                  {language === "en" ? tn.labelEn : tn.labelEs}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">{t("language")}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-2.5 text-sm text-white outline-none focus:border-brand-purple [color-scheme:dark]"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">{t("platforms")}</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {PLATFORMS.map((p) => {
              const active = selectedPlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? "border-brand-gold/60 bg-brand-gold/10 text-white"
                      : "border-[var(--border)] text-gray-500 hover:border-brand-gold/30 hover:text-gray-300"
                  }`}
                >
                  {active
                    ? <CheckSquare size={13} className="text-brand-gold shrink-0" />
                    : <Square size={13} className="shrink-0" />
                  }
                  <span>{PLATFORM_ICONS[p.id]}</span>
                  <span className="truncate">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim() || selectedPlatforms.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold px-6 py-3 font-black text-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <><Loader2 size={16} className="animate-spin" />{t("generating")}</>
          ) : (
            <><Sparkles size={16} />{t("generate")}</>
          )}
        </button>
      </div>

      {/* ── Results ── */}
      {hasResults && activePlatformsWithContent.length > 0 && (
        <div className="card space-y-4">
          <h3 className="font-black text-white">{t("results")}</h3>

          {/* Platform tabs */}
          <div className="flex flex-wrap gap-1 rounded-xl bg-[var(--muted)] p-1">
            {activePlatformsWithContent.map((p) => (
              <button
                key={p}
                onClick={() => setActiveTab(p)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  activeTab === p
                    ? "bg-[var(--card)] text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>{PLATFORM_ICONS[p]}</span>
                {PLATFORM_META[p].label}
              </button>
            ))}
          </div>

          {activePlatformsWithContent.map((p) => {
            if (p !== activeTab) return null;
            const meta  = PLATFORM_META[p];
            const text  = editedPosts[p] ?? "";
            const isOver = text.length > meta.charLimit;

            return (
              <div key={p} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">
                    {PLATFORM_ICONS[p]} {meta.label}
                  </span>
                  <CharCounter value={text} limit={meta.charLimit} />
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setEditedPosts((prev) => ({ ...prev, [p]: e.target.value }))}
                  rows={8}
                  className={`w-full resize-none rounded-lg border bg-[var(--input)] px-4 py-3 text-sm text-white outline-none transition-colors ${
                    isOver
                      ? "border-brand-red focus:border-brand-red"
                      : "border-[var(--border)] focus:border-brand-purple"
                  }`}
                />

                <div className="flex items-center justify-between">
                  {isOver && <p className="text-xs text-brand-red">{t("overLimit")}</p>}
                  <div className="ml-auto flex items-center gap-2">
                    <CopyButton text={text} />
                    <button
                      onClick={() => handleSaveDraft(p)}
                      disabled={savingPlatform === p || !text.trim()}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-purple/20 px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-brand-purple/40 disabled:opacity-50"
                    >
                      {savingPlatform === p
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Save size={12} />
                      }
                      {t("saveDraftBtn")}
                      {imageUrl && " + 🖼️"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Image uploader (shared across all platforms) ── */}
          <div className="border-t border-[var(--border)] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImagePlus size={16} className="text-brand-purple" />
                <span className="text-sm font-medium text-gray-300">{ti("addImage")}</span>
              </div>
              <button
                type="button"
                onClick={() => { setShowImage(!showImage); if (showImage) setImageUrl(undefined); }}
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
            {imageUrl && (
              <p className="text-xs text-brand-gold">
                ✓ {ti("imageWillBeAttached")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
