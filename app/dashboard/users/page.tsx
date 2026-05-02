"use client";

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Users as UsersIcon, Plus, Mail, Shield, UserCheck,
  Search, MoreVertical, Trash2, Edit3, Filter, Download
} from 'lucide-react';
import { userApi } from '@/lib/api/users';
import { authApi } from '@/lib/api/auth';
import { workspaceApi } from '@/lib/api/workspaces';
import { classApi } from '@/lib/api/classes';
import { User, Workspace, Class } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, wsRes, clsRes] = await Promise.all([
        userApi.list(),
        workspaceApi.list(),
        classApi.list()
      ]);
      if (usersRes.data) setUsers(usersRes.data);
      if (wsRes.data) setWorkspaces(wsRes.data);
      if (clsRes.data) setClasses(clsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await userApi.delete(id);
      fetchData();
    }
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      user_name: formData.get('name') as string,
      user_email: formData.get('email') as string,
      user_password: 'Password123!', // Default password
      role: formData.get('role') as any,
      workspaceId: parseInt(formData.get('workspaceId') as string),
      classId: formData.get('classId') ? parseInt(formData.get('classId') as string) : null,
    };

    try {
      const res = await authApi.register(data);
      if (res.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert(res.message || "Failed to add user");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.user_name.toLowerCase().includes(search.toLowerCase()) ||
    u.user_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <DashboardHeader
        title="User Management"
        description="Monitor staff and students across all educational environments."
      >
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#1B2559] hover:bg-[#2B3674] shadow-xl shadow-[#1B2559]/20 h-[48px] px-6 rounded-2xl"
        >
          <Plus size={18} />
          Add New User
        </Button>
      </DashboardHeader>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-[24px] shadow-sm border border-zinc-400/20">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" size={18} />
          <input
            type="text"
            placeholder="Search users by name, email or role..."
            className="w-full pl-12 pr-4 h-[48px] rounded-2xl bg-[#F4F7FF] border-none text-[15px] font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-[#A3AED0]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="ghost" className="flex-1 md:flex-none h-[48px] px-5 rounded-2xl text-[#1B2559] font-black flex items-center gap-2 hover:bg-[#F4F7FF]">
            <Filter size={18} /> Filter
          </Button>
          <Button variant="ghost" className="flex-1 md:flex-none h-[48px] px-5 rounded-2xl text-[#1B2559] font-black flex items-center gap-2 hover:bg-[#F4F7FF]">
            <Download size={18} /> Export
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-400/20">
                <th className="px-8 py-5 text-[12px] font-black text-[#A3AED0] uppercase tracking-[1.5px]">User Details</th>
                <th className="px-6 py-5 text-[12px] font-black text-[#A3AED0] uppercase tracking-[1.5px]">Role & Access</th>
                <th className="px-6 py-5 text-[12px] font-black text-[#A3AED0] uppercase tracking-[1.5px]">Status</th>
                <th className="px-6 py-5 text-[12px] font-black text-[#A3AED0] uppercase tracking-[1.5px]">Joined Date</th>
                <th className="px-8 py-5 text-[12px] font-black text-[#A3AED0] uppercase tracking-[1.5px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F7FF]">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6 h-[80px] bg-gray-50/20" />
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-[#F4F7FF]/50 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white font-black text-[18px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                          {user.img ? <img src={user.img} className="w-full h-full object-cover" /> : user.user_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[16px] font-extrabold text-[#1B2559]">{user.user_name}</p>
                          <p className="text-[13px] font-medium text-[#A3AED0] flex items-center gap-1.5"><Mail size={12} /> {user.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${user.role === 'ADMIN' ? 'bg-purple-100/50 text-purple-600' :
                          user.role === 'TEACHER' ? 'bg-blue-100/50 text-blue-600' :
                            'bg-orange-100/50 text-orange-600'
                        }`}>
                        <Shield size={12} /> {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${user.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={`text-[14px] font-bold ${user.active ? 'text-green-600' : 'text-[#A3AED0]'}`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-bold text-[#1B2559] text-[14px]">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-xl hover:bg-white text-blue-600">
                          <Edit3 size={18} />
                        </Button>
                        <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-xl hover:bg-red-50 text-red-600" onClick={() => handleDelete(user.id)}>
                          <Trash2 size={18} />
                        </Button>
                        <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-xl hover:bg-white">
                          <MoreVertical size={18} className="text-[#A3AED0]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <UsersIcon size={48} className="mx-auto text-[#F4F7FF] mb-4" />
                    <p className="text-[#A3AED0] font-bold">No users found in this workspace.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleAddUser} className="space-y-6">
          <Input
            name="name"
            label="Full Name"
            placeholder="e.g. John Doe"
            required
          />
          <Input
            name="email"
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-[#1B2559] ml-1">Role</label>
              <select
                name="role"
                className="w-full h-[48px] px-4 rounded-2xl bg-[#F4F7FF] border-none text-[14px] font-bold text-[#1B2559] focus:ring-2 focus:ring-blue-500/20 active:scale-[0.99] transition-all outline-none"
                required
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-[#1B2559] ml-1">Workspace</label>
              <select
                name="workspaceId"
                className="w-full h-[48px] px-4 rounded-2xl bg-[#F4F7FF] border-none text-[14px] font-bold text-[#1B2559] focus:ring-2 focus:ring-blue-500/20 active:scale-[0.99] transition-all outline-none"
                required
              >
                {workspaces.map(ws => (
                  <option key={ws.id} value={ws.id}>{ws.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#1B2559] ml-1">Class (Optional)</label>
            <select
              name="classId"
              className="w-full h-[48px] px-4 rounded-2xl bg-[#F4F7FF] border-none text-[14px] font-bold text-[#1B2559] focus:ring-2 focus:ring-blue-500/20 active:scale-[0.99] transition-all outline-none"
            >
              <option value="">No Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <p className="text-[12px] text-[#A3AED0] text-center p-4 bg-blue-50/50 rounded-2xl font-medium">
            Note: The user will be assigned a temporary password <b>Password123!</b> and prompted to change it on their first login.
          </p>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-[52px] rounded-2xl font-black text-[#A3AED0]"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-[52px] rounded-2xl bg-[#1B2559] font-black"
              isLoading={isSubmitting}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
