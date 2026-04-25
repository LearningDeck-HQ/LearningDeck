"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { workspaceApi } from '@/lib/api/workspaces';
import { Workspace } from '@/types';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export const AuthForm = ({ type }: AuthFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  React.useEffect(() => {
    if (type === 'signup') {
      workspaceApi.list().then(res => {
        if (res.success && res.data) setWorkspaces(res.data);
      });
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const workspaceId = formData.get('workspaceId') as string;

    try {
      let response;
      if (type === 'login') {
        response = await authApi.login(email, password);
      } else {
        response = await authApi.register({
          user_name: name,
          user_email: email,
          user_password: password,
          role: 'ADMIN',
          workspaceId: parseInt(workspaceId) || 1, // Fallback to 1 if not selected
        });
      }

      if (response.success) {
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
        }
        if (response.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        if (source === 'desktop' && response.data?.token) {
          const token = response.data.token;
          setAuthToken(token);
          setIsSuccess(true);
          //alert('Login successful! Opening LearningDeck Desktop...');
          window.location.href = `learningdeck://auth?token=${token}`;
          return;
        }

        router.push('/dashboard');
      } else {
        setError(response.message || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-[480px] bg-[#F4F7FF] rounded-sm  border border-zinc-400/20 p-8 md:p-12 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-8">
          <Image
            src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
            alt="LearningDeck Logo"
            width={40}
            height={40}
            className="rounded-full shadow-md"
          />
          <span className="text-[24px] font-bold text-[#1B2559]">LearningDeck</span>
        </div>

        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-[24px] font-bold text-[#1B2559] mb-2">Authenticated!</h1>
        <p className="text-[14px] text-[#A3AED0] mb-8">
          You have successfully logged in. You can now return to the desktop application to continue.
        </p>

        <Button
          onClick={() => window.location.href = `learningdeck://auth?token=${authToken}`}
          className="w-full"
        >
          Open Desktop App
        </Button>

        <p className="mt-6 text-[12px] text-[#A3AED0]">
          Didn't see a prompt? <button onClick={() => window.location.href = `learningdeck://auth?token=${authToken}`} className="text-blue-500 hover:underline font-medium">Click here to try again</button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] bg-[#F4F7FF] rounded-md  border border-zinc-400/20 p-8 md:p-12 flex flex-col items-center">
      {/* Logo Section */}
      <div className="flex items-center gap-2 mb-8">
        <Image
          src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
          alt="LearningDeck Logo"
          width={40}
          height={40}
          className="rounded-full shadow-md"
        />
        {source === 'desktop' ? <span className="text-[24px] font-bold text-[#1B2559]">Connect desktop app</span> : <span className="text-[24px] font-bold text-[#1B2559]">LearningDeck</span>}
      </div>

      {source !== 'desktop' && <h1 className="text-[24px] font-bold text-[#1B2559] mb-2">
        {type === 'login' ? 'Sign In' : 'Create Account'}

      </h1>}
      <p className="text-[14px] text-[#A3AED0] mb-8">
        {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
        <Link
          href={type === 'login' ? '/signup' : '/login'}
          className="text-blue-500 font-bold hover:underline"
        >
          {type === 'login' ? 'Sign Up' : 'Sign In'}
        </Link>
      </p>

      {error && (
        <div className="w-full p-4 mb-6 text-[13px] font-medium text-red-500 bg-red-50 rounded-[12px] border border-red-100 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {type === 'signup' && (
          <Input
            name="name"
            label="Name"
            placeholder="Enter Your Name"
            required
          />
        )}
        {type === 'signup' && (
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-[#1B2559] ml-1">Workspace</label>
            <select
              name="workspaceId"
              className="w-full h-[40px] px-4 rounded-[12px] bg-white border border-[#D0D5DD] text-[14px] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              required
            >
              {workspaces.length > 0 ? (
                workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))
              ) : (
                <option value="1">Default School (1)</option>
              )}
            </select>
          </div>
        )}
        <Input
          name="email"
          label="Email"
          type="email"
          placeholder="Enter Your Email"
          required
        />
        <Input
          name="password"
          label="Password"
          type="password"
          placeholder="Enter Your Password"
          required
        />
        {type === 'signup' && (
          <Input
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm Your Password"
            required
          />
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          {type === 'login' ? 'Sign In' : 'Get Started'}
        </Button>
      </form>

      <div className="w-full flex items-center my-8">
        <div className="flex-grow h-[1px] bg-[#E0E5F2]"></div>
        <span className="px-4 text-[12px] font-bold text-[#A3AED0] uppercase tracking-widest">or</span>
        <div className="flex-grow h-[1px] bg-[#E0E5F2]"></div>
      </div>

      <button className="w-full h-[48px] flex items-center justify-center gap-3 bg-white border border-[#E0E5F2] rounded-[12px] hover:bg-gray-50 transition-all font-medium text-[#1B2559]">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.08.56 4.22 1.66l3.16-3.16C17.45 2.08 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>
    </div>
  );
};
