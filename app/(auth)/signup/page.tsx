import React, { Suspense } from 'react';
import { AuthForm } from '@/features/auth/components/AuthForm';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-[#1B2559] font-medium">Loading...</div>}>
        <AuthForm type="signup" />
      </Suspense>
    </main>
  );
}
