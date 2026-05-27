import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { bookingId, tenantProfile, docTypes } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // ── Dev mock fallback (no API key needed) ──
      const income = tenantProfile?.monthlyIncome || 2500;
      const rent = tenantProfile?.rent || 1000;
      const isEuCitizen =
        tenantProfile?.nationality === "German" ||
        tenantProfile?.nationality === "French";

      let overall = 85;
      const flags: string[] = [];

      if (income < rent * 3) { overall -= 20; flags.push("income_low"); }
      if (!isEuCitizen && !docTypes?.includes("visa")) {
        overall -= 15;
        flags.push("visa_missing");
      }
      if (!docTypes?.includes("passport")) { overall -= 10; flags.push("passport_missing"); }

      return NextResponse.json({
        success: true,
        mock: true,
        data: {
          overall_score: Math.max(overall, 0),
          employment_score: tenantProfile?.employmentStatus === "Employed" ? 95 : 70,
          doc_score: (docTypes?.length ?? 0) >= 3 ? 95 : 60,
          stay_length_score: 90,
          income_score: income >= rent * 3 ? 98 : 65,
          reasoning:
            "Mock scoring: passport & enrollment certificates confirm student alignment.",
          flags,
          model_version: "mock-fallback-v1",
        },
      });
    }

    // ── Live: OpenAI Chat Completions via native fetch ──
    const body = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI-driven tenant rating engine. Respond ONLY with valid JSON containing: overall_score, employment_score, doc_score, stay_length_score, income_score, reasoning, flags, model_version.",
        },
        {
          role: "user",
          content: `Booking: ${bookingId}. Profile: ${JSON.stringify(tenantProfile)}. Docs: ${JSON.stringify(docTypes)}`,
        },
      ],
      response_format: { type: "json_object" },
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json({
      success: true,
      data: JSON.parse(json.choices[0].message.content || "{}"),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
