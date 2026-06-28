"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImagePlus, X, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  onRemove: () => void;
  currentUrl?: string;
  className?: string;
}

export function ImageUploader({
  onUpload,
  onRemove,
  currentUrl,
  className = "",
}: ImageUploaderProps) {
  const t = useTranslations("ImageUploader");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [preview, setPreview]         = useState<string | null>(currentUrl ?? null);

  const validate = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return t("errorType");
    if (file.size > MAX_SIZE_BYTES) return t("errorSize");
    return null;
  };

  const uploadFile = useCallback(async (file: File) => {
    const error = validate(file);
    if (error) { toast.error(error); return; }

    setUploading(true);

    // Local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error(t("errorUpload")); return; }

      const ext = file.name.split(".").pop() ?? "jpg";
      const safeFilename = `${Date.now()}.${ext}`;
      const filePath = `${user.id}/${safeFilename}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file, { upsert: false, contentType: file.type });

      if (uploadError) {
        toast.error(t("errorUpload"));
        setPreview(currentUrl ?? null);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onUpload(publicUrl);
      toast.success(t("uploadSuccess"));
    } catch {
      toast.error(t("errorUpload"));
      setPreview(currentUrl ?? null);
    } finally {
      setUploading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl, onUpload]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove();
  };

  // ── Preview state ────────────────────────────────────────────
  if (preview) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-[var(--border)] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt="Post image preview"
          className="max-h-64 w-full object-cover"
        />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 size={28} className="animate-spin text-white" />
          </div>
        )}
        {!uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-brand-red"
            title={t("remove")}
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  // ── Drop zone ────────────────────────────────────────────────
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-all ${
        isDragging
          ? "border-brand-gold bg-brand-gold/5 scale-[1.01]"
          : "border-[var(--border)] hover:border-brand-purple/50 hover:bg-brand-purple/5"
      } ${uploading ? "pointer-events-none opacity-60" : ""} ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleChange}
        className="hidden"
      />

      {uploading ? (
        <Loader2 size={28} className="animate-spin text-brand-gold" />
      ) : (
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
          isDragging ? "bg-brand-gold/20" : "bg-[var(--muted)]"
        }`}>
          {isDragging ? (
            <Upload size={24} className="text-brand-gold" />
          ) : (
            <ImagePlus size={24} className="text-gray-500" />
          )}
        </div>
      )}

      <div className="text-center">
        <p className="text-sm font-medium text-white">
          {uploading ? t("uploading") : isDragging ? t("dropNow") : t("dragDrop")}
        </p>
        {!uploading && !isDragging && (
          <>
            <p className="mt-0.5 text-xs text-gray-500">{t("orClick")}</p>
            <p className="mt-2 text-xs text-gray-600">{t("accept")}</p>
          </>
        )}
      </div>
    </div>
  );
}
