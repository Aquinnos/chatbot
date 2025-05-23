'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { authApi } from '@/services/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const serverCheckTimeout = setTimeout(() => {
        setError(
          'Server API is not responding. Please check if the backend is running.'
        );
        setIsLoading(false);
      }, 10000);

      await authApi.login({ email, password });

      clearTimeout(serverCheckTimeout);

      router.push('/');
    } catch (err: Error | unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error occurred while logging in. Please try again later.';

      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('Server error: 404')) {
        userFriendlyMessage =
          'User not found. Please check your email and password.';
      } else if (errorMessage.includes('Invalid password')) {
        userFriendlyMessage = 'Password is incorrect. Please try again.';
      } else if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('Network')
      ) {
        userFriendlyMessage =
          'Problem with the server connection. Please check your internet connection.';
      }

      setError(userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Log in to your account"
      subtitle="Enter your credentials to access your account"
      alternateLink="/auth/register"
      alternateLinkText="Don't have an account? Sign up"
    >
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1dcd9f] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1dcd9f]  focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-[#1dcd9f] px-4 py-2 text-sm font-medium text-white hover:bg-[#169976] focus:outline-none focus:ring-2 focus:ring-[#1dcd9f] focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
}
