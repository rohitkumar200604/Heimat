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
    const { email } = await req.json();
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        success: true,
        mock: true,
        url: "https://connect.stripe.com/express/oauth/authorize?mock=true",
      });
    }

    const sk = process.env.STRIPE_SECRET_KEY;

    // 1. Create Express account
    const acctRes = await fetch("https://api.stripe.com/v1/accounts", {
      method: "POST",
      headers: stripeHeaders(sk),
      body: encodeForm({ type: "express", email, "capabilities[card_payments][requested]": "true", "capabilities[transfers][requested]": "true" }),
    });
    if (!acctRes.ok) {
      const err = await acctRes.json();
      return NextResponse.json({ success: false, error: err.error?.message }, { status: acctRes.status });
    }
    const account = await acctRes.json();

    // 2. Create Account Link for onboarding
    const linkRes = await fetch("https://api.stripe.com/v1/account_links", {
      method: "POST",
      headers: stripeHeaders(sk),
      body: encodeForm({
        account: account.id,
        refresh_url: `${origin}/dashboard/landlord`,
        return_url: `${origin}/dashboard/landlord`,
        type: "account_onboarding",
      }),
    });
    if (!linkRes.ok) {
      const err = await linkRes.json();
      return NextResponse.json({ success: false, error: err.error?.message }, { status: linkRes.status });
    }
    const link = await linkRes.json();

    return NextResponse.json({ success: true, url: link.url });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
