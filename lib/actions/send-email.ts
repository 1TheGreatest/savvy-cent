"use server";
import { JSX } from "react";
import { Resend } from "resend";

interface EmailParams {
  receiver: string;
  title: string;
  emailComponent: JSX.Element | undefined;
}

export async function sendEmail({
  receiver,
  title,
  emailComponent,
}: EmailParams) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    const { data, error } = await resend.emails.send({
      from: "SavvyCent <onboarding@resend.dev>",
      to: ["sampomahdev@gmail.com"],
      subject: title,
      react: emailComponent,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
