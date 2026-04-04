"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Models
const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

// Get model
const getModel = (modelName) =>
  genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

// Fallback wrapper
async function generateWithFallback(prompt) {
  try {
    return await getModel(PRIMARY_MODEL).generateContent(prompt);
  } catch (err) {
    console.warn("Primary failed, switching to fallback...", err);
    return await getModel(FALLBACK_MODEL).generateContent(prompt);
  }
}

// Safe JSON parser
function safeJSONParse(text) {
  try {
    const cleaned = text.replace(/```(?:json)?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON parse failed. Raw:", text);
    throw new Error("Invalid AI JSON response");
  }
}

// ✅ ENUM NORMALIZER (CRITICAL FIX)
function normalizeEnum(value, allowed) {
  if (!value) return allowed[0];

  const upper = value.toUpperCase();
  return allowed.includes(upper) ? upper : allowed[0];
}

// ========================
// Generate AI Insights
// ========================
export async function generateAIInsights(industry) {
  const prompt = `
Analyze the current state of the ${industry} industry.

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
    return safeJSONParse(text);
  } catch (error) {
    console.error("Error generating AI insights:", error);
    throw new Error("Failed to generate industry insights");
  }
}

// ========================
// Get Industry Insights
// ========================
export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  // ========================
  // CREATE if not exists
  // ========================
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const normalizedInsights = {
      ...insights,
      demandLevel: normalizeEnum(insights.demandLevel, ["HIGH", "MEDIUM", "LOW"]),
      marketOutlook: normalizeEnum(insights.marketOutlook, ["POSITIVE", "NEUTRAL", "NEGATIVE"]),
    };

    return await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...normalizedInsights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ========================
  // UPDATE if expired
  // ========================
  if (new Date(user.industryInsight.nextUpdate) < new Date()) {
    const insights = await generateAIInsights(user.industry);

    const normalizedInsights = {
      ...insights,
      demandLevel: normalizeEnum(insights.demandLevel, ["HIGH", "MEDIUM", "LOW"]),
      marketOutlook: normalizeEnum(insights.marketOutlook, ["POSITIVE", "NEUTRAL", "NEGATIVE"]),
    };

    return await db.industryInsight.update({
      where: { id: user.industryInsight.id },
      data: {
        ...normalizedInsights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ========================
  // RETURN existing
  // ========================
  return user.industryInsight;
}