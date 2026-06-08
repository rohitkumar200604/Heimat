import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to, templateName, variables } = await req.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_NUMBER ?? "whatsapp:+14155238886";

    if (!accountSid || !authToken) {
      console.log(`[Twilio Mock] WhatsApp → ${to} | template="${templateName}"`, variables);
      return NextResponse.json({
        success: true,
        mock: true,
        sid: `SM_mock_${Math.random().toString(36).substring(7)}`,
        message: "Dev mode: WhatsApp logged to console.",
      });
    }

    // Twilio REST API — Basic Auth with accountSid:authToken
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const body = new URLSearchParams({
      From: from,
      To: `whatsapp:${to}`,
      Body: `Heimstadt Update: ${templateName}. ${JSON.stringify(variables)}`,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: body.toString(),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ success: false, error: err.message }, { status: res.status });
    }

    const message = await res.json();
    return NextResponse.json({ success: true, sid: message.sid });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
