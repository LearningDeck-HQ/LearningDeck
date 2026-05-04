"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Briefcase,
  Users,
  GraduationCap,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  FileText,
  LayoutDashboard,
  User
} from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { workspaceApi } from '@/lib/api/workspaces';
import { Workspace } from '@/types';

const navItems = [
 
  { label: 'Plan', href: '/dashboard/plan', icon: CreditCard },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const workspaceSubItems = [
   { label: 'Analytics', href: '/dashboard', icon: BarChart3 },
  { label: 'Exams', href: '/dashboard/exams', icon: BookOpen },
  { label: 'Questions', href: '/dashboard/questions', icon: FileText },
  { label: 'Subjects', href: '/dashboard/subjects', icon: LayoutDashboard },
  { label: 'Classes', href: '/dashboard/classes', icon: GraduationCap },
  { label: 'Teachers', href: '/dashboard/teachers', icon: User },
  { label: 'Students', href: '/dashboard/students', icon: Users },
  { label: 'Results', href: '/dashboard/results', icon: BarChart3 },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [workspacesExpanded, setWorkspacesExpanded] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState('Workspace 1');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await workspaceApi.list();
          if (res.data) setWorkspaces(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          //setIsLoading(false);
        }
      };
      fetchData();
    }, []);
  

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      await authApi.logout();
    }
  };

  const getLinkStyles = (isActive: boolean) =>
    `block px-3 py-1 rounded-sm text-xs ${isActive
      ? 'bg-zinc-300/20 text-[#0e0f10]'
      : 'hover:bg-accent-light'
    }`;

  return (
    <aside className="w-fit h-full bg-white border-r border-zinc-400/20 flex flex-col p-4 text-[#6b6b6b]">
      {/* Branding Section */}
      <div className="flex items-center gap-1 mb-3 px-2">
        <Image
          src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
          alt="LearningDeck Logo"
          width={20}
          height={20}
          className="rounded"
        />

        <select
          value={currentWorkspace}
          onChange={(e) => setCurrentWorkspace(e.target.value)}
          className='flex w-full bg-transparent text-black border border-zinc-400/20 px-2 py-2 rounded text-xs outline-none'
        >
         {workspaces.map((ws) => (
            <option key={ws.id} value={ws.name} className='truncate'>
              {ws.name}
            </option>
          ))}
        </select>
      </div>

      <nav className="flex flex-col flex-1">
       

        <div>
          <button
            onClick={() => setWorkspacesExpanded(!workspacesExpanded)}
            className={`${getLinkStyles(pathname.startsWith('/dashboard/workspaces'))} flex justify-between items-center w-full`}
          >
            <div className="flex items-center">
              <Briefcase className="inline-block mr-2" />
              Workspaces
            </div>
            <ChevronDown className={`transform transition-transform ${workspacesExpanded ? 'rotate-180' : ''}`} />
          </button>
          {workspacesExpanded && (
            <div className="ml-4">
              {workspaceSubItems.map((item) => (
                <Link key={item.href} href={item.href} className={getLinkStyles(pathname === item.href)}>
                  <item.icon className="inline-block mr-2" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
 {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className={getLinkStyles(isActive)}>
              <Icon className="inline-block mr-2" />
              {item.label}
            </Link>
          );
        })}
        <div className="mt-auto pt-6 border-t border-zinc-400/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-1 text-xs text-[#6b6b6b] hover:text-red-500 hover:bg-red-50 transition-all rounded-sm group"
          >
            <LogOut className="group-hover:text-red-500" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
