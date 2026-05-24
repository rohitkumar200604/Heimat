import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "mock-secret-key", {
  apiVersion: "2025-01-27.acac" as any,
});

export async function POST(req: Request) {
  try {
    const { amount, landlordStripeAccountId } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        success: true,
        mock: true,
        clientSecret: "pi_mock_secret_abc123"
      });
    }

    const applicationFeeAmount = Math.round(amount * 0.08); // 8% fee split

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      payment_method_types: ["card", "sepa_debit"],
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: landlordStripeAccountId,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
