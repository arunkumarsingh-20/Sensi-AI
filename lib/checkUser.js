// lib/checkUser.js
import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    null;

  if (!email) {
    return null;
  }

  const firstName = user.firstName?.trim() || "";
  const lastName = user.lastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const fallbackName = user.username?.trim() || email.split("@")[0] || "User";

  try {
    const existingUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    const dbUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        email,
        imageUrl: user.imageUrl || "",
        name: fullName || fallbackName,
      },
    });

    return dbUser;
  } catch (error) {
    console.error("checkUser failed:", error);
    return null;
  }
};
