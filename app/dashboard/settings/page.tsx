"use client";

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { User, Shield, ShieldCheck, Mail, Lock, Camera, Bell, Globe } from 'lucide-react';
import { userApi } from '@/lib/api/users';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      const res = await userApi.update(user.id, {
        user_name: user.user_name,
        user_email: user.user_email
      });
      if (res.success && res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardHeader 
        title="Account Settings" 
        description="Manage your profile, security preferences, and global workspace notifications."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <Card className="border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-500 relative">
               <div className="absolute -bottom-16 left-8">
                  <div className="relative group">
                    <div className="w-32 h-32 bg-white rounded-[40px] p-1.5 shadow-2xl">
                      <div className="w-full h-full bg-blue-50 rounded-[35px] flex items-center justify-center text-blue-600 text-4xl font-black">
                        {user?.user_name?.charAt(0) || 'A'}
                      </div>
                    </div>
                    <button className="absolute bottom-2 right-2 w-10 h-10 bg-[#1B2559] text-white rounded-2xl flex items-center justify-center border-4 border-white hover:scale-110 transition-transform">
                      <Camera size={18} />
                    </button>
                  </div>
               </div>
            </div>
            <CardContent className="pt-20 pb-8 px-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                  <h3 className="text-[24px] font-black text-[#1B2559]">{user?.user_name || 'Administrator'}</h3>
                  <p className="text-[#A3AED0] flex items-center gap-2 font-medium">
                    <Shield size={16} className="text-blue-500" /> Professional Admin Plan
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-green-50 text-green-600 text-[13px] font-black rounded-xl border border-green-100 flex items-center gap-2">
                    <ShieldCheck size={16} /> Verified Account
                  </span>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[14px] font-bold text-[#1B2559] ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" size={18} />
                      <input 
                        type="text"
                        className="w-full h-[52px] pl-12 pr-4 bg-[#F4F7FF] border-none rounded-2xl text-[15px] font-bold text-[#1B2559] focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        value={user?.user_name || ''}
                        onChange={(e) => setUser({...user, user_name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-bold text-[#1B2559] ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" size={18} />
                      <input 
                        type="email"
                        className="w-full h-[52px] pl-12 pr-4 bg-[#F4F7FF] border-none rounded-2xl text-[15px] font-bold text-[#1B2559] focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        value={user?.user_email || ''}
                        onChange={(e) => setUser({...user, user_email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    isLoading={isSaving}
                    className="h-[52px] px-10 bg-[#1B2559] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm p-8">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                 <Lock size={20} />
               </div>
               <h3 className="text-[18px] font-extrabold text-[#1B2559]">Security & Connectivity</h3>
             </div>
             
             <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#F4F7FF]/50 border border-[#F4F7FF] flex items-center justify-between group hover:bg-[#F4F7FF] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                       <Globe size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#1B2559]">Double Authentication</p>
                      <p className="text-[13px] text-[#A3AED0]">Secure your account with 2FA verification.</p>
                    </div>
                  </div>
                  <button className="text-blue-500 font-black text-[13px] uppercase tracking-widest px-4 py-2 hover:bg-white rounded-xl transition-all">Enable</button>
                </div>

                <div className="p-5 rounded-2xl bg-[#F4F7FF]/50 border border-[#F4F7FF] flex items-center justify-between group hover:bg-[#F4F7FF] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                       <Bell size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#1B2559]">System Notifications</p>
                      <p className="text-[13px] text-[#A3AED0]">Manage how you receive alerts and updates.</p>
                    </div>
                  </div>
                  <button className="text-blue-500 font-black text-[13px] uppercase tracking-widest px-4 py-2 hover:bg-white rounded-xl transition-all">Configure</button>
                </div>
             </div>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="border-none shadow-xl shadow-gray-200/50 bg-[#1B2559] text-white p-8">
             <h3 className="text-[20px] font-bold mb-4">Workspace Info</h3>
             <div className="space-y-6">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-white/60 text-[14px]">Role</span>
                  <span className="font-bold text-blue-400">Master Admin</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-white/60 text-[14px]">Status</span>
                  <span className="text-green-400 font-bold">Active</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-white/60 text-[14px]">Last Session</span>
                  <span className="font-bold text-[14px]">Today, 14:02 PM</span>
                </div>
             </div>
           </Card>

           <Card className="border-none shadow-xl shadow-gray-200/50 bg-gradient-to-br from-blue-600 to-blue-400 text-white p-8 overflow-hidden relative">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
             <h3 className="text-[20px] font-extrabold mb-2 relative z-10">Premium Support</h3>
             <p className="text-white/70 text-[14px] mb-8 relative z-10">Access 24/7 dedicated assistance for your institution.</p>
             <button className="w-full py-4 bg-white text-blue-600 font-black rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-gray-50 transition-all relative z-10">
               Contact Support Team
             </button>
           </Card>
        </div>
      </div>
    </div>
  );
}
