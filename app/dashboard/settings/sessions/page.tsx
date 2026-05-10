"use client";

import React, { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, } from '@/components/ui/Card';
import { Monitor, Smartphone, Trash2, Clock, MapPin, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SessionsPage = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);

    const fetchSessions = async () => {
        try {
            const response = await authApi.getSessions();
            if (response.success) {
                setSessions(response.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this session? You will be logged out on that device.')) return;

        setRevokingId(id);
        try {
            const response = await authApi.revokeSession(id);
            if (response.success) {
                setSessions(sessions.filter(s => s.id !== id));
            }
        } catch (err) {
            console.error('Failed to revoke session:', err);
        } finally {
            setRevokingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded animate-spin"></div>
            </div>
        );
    }

    return (
        <div className=" space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-b border-gray-100 bg-[#f9f9f9] p-2 md:p-4">
            <div className="border-none   overflow-hidden">
                <div className=" pb-2">
                    <div className="flex items-center gap-3 mb-1">

                        <div>
                            <div className="text-sm  text-[#1B2559]">Active Sessions</div>
                            <div className=" text-gray-500">
                                Manage and revoke active sessions across all your devices.
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-0">
                    <div className="divide-y divide-gray-50">
                        {sessions.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                No active sessions found.
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div key={session.id} className="p-2 flex items-center justify-between group hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded flex items-center justify-center ${session.deviceType === 'desktop' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {session.deviceType === 'desktop' ? <Monitor size={24} /> : <Smartphone size={24} />}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="  text-[#1B2559]">
                                                    {session.deviceName || (session.deviceType === 'desktop' ? 'LearningDeck Desktop' : 'Web Browser')}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-4  text-gray-400 text-[12px]">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} /> Last active {formatDistanceToNow(new Date(session.lastUsedAt), { addSuffix: true })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Shield size={14} /> Expires {formatDistanceToNow(new Date(session.expiresAt), { addSuffix: true })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={14} /> {session.deviceType.charAt(0).toUpperCase() + session.deviceType.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRevoke(session.id)}
                                        isLoading={revokingId === session.id}
                                        className="h-10 px-4 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded transition-all"
                                    >
                                        <Trash2 size={16} className="mr-2" /> Revoke
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
};

export default SessionsPage;