import { Metadata } from 'next';
import WorkspaceContent from '@/components/layout/WorkspaceContent';

export const metadata: Metadata = {
  title: "Workspace | LearningDeck",
  description: "Manage your courses and collaborative tools",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <WorkspaceContent>{children}</WorkspaceContent>;
}