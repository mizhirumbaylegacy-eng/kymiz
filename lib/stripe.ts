import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
});

// ── Plan definitions ────────────────────────────────────────
export type PlanId = "starter" | "pro" | "agency";

export interface Plan {
  id: PlanId;
  name: string;
  priceId: string;      // Stripe Price ID (from env)
  priceLabel: string;
  interval: "month";
  features: string[];
  highlighted: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceId: process.env.STARTER_PRICE_ID ?? "",
    priceLabel: "$29",
    interval: "month",
    highlighted: false,
    features: [
      "3 workspaces",
      "50 posts / mes",
      "Generación IA básica",
      "Soporte por email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceId: process.env.PRO_PRICE_ID ?? "",
    priceLabel: "$79",
    interval: "month",
    highlighted: true,
    features: [
      "10 workspaces",
      "Posts ilimitados",
      "IA ilimitada + imágenes",
      "Analytics avanzado",
      "Soporte prioritario",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    priceId: process.env.AGENCY_PRICE_ID ?? "",
    priceLabel: "$199",
    interval: "month",
    highlighted: false,
    features: [
      "Workspaces ilimitados",
      "Posts ilimitados",
      "Todo en Pro",
      "White label",
      "Account manager dedicado",
      "SLA 99.9%",
    ],
  },
];
