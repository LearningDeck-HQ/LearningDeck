"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { inviteApi } from '@/lib/api/invites';
import {
  UserPlus,
  Mail,
  Copy,
  RefreshCcw,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { ScaleLoader } from 'react-spinners';

interface Invite {
  id: string;
  email: string;
  role: string;
  status: 'PENDING' | 'COMPLETED' | 'REVOKED';
  token: string;
  createdAt: string;
  expiresAt: string;
}

const Invitations = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', role: 'TEACHER' });

  useEffect(() => { fetchInvites(); }, []);

  const fetchInvites = async () => {
    setIsLoading(true);
    try {
      const response = await inviteApi.list();
      if (response.success) setInvites(response.data || []);
    } catch (error) {
      toast.error('Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await inviteApi.create(formData);
      if (response.success) {
        toast.success('Invitation sent successfully');
        setIsModalOpen(false);
        setFormData({ email: '', role: 'TEACHER' });
        fetchInvites();
      } else {
        toast.error(response.message || 'Failed to send invitation');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (id: string) => {
    try {
      const response = await inviteApi.resend(id);
      if (response.success) { toast.success('Invitation resent successfully'); fetchInvites(); }
    } catch { toast.error('Failed to resend invitation'); }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      const response = await inviteApi.revoke(id);
      if (response.success) { toast.success('Invitation revoked'); fetchInvites(); }
    } catch { toast.error('Failed to revoke invitation'); }
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${token}`);
    toast.success('Invite link copied to clipboard');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <div className="inline-flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-gray-600 uppercase tracking-wider text-xs">Accepted</span>
          </div>
        );
      case 'REVOKED':
        return (
          <div className="inline-flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
            <span className="text-gray-600 uppercase tracking-wider text-xs">Revoked</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span className="text-gray-600 uppercase tracking-wider text-xs">Pending</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-64 w-full">
          <ScaleLoader barCount={3} color="#a7a7a7" height={20} width={5} />
        </div>
      ) : invites.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <div />
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors border-none ring-0"
            >
              <UserPlus className="w-4 h-4" /> Invite Member
            </Button>
          </div>

          <div className="divide-y divide-gray-100 border-t border-b border-gray-100 bg-[#f9f9f9]">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-y border-zinc-400/20">
              {['Email', 'Role', 'Status', 'Sent', 'Actions'].map((h) => (
                <span key={h} className="text-xs text-gray-500 uppercase tracking-wider font-medium">{h}</span>
              ))}
            </div>

            {invites.map((invite) => (
              <div
                key={invite.id}
                className="group grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center py-5 px-5 transition-colors hover:bg-gray-50/50 border-y border-zinc-400/20 rounded"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center border border-blue-100 shrink-0">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-900">{invite.email}</span>
                </div>

                <span className="capitalize text-gray-600">{invite.role.toLowerCase()}</span>

                {getStatusBadge(invite.status)}

                <span className="text-gray-500 ">
                  {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyLink(invite.token)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Copy Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {invite.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleResend(invite.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="Resend"
                      >
                        <RefreshCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRevoke(invite.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                        title="Revoke"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-24 border border-dashed border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Mail className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-gray-900 mb-2">No invitations yet</h3>
          <p className="text-gray-500 max-w-xs mx-auto mb-6">
            Invite your team members to start collaborating on your workspace.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-8 h-10 rounded hover:bg-blue-700 transition-colors border-none ring-0"
          >
            Send Invite
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded border border-gray-200 w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#f9f9f9]">
              <h3 className="text-gray-900 font-medium">Invite Team Member</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="colleague@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <div className="space-y-2">
                <label className=" text-gray-600">Assign Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {['TEACHER', 'ADMIN'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={`py-2.5 px-4 rounded  border transition-all ${formData.role === role
                        ? 'border-blue-400 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                        }`}
                    >
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-10 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors border-none ring-0"
                isLoading={isSubmitting}
              >
                Send Invitation
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invitations;