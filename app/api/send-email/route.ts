// "use server";
import { handleError } from "@/lib/utils";
import { JSX } from "react";
import { Resend } from "resend";

interface EmailParams {
  to: string;
  subject: string;
  react: JSX.Element | undefined;
}

export async function sendEmail({ to, subject, react }: EmailParams) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    const data = await resend.emails.send({
      from: "SavvyCent <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    return { success: true, data };
  } catch (error) {
    handleError(error, "Error sending email");
    return { success: false, error };
  }
}
