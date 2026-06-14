import { NextResponse } from "next/server";

function encodeForm(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

function stripeHeaders(secretKey: string) {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Bearer ${secretKey}`,
  };
}

export async function POST(req: Request) {
  try {
    const { priceId, customerId } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        success: true,
        mock: true,
        subscriptionId: "sub_mock_123",
        clientSecret: "mock_client_secret_xyz",
      });
    }

    const sk = process.env.STRIPE_SECRET_KEY;

    const res = await fetch("https://api.stripe.com/v1/subscriptions", {
      method: "POST",
      headers: stripeHeaders(sk),
      body: encodeForm({
        customer: customerId,
        "items[0][price]": priceId,
        payment_behavior: "default_incomplete",
        "payment_settings[save_default_payment_method]": "on_subscription",
        "expand[]": "latest_invoice.payment_intent",
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ success: false, error: err.error?.message }, { status: res.status });
    }

    const subscription = await res.json();
    const clientSecret =
      subscription.latest_invoice?.payment_intent?.client_secret ?? null;

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
