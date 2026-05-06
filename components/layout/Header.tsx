"use client";

import Image from "next/image"
import { MdSearch } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarRightCollapse, TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { HiMenuAlt2 } from "react-icons/hi";
import { useSidebar } from "@/context/SidebarContext";

const Header = () => {
    const { isLeftSidebarCollapsed, toggleLeftSidebar } = useSidebar();

    return (
        <div className='flex justify-between w-full pt-2 bg-[#f9f9f9] border-b border-[#ededed] text-[#6b6b6b] '>
            <div className='flex items-center gap-2 px-2 py-2'>
                {/* Desktop Toggle */}
                <button
                    onClick={toggleLeftSidebar}
                    className="hidden md:block text-xl cursor-pointer hover:text-[#0e0f10] transition-colors"
                >
                    {isLeftSidebarCollapsed ? <TbLayoutSidebarLeftExpand /> : <TbLayoutSidebarLeftCollapse />}
                </button>

                {/* Mobile Toggle */}
                <button
                    onClick={toggleLeftSidebar}
                    className="md:hidden text-xl cursor-pointer hover:text-[#0e0f10] transition-colors"
                >
                    <HiMenuAlt2 />
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

            <div className='flex items-center gap-2 px-2 py-2'>
                <Image src="/profile_icon.png" alt="Profile" width={30} height={30} className='rounded' />
            </div>

        </div>
    )
}

export default Header