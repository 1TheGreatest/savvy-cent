"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../prisma";
import { handleError, serializeAccount, serializeTransaction } from "../utils";
import { revalidatePath } from "next/cache";

export const createAccount = async ({
  name,
  type,
  balance,
  isDefault,
}: CreateAccountProps) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Convert balance to float before saving
    const balanceFloat = parseFloat(balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance");
    }

    // check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: {
        userId: user.id,
      },
    });

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault = existingAccounts.length === 0 ? true : isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // create the account
    const newAccount = await db.account.create({
      data: {
        name,
        type,
        balance: balanceFloat,
        isDefault: shouldBeDefault,
        userId: user.id,
      },
    });

    // Serialize the account before returning because next.js does not support decimal values
    const serializedAccount = serializeAccount(newAccount);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    handleError(error, "Error creating account");
  }
};

// getUserAccounts fetches all accounts for the logged in user
export const getUserAccounts = async () => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const existingAccounts = await db.account.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        isDefault: "desc",
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    // Serialize the accounts before returning because next.js does not support decimal values
    const serializedAccounts = existingAccounts.map(serializeAccount);

    return serializedAccounts;
    // return { success: true, data: serializedAccounts };
  } catch (error) {
    handleError(error, "Error fetching accounts");
  }
};

export const getDashboardData = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get all user transactions
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeTransaction);
};
