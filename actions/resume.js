"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Models
const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

const getModel = (modelName) =>
  genAI.getGenerativeModel({
    model: modelName,
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

// ========================
// Save Resume
// ========================
export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: { content },
      create: {
        userId: user.id,
        content,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

// ========================
// Get Resume
// ========================
export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    return await db.resume.findUnique({
      where: { userId: user.id },
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    throw new Error("Failed to fetch resume");
  }
}

// ========================
// Improve Resume Content with AI
// ========================
export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.

Current content:
"${current}"

Requirements:
- Use strong action verbs
- Add measurable impact (metrics, % improvement, etc.)
- Highlight relevant technical skills
- Focus on achievements over responsibilities
- Use industry-specific keywords
- Keep it concise but impactful

Return ONLY the improved paragraph.
No explanations, no extra text.
`;

  try {
    const result = await generateWithFallback(prompt);
    const improvedContent = result.response.text().trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}