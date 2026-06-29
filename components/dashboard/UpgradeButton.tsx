"use client";

import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import type { PlanId } from "@/lib/stripe";

interface UpgradeButtonProps {
  planId: PlanId;
  label: string;
  highlighted?: boolean;
  currentPlan?: string;
}

export function UpgradeButton({
  planId,
  label,
  highlighted = false,
  currentPlan,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const isCurrent = currentPlan === planId;

  const handleUpgrade = async () => {
    if (isCurrent) return;
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Error al crear sesión de pago");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      toast.error("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  if (isCurrent) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/10 px-4 py-2 text-sm font-black text-brand-gold">
        ✓ Plan actual
      </span>
    );
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-black transition-all active:scale-95 disabled:opacity-60 ${
        highlighted
          ? "bg-brand-purple text-white hover:brightness-110"
          : "border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black"
      }`}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Zap size={15} />
      )}
      {loading ? "Redirigiendo..." : label}
    </button>
  );
}
