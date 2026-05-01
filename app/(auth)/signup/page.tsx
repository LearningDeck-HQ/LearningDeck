"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthForm } from '@/features/auth/components/AuthForm';

function SignupContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const role = searchParams.get('role') as 'TEACHER' | 'STUDENT' | 'ADMIN' | null;

  return (
    <AuthForm 
      type={token ? 'invite' : 'signup'} 
      inviteToken={token || undefined}
      role={role || 'ADMIN'}
    />
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-[#1B2559] font-medium">Loading...</div>}>
        <SignupContent />
      </Suspense>
    </main>
  );
}

