 "use client";

import { useState } from 'react';
import { Briefcase, Home, Settings2, Activity, LayoutDashboard, Settings, BarChart3 } from 'lucide-react';
import { AshardTabItem, AshardTabs } from '@/components/ui/AshardTabs';

const WorkspacesLayout = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'manage' | 'usage'>('home');

const workspaceTabs: AshardTabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/dashboard/workspaces',
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: 'manage',
    label: 'Manage',
    href: '/dashboard/workspaces/manage',
    icon: <Settings size={18} />,
  },
  {
    id: 'usage',
    label: 'Usage',
    href: '/dashboard/workspaces/usage',
    icon: <BarChart3 size={18} />,
  },
];

  const handleTabChange = (id: string) => setActiveTab(id as 'home' | 'manage' | 'usage');

  return (
    <div className="  animate-in fade-in slide-in-from-bottom-2 duration-500 selection:bg-blue-100 h-full">
        <AshardTabs items={workspaceTabs} className="mb-4 max-w-[300px]" />
      {children}
    </div>
  );
};

export default WorkspacesLayout;