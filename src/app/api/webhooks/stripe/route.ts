import { NextResponse } from "next/server";

/**
 * Stripe webhook handler — no SDK required.
 * Signature verification uses Node's built-in `crypto` module via Web Crypto API.
 */
async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Stripe signature format: t=<timestamp>,v1=<hmac>,...
    const parts = Object.fromEntries(
      signature.split(",").map((p) => p.split("=") as [string, string])
    );
    const timestamp = parts["t"];
    const expectedSig = parts["v1"];
    if (!timestamp || !expectedSig) return false;

    const payload = `${timestamp}.${body}`;
    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const msgData = enc.encode(payload);

    const key = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, msgData);
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hex === expectedSig;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") ?? "";

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ success: true, mock: true, message: "Mock webhook processed." });
    }

    const valid = await verifyStripeSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    if (!valid) {
      return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        console.log(`Subscription ${event.data.object.id} → ${event.data.object.status}`);
        break;
      case "invoice.payment_succeeded":
        console.log(`Invoice paid: ${event.data.object.id}`);
        break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
