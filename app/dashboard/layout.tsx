import { Metadata } from 'next';
import DashContent from '@/components/layout/DashContent';

export const metadata: Metadata = {
title: "Dashboard | LearningDeck",
  description: "Your central hub for managing workspaces, courses, and exams with ease",
  icons: {
    icon: "/learningdeck-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <DashContent>{children}</DashContent>;
}