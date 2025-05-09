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
  selectedModel,
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
    <div className="relative z-[80]">
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 pointer-event-fix"
        aria-label="Menu"
        style={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}
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
            className="fixed inset-0 bg-black/70 z-[75]"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white dark:bg-zinc-800 ring-1 ring-black ring-opacity-5 z-[80]">
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
                <div className="relative">
                  <button
                    className="w-full p-1.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded text-sm text-left flex justify-between items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = '/models';
                      setIsOpen(false);
                    }}
                    style={{
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <span>{selectedModel.name}</span>
                    <svg
                      className="w-4 h-4 ml-1 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
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
