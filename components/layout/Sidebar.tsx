"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { authApi } from '@/lib/api/auth';

const navItems = [

  { label: 'Workspaces', href: '/dashboard/workspaces', icon: Briefcase },
  { label: 'Analytics', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Classes', href: '/dashboard/classes', icon: GraduationCap },
  { label: 'Subjects', href: '/dashboard/subjects', icon: BookOpen },
  { label: 'Exams', href: '/dashboard/exams', icon: FileText },
  { label: 'Users', href: '/dashboard/users', icon: Users },
  { label: 'Results', href: '/dashboard/results', icon: BarChart3 },
];

const Sidebar = () => {
  const pathname = usePathname();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await authApi.logout();
    }
  };

  const getLinkStyles = (isActive: boolean) =>
    `group relative flex items-center gap-3 px-4 py-2 transition-all duration-200 rounded-sm  mb-1 ${isActive
      ? ' text-blue-600 bg-blue-50/50 border border-blue-400/20'
      : 'font-medium text-[#A3AED0] hover:text-[#1B2559] hover:bg-[#F4F7FF]'
    }`;

  return (
    <aside className="w-72 h-full bg-white border-r border-zinc-400/20 flex flex-col p-6">
      {/* Branding Section */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <Image
          src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
          alt="LearningDeck Logo"
          width={36}
          height={36}
          className="rounded"
        />

        <select className='w-full bg-transparent text-black border border-zinc-400/20 px-2 py-2 rounded  text-base focus:border-none focus:ring-none outline-none'>
          <option>Select Workspace</option>
        </select>
      </div>

      <nav className="flex flex-col flex-1">


        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className={getLinkStyles(isActive)}>
              <Icon size={20} className={isActive ? 'text-blue-600' : 'text-[#A3AED0] group-hover:text-[#1B2559]'} />
              <span className="text-xs">{item.label}</span>

            </Link>
          );
        })}

        <div className="mt-auto pt-6 border-t border-zinc-400/20">
          <Link href="/dashboard/settings" className={getLinkStyles(pathname === '/dashboard/settings')}>
            <Settings size={20} />
            <span className="text-xs">Settings</span>
            {pathname === '/dashboard/settings' && <ActiveIndicator />}
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-[#A3AED0] hover:text-red-500 hover:bg-red-50 transition-all rounded-[12px] group mt-1"
          >
            <LogOut size={20} className="group-hover:text-red-500" />
            <span className="text-xs font-medium">Log Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

const ActiveIndicator = () => (
  <div className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-[4px] h-[32px] bg-blue-600 rounded-l-full" />
);

export default Sidebar;
