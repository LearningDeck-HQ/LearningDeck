"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScaleLoader } from 'react-spinners';
import { authApi } from '@/lib/api/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.verifyToken();
        if (response.success && response.data?.user) {
          const user = response.data.user;
          if (user.role === 'ADMIN' && !user.hasSubscription) {
            //   router.push('/setup');
          } else {
            setIsAuthorized(true);
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
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
