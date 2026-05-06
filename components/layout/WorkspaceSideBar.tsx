"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { BiBookOpen, BiSolidShapes, BiUser } from 'react-icons/bi';
import { BsPersonWorkspace } from 'react-icons/bs';
import { GiTeacher } from 'react-icons/gi';
import { MdReport, MdQuiz, MdBarChart, MdCreditCard, MdSettings, MdLogout, MdArrowBack } from 'react-icons/md';
import { SiGoogleclassroom } from 'react-icons/si';
import { FiChevronDown } from 'react-icons/fi';
import { authApi } from '@/lib/api/auth';
import { workspaceApi } from '@/lib/api/workspaces';
import { Workspace } from '@/types';


const navItems = [
    // { label: 'Analytics', href: '/workspace', icon: MdBarChart },
    { label: 'Exams', href: '/workspace/exams', icon: BiBookOpen },
    { label: 'Questions', href: '/workspace/questions', icon: MdQuiz },
    { label: 'Subjects', href: '/workspace/subjects', icon: BiSolidShapes },
    { label: 'Classes', href: '/workspace/classes', icon: SiGoogleclassroom },
    { label: 'Teachers', href: '/workspace/teachers', icon: GiTeacher },
    { label: 'Students', href: '/workspace/students', icon: BiUser },
    { label: 'Results', href: '/workspace/results', icon: MdReport },

    // { label: 'Plan', href: '/workspace/plan', icon: MdCreditCard },
    // { label: 'Settings', href: '/workspace/settings', icon: MdSettings },

];

const workspaceSubItems = [
    { label: 'Analytics', href: '/workspace', icon: MdBarChart },
    { label: 'Exams', href: '/workspace/exams', icon: BiBookOpen },
    { label: 'Questions', href: '/workspace/questions', icon: MdQuiz },
    { label: 'Subjects', href: '/workspace/subjects', icon: BiSolidShapes },
    { label: 'Classes', href: '/workspace/classes', icon: SiGoogleclassroom },
    { label: 'Teachers', href: '/workspace/teachers', icon: GiTeacher },
    { label: 'Students', href: '/workspace/students', icon: BiUser },
    { label: 'Results', href: '/workspace/results', icon: MdReport },
];

const WorkspaceSideBar = ({ onClose }: { onClose?: () => void }) => {
    const pathname = usePathname();
    const [workspacesExpanded, setWorkspacesExpanded] = useState(true);
    const [currentWorkspace, setCurrentWorkspace] = useState('Workspace 1');
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const navigate = useRouter();

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
        <aside className="w-64 h-full text-sm bg-white border-r border-zinc-400/20 flex flex-col px-4 py-2  text-[#6b6b6b]">


            <nav className="flex flex-col flex-1">



                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/workspace' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={getLinkStyles(isActive)}
                            onClick={onClose}
                        >
                            <Icon className="inline-block mr-2" />
                            {item.label}
                        </Link>
                    );
                })}
                <div className="mt-auto pt-6 border-t border-zinc-400/20">
                    <button
                        onClick={() => navigate.push('/dashboard')}
                        className="w-full flex items-center gap-3 px-3 py-1 text-xs text-[#6b6b6b] hover:text-red-500 hover:bg-red-50 transition-all rounded-sm group mb-2"
                    >
                        <MdArrowBack className="group-hover:text-red-500" />
                        <span className="font-medium">Back Home</span>
                    </button>
                     <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-1 text-xs text-[#6b6b6b] hover:text-red-500 hover:bg-red-50 transition-all rounded-sm group"
                    >
                        <MdLogout className="group-hover:text-red-500" />
                        <span className="font-medium">Log Out</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default WorkspaceSideBar;
