"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

const ENUMS = {
  DEMAND_LEVEL: ["HIGH", "MEDIUM", "LOW"],
  MARKET_OUTLOOK: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const getModel = (modelName) =>
  genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

async function generateWithFallback(prompt) {
  try {
    return await getModel(PRIMARY_MODEL).generateContent(prompt);
  } catch (primaryError) {
    console.warn("Primary model failed, trying fallback model...");
    try {
      return await getModel(FALLBACK_MODEL).generateContent(prompt);
    } catch (fallbackError) {
      console.error("Both primary and fallback models failed");
      throw new Error("AI generation failed");
    }
  }
}

function safeJSONParse(text) {
  try {
    const cleaned = String(text).replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Invalid AI JSON response");
  }
}

function normalizeEnum(value, allowed) {
  if (!value) return allowed[0];
  const normalized = String(value).toUpperCase().trim();
  return allowed.includes(normalized) ? normalized : allowed[0];
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((v) => String(v).trim()).filter(Boolean))];
}

function toSalaryRanges(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      role: String(item?.role ?? "").trim(),
      min: Number(item?.min ?? 0),
      max: Number(item?.max ?? 0),
      median: Number(item?.median ?? 0),
      location: String(item?.location ?? "").trim(),
    }))
    .filter((item) => item.role && Number.isFinite(item.min) && Number.isFinite(item.max) && Number.isFinite(item.median));
}

function normalizeInsights(insights) {
  return {
    salaryRanges: toSalaryRanges(insights?.salaryRanges),
    growthRate: Number.isFinite(Number(insights?.growthRate)) ? Number(insights.growthRate) : 0,
    demandLevel: normalizeEnum(insights?.demandLevel, ENUMS.DEMAND_LEVEL),
    topSkills: toStringArray(insights?.topSkills),
    marketOutlook: normalizeEnum(insights?.marketOutlook, ENUMS.MARKET_OUTLOOK),
    keyTrends: toStringArray(insights?.keyTrends),
    recommendedSkills: toStringArray(insights?.recommendedSkills),
  };
}

export async function generateAIInsights(industry) {
  const normalizedIndustry = String(industry ?? "").trim();
  if (!normalizedIndustry) {
    throw new Error("Industry is required");
  }

  const prompt = `
Analyze the current state of the ${normalizedIndustry} industry.

Return ONLY valid JSON in this exact format:
{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "HIGH" | "MEDIUM" | "LOW",
  "topSkills": ["skill1", "skill2"],
  "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "keyTrends": ["trend1", "trend2"],
  "recommendedSkills": ["skill1", "skill2"]
}

IMPORTANT:
- No markdown
- No backticks
- Only JSON
`;

  try {
    const result = await generateWithFallback(prompt);
    const text = result.response.text();
    const parsed = safeJSONParse(text);
    return normalizeInsights(parsed);
  } catch (error) {
    console.error("Error generating AI insights:", error);
    throw new Error("Failed to generate industry insights");
  }
}

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");
  if (!user.industry) throw new Error("User industry is not set");

  const nextUpdate = new Date(Date.now() + ONE_WEEK_MS);

  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    return await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate,
      },
    });
  }

  if (new Date(user.industryInsight.nextUpdate) < new Date()) {
    const insights = await generateAIInsights(user.industry);

    return await db.industryInsight.update({
      where: { id: user.industryInsight.id },
      data: {
        ...insights,
        nextUpdate,
      },
    });
  }

  return user.industryInsight;
}
