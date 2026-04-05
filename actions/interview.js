// actions/interview.js
"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";
const MAX_QUIZ_QUESTIONS = 10;
const MAX_RETRIES = 3;

const getJsonModel = (modelName) =>
  genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

const getTextModel = (modelName) =>
  genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.4,
    },
  });

async function generateWithFallback(prompt, mode = "text") {
  const getModel = mode === "json" ? getJsonModel : getTextModel;

  try {
    return await getModel(PRIMARY_MODEL).generateContent(prompt);
  } catch (primaryError) {
    console.warn("Primary model failed, switching to fallback...", primaryError);
    try {
      return await getModel(FALLBACK_MODEL).generateContent(prompt);
    } catch (fallbackError) {
      console.error("Both models failed:", { primaryError, fallbackError });
      throw new Error("AI generation failed");
    }
  }
}

function safeJSONParse(text) {
  try {
    const cleanedText = String(text)
      .replace(/```(?:json)?\n?/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedText);
  } catch {
    throw new Error("Invalid AI response format");
  }
}

async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, industry: true, skills: true },
  });

  if (!user) throw new Error("User not found");
  return user;
}

function normalizeQuestion(q) {
  const question = String(q?.question ?? "").trim();
  const options = Array.isArray(q?.options)
    ? q.options.map((opt) => String(opt).trim()).filter(Boolean)
    : [];
  const correctAnswer = String(q?.correctAnswer ?? "").trim();
  const explanation = String(q?.explanation ?? "").trim();

  const validOptions = options.slice(0, 4);
  const hasCorrectInOptions = validOptions.includes(correctAnswer);

  if (!question || validOptions.length !== 4 || !hasCorrectInOptions) {
    return null;
  }

  return {
    question,
    options: validOptions,
    correctAnswer,
    explanation: explanation || "Review core concepts related to this question.",
  };
}

function normalizeQuizPayload(payload) {
  const questions = Array.isArray(payload?.questions) ? payload.questions : [];
  return questions.map(normalizeQuestion).filter(Boolean).slice(0, MAX_QUIZ_QUESTIONS);
}

function buildQuizPrompt(user) {
  return `
Generate exactly ${MAX_QUIZ_QUESTIONS} technical interview questions for a ${user.industry} professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.

Rules:
- Each question must have exactly 4 options
- correctAnswer must exactly match one option
- Return ONLY valid JSON
- No markdown, no code fences, no extra text

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
}

function buildFallbackQuiz(user) {
  const industry = user.industry || "your field";
  const skills = Array.isArray(user.skills) && user.skills.length ? user.skills : ["problem solving"];

  return [
    {
      question: `What is the most important first step when solving a new ${industry} problem?`,
      options: [
        "Understand the requirements",
        "Write code immediately",
        "Skip planning",
        "Guess the answer",
      ],
      correctAnswer: "Understand the requirements",
      explanation: "Clear requirements reduce rework and improve solution quality.",
    },
    {
      question: `Which skill is most valuable for long-term growth in ${industry}?`,
      options: [
        skills[0],
        "Ignoring feedback",
        "Avoiding collaboration",
        "Working without review",
      ],
      correctAnswer: skills[0],
      explanation: "The strongest skill should align with your current professional focus.",
    },
    {
      question: "What helps improve the quality of technical decisions?",
      options: [
        "Testing assumptions",
        "Rushing to ship",
        "Avoiding documentation",
        "Skipping reviews",
      ],
      correctAnswer: "Testing assumptions",
      explanation: "Good decisions are backed by evidence, review, and validation.",
    },
    {
      question: "What is a strong way to explain your work in an interview?",
      options: [
        "Use the STAR method",
        "Speak only in jargon",
        "Avoid examples",
        "Give unrelated answers",
      ],
      correctAnswer: "Use the STAR method",
      explanation: "STAR helps structure answers clearly with situation, task, action, and result.",
    },
    {
      question: "Why is measuring results important?",
      options: [
        "It shows impact",
        "It makes answers longer",
        "It hides mistakes",
        "It avoids accountability",
      ],
      correctAnswer: "It shows impact",
      explanation: "Metrics help demonstrate the value of your work.",
    },
    {
      question: "What is a good habit during problem solving?",
      options: [
        "Break the problem into smaller parts",
        "Ignore edge cases",
        "Skip validation",
        "Do everything at once",
      ],
      correctAnswer: "Break the problem into smaller parts",
      explanation: "Decomposition makes difficult tasks easier to solve.",
    },
    {
      question: "Which approach improves team collaboration?",
      options: [
        "Share progress early",
        "Hide blockers",
        "Avoid communication",
        "Work in isolation forever",
      ],
      correctAnswer: "Share progress early",
      explanation: "Early communication helps teams unblock work faster.",
    },
    {
      question: "What is the safest way to handle uncertainty in a technical answer?",
      options: [
        "State assumptions clearly",
        "Pretend to know everything",
        "Give a random answer",
        "Change the topic",
      ],
      correctAnswer: "State assumptions clearly",
      explanation: "Clear assumptions make your reasoning more trustworthy.",
    },
    {
      question: "What often improves the quality of your output?",
      options: [
        "Review and iteration",
        "Skipping feedback",
        "Working faster only",
        "Avoiding tests",
      ],
      correctAnswer: "Review and iteration",
      explanation: "Iteration and review usually lead to better results.",
    },
    {
      question: "What is the best way to keep growing professionally?",
      options: [
        "Keep learning continuously",
        "Stop learning after one job",
        "Ignore new tools",
        "Avoid feedback",
      ],
      correctAnswer: "Keep learning continuously",
      explanation: "Continuous learning helps you adapt and stay effective.",
    },
  ];
}

export async function generateQuiz() {
  const user = await getCurrentDbUser();

  if (!user.industry) {
    throw new Error("Please complete onboarding first");
  }

  const prompt = buildQuizPrompt(user);
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const result = await generateWithFallback(prompt, "json");
      const text = result.response.text();
      const parsed = safeJSONParse(text);
      const questions = normalizeQuizPayload(parsed);

      if (questions.length === MAX_QUIZ_QUESTIONS) {
        return questions;
      }

      lastError = new Error("AI returned insufficient valid questions");
    } catch (error) {
      lastError = error;
    }
  }

  console.warn("Quiz generation fell back to local questions:", lastError?.message);
  return buildFallbackQuiz(user);
}

