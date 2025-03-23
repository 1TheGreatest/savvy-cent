"use server";
import EmailTemplate from "@/emails/template";
import { Resend } from "resend";

interface EmailParams {
  receiver: string;
  accountName: string;
  userName: string;
  type: string;
  percentageUsed: number;
  budAmount: number;
  totExpenses: number;
}

export async function POST(req: Request) {
  const {
    receiver,
    accountName,
    userName,
    type,
    percentageUsed,
    budAmount,
    totExpenses,
  }: EmailParams = await req.json();
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    const { data, error } = await resend.emails.send({
      from: "SavvyCent <onboarding@resend.dev>",
      to: [receiver],
      subject: `Budget Alert for ${accountName}`,
      react: EmailTemplate({
        userName: userName,
        type: type,
        data: {
          percentageUsed: percentageUsed,
          budgetAmount: budAmount,
          totalExpenses: totExpenses,
        },
      }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
