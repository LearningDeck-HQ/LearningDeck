"use client";

import { TbHome, TbTemplate, TbVideoPlus } from "react-icons/tb";
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
import { GrDeploy } from "react-icons/gr";
import { FiArrowUpRight } from 'react-icons/fi';
import { authApi } from '@/lib/api/auth';
import { BiBrain, BiCreditCard, BiLoader, BiPlus, BiWorld } from "react-icons/bi";
import { useEffect, useState } from "react";
import { billingApi } from "@/lib/api/billing";
import { userApi } from '@/lib/api/users';

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const pathname = usePathname();
  const [currentPlan, setCurrentPlan] = useState<string>('');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await userApi.me();
        if (res.success && res.data) {
          const workspaceId = res.data.workspaceId;
          const subRes = await billingApi.getSubscription(workspaceId);
          if (subRes.success && subRes.data?.plan) {
            const planName = subRes.data.plan.charAt(0) + subRes.data.plan.slice(1).toLowerCase().replace(/_/g, " ");
            setCurrentPlan(planName);
          }
        }
      } catch (error) {
        console.error('Failed to fetch current plan', error);
      }
    };
    fetchPlan();
  }, []);

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

  const currentPlanName = currentPlan.split(' ')[0]

  return (
    <aside className="w-full h-full bg-[#f9f9f9] border-r border-[#ededed] flex flex-col font-sans text-xs">
      {/* Top Action Button */}
      <div className="p-4">
        <button className="w-full flex justify-center px-4 py-1.5 border border-[#ededed] rounded  font-medium text-[#0e0f10] hover:bg-[#ededed] transition-colors">
          <TbVideoPlus className="w-4 h-4 mr-2" /> Tutorials
        </button>
      </div>

      <nav className="flex flex-col  h-full px-2 gap-0.5">
        {/* Main Navigation - Following image_75fd16.png structure */}
        <Link href="/dashboard" className={getLinkStyles(pathname === '/dashboard')} onClick={onClose}>
          <TbHome className="text-sm" />

          <span>Home</span>
        </Link>

        <Link href="/dashboard/workspaces" className={getLinkStyles(pathname.startsWith('/dashboard/workspaces'))} onClick={onClose}>
          <MdWorkspaces className="" />
          <span>Workspace</span>
        </Link>

        <div className="my-2 border-t border-[#ededed]/60" />

        <Link href="/dashboard/plans" className={getLinkStyles(pathname === '/dashboard/plans')} onClick={onClose}>
          <BiCreditCard className=" opacity-70" />
          <span className="text-[#6b6b6b]">Plan  {currentPlanName !== '' && <span className="text-green-500 ml-1 border border-green-500 rounded text-[10px] px-1 py-0.5 uppercase">{currentPlanName || ''}</span>} </span>
        </Link>

        <Link href="/dashboard/settings" className={getLinkStyles(pathname.startsWith('/dashboard/settings'))} onClick={onClose}>
          <MdSettings className=" opacity-70" />
          <span className="text-[#6b6b6b]">Settings</span>
        </Link>



        <div className="my-2 border-t border-[#ededed]/60" />

        <Link href="/dashboard/agentic-mode" className={getLinkStyles(pathname === '/dashboard/agentic-mode')} onClick={onClose}>
          <BiBrain className=" opacity-70" />
          <span className="text-[#6b6b6b]">Agentic mode <span className="text-blue-500 ml-1 border border-blue-500 rounded text-[10px] px-1 py-0.5">BETA</span></span>
        </Link>



        <Link href="/dashboard/templates" className={getLinkStyles(pathname === '/dashboard/templates')} onClick={onClose}>
          <TbTemplate className=" opacity-70" />
          <span className="text-[#6b6b6b]">Plugins & Templates </span>
        </Link>

        {/* Bottom External Links Section */}
        <div className="mt-auto mb-4 flex flex-col gap-1 pt-4 border-t border-[#ededed] text-xs">
          <Link href="#" className={footerLinkStyles} onClick={onClose}>
            <span>What is Learningdeck</span>
            <FiArrowUpRight className="opacity-0 group-hover:opacity-100" />
          </Link>

          <Link href="#" className={footerLinkStyles} onClick={onClose}>
            <span>Learning Center</span>
            <FiArrowUpRight className="opacity-0 group-hover:opacity-100" />
          </Link>
          <Link href="#" className={footerLinkStyles} onClick={onClose}>
            <span>Support Center</span>
            <FiArrowUpRight className="opacity-0 group-hover:opacity-100" />
          </Link>

          <Link href="/downloads" className={footerLinkStyles} onClick={onClose}>
            <span>Download Desktop Agent</span>
            <FiArrowUpRight className="opacity-0 group-hover:opacity-100" />
          </Link>

          <button
            onClick={() => {
              handleLogout();
              onClose?.();
            }}
            className="mt-2 flex items-center gap-3 px-3 py-2  text-[#6b6b6b] hover:text-red-600 hover:bg-red-50 transition-all rounded-md group"
          >
            <MdLogout className=" group-hover:text-red-600" />
            <span className="">Log out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;