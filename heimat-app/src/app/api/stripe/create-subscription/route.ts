import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "mock-secret-key", {
  apiVersion: "2025-01-27.acac" as any,
});

export async function POST(req: Request) {
  try {
    const { priceId, customerId } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        success: true,
        mock: true,
        subscriptionId: "sub_mock_123", 
        clientSecret: "mock_client_secret_xyz"
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    const invoice = subscription.latest_invoice && typeof subscription.latest_invoice === 'object' 
      ? (subscription.latest_invoice as any) 
      : null;
    const paymentIntent = invoice && invoice.payment_intent && typeof invoice.payment_intent === 'object' 
      ? (invoice.payment_intent as any) 
      : null;

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret || null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
