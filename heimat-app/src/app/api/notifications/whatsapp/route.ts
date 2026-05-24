import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: Request) {
  try {
    const { to, templateName, variables } = await req.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

    if (!accountSid || !authToken) {
      console.log(`[Twilio Mock] Outbound WhatsApp sent to ${to} using template "${templateName}" with variables:`, variables);
      return NextResponse.json({
        success: true,
        mock: true,
        sid: `SM_mock_${Math.random().toString(36).substring(7)}`,
        message: "Scaffold mode: WhatsApp logged to server console successfully."
      });
    }

    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      from,
      to: `whatsapp:${to}`,
      body: `Heimat Update: ${templateName} template triggered. Details: ${JSON.stringify(variables)}`
    });

    return NextResponse.json({ success: true, sid: message.sid });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
