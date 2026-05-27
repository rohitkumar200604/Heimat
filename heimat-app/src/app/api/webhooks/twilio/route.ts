import { NextResponse } from "next/server";

/**
 * Twilio inbound WhatsApp webhook — no SDK required.
 * Signature validation uses HMAC-SHA1 via Web Crypto API.
 */
async function validateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string
): Promise<boolean> {
  try {
    // Twilio signature: HMAC-SHA1 of url + sorted params appended
    const sortedKeys = Object.keys(params).sort();
    const paramStr = sortedKeys.reduce((acc, k) => acc + k + params[k], "");
    const payload = url + paramStr;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", enc.encode(authToken),
      { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
    const base64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
    return base64 === signature;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const body = formData.get("Body")?.toString() ?? "";
    const from = formData.get("From")?.toString() ?? "";
    const signature = req.headers.get("x-twilio-signature") ?? "";

    // Validate in production only
    if (process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WEBHOOK_URL) {
      const params = Object.fromEntries(
        [...formData.entries()].map(([k, v]) => [k, String(v)])
      );
      const isValid = await validateTwilioSignature(
        process.env.TWILIO_AUTH_TOKEN,
        process.env.TWILIO_WEBHOOK_URL,
        params,
        signature
      );
      if (!isValid) {
        return NextResponse.json({ error: "Twilio signature validation failed." }, { status: 403 });
      }
    }

    console.log(`[Twilio Inbound] From: ${from} | Body: ${body}`);

    // Return TwiML response (plain XML — no SDK needed)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Vielen Dank für Ihre Nachricht an Heimat! Wir leiten diese umgehend weiter. / Thank you! We will forward your message immediately.</Message>
</Response>`;

    return new Response(twiml, {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
