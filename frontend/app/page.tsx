'use client';

import Chatbot from '@/components/Chatbot';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');

    if (!user) {
      router.push('/auth/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
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
    <main className="p-4 h-[100vh]">
      <div className="flex justify-between items-center mb-4 p-2">
        <h1 className="text-xl font-bold">Chatbot with GLHF API</h1>
        <button
          onClick={() => {
            localStorage.removeItem('user');
            router.push('/auth/login');
          }}
          className="px-4 py-2 text-sm bg-[#1dcd9f] hover:bg-[#169976] rounded"
        >
          Logout
        </button>
      </div>
      <Chatbot />
    </main>
  );
}
