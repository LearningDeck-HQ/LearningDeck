import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Updated import
import "./globals.css";

// Configure Inter with preferred weights and CSS variable
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LearningDeck - Sign In",
  description: "Secure login to your LearningDeck account",
  icons: {
    icon: "/learningdeck-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col bg-[#E9EDF7]">
        {children}
      </body>
    </html>
  );
}