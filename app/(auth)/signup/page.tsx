import React from 'react';
import { AuthForm } from '@/features/auth/components/AuthForm';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <AuthForm type="signup" />
    </main>
  );
}
