"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
// Generate Cover Letter
// ========================
export async function generateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
Write a professional cover letter for a ${data.jobTitle} position at ${
    data.companyName
  }.

About the candidate:
- Industry: ${user.industry}
- Years of Experience: ${user.experience}
- Skills: ${user.skills?.join(", ")}
- Professional Background: ${user.bio}

Job Description:
${data.jobDescription}

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
    const content = result.response.text().trim();

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
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

// ========================
// Get All Cover Letters
// ========================
export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

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

// ========================
// Get Single Cover Letter
// ========================
export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    return await db.coverLetter.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Error fetching cover letter:", error);
    throw new Error("Failed to fetch cover letter");
  }
}

// ========================
// Delete Cover Letter
// ========================
export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    return await db.coverLetter.delete({
      where: {
        id,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Error deleting cover letter:", error);
    throw new Error("Failed to delete cover letter");
  }
}