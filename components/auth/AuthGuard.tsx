"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScaleLoader } from 'react-spinners';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
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
