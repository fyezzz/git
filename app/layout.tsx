import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FFO Revenue Infrastructure",
  description: "Lead capture, instant AI response, qualification, booking, CRM and sales handoff.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
