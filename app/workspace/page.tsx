"use client";

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Briefcase, Plus, Users, BookOpen, GraduationCap, FileText, ChevronRight } from 'lucide-react';
import { workspaceApi } from '@/lib/api/workspaces';
import { Workspace } from '@/types';
import Image from 'next/image';
import { ScaleLoader } from 'react-spinners';

export default function WorkspacesPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

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
        const fetchData = async () => {
            try {
                const res = await workspaceApi.list();
                if (res.data) setWorkspaces(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    let WorkspaceName = workspaces[0]?.name || 'Workspace';
    const profileName = user?.user_name || user?.name || 'Guest';
    const profileEmail = user?.user_email || user?.email || 'No email';

    if (isLoading) return <div className='flex flex-col h-full w-full items-center justify-center'>
        <ScaleLoader barCount={3} color="#a7a7a7ff" height={18} width={4} />
    </div>

    return (
        <div className="flex flex-col h-full w-full justify-center items-center gap-5 text-black text-sm text-center ">
            <Image
                src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
                alt="Logo"
                width={50}
                height={50}
                className="rounded"
            />
            <div className='text-center text-md'>
                Hi, <strong>{profileName}  </strong>  <br />       Welcome to  <strong>{WorkspaceName}</strong> workspace, <br />You can get started by navigating to the sidebar for exam, classes and many more management features



            </div>        </div>
    );
}