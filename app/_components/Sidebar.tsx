"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();
  const [organisationExpanded, setOrganisationExpanded] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/dashboard/organisation')) {
      setOrganisationExpanded(true);
    }
  }, [pathname]);

  // Utility to handle active state styles
  const getLinkStyles = (isActive: boolean) => 
    `group relative flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
      isActive 
        ? 'font-bold text-[#1B2559]' 
        : 'font-medium text-[#A3AED0] hover:text-[#1B2559]'
    }`;

  return (
    <aside className="w-64 h-full bg-white border-r border-[#F4F7FF] flex flex-col">
      {/* Branding Section */}
      <div className="p-8 mb-4 border-b border-[#F4F7FF]">
        <div className="flex items-center gap-3">
          <Image 
            src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4" 
            alt="LearningDeck Logo" 
            width={34} 
            height={34} 
            className="rounded-full shadow-sm" 
          />
          <span className="text-[20px] font-bold text-[#1B2559] tracking-tight">
            LearningDeck
          </span>
        </div>
      </div>

      <nav className="flex flex-col px-4 gap-1">
        {/* Home */}
        <Link href="/dashboard" className={getLinkStyles(pathname === '/dashboard')}>
          <div className={`${pathname === '/dashboard' ? 'text-blue-500' : 'text-[#A3AED0] group-hover:text-[#1B2559]'}`}>
            {/* Using inline SVG for easy color manipulation to match the UI */}
            <HomeIcon />
          </div>
          <span className={`${pathname === '/dashboard' && 'text-blue-500'} text-[15px]`}>Home</span>
          {pathname === '/dashboard' && <ActiveIndicator />}
        </Link>

        {/* Organisation Group */}
        <div>
          <button 
            onClick={() => setOrganisationExpanded(!organisationExpanded)} 
            className={`${getLinkStyles(pathname.startsWith('/dashboard/organisation'))} w-full`}
          >
            <div className={`${pathname.startsWith('/dashboard/organisation') ? 'text-blue-500' : 'text-[#A3AED0] group-hover:text-[#1B2559]'}`}>
              <OrgIcon />
            </div>
            <span className={`${pathname.startsWith('/dashboard/organisation') && 'text-blue-500'} text-[15px]`}>Organisation</span>
            <span className="ml-auto text-[10px] opacity-50">{organisationExpanded ? '▼' : '▶'}</span>
            {pathname.startsWith('/dashboard/organisation') && <ActiveIndicator />}
          </button>
          
          {organisationExpanded && (
            <div className="mt-1 space-y-1">
              <Link 
                href="/dashboard/organisation/members" 
                className={`${getLinkStyles(pathname === '/dashboard/organisation/members')} pl-12`}
              >
                <div className={`${pathname === '/dashboard/organisation/members' ? 'text-blue-500' : 'text-[#A3AED0] group-hover:text-[#1B2559]'}`}>
                  {/* Simple circle icon for sub-item */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <span className={`${pathname === '/dashboard/organisation/members' && 'text-blue-500'} text-[14px]`}>Members</span>
              </Link>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link href="/dashboard/settings" className={getLinkStyles(pathname === '/dashboard/settings')}>
          <div className={`${pathname === '/dashboard/settings' ? 'text-blue-500' : 'text-[#A3AED0] group-hover:text-[#1B2559]'}`}>
            <SettingsIcon />
          </div>
          <span className={`${pathname === '/dashboard/settings' && 'text-blue-500'} text-[15px]`}>Settings</span>
          {pathname === '/dashboard/settings' && <ActiveIndicator />}
        </Link>
      </nav>
    </aside>
  );
};

// --- Sub-components for that "Pixel Perfect" look ---

const ActiveIndicator = () => (
  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[4px] h-[36px] bg-blue-500 rounded-l-full" />
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const OrgIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><line x1="9" x2="9" y1="20" y2="4"/><line x1="15" x2="15" y1="20" y2="4"/><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/></svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default Sidebar;