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

function maskApiKey(apiKey: string): string {
  if (!apiKey) return '';
  if (apiKey.length <= 10) return '*'.repeat(apiKey.length);

  const prefix = apiKey.substring(0, 6);
  const suffix = apiKey.substring(apiKey.length - 4);
  const maskedPart = '*'.repeat(Math.min(10, apiKey.length - 10));

  return `${prefix}${maskedPart}${suffix}`;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showFullApiKey, setShowFullApiKey] = useState(false);
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const userData = authApi.getCurrentUser();

        if (userData) {
          setProfile(userData);
          setUsername(userData.username);
          setEmail(userData.email);
        } else {
          const response = await authApi.authenticatedRequest('/users');
          setProfile(response);
          setUsername(response.username);
          setEmail(response.email);
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    setSuccessMessage('');
    setIsUpdating(true);

    try {
      if (newPassword && newPassword !== confirmNewPassword) {
        setUpdateError('New passwords do not match');
        setIsUpdating(false);
        return;
      }

      const updateData: {
        username?: string;
        email?: string;
        password?: string;
        currentPassword?: string;
      } = {};

      if (username !== profile?.username) {
        updateData.username = username;
      }

      if (email !== profile?.email) {
        updateData.email = email;
      }

      if (newPassword) {
        updateData.password = newPassword;
        if (!currentPassword) {
          setUpdateError('Current password is required to set a new password');
          setIsUpdating(false);
          return;
        }
        updateData.currentPassword = currentPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        setIsUpdating(false);
        return;
      }
      const updatedProfile = await authApi.updateProfile(updateData);

      setProfile(updatedProfile);
      setUsername(updatedProfile.username);
      setEmail(updatedProfile.email);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
    } catch (err: unknown) {
      setUpdateError(
        err instanceof Error ? err.message : 'Failed to update profile'
      );
      console.error('Error updating profile:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setUsername(profile.username);
      setEmail(profile.email);
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setUpdateError('');
    setIsEditing(false);
  };

  const toggleApiKeyVisibility = () => {
    setShowFullApiKey(!showFullApiKey);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#1dcd9f] mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="text-center bg-red-50 p-4 sm:p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-3 sm:mb-4">
            Error
          </h2>
          <p className="text-sm sm:text-base text-red-600 mb-3 sm:mb-4">
            {error}
          </p>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto py-6 sm:py-12 px-4">
      <div className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <button
                onClick={() => router.push('/chat')}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-md bg-[#1dcd9f] text-white hover:bg-[#169976] transition-colors"
              >
                Back to Chat
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {profile ? (
            isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-6">
                {updateError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4">
                    <p className="text-sm text-red-700">{updateError}</p>
                  </div>
                )}

                <div className="space-y-1 sm:space-y-2">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-[#1dcd9f] text-black dark:text-white dark:bg-zinc-700"
                    required
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-[#1dcd9f] text-black dark:text-white dark:bg-zinc-700"
                    required
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 mt-3">
                  <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                    Change Password
                  </h3>

                  <div className="space-y-1 sm:space-y-2">
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-[#1dcd9f] text-black dark:text-white dark:bg-zinc-700"
                    />
                  </div>

                  <div className="space-y-1 sm:space-y-2 mt-3 sm:mt-4">
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-[#1dcd9f] text-black dark:text-white dark:bg-zinc-700"
                    />
                  </div>

                  <div className="space-y-1 sm:space-y-2 mt-3 sm:mt-4">
                    <label
                      htmlFor="confirmNewPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1dcd9f] focus:border-[#1dcd9f] text-black dark:text-white dark:bg-zinc-700"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-3 sm:pt-4 mt-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-[#1dcd9f] text-white rounded-md hover:bg-[#169976] disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-8 py-3 border-b dark:border-zinc-700">
                  <div className="font-medium text-gray-500 dark:text-gray-400 w-full md:w-48 text-sm sm:text-base">
                    Username
                  </div>
                  <div className="text-base sm:text-lg">{profile.username}</div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-8 py-3 border-b dark:border-zinc-700">
                  <div className="font-medium text-gray-500 dark:text-gray-400 w-full md:w-48 text-sm sm:text-base">
                    Email
                  </div>
                  <div className="text-base sm:text-lg break-all">
                    {profile.email}
                  </div>
                </div>

                {profile.apiKey && (
                  <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-8 py-3 border-b dark:border-zinc-700">
                    <div className="font-medium text-gray-500 dark:text-gray-400 w-full md:w-48 text-sm sm:text-base">
                      API Key
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="text-sm sm:text-base font-mono break-all bg-gray-100 dark:bg-zinc-700 p-2 rounded flex flex-wrap items-center gap-2">
                        <span className="overflow-ellipsis">
                          {showFullApiKey
                            ? profile.apiKey
                            : maskApiKey(profile.apiKey)}
                        </span>
                        <button
                          onClick={toggleApiKeyVisibility}
                          className="ml-auto p-1 text-xs bg-gray-200 dark:bg-zinc-600 rounded hover:bg-gray-300 dark:hover:bg-zinc-500"
                        >
                          {showFullApiKey ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        This API key is stored encrypted in our database for
                        your security.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-3 sm:pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-[#1dcd9f] text-white rounded-md hover:bg-[#169976]"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )
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
