import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const body = formData.get("Body")?.toString() || "";
    const from = formData.get("From")?.toString() || "";
    const signature = req.headers.get("x-twilio-signature") || "";

    const validate = process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WEBHOOK_URL;
    if (validate) {
      const isValid = twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN!,
        signature,
        process.env.TWILIO_WEBHOOK_URL!,
        Object.fromEntries(formData.entries())
      );
      if (!isValid) {
        return NextResponse.json({ error: "Twilio request signature validation failed." }, { status: 403 });
      }
    }

    console.log(`[Twilio Inbound] Received message from ${from}: ${body}`);

    // Create automatic response message
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message("Vielen Dank für Ihre Nachricht an Heimat! Wir leiten diese umgehend an den Empfänger weiter. / Thank you! We will forward your message immediately.");

    return new Response(twiml.toString(), {
      headers: { "Content-Type": "text/xml" }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
