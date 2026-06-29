import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient as createServerClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import type { PlanId } from "@/lib/stripe";

// Admin Supabase client — bypasses RLS (uses service role)
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Supabase admin env vars not set");
  return createServerClient(url, key);
}

const PLAN_HIERARCHY: Record<PlanId, number> = {
  starter: 1,
  pro: 2,
  agency: 3,
};

async function updateUserPlan(userId: string, planId: PlanId) {
  const admin = getAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ plan: planId, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update user plan:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig  = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing stripe-signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId  = session.metadata?.userId;
        const planId  = session.metadata?.planId as PlanId | undefined;

        if (!userId || !planId || !PLAN_HIERARCHY[planId]) {
          console.error("Missing metadata in checkout session:", session.metadata);
          break;
        }

        if (session.payment_status === "paid") {
          await updateUserPlan(userId, planId);
          console.log(`✓ Plan updated: user=${userId} plan=${planId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        // Downgrade to free when subscription is cancelled
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId) {
          await updateUserPlan(userId, "starter");
          console.log(`✓ Subscription cancelled — downgraded: user=${userId}`);
        }
        break;
      }

      default:
        // Unhandled event types are silently ignored
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
