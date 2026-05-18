"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

export default function StudentAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.verifyToken();
        if (response.success && response.data?.user) {
          const user = response.data.user;
          if (user.role === 'STUDENT') {
            setIsAuthorized(true);
          } else {
            // Logged in as admin/teacher. Redirect to standard workspace or dashboard.
            router.push(user.role === 'TEACHER' ? '/workspace' : '/dashboard');
          }
        } else {
          router.push('/student-portal');
        }
      } catch (err) {
        router.push('/student-portal');
      }
    };

    checkAuth();
  }, [router]);

  // Prevent flashing of protected content
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFBFF]">
        
      </div>
    );
  }

  return <>{children}</>;
}
