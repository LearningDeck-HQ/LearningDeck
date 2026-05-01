"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { workspaceApi } from '@/lib/api/workspaces';
import { Workspace } from '@/types';
import { ChevronRight, Check, User, LogOut } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'signup' | 'invite';
  inviteToken?: string;
  role?: 'TEACHER' | 'STUDENT' | 'ADMIN';
}

export const AuthForm = ({ type, inviteToken, role = 'ADMIN' }: AuthFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [storedUser, setStoredUser] = useState<any>(null);
  const [isContinuing, setIsContinuing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setStoredUser(user);
        setAuthToken(token);
        if (source === 'desktop' && type === 'login') {
          setIsContinuing(true);
        }
      } catch (e) {
        console.error("Error parsing stored user", e);
      }
    }
  }, [source, type]);

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
      } else if (type === 'signup') {
        const workspaceName = formData.get('workspaceName') as string;
        response = await workspaceApi.setup({
          workspace_name: workspaceName,
          admin_name: name,
          admin_email: email,
          admin_password: password,
        });
      } else {
        response = await authApi.register({
          user_name: name,
          user_email: email,
          user_password: password,
          inviteToken: inviteToken,
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

  const handleContinue = () => {
    if (authToken) {
      window.location.href = `learningdeck://auth?token=${authToken}`;
    }
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setStoredUser(null);
    setAuthToken(null);
    setIsContinuing(false);
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-[440px] bg-white rounded border border-gray-200 p-8 md:p-10 flex flex-col items-center text-center ">
        <div className="flex items-center gap-3 mb-10">
          <Image
            src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
            alt="LearningDeck Logo"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-[18px] tracking-tight text-gray-800">LearningDeck</span>
        </div>

        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100">
          <Check className="w-8 h-8 text-blue-600" />
        </div>

        <h1 className="text-[24px] tracking-tight text-gray-900 mb-3">Authenticated</h1>
        <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
          You have successfully logged in. You can now return to the desktop application to continue.
        </p>

        <button
          onClick={() => window.location.href = `learningdeck://auth?token=${authToken}`}
          className="w-full h-[44px] bg-blue-600 text-white text-[14px] font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Open Desktop App <ChevronRight className="w-4 h-4" />
        </button>

        <p className="mt-8 text-[13px] text-gray-400">
          Didn't see a prompt? <button onClick={() => window.location.href = `learningdeck://auth?token=${authToken}`} className="text-blue-600 hover:text-blue-700 transition-colors font-medium">Click here to try again</button>
        </p>
      </div>
    );
  }

  if (isContinuing && storedUser) {
    return (
      <div className="w-full max-w-[440px] bg-white rounded border border-gray-200 p-8 md:p-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-10">
          <Image
            src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
            alt="LearningDeck Logo"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-[18px] tracking-tight text-gray-800 font-medium">LearningDeck</span>
        </div>

        <div className="text-center w-full mb-8">
          <h1 className="text-[24px] tracking-tight text-gray-900 mb-2">Welcome back</h1>
          <p className="text-[14px] text-gray-500">Continue with your account</p>
        </div>

        <div className="w-full p-6  rounded-lg flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
            <User className="w-8 h-8" />
          </div>
          <span className="text-[16px] font-semibold text-gray-900">{storedUser.name || storedUser.user_name}</span>
          <span className="text-[13px] text-gray-500">{storedUser.email || storedUser.user_email}</span>
        </div>

        <button
          onClick={handleContinue}
          className="w-full h-[44px] bg-blue-600 text-white text-[14px] font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-4"
        >
          Continue as {storedUser.name || (storedUser.user_name?.split(' ')[0])} <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleSwitchAccount}
          className="w-full h-[44px] bg-white text-gray-700 border border-gray-200 text-[14px] font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign in to a different account
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px] bg-white rounded border border-gray-200 p-8 md:p-10 flex flex-col items-center ">
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-10">
        <Image
          src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
          alt="LearningDeck Logo"
          width={28}
          height={28}
          className="rounded-md"
        />
        <span className="text-[18px] tracking-tight text-gray-800 font-medium">LearningDeck</span>
      </div>

      <div className="text-center w-full mb-8">
        <h1 className="text-[24px] tracking-tight text-gray-900 mb-2">
          {source === 'desktop'
            ? 'Connect desktop app'
            : type === 'login'
              ? 'Sign In'
              : type === 'invite'
                ? `Join as ${role?.charAt(0).toUpperCase()}${role?.slice(1).toLowerCase()}`
                : 'Create Account'
          }
        </h1>
        <p className="text-[14px] text-gray-500">
          {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <Link
            href={`${type === 'login' ? '/signup' : '/login'}${source ? `?source=${source}` : ''}`}
            className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            {type === 'login' ? 'Sign Up' : 'Sign In'}
          </Link>
        </p>
      </div>

      {error && (
        <div className="w-full p-3 mb-6 text-[13px] text-red-600 bg-red-50 rounded-md border border-red-100 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {(type === 'signup' || type === 'invite') && (
          <Input
            name="name"
            label="Name"
            placeholder="Enter Your Name"
            className="text-[14px] border-gray-200 focus:border-blue-300 transition-all"
            required
          />
        )}
        {type === 'signup' && (
          <Input
            name="workspaceName"
            label="Workspace Name"
            placeholder="e.g. Greenwood High"
            className="text-[14px] border-gray-200 focus:border-blue-300 transition-all"
            required
          />
        )}
        <Input
          name="email"
          label="Email"
          type="email"
          placeholder="Enter Your Email"
          className="text-[14px] border-gray-200 focus:border-blue-300 transition-all"
          required
        />
        <Input
          name="password"
          label="Password"
          type="password"
          placeholder="Enter Your Password"
          className="text-[14px] border-gray-200 focus:border-blue-300 transition-all"
          required
        />
        {(type === 'signup' || type === 'invite') && (
          <Input
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm Your Password"
            className="text-[14px] border-gray-200 focus:border-blue-300 transition-all"
            required
          />
        )}

        <button
          type="submit"
          className="w-full h-[44px] bg-blue-600 text-white text-[14px] font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          disabled={isLoading}
        >
          {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {type === 'login' ? 'Sign In' : type === 'invite' ? 'Complete Registration' : 'Get Started'}
        </button>
      </form>

      <div className="w-full flex items-center my-8">
        <div className="flex-grow h-[1px] bg-gray-100"></div>
        <span className="px-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest">or</span>
        <div className="flex-grow h-[1px] bg-gray-100"></div>
      </div>

      <button className="w-full h-[44px] flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-[14px] font-medium text-gray-700">
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