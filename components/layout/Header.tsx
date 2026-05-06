"use client";

import Image from "next/image"
import { MdSearch } from "react-icons/md";
import { CiMenuBurger } from "react-icons/ci";
import { useSidebar } from "@/context/SidebarContext";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";

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
                    className=" text-xl cursor-pointer text-black hover:text-[#0e0f10] transition-colors"
                >
                    <CiMenuBurger  />
                </button>

                <Image src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4" alt="LearningDeck" width={20} height={20} className='rounded' />
                <span className='font-medium truncate'>LearningDeck | Web Dashboard</span>
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
                    <Image src="/profile_icon.png" alt="Profile" width={34} height={34} className='rounded-full' />
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