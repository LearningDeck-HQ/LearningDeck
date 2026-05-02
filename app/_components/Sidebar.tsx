"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Settings,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const [organisationExpanded, setOrganisationExpanded] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/dashboard/organisation')) {
      setOrganisationExpanded(true);
    }
  }, [pathname]);

  // Utility to handle active state styles matching the landing page theme
  const getLinkStyles = (isActive: any) =>
    `group flex items-center gap-3 px-3 py-2.5 mx-3 rounded-md transition-colors text-[14px] font-medium ${isActive
      ? 'bg-blue-50 text-blue-600'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`;

  const getIconStyles = (isActive) =>
    `w-5 h-5 transition-colors ${isActive
      ? 'text-blue-600'
      : 'text-gray-500 group-hover:text-gray-700'
    }`;

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col selection:bg-blue-100">
      {/* Branding Section */}
      <div className="px-6 py-4 mb-4 border-b border-gray-200 flex items-center h-[69px]"> {/* h-[69px] to match the landing page top nav height roughly */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
            alt="LearningDeck Logo"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-[16px] tracking-tight text-gray-800 font-medium">
            LearningDeck
          </span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto pb-4">
        {/* Home */}
        <Link href="/dashboard" className={getLinkStyles(pathname === '/dashboard')}>
          <LayoutDashboard className={getIconStyles(pathname === '/dashboard')} />
          <span>Dashboard</span>
        </Link>

        {/* Organisation Group */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setOrganisationExpanded(!organisationExpanded)}
            className={`w-full justify-between ${getLinkStyles(pathname.startsWith('/dashboard/organisation'))}`}
          >
            <div className="flex items-center gap-3">
              <Layers className={getIconStyles(pathname.startsWith('/dashboard/organisation'))} />
              <span>Organisation</span>
            </div>
            {organisationExpanded ? (
              <ChevronDown className={`w-4 h-4 ${pathname.startsWith('/dashboard/organisation') ? 'text-blue-600' : 'text-gray-400'}`} />
            ) : (
              <ChevronRight className={`w-4 h-4 ${pathname.startsWith('/dashboard/organisation') ? 'text-blue-600' : 'text-gray-400'}`} />
            )}
          </button>

          {/* Sub-menu */}
          {organisationExpanded && (
            <div className="mb-1 space-y-1">
              <Link
                href="/dashboard/organisation/members"
                className={`group flex items-center gap-3 px-3 py-2 ml-9 mr-3 rounded-md transition-colors text-[14px] font-medium ${pathname === '/dashboard/organisation/members'
                  ? 'text-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {/* Reusing the Landing Page feature list bullet point style */}
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${pathname === '/dashboard/organisation/members'
                  ? 'bg-blue-600'
                  : 'bg-gray-400 group-hover:bg-gray-600'
                  }`} />
                <span>Members</span>
              </Link>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link href="/dashboard/settings" className={getLinkStyles(pathname === '/dashboard/settings')}>
          <Settings className={getIconStyles(pathname === '/dashboard/settings')} />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;