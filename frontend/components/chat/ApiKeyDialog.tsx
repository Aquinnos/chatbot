'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/services/api';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyDialog({ isOpen, onClose }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load the API key from user's account or localStorage on component mount
  useEffect(() => {
    // First try to get API key from authenticated user
    const user = authApi.getCurrentUser();
    if (user?.apiKey) {
      setApiKey(user.apiKey);
    } else {
      // Fall back to localStorage if not in user data
      const savedKey = localStorage.getItem('user_glhf_api_key');
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate API key format (basic check)
      if (apiKey && !apiKey.startsWith('glhf_')) {
        setError(
          'Invalid API key format. GLHF API keys should start with "glhf_"'
        );
        setIsSaving(false);
        return;
      }

      // Save to localStorage for immediate use
      if (apiKey) {
        localStorage.setItem('user_glhf_api_key', apiKey);
      } else {
        localStorage.removeItem('user_glhf_api_key');
      }

      // Verify the API key works by making a test request
      const response = await fetch('/api/verify-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify API key');
      }

      // If user is authenticated, also save to the backend
      if (authApi.isAuthenticated()) {
        try {
          await authApi.updateApiKey(apiKey);
          setSuccess(
            'API key verified and saved to your account successfully!'
          );
        } catch (err) {
          console.error('Failed to save API key to account:', err);
          setSuccess('API key verified and saved locally.');
        }
      } else {
        setSuccess('API key verified and saved locally.');
      }

      // Close the dialog after a short delay
      setTimeout(() => {
        onClose();
        // Force page reload to apply the new API key
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setApiKey('');
    localStorage.removeItem('user_glhf_api_key');

    // If user is authenticated, also clear from the backend
    if (authApi.isAuthenticated()) {
      try {
        await authApi.updateApiKey('');
        setSuccess(
          'API key cleared from your account. Using default key if available.'
        );
      } catch (err) {
        console.error('Failed to clear API key from account:', err);
        setSuccess('API key cleared locally. Using default key if available.');
      }
    } else {
      setSuccess('API key cleared. Using default key if available.');
    }

    setTimeout(() => {
      onClose();
      // Force page reload to apply the change
      window.location.reload();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Set GLHF API Key</h2>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Enter your GLHF API key to use your own account. The key will be
          stored in your browser and{' '}
          {authApi.isAuthenticated()
            ? 'synchronized with your account'
            : 'sent securely with each request'}
          .
        </p>

        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
            API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="glhf_..."
            className="w-full p-2 border rounded-md dark:bg-zinc-700 dark:border-zinc-600"
          />
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded text-green-800 dark:text-green-300 text-sm">
            {success}
          </div>
        )}

        <div className="flex justify-between gap-4 mt-6">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded"
          >
            Clear Key
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
