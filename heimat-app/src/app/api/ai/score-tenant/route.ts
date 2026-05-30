import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { bookingId, tenantProfile, docTypes } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    const supabaseServer = getSupabaseServer();

    let dbTenantId = "";
    let rentAmount = 1000;

    const isMock = !bookingId || bookingId.startsWith("mock");

    if (!isMock) {
      const { data: booking, error: bookingErr } = await supabaseServer
        .from("bookings")
        .select(`
          tenant_id,
          rent_total,
          properties (
            rent_cold
          )
        `)
        .eq("id", bookingId)
        .single();

      if (bookingErr || !booking) {
        console.error("Error fetching booking for AI scoring:", bookingErr);
        return NextResponse.json({
          success: false,
          error: `Booking not found: ${bookingErr?.message || "Invalid booking ID"}`
        }, { status: 404 });
      }

      dbTenantId = booking.tenant_id;
      const prop = booking.properties as any;
      rentAmount = prop?.rent_cold ? parseFloat(prop.rent_cold) : parseFloat(booking.rent_total);
    }

    let scoreData: any;

    if (!apiKey) {
      // ── Dev mock fallback (no API key needed) ──
      const income = tenantProfile?.monthlyIncome || 2500;
      const rent = tenantProfile?.rent || rentAmount;
      const isEuCitizen =
        tenantProfile?.nationality === "German" ||
        tenantProfile?.nationality === "French" ||
        tenantProfile?.nationality?.toLowerCase() === "deutsch" ||
        tenantProfile?.nationality?.toLowerCase() === "germany";

      let overall = 85;
      const flags: string[] = [];

      if (income < rent * 3) { overall -= 20; flags.push("income_low"); }
      if (!isEuCitizen && !docTypes?.includes("visa")) {
        overall -= 15;
        flags.push("visa_missing");
      }
      if (!docTypes?.includes("passport")) { overall -= 10; flags.push("passport_missing"); }

      scoreData = {
        overall_score: Math.max(overall, 0),
        employment_score: tenantProfile?.employmentStatus === "Employed" || tenantProfile?.employmentStatus === "employed" ? 95 : 70,
        doc_score: (docTypes?.length ?? 0) >= 3 ? 95 : 60,
        stay_length_score: 90,
        income_score: income >= rent * 3 ? 98 : 65,
        reasoning:
          "Mock scoring analysis: Provided documentation covers basic identification. Income is healthy relative to average cold rent. Alignment matches standard tenant criteria.",
        flags,
        model_version: "mock-fallback-v1",
      };
    } else {
      // ── Live: OpenRouter AI Chat Completions via native fetch ──
      const body = {
        model: "google/gemini-2.5-flash", // fast and cost-effective default model on OpenRouter
        messages: [
          {
            role: "system",
            content:
              "You are an AI-driven tenant rating engine. Respond ONLY with valid JSON containing: overall_score, employment_score, doc_score, stay_length_score, income_score, reasoning, flags, model_version. Do not format with markdown, only return pure JSON.",
          },
          {
            role: "user",
            content: `Booking: ${bookingId}. Profile: ${JSON.stringify(tenantProfile)}. Docs: ${JSON.stringify(docTypes)}`,
          },
        ],
        response_format: { type: "json_object" },
      };

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://heimat-app.vercel.app",
          "X-Title": "Heimat App",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ success: false, error: err }, { status: res.status });
      }

      const json = await res.json();
      scoreData = JSON.parse(json.choices[0].message.content || "{}");
    }

    // ── Save score data and update booking if NOT mock ──
    if (!isMock) {
      // 1. Check for existing score
      const { data: existingScore } = await supabaseServer
        .from("ai_tenant_scores")
        .select("id")
        .eq("booking_id", bookingId)
        .maybeSingle();

      if (existingScore) {
        const { error: updateScoreErr } = await supabaseServer
          .from("ai_tenant_scores")
          .update({
            overall_score: scoreData.overall_score,
            employment_score: scoreData.employment_score,
            doc_score: scoreData.doc_score,
            stay_length_score: scoreData.stay_length_score,
            income_score: scoreData.income_score,
            reasoning: scoreData.reasoning,
            flags: scoreData.flags || [],
            model_version: scoreData.model_version || "ai-v1",
          })
          .eq("id", existingScore.id);

        if (updateScoreErr) throw updateScoreErr;
      } else {
        const { error: insertScoreErr } = await supabaseServer
          .from("ai_tenant_scores")
          .insert({
            booking_id: bookingId,
            tenant_id: dbTenantId,
            overall_score: scoreData.overall_score,
            employment_score: scoreData.employment_score,
            doc_score: scoreData.doc_score,
            stay_length_score: scoreData.stay_length_score,
            income_score: scoreData.income_score,
            reasoning: scoreData.reasoning,
            flags: scoreData.flags || [],
            model_version: scoreData.model_version || "ai-v1",
          });

        if (insertScoreErr) throw insertScoreErr;
      }

      // 2. Cache overall match score in tenant_profiles table
      const { error: tpScoreErr } = await supabaseServer
        .from("tenant_profiles")
        .update({ ai_score: scoreData.overall_score })
        .eq("user_id", dbTenantId);
      
      if (tpScoreErr) {
        console.warn("Could not cache ai_score on tenant_profiles, might not exist yet:", tpScoreErr);
      }

      // 3. Update the bookings pipeline status to docs_review
      const { error: bookingUpdateErr } = await supabaseServer
        .from("bookings")
        .update({ status: "docs_review" })
        .eq("id", bookingId);

      if (bookingUpdateErr) throw bookingUpdateErr;
    }

    return NextResponse.json({
      success: true,
      data: scoreData,
    });
  } catch (error: any) {
    console.error("Error in AI score POST handler:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
