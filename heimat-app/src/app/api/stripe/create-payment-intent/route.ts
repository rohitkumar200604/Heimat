import { NextResponse } from "next/server";

/** Encode body as application/x-www-form-urlencoded for Stripe REST API */
function encodeForm(data: Record<string, string | number>): string {
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
    const { amount, landlordStripeAccountId } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        success: true,
        mock: true,
        clientSecret: "pi_mock_secret_abc123",
      });
    }

    const applicationFeeAmount = Math.round(amount * 0.08); // 8% platform fee

    const body = encodeForm({
      amount,
      currency: "eur",
      "payment_method_types[]": "card",
      application_fee_amount: applicationFeeAmount,
      "transfer_data[destination]": landlordStripeAccountId,
    });

    const res = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: stripeHeaders(process.env.STRIPE_SECRET_KEY),
      body,
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ success: false, error: err.error?.message }, { status: res.status });
    }

    const pi = await res.json();
    return NextResponse.json({ success: true, clientSecret: pi.client_secret });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
