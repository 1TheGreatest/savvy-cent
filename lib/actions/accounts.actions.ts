"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../prisma";
import { handleError, serializeAccount, serializeTransaction } from "../utils";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

export const updateDefaultAccount = async (accountId: string) => {
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

    // unset other default accounts
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: {
        isDefault: true,
      },
    });

    const serializedAccount = serializeAccount(account);
    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    handleError(error, "Error updating default account");
  }
};

export const getAccountWithTransactions = async (accountId: string) => {
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

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        transactions: {
          orderBy: {
            date: "desc",
          },
        },
        //    _count: {
        //      select: { transactions: true },
        //    },
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    const serializedAccount = serializeAccount(account);

    return {
      account: serializedAccount,
      transactions: account.transactions.map(serializeTransaction),
    };
  } catch (error) {
    handleError(error, "Error fetching account");
  }
};

// bulk delete transactions
export const bulkDeleteTransactions = async (transactionIds: string[]) => {
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

    const transactions = await db.transaction.findMany({
      where: {
        id: {
          in: transactionIds,
        },
        userId: user.id,
      },
    });

    const accountBalaceChanges = transactions.reduce((acc, transaction) => {
      const amount =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + amount;
      return acc;
    }, {});

    // Delete transactions and update account balances
    await db.$transaction(async (tx) => {
      // Delete transactions
      await tx.transaction.deleteMany({
        where: {
          id: {
            in: transactionIds,
          },
          userId: user.id,
        },
      });

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalaceChanges
      )) {
        await tx.account.update({
          where: {
            id: accountId,
          },
          data: {
            balance: {
              increment: balanceChange as Decimal,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    return { success: true };
  } catch (error) {
    handleError(error, "Error deleting transactions");
  }
};
