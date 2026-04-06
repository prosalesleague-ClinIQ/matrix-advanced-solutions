import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[STRIPE_WEBHOOK] Signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const supabase = createAdminClient();

    // Find the order by stripe_payment_intent_id
    const { data: order } = await supabase
      .from("orders")
      .select("id, clinic_id, order_number")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .single();

    if (order) {
      // Update order payment status
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // Update related invoices
      await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", order.id);

      // Create payment record
      await supabase.from("payments").insert({
        order_id: order.id,
        clinic_id: order.clinic_id,
        amount: paymentIntent.amount / 100,
        method: "card",
        status: "paid",
        stripe_payment_intent_id: paymentIntent.id,
      });

      console.log(`[STRIPE_WEBHOOK] Payment confirmed for order ${order.order_number}`);
    }
  }

  return NextResponse.json({ received: true });
}
