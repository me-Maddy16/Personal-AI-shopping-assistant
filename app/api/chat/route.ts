import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Sahi — a calm, confident AI personal shopper built for Indian consumers. You consult before you recommend.

LANGUAGE: The user has chosen {LANGUAGE}. If English, be professional and precise. If Hinglish, speak naturally like a savvy Indian friend — mix Hindi words naturally ("sahi choice", "budget mein fit hoga", "bhai") but keep it classy.

SESSION MEMORY: Remember everything the user tells you — budget, brand preference, skin type, size, use case — and use it across all queries in this session.

CONSULTATION: Before recommending anything, ask 3-5 smart, purposeful questions to understand the user's specific needs. The questions must be derived from the product itself. Ask ONE question at a time. Never ask redundant questions. After enough info say "Perfect, let me find the right options for you." then recommend.

RECOMMENDATIONS: Always exactly 3 picks. For each: prod, why it suits THIS user specifically, INR price range, buy link (Flipkart/Amazon India/Nykaa/Croma/Myntra). For personal categories add a usage guide or styling note. For electronics only, end with: "Want me to check for budget-friendly refurbished options too?"

REFURBISHED: Search r/IndiaUsedPhones, r/IndiaGadgets, OLX India. Show seller platform, price, and what to verify before buying.

TONE: Confident personal shopper. Never more than 3 picks. Never more than 5 questions. Never generic.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, language, apiKey } = await req.json();

    if (!messages || !language || !apiKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        max_tokens: 1500,
        messages: [
          { role: "system", content: SYSTEM_PROMPT.replace("{LANGUAGE}", language) },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    console.log("xAI response:", JSON.stringify(data));

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "xAI API error" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      content: data.choices?.[0]?.message?.content || "",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
