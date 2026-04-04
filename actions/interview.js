"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Primary + fallback models
const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

// Helper to get model
const getModel = (modelName) =>
  genAI.getGenerativeModel({ model: modelName });

// Helper for safe AI call with fallback
async function generateWithFallback(prompt) {
  try {
    const model = getModel(PRIMARY_MODEL);
    return await model.generateContent(prompt);
  } catch (err) {
    console.warn("Primary model failed, switching to fallback...", err);
    const fallbackModel = getModel(FALLBACK_MODEL);
    return await fallbackModel.generateContent(prompt);
  }
}

// Safe JSON parser
function safeJSONParse(text) {
  try {
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (err) {
    console.error("JSON Parse Error. Raw response:", text);
    throw new Error("Invalid AI response format");
  }
}

// ========================
// Generate Quiz
// ========================
export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
Generate 10 technical interview questions for a ${user.industry} professional${
    user.skills?.length
      ? ` with expertise in ${user.skills.join(", ")}`
      : ""
  }.

Each question must be multiple choice with exactly 4 options.

IMPORTANT:
- Return ONLY valid JSON
- Do NOT include markdown or backticks
- Ensure correctAnswer exactly matches one option

Format:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}
`;

  try {
    const result = await generateWithFallback(prompt);
    const text = result.response.text();

    const quiz = safeJSONParse(text);

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

// ========================
// Save Quiz Result
// ========================
export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"
Correct Answer: "${q.answer}"
User Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
The user got the following ${user.industry} technical interview questions wrong:

${wrongQuestionsText}

Provide a concise improvement tip (max 2 sentences).
Focus on what to learn next. Be encouraging.
Do NOT mention mistakes explicitly.
`;

    try {
      const result = await generateWithFallback(improvementPrompt);
      improvementTip = result.response.text().trim();
    } catch (error) {
      console.error("Error generating improvement tip:", error);
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

// ========================
// Get Assessments
// ========================
export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}