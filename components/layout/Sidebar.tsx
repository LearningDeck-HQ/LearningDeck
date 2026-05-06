"use client";

import { TbHome } from "react-icons/tb";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MdHome,
  MdWorkspaces,
  MdFolderOpen,
  MdBarChart,
  MdOutlineNetworkCheck,
  MdPublic,
  MdLogout,
  MdSettings
} from 'react-icons/md';
import { FiArrowUpRight } from 'react-icons/fi';
import { authApi } from '@/lib/api/auth';
import { BiCreditCard } from "react-icons/bi";

const Sidebar = () => {
  const pathname = usePathname();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      await authApi.logout();
    }
  };

  const getLinkStyles = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-md  transition-all ${isActive
      ? 'bg-[#ededed] text-[#0e0f10] font-medium'
      : 'hover:bg-[#ededed]/50 text-[#6b6b6b]'
    }`;

  const footerLinkStyles = "flex items-center justify-between px-3 py-1.5 text-[#6b6b6b] hover:text-[#0e0f10] transition-colors group";

  return (
    <aside className="w-64 h-full bg-[#f9f9f9] border-r border-[#ededed] flex flex-col font-sans text-xs">
      {/* Top Action Button */}
      <div className="p-4">
        <button className="w-fit px-4 py-1.5 border border-[#ededed] rounded  font-medium text-[#0e0f10] hover:bg-[#ededed] transition-colors">
          Invite Teacher
        </button>
      </div>

      <nav className="flex flex-col flex-1 px-2 gap-0.5">
        {/* Main Navigation - Following image_75fd16.png structure */}
        <Link href="/dashboard" className={getLinkStyles(pathname === '/dashboard')}>
          <TbHome className="text-sm" />

          <span>Home</span>
        </Link>

        <Link href="/dashboard/workspaces" className={getLinkStyles(pathname.startsWith('/dashboard/workspaces'))}>
          <MdWorkspaces className="" />
          <span>Workspace</span>
        </Link>

        <div className="my-2 border-t border-[#ededed]/60" />

        <Link href="/dashboard/catalog" className={getLinkStyles(pathname === '/dashboard/catalog')}>
          <BiCreditCard className=" opacity-70" />
          <span className="text-[#6b6b6b]">Plan</span>
        </Link>

        <Link href="/dashboard/settings" className={getLinkStyles(pathname === '/dashboard/settings')}>
          <MdSettings className=" opacity-70" />
          <span className="text-[#6b6b6b]">Settings</span>
        </Link>

        <div className="my-2 border-t border-[#ededed]/60" />

        <Link href="/dashboard/private" className={getLinkStyles(pathname === '/dashboard/private')}>
          <MdOutlineNetworkCheck className=" opacity-70" />
          <span className="text-[#6b6b6b]">Private Network</span>
        </Link>

        <Link href="/dashboard/public" className={getLinkStyles(pathname === '/dashboard/public')}>
          <MdPublic className=" opacity-70" />
          <span className="text-[#6b6b6b]">Public Network</span>
        </Link>

        {/* Bottom External Links Section */}
        <div className="mt-auto mb-4 flex flex-col gap-1 pt-4 border-t border-[#ededed] text-xs">
          <Link href="#" className={footerLinkStyles}>
            <span>What is Learningdeck</span>
            <FiArrowUpRight className="opacity-0 group-hover:opacity-100" />
          </Link>
          <Link href="#" className={footerLinkStyles}>
            <span>How to Publish</span>
            <FiArrowUpRight className="opacity-0 group-hover:opacity-100" />
          </Link>
          <Link href="#" className={footerLinkStyles}>
            <span>Learning Center</span>
            <FiArrowUpRight className="opacity-0 group-hover:opacity-100" />
          </Link>
          <Link href="#" className={footerLinkStyles}>
            <span>Support Center</span>
            <FiArrowUpRight className="opacity-0 group-hover:opacity-100" />
          </Link>
          <Link href="#" className={footerLinkStyles}>
            <span>Learningdeck Enterprise</span>
            <FiArrowUpRight className="opacity-0 group-hover:opacity-100" />
          </Link>
          <Link href="#" className={footerLinkStyles}>
            <span>Download Desktop App</span>
            <FiArrowUpRight className="opacity-0 group-hover:opacity-100" />
          </Link>

          <button
            onClick={handleLogout}
            className="mt-2 flex items-center gap-3 px-3 py-2  text-[#6b6b6b] hover:text-red-600 hover:bg-red-50 transition-all rounded-md group"
          >
            <MdLogout className="text-lg group-hover:text-red-600" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;