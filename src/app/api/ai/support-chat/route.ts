import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userMessage, history, property } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // ── Dev mock fallback (no API key needed) ──
      const msg = userMessage.toLowerCase();
      const isDe = msg.includes("hallo") || msg.includes("bitte") || msg.includes("ist") || msg.includes("kaution") || msg.includes("balkon") || msg.includes("küche");
      
      let response = isDe 
        ? "Vielen Dank für Ihre Anfrage. Unser Support-Team wird sich in Kürze mit Ihnen in Verbindung setzen. Sie können diese Wohnung auch direkt über die Schaltfläche unten online reservieren."
        : "Thank you for reaching out. Our support team will get back to you shortly. You can also reserve this apartment directly online using the booking option below.";
      
      if (msg.includes("deposit") || msg.includes("kaution")) {
        response = isDe
          ? `Die Kaution für diese Wohnung beträgt ${property?.deposit_months || 3} Kaltmieten. Sie wird bei der Buchung sicher über unsere Plattform hinterlegt.`
          : `The deposit for this apartment is equivalent to ${property?.deposit_months || 3} months of cold rent. It is securely escrowed via our platform during booking.`;
      } else if (msg.includes("available") || msg.includes("frei") || msg.includes("ab wann")) {
        response = isDe
          ? `Diese Wohnung ist ab dem ${property?.available_from || "dem angegebenen Datum"} verfügbar. Sie können sie direkt online buchen.`
          : `This property is available starting from ${property?.available_from || "the listed date"}. You can secure it entirely online.`;
      } else if (msg.includes("balcony") || msg.includes("balkon")) {
        const hasBalcony = property?.amenities?.includes("balcony");
        if (hasBalcony) {
          response = isDe ? "Ja, diese Wohnung verfügt über einen Balkon." : "Yes, this apartment features a private balcony.";
        } else {
          response = isDe ? "Nein, diese Wohnung hat leider keinen Balkon." : "No, this specific listing does not come with a balcony.";
        }
      } else if (msg.includes("kitchen") || msg.includes("küche")) {
        const hasKitchen = property?.amenities?.includes("kitchen");
        if (hasKitchen) {
          response = isDe ? "Ja, eine voll ausgestattete Einbauküche ist im Mietpreis enthalten." : "Yes, a fully equipped built-in kitchen is included in the rental price.";
        } else {
          response = isDe ? "Diese Wohnung wird ohne Einbauküche vermietet." : "This property is rented without a kitchen pre-installed.";
        }
      } else if (msg.includes("pet") || msg.includes("haustier") || msg.includes("hund") || msg.includes("katze")) {
        response = isDe
          ? "Haustierhaltung ist nach Absprache mit dem Vermieter gestattet. Bitte geben Sie Details in Ihrer Bewerbungsnotiz an."
          : "Pet policy is subject to agreement with the landlord. Please specify any details in your application note.";
      }

      return NextResponse.json({ success: true, text: response });
    }

    // ── Live: Google Gemini AI via REST API ──
    const totalRent = parseFloat(property?.rent_cold || 1000) + 
                     parseFloat(property?.rent_utilities || 0) + 
                     parseFloat(property?.rent_heating || 0);

    const systemInstruction = `You are a helpful customer support representative for Heimstadt, a premium student housing marketplace in Germany.
You are assisting a customer inquiring about the following property:
- Title: ${property?.title || "Apartment"}
- City: ${property?.city || "Unknown City"}
- Street: ${property?.street || "N/A"}
- Size: ${property?.size_sqm || "N/A"} sqm
- Rooms: ${property?.rooms || "N/A"}
- Warm Rent: ${totalRent} EUR per month
- Available from: ${property?.available_from || "N/A"}
- Amenities: ${property?.amenities ? property.amenities.join(", ") : "N/A"}

Please answer questions professionally, politely, and helpfully in the same language as the customer (German or English).
Pretend you are a human support agent named "Heimstadt Assistant".
Keep responses concise (usually 1-3 sentences) and directly address the user's questions about the property or the booking process.`;

    const geminiModel = "gemini-2.5-flash";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

    // Format chat history for Gemini
    const geminiContents = [
      ...history.map((h: any) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      })),
      {
        role: "user",
        parts: [{ text: userMessage }]
      }
    ];

    const body = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: geminiContents,
    };

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const json = await res.json();
    const responseText = json.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I could not generate a response. Please try again.";

    return NextResponse.json({
      success: true,
      text: responseText
    });
  } catch (error: any) {
    console.error("Error in support-chat API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
