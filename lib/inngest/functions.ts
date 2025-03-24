import EmailTemplate from "@/emails/template";
import { sendEmail } from "../actions/send-email";
import { db } from "../prisma";
import {
  calculateNextRecurringDate,
  isNewMonth,
  isTransactionDue,
} from "../utils";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// 1. Budget Alerts with Event Batching
export const checkBudgetAlerts = inngest.createFunction(
  { id: "check-budget-alerts", name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" }, // Runs every 6 hours
  async ({ step }) => {
    // Fetch all budgets with default account
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    // Iterate over each budget
    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue; // Skip if no default account

      // Check budget usages
      await step.run(`check-budget-${budget.id}`, async () => {
        const currentDate = new Date();
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        // Calculate total expenses for the default account only
        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id, // Only consider default account
            type: "EXPENSE",
            date: {
              // greater than or equal to the start of the month
              gte: startOfMonth,
              // less than or equal to the end of the month
              lte: endOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = Number(budget.amount);
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        // Check if we should send an alert
        if (
          percentageUsed >= 80 && // Default threshold of 80%
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date())) // Send only once per month
        ) {
          // Send email alert
          const accountName = defaultAccount.name ?? "Default Account";

          try {
            const response = await sendEmail({
              receiver: budget.user.email,
              title: `Budget Alert for ${accountName}`,
              emailComponent: EmailTemplate({
                userName: budget.user.name ?? "User",
                type: "budget-alert",
                emailData: {
                  percentageUsed,
                  budgetAmount: parseInt(budgetAmount.toFixed(1)),
                  totalExpenses: parseInt(totalExpenses.toFixed(1)),
                },
              }),
            });
            if (response["status"] === 200) {
              console.log("Email sent successfully");
            }
          } catch {
            console.error("Failed to send email");
          }

          // Update last alert sent
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }
  }
);

// 2. Trigger recurring transactions with batching
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions", // Unique ID,
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" }, // Daily at midnight
  async ({ step }) => {
    // Fetch all recurring transactions that are due
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null }, // Never processed
              {
                nextRecurringDate: {
                  lte: new Date(), // Due date passed
                },
              },
            ],
          },
        });
      }
    );

    // Send event for each recurring transaction in batches
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
        },
      }));

      // Send events directly using inngest.send()
      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length }; // Return count
  }
);

// Recurring Transaction Processing with Throttling
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10, // Process 10 transactions
      period: "1m", // per minute
      key: "event.data.userId", // Throttle per user
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    // Validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      });

      if (!transaction || !isTransactionDue(transaction)) return; // Skip if not due

      // Create new transaction and update account balance in a transaction
      await db.$transaction(async (tx) => {
        // Create new transaction
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        // Update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        // Update last processed date and next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval!
            ),
          },
        });
      });
    });
  }
);

// 3. Monthly Report Generation
export const geminiGenerateFinancialInsights = async (
  stats: StatProps,
  month: string
) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
};

export const openAIGenerateFinancialInsights = async (
  stats: StatProps,
  month: string
) => {
  const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
  try {
    // Write Prompt
    const prompt = `Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
    `;

    // Call OpenAI's gpt-4o-mini API
    const response = await openAI.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content:
            "You are a financial analyst providing monthly financial insights.",
        },
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
      max_tokens: 200,
    });

    // Extract and parse response
    const textResponse = response.choices[0]?.message?.content?.trim();
    if (!textResponse) throw new Error("No response from ChatGPT");
    // Clean and parse JSON
    const cleanedText = textResponse.replace(/```(?:json)?\n?/g, "").trim();
    // Parse JSON
    try {
      const data = JSON.parse(cleanedText);
      return data;
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
};

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" }, // First day of each month
  async ({ step }) => {
    // Fetch all users with accounts
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: { accounts: true },
      });
    });

    // Generate report for each user
    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1); // Last month

        // Get monthly stats to feed into AI
        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        // Generate AI insights
        const insights = await geminiGenerateFinancialInsights(
          stats,
          monthName
        );

        // Send email alert
        try {
          const response = await sendEmail({
            receiver: user.email,
            title: `Your Monthly Financial Report - ${monthName}`,
            emailComponent: EmailTemplate({
              userName: user.name ?? "User",
              type: "monthly-report",
              emailData: {
                stats,
                month: monthName,
                insights,
              },
            }),
          });
          if (response["status"] === 200) {
            console.log("Email sent successfully");
          }
        } catch {
          console.error("Failed to send email");
        }
      });
    }

    return { processed: users.length };
  }
);

// function calculateNextRecurringDate(date, interval) {
//   const next = new Date(date);
//   switch (interval) {
//     case "DAILY":
//       next.setDate(next.getDate() + 1);
//       break;
//     case "WEEKLY":
//       next.setDate(next.getDate() + 7);
//       break;
//     case "MONTHLY":
//       next.setMonth(next.getMonth() + 1);
//       break;
//     case "YEARLY":
//       next.setFullYear(next.getFullYear() + 1);
//       break;
//   }
//   return next;
// }

const getMonthlyStats = async (userId: string, month: Date) => {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // Fetch all transactions for the month
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Reduce transaction data to 4 elements to calculate stats
  return transactions.reduce(
    (stats, t) => {
      const amount = parseInt(t.amount.toNumber().toFixed(2));
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {} as { [key: string]: number },
      transactionCount: transactions.length,
    }
  );
};
