"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getAvailableCredits() {
  const { userId } = await auth();
  if (!userId) {
    return 0;
  }

  let userBalance = await prisma.userBalance.findUnique({
    where: { userId },
  });

  if (!userBalance) {
    userBalance = await prisma.userBalance.create({
      data: {
        userId,
        credits: 200,
      }
    });
    return userBalance.credits;
  }

  const now = new Date();
  const lastRefill = new Date(userBalance.lastRefillAt);
  const oneDay = 24 * 60 * 60 * 1000;

  if (now.getTime() - lastRefill.getTime() > oneDay) {
    userBalance = await prisma.userBalance.update({
      where: { userId },
      data: {
        credits: 200,
        lastRefillAt: now,
      },
    });
  }

  return userBalance.credits;
}

export async function setupUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  const userBalance = await prisma.userBalance.findUnique({
    where: {
      userId,
    },
  });

  if (!userBalance) {
    await prisma.userBalance.create({
      data: {
        userId,
        credits: 200,
      },
    });
  }

  redirect("/home");
}
