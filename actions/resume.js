"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

const MAX_RESUME_LENGTH = 100_000;
const MAX_SECTION_LENGTH = 4_000;

const getModel = (modelName) =>
  genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.5,
    },
  });

async function generateWithFallback(prompt) {
  try {
    return await getModel(PRIMARY_MODEL).generateContent(prompt);
  } catch (primaryError) {
    console.warn("Primary model failed, switching to fallback...");
    try {
      return await getModel(FALLBACK_MODEL).generateContent(prompt);
    } catch (fallbackError) {
      console.error("Both models failed:", { primaryError, fallbackError });
      throw new Error("AI generation failed");
    }
  }
}

async function getCurrentDbUser({ includeIndustryInsight = false } = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: includeIndustryInsight ? { industryInsight: true } : undefined,
  });

  if (!user) throw new Error("User not found");
  return user;
}

function assertString(value, fieldName, maxLength) {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${fieldName} is required`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} is too long`);
  }

  return trimmed;
}

export async function saveResume(content) {
  const user = await getCurrentDbUser();

  const safeContent = assertString(content, "Resume content", MAX_RESUME_LENGTH);

  try {
    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: { content: safeContent },
      create: {
        userId: user.id,
        content: safeContent,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const user = await getCurrentDbUser();

  try {
    return await db.resume.findUnique({
      where: { userId: user.id },
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    throw new Error("Failed to fetch resume");
  }
}

export async function improveWithAI({ current, type }) {
  const user = await getCurrentDbUser({ includeIndustryInsight: true });

  if (!user.industry) {
    throw new Error("Please complete onboarding first");
  }

  const safeCurrent = assertString(current, "Current content", MAX_SECTION_LENGTH);
  const safeType = assertString(type, "Type", 50);

  const prompt = `
As an expert resume writer, improve the following ${safeType} description for a ${user.industry} professional.

Current content:
"${safeCurrent}"

Requirements:
- Use strong action verbs
- Add measurable impact (metrics, % improvement, etc.)
- Highlight relevant technical skills
- Focus on achievements over responsibilities
- Use industry-specific keywords
- Keep it concise but impactful (max 120 words)

Return ONLY the improved paragraph.
No explanations, no extra text.
`;

  try {
    const result = await generateWithFallback(prompt);
    const improvedContent = String(result.response.text() || "").trim();

    if (!improvedContent) {
      throw new Error("Empty AI response");
    }

    return improvedContent.slice(0, 2000);
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}
