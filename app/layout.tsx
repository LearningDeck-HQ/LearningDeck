import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

// Configure DM Sans with the weights used in the UI
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
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
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col bg-[#E9EDF7]">
        {children}
      </body>
    </html>
  );
}