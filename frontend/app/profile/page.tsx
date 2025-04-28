'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  apiKey?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Get profile from localStorage first
        const userData = authApi.getCurrentUser();

        if (userData) {
          setProfile(userData);
        } else {
          // If not in localStorage, try to fetch from API
          const response = await authApi.authenticatedRequest('/users');
          setProfile(response);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch profile'
        );
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    authApi.logout();
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center bg-red-50 p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Profile</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Back to Chat
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>

          {profile ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 py-4 border-b dark:border-zinc-700">
                <div className="font-medium text-gray-500 dark:text-gray-400 w-48">
                  Username
                </div>
                <div className="text-lg">{profile.username}</div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 py-4 border-b dark:border-zinc-700">
                <div className="font-medium text-gray-500 dark:text-gray-400 w-48">
                  Email
                </div>
                <div className="text-lg">{profile.email}</div>
              </div>

              {profile.apiKey && (
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 py-4 border-b dark:border-zinc-700">
                  <div className="font-medium text-gray-500 dark:text-gray-400 w-48">
                    API Key
                  </div>
                  <div className="text-lg font-mono break-all bg-gray-100 dark:bg-zinc-700 p-2 rounded">
                    {profile.apiKey}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No profile data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
