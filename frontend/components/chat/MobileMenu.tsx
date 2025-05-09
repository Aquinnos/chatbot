'use client';

import { useState } from 'react';
import { Model } from '@/lib/models';

interface MobileMenuProps {
  onApiKeyClick: () => void;
  onSettingsClick: () => void;
  onClearChatClick: () => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
  models: Model[];
  selectedModel: Model;
  onModelSelect: (model: Model) => void;
}

export function MobileMenu({
  onApiKeyClick,
  onSettingsClick,
  onClearChatClick,
  onProfileClick,
  onLogoutClick,
  models,
  selectedModel,
  onModelSelect,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700"
        aria-label="Menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white dark:bg-zinc-800 ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                onClick={() => handleMenuItemClick(onApiKeyClick)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                <span className="mr-2">🔑</span>
                API Key
              </button>
              <button
                onClick={() => handleMenuItemClick(onSettingsClick)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                <span className="mr-2">⚙️</span>
                Settings
              </button>
              <div className="px-4 py-2 border-b border-gray-200 dark:border-zinc-700">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Model
                </label>
                <select
                  value={selectedModel.id}
                  onChange={(e) => {
                    const selectedModel = models.find(
                      (model) => model.id === e.target.value
                    );
                    if (selectedModel) {
                      handleMenuItemClick(() => onModelSelect(selectedModel));
                    }
                  }}
                  className="w-full p-1.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded text-sm"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => handleMenuItemClick(onClearChatClick)}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                Clear chat
              </button>
              <button
                onClick={() => handleMenuItemClick(onProfileClick)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                Profile
              </button>
              <button
                onClick={() => handleMenuItemClick(onLogoutClick)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
