import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"] // Need explicit weights for mono occasionally
});

export const metadata: Metadata = {
  title: "Expense Simplified",
  description: "Multi-currency reimbursements with smart approval workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#EFEFEB] overflow-hidden">
        {children}
      </body>
    </html>
  );
}
