"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function LinkedInIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function PublishLinkedInButton({
  workspaceId,
  content,
}: {
  workspaceId: string;
  content: string;
}) {
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!content.trim()) {
      toast.error("El contenido no puede estar vacío");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al publicar en LinkedIn");
      } else {
        toast.success("✓ Publicado en LinkedIn correctamente");
      }
    } catch {
      toast.error("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePublish}
      disabled={loading || !content.trim()}
      className="inline-flex items-center gap-2 rounded-lg bg-[#0A66C2] px-5 py-2.5 text-sm font-black text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <LinkedInIcon size={15} />
      )}
      {loading ? "Publicando..." : "Publicar en LinkedIn"}
    </button>
  );
}
