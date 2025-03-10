import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SavvyCent - Every cent counts, and your AI knows it.",
  description:
    "SavvyCent is a personal finance app that helps  you save money.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header />
          <main className="min-h-screen">{children}</main>

          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto text-center text-gray-600">
              <p className=""> Made with ❤️ by TheGreatest </p>
            </div>
          </footer>
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
