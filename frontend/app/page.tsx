'use client';

import Chatbot from '@/components/Chatbot';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use the authApi to check authentication status
    const checkAuth = () => {
      const isAuth = authApi.isAuthenticated();

      if (!isAuth) {
        router.push('/auth/login');
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="p-4 h-[100vh] bg-white dark:bg-zinc-900">
      <div className="flex justify-between items-center mb-4 p-2">
        <h1 className="text-xl font-bold">Chatbot with GLHF API</h1>
      </div>
      <Chatbot />
    </main>
  );
}
