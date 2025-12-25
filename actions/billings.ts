"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PackId, getCreditsPack } from "@/lib/billing";
import { UserBalance } from "@prisma/client";

export async function getAvailableCredits() {
  const { userId } = await auth();
  if (!userId) {
    return 0;
  }

  let userBalance: UserBalance | null = await prisma.userBalance.findUnique({
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

export async function purchaseCredits(packId: PackId) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  // Get the pack details
  const pack = getCreditsPack(packId);
  if (!pack) {
    throw new Error("Invalid pack");
  }

  // TODO: Implement Stripe payment integration
  // For now, just add credits directly
  const userBalance = await prisma.userBalance.upsert({
    where: { userId },
    create: {
      userId,
      credits: pack.credits,
    },
    update: {
      credits: {
        increment: pack.credits,
      },
    },
  });

  return userBalance.credits;
}

export async function downloadInvoice(id: string): Promise<string> {
  // TODO: Implement invoice download functionality
  // For now, return a placeholder URL
  return "#";
}
