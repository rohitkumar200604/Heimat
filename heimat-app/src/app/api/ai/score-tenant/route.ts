import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { bookingId, tenantProfile, docTypes } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback Mock Scoring for Offline/Development Mode
      const isEuCitizen = tenantProfile?.nationality === "German" || tenantProfile?.nationality === "French";
      const income = tenantProfile?.monthlyIncome || 2500;
      const rent = tenantProfile?.rent || 1000;
      
      let overall = 85;
      const flags = [];

      if (income < rent * 3) {
        overall -= 20;
        flags.push("income_low");
      }
      if (!isEuCitizen && !docTypes?.includes("visa")) {
        overall -= 15;
        flags.push("visa_missing");
      }
      if (!docTypes?.includes("passport")) {
        overall -= 10;
        flags.push("passport_missing");
      }

      return NextResponse.json({
        success: true,
        mock: true,
        data: {
          overall_score: Math.max(overall, 0),
          employment_score: tenantProfile?.employmentStatus === "Employed" ? 95 : 70,
          doc_score: docTypes?.length >= 3 ? 95 : 60,
          stay_length_score: 90,
          income_score: income >= rent * 3 ? 98 : 65,
          reasoning: "Mock scoring engine analyzed the applicant and documents. Verification passport & enrollment certificates confirm student alignment. Income criteria verified.",
          flags,
          model_version: "gpt-4o-mock-fallback"
        }
      });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI-driven tenant rating engine. Rate the application based on profile & visa/income criteria."
        },
        {
          role: "user",
          content: `Booking details: ${bookingId}. Tenant Profile: ${JSON.stringify(tenantProfile)}. Document Verification Status: ${JSON.stringify(docTypes)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    return NextResponse.json({
      success: true,
      data: JSON.parse(completion.choices[0].message.content || "{}")
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
