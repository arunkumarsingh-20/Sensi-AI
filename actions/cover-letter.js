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

const MAX_JOB_TITLE = 120;
const MAX_COMPANY_NAME = 120;
const MAX_JOB_DESCRIPTION = 8000;

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

function requiredString(value, field, maxLen) {
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  const v = value.trim();
  if (!v) throw new Error(`${field} is required`);
  if (v.length > maxLen) throw new Error(`${field} is too long`);
  return v;
}

function optionalString(value, maxLen = 2000) {
  if (typeof value !== "string") return "";
  const v = value.trim();
  return v.slice(0, maxLen);
}

async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true,
      industry: true,
      experience: true,
      skills: true,
      bio: true,
    },
  });

  if (!user) throw new Error("User not found");
  return user;
}

export async function generateCoverLetter(data) {
  const user = await getCurrentDbUser();

  const jobTitle = requiredString(data?.jobTitle, "Job title", MAX_JOB_TITLE);
  const companyName = requiredString(data?.companyName, "Company name", MAX_COMPANY_NAME);
  const jobDescription = requiredString(
    data?.jobDescription,
    "Job description",
    MAX_JOB_DESCRIPTION
  );

  const prompt = `
Write a professional cover letter for a ${jobTitle} position at ${companyName}.

About the candidate:
- Industry: ${optionalString(user.industry, 100) || "Not specified"}
- Years of Experience: ${Number.isFinite(Number(user.experience)) ? Number(user.experience) : "Not specified"}
- Skills: ${Array.isArray(user.skills) && user.skills.length ? user.skills.join(", ") : "Not specified"}
- Professional Background: ${optionalString(user.bio, 1200) || "Not specified"}

Job Description:
${jobDescription}

Requirements:
1. Use a professional and enthusiastic tone
2. Highlight relevant skills and experience
3. Show understanding of the company's needs
4. Keep it concise (max 400 words)
5. Use proper business letter formatting in markdown
6. Include specific examples of achievements
7. Relate candidate's background to job requirements

IMPORTANT:
- Return clean markdown
- Do NOT include backticks or code blocks
`;

  try {
    const result = await generateWithFallback(prompt);
    const content = String(result.response.text() || "").trim();

    if (!content) {
      throw new Error("Empty AI response");
    }

    const coverLetter = await db.coverLetter.create({
      data: {
        content: content.slice(0, 20000),
        jobDescription,
        companyName,
        jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter");
  }
}

export async function getCoverLetters() {
  const user = await getCurrentDbUser();

  try {
    return await db.coverLetter.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching cover letters:", error);
    throw new Error("Failed to fetch cover letters");
  }
}

export async function getCoverLetter(id) {
  const user = await getCurrentDbUser();
  const safeId = requiredString(id, "Cover letter id", 100);

  try {
    return await db.coverLetter.findFirst({
      where: {
        id: safeId,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Error fetching cover letter:", error);
    throw new Error("Failed to fetch cover letter");
  }
}

export async function deleteCoverLetter(id) {
  const user = await getCurrentDbUser();
  const safeId = requiredString(id, "Cover letter id", 100);

  try {
    const result = await db.coverLetter.deleteMany({
      where: {
        id: safeId,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      throw new Error("Cover letter not found");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting cover letter:", error);
    throw new Error("Failed to delete cover letter");
  }
}