export async function saveQuizResult(questions, answers, score) {
  const user = await getCurrentDbUser();

  if (!Array.isArray(questions) || !Array.isArray(answers)) {
    throw new Error("Invalid quiz payload");
  }

  const safeQuestions = questions.map(normalizeQuestion).filter(Boolean);
  if (!safeQuestions.length) throw new Error("No valid questions provided");

  const safeAnswers = answers.map((a) => (a == null ? "" : String(a)));
  const questionResults = safeQuestions.map((q, index) => {
    const userAnswer = safeAnswers[index] ?? "";
    const isCorrect = q.correctAnswer === userAnswer;

    return {
      question: q.question,
      options: q.options,
      answer: q.correctAnswer,
      userAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const correctCount = questionResults.filter((q) => q.isCorrect).length;
  const computedScore = Number(
    ((correctCount / questionResults.length) * 100).toFixed(2)
  );
  const finalScore = Number.isFinite(Number(score)) ? Number(score) : computedScore;

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
The user got the following ${user.industry || "technical"} interview questions wrong:

${wrongQuestionsText}

Provide one concise improvement tip (max 2 sentences).
Focus on what to learn next and keep it encouraging.
`;

    try {
      const result = await generateWithFallback(improvementPrompt, "text");
      improvementTip = String(result.response.text() || "").trim().slice(0, 500) || null;
    } catch (error) {
      console.error("Error generating improvement tip:", error);
    }
  }

  try {
    return await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: finalScore,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const user = await getCurrentDbUser();

  try {
    return await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
