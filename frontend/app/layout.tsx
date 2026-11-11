import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustLoad | Transparent Group Money for Cross-Border Trips",
  description: "Pool money. Buy together. Everyone sees every naira. Built for the PayPal AI Hackathon 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
