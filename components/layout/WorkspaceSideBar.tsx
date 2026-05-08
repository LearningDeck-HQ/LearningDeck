"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BiBookOpen, BiSolidShapes, BiUser } from 'react-icons/bi';
import { GiTeacher } from 'react-icons/gi';
import { MdReport, MdQuiz, MdLogout, MdArrowBack } from 'react-icons/md';
import { SiGoogleclassroom } from 'react-icons/si';
import { authApi } from '@/lib/api/auth';
import { workspaceApi } from '@/lib/api/workspaces';
import { Workspace } from '@/types';

const navItems = [
    { label: 'Exams', href: '/workspace/exams', icon: BiBookOpen },
    { label: 'Questions', href: '/workspace/questions', icon: MdQuiz },
    { label: 'Subjects', href: '/workspace/subjects', icon: BiSolidShapes },
    { label: 'Classes', href: '/workspace/classes', icon: SiGoogleclassroom },
    { label: 'Teachers', href: '/workspace/teachers', icon: GiTeacher },
    { label: 'Students', href: '/workspace/students', icon: BiUser },
    { label: 'Results', href: '/workspace/results', icon: MdReport },
];

const TeacherNavItems = [
    { label: 'Exams', href: '/workspace/exams', icon: BiBookOpen },
    { label: 'Questions', href: '/workspace/questions', icon: MdQuiz },
    { label: 'Subjects', href: '/workspace/subjects', icon: BiSolidShapes },
    { label: 'Results', href: '/workspace/results', icon: MdReport },
];

const WorkspaceSideBar = ({ onClose }: { onClose?: () => void }) => {
    const pathname = usePathname();
    const navigate = useRouter();

    const [user, setUser] = useState<any>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    // This state prevents the "flash" of incorrect nav items
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUser = window.localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Header: Failed to parse stored user', error);
                }
            }
            setIsHydrated(true);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await workspaceApi.list();
                if (res.data) setWorkspaces(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleLogout = async () => {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            await authApi.logout();
            navigate.push('/login');
        }
    };

    const getLinkStyles = (isActive: boolean) =>
        `block px-3 py-1 rounded-sm text-xs ${isActive
            ? 'bg-zinc-300/20 text-[#0e0f10]'
            : 'hover:bg-accent-light'
        }`;

    // Choose the list based on role
    const currentNavItems = user?.role === "TEACHER" ? TeacherNavItems : navItems;
    const isTeacher = user?.role === "TEACHER";

    // Don't render the nav items until we know the user role
    if (!isHydrated) {
        return <aside className="w-64 h-full bg-white border-r border-zinc-400/20" />;
    }

    return (
        <aside className="w-full h-full text-sm bg-white border-r border-zinc-400/20 flex flex-col px-4 py-2 text-[#6b6b6b]">
            <nav className="flex flex-col flex-1">
                {currentNavItems.map((item) => {
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
                    {!isTeacher && <button
                        onClick={() => navigate.push('/dashboard')}
                        className="w-full flex items-center gap-3 px-3 py-1 text-xs text-[#6b6b6b] hover:text-red-500 hover:bg-red-50 transition-all rounded-sm group mb-2"
                    >
                        <MdArrowBack className="group-hover:text-red-500" />
                        <span className="font-medium">Back Home</span>
                    </button>}
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