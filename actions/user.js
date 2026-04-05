"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { generateAIInsights } from "./dashboard";

function normalizePayload(data) {
  const industry = typeof data?.industry === "string" ? data.industry.trim() : "";
  const bio = typeof data?.bio === "string" ? data.bio.trim() : "";
  const experience = Number.isFinite(Number(data?.experience))
    ? Number(data.experience)
    : null;

  const skills = Array.isArray(data?.skills)
    ? [...new Set(data.skills.map((s) => String(s).trim()).filter(Boolean))]
    : [];

  if (!industry) {
    throw new Error("Industry is required");
  }

  if (experience === null || experience < 0 || experience > 50) {
    throw new Error("Experience must be between 0 and 50");
  }

  return { industry, bio, experience, skills };
}

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existingUser = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!existingUser) throw new Error("User not found");

  const payload = normalizePayload(data);

  try {
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: payload.industry },
    });

    if (!industryInsight) {
      const insights = await generateAIInsights(payload.industry);

      industryInsight = await db.industryInsight.upsert({
        where: { industry: payload.industry },
        update: {},
        create: {
          industry: payload.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const updatedUser = await db.user.update({
      where: { id: existingUser.id },
      data: {
        industry: payload.industry,
        experience: payload.experience,
        bio: payload.bio,
        skills: payload.skills,
      },
    });

    return { success: true, updatedUser, industryInsight };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });

    if (!user) throw new Error("User not found");

    return {
      isOnboarded: Boolean(user.industry),
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
