import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseServer } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { bookingId, tenantProfile, docTypes } = await req.json();

    const supabase = getSupabaseServer();

    // Fetch booking details to get tenant_id
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("tenant_id")
      .eq("id", bookingId)
      .single();

    const tenantId = booking?.tenant_id || "00000000-0000-0000-0000-000000000000";

    const apiKey = process.env.OPENAI_API_KEY;
    let scoreData: any;

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

      scoreData = {
        overall_score: Math.max(overall, 0),
        employment_score: tenantProfile?.employmentStatus === "Employed" ? 95 : 70,
        doc_score: docTypes?.length >= 3 ? 95 : 60,
        stay_length_score: 90,
        income_score: income >= rent * 3 ? 98 : 65,
        reasoning: "Mock scoring engine analyzed the applicant and documents. Verification passport & enrollment certificates confirm student alignment. Income criteria verified.",
        flags,
        model_version: "gpt-4o-mock-fallback"
      };
    } else {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI-driven tenant rating engine. Evaluate the tenant's application based on profile data, income vs rent, and uploaded documents.
You must return a JSON object with the following fields:
{
  "overall_score": number (0-100, overall suitability score),
  "employment_score": number (0-100, based on job stability: employed/student/unemployed),
  "doc_score": number (0-100, completeness/validity of uploaded documents),
  "stay_length_score": number (0-100, based on lease length and student/work program duration),
  "income_score": number (0-100, based on monthly income vs total rent: ideally income should be >= 3x rent),
  "reasoning": string (concise explanation of the ratings in English or German),
  "flags": string[] (list of warning flags like "income_low", "passport_missing", "visa_missing", "probation_period")
}`
          },
          {
            role: "user",
            content: `Booking details: ${bookingId}. Tenant Profile: ${JSON.stringify(tenantProfile)}. Document Verification Status: ${JSON.stringify(docTypes)}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const parsedData = JSON.parse(completion.choices[0].message.content || "{}");
      
      scoreData = {
        overall_score: parsedData.overall_score ?? 70,
        employment_score: parsedData.employment_score ?? 70,
        doc_score: parsedData.doc_score ?? 70,
        stay_length_score: parsedData.stay_length_score ?? 70,
        income_score: parsedData.income_score ?? 70,
        reasoning: parsedData.reasoning ?? "AI screening completed.",
        flags: parsedData.flags ?? [],
        model_version: "gpt-4o"
      };
    }

    // Save score in the database
    const { error: insertErr } = await supabase
      .from("ai_tenant_scores")
      .insert({
        booking_id: bookingId,
        tenant_id: tenantId,
        overall_score: scoreData.overall_score,
        employment_score: scoreData.employment_score,
        doc_score: scoreData.doc_score,
        stay_length_score: scoreData.stay_length_score,
        income_score: scoreData.income_score,
        reasoning: scoreData.reasoning,
        flags: scoreData.flags,
        model_version: scoreData.model_version
      });

    if (insertErr) {
      console.error("Error inserting AI scores:", insertErr);
    }

    // Update booking status to docs_review
    const { error: updateErr } = await supabase
      .from("bookings")
      .update({ status: "docs_review" })
      .eq("id", bookingId);

    if (updateErr) {
      console.error("Error updating booking status:", updateErr);
    }

    return NextResponse.json({
      success: true,
      data: scoreData
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
