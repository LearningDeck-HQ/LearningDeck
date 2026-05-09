"use client";

import Image from "next/image"
import { MdSearch } from "react-icons/md";
import { useSidebar } from "@/context/SidebarContext";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { RiMenu5Line } from "react-icons/ri";



const Header = () => {
  const { toggleLeftSidebar } = useSidebar();
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const profilePopoverRef = React.useRef<HTMLDivElement>(null);
  const navigate = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedUser = window.localStorage.getItem('user');
    if (!storedUser) return;

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error('Header: Failed to parse stored user', error);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profilePopoverRef.current &&
        !profilePopoverRef.current.contains(event.target as Node)
      ) {
        setIsProfilePopoverOpen(false);
      }
    };

    if (isProfilePopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfilePopoverOpen]);

  const handleLogout = async () => {
    setIsProfilePopoverOpen(false);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
    }

    try {
      if (typeof window !== 'undefined' && (window as any).api?.clearAuthToken) {
        await (window as any).api.clearAuthToken();
      }
    } catch (error) {
      console.warn('Header: clearAuthToken failed', error);
    }

    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Header: authApi.logout failed', error);
    }

    navigate.push('/login');
  };

  const profileName = user?.user_name || user?.name || 'Guest';
  const profileEmail = user?.user_email || user?.email || 'No email';

  return (
    <div className='flex justify-between w-full  bg-[#f9f9f9] border-b border-[#ededed] text-[#6b6b6b] py-2 '>
      <div className='flex items-center gap-2 px-2 '>
        {/* Desktop Toggle */}

        <button
          onClick={toggleLeftSidebar}
          className=" text-xl cursor-pointer  hover:text-[#0e0f10] transition-colors"
        >
          <RiMenu5Line />

        </button>

        <Image src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4" alt="LearningDeck" width={20} height={20} className='rounded' />
        <span className='font-medium truncate'><span className="text-black">LearningDeck |</span> Web Dashboard</span>
      </div>
      <div className="px-3 hidden md:block">
        <div className="relative group">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#6b6b6b] group-focus-within:text-[#0e0f10] transition-colors" />
          <input
            type="text"
            placeholder="Search in LearningDeck"
            className="w-full bg-[#ededed]/50 border border-[#ededed] rounded-md py-1.5 pl-10 pr-3 text-xs text-[#0e0f10] placeholder:text-[#6b6b6b] outline-none focus:bg-white focus:border-zinc-300 transition-all"
          />
        </div>
      </div>

      <div className='relative flex items-center gap-2 px-2 '>
        <button
          type="button"
          onClick={() => setIsProfilePopoverOpen((prev) => !prev)}
          className="rounded-full overflow-hidden border border-[#e5e7eb] hover:border-[#cbd5e1] transition-colors"
        >
          <Image src="data:image/png;base64,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" alt="Profile" width={34} height={34} className='rounded-full' />
        </button>



        {isProfilePopoverOpen && (
          <div
            ref={profilePopoverRef}
            className="absolute right-2 top-[calc(100%+10px)] w-72 bg-white border border-[#ededed] shadow rounded z-[200] overflow-hidden"
          >
            <div className="p-4 bg-zinc-50 border-b border-zinc-200">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-sm text-zinc-900 font-medium truncate">
                  {user?.user_name || user?.name || 'None'}
                </div>
                {user?.role && (
                  <span className="text-[10px] font-medium uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {user.role}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-500 truncate">
                {user?.user_email || user?.email || 'none'}
              </div>
            </div>
            <div className="flex flex-col gap-1 p-2">
              <button
                onClick={() => {
                  setIsProfilePopoverOpen(false);
                  alert('View Profile coming soon');
                }}
                className="text-left text-[12px] px-3 py-2 rounded hover:bg-zinc-100"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  setIsProfilePopoverOpen(false);
                  alert('Settings coming soon');
                }}
                className="text-left text-[12px] px-3 py-2 rounded hover:bg-zinc-100"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  setIsProfilePopoverOpen(false);
                  alert('Switch accounts coming soon');
                }}
                className="text-left text-[12px] px-3 py-2 rounded hover:bg-zinc-100"
              >
                Switch Accounts
              </button>
              <button
                onClick={() => {
                  setIsProfilePopoverOpen(false);
                  alert('Add account coming soon');
                }}
                className="text-left text-[12px] px-3 py-2 rounded hover:bg-zinc-100"
              >
                Add Account
              </button>
              <button
                onClick={handleLogout}
                className="text-left text-[12px] px-3 py-2 rounded text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  )
}

export default Header