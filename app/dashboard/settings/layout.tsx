"use client";

import { useState } from 'react';
import { LayoutDashboard, Settings, BarChart3 } from 'lucide-react';
import { SettingsTabs } from '@/components/ui/SettingsTabs';
import { FiActivity } from 'react-icons/fi';

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'sessions'>('general');

    const settingsTabs = [
        {
            id: 'general',
            label: 'General',
            href: '/dashboard/settings',
            icon: <LayoutDashboard size={18} />,
        },
        {
            id: 'account',
            label: 'Account',
            href: '/dashboard/settings/account',
            icon: <LayoutDashboard size={18} />,
        },
        {
            id: 'sessions',
            label: 'Sessions',
            href: '/dashboard/settings/sessions',
            icon: <FiActivity size={18} />,
        }
    ];

    const handleTabChange = (id: string) => setActiveTab(id as 'general' | 'sessions');

    return (
        <div className="  animate-in fade-in slide-in-from-bottom-2 duration-500 selection:bg-blue-100 h-full p-4 md:p-8">
            <SettingsTabs items={settingsTabs} className="mb-4 w-fit" />
            {children}
        </div>
    );
};

export default SettingsLayout;