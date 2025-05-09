'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModelSelector } from '../ui/model-selector';
import { Model, defaultModel } from '@/lib/models';
import { ApiKeyDialog } from './ApiKeyDialog';
import { ModelSwitchDialog } from './ModelSwitchDialog';
import { MobileMenu } from './MobileMenu';
import { authApi } from '@/services/api';

interface ChatHeaderProps {
  chatSidebarOpen: boolean;
  setChatSidebarOpen: (open: boolean) => void;
  getActiveChatTitle: () => string;
  configOpen: boolean;
  setConfigOpen: (open: boolean) => void;
  models: Model[];
  selectedModel: Model | undefined;
  onModelSelect: (model: Model) => void;
  clearChat: () => void;
  createNewChat: () => void;
  messagesCount: number;
}

export function ChatHeader({
  chatSidebarOpen,
  setChatSidebarOpen,
  getActiveChatTitle,
  configOpen,
  setConfigOpen,
  models,
  selectedModel = defaultModel,
  onModelSelect,
  clearChat,
  createNewChat,
  messagesCount,
}: ChatHeaderProps) {
  const router = useRouter();
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [modelSwitchDialogOpen, setModelSwitchDialogOpen] = useState(false);
  const [pendingModel, setPendingModel] = useState<Model | null>(null);

  const actualModel = selectedModel || defaultModel;

  const handleModelSelect = (model: Model) => {
    if (model.id === actualModel.id) {
      return;
    }

    if (messagesCount === 0) {
      onModelSelect(model);
      return;
    }

    setPendingModel(model);
    setModelSwitchDialogOpen(true);
  };

  const handleCreateNewChat = () => {
    if (pendingModel) {
      onModelSelect(pendingModel);
      createNewChat();
      setModelSwitchDialogOpen(false);
      setPendingModel(null);
    }
  };

  const handleKeepCurrentModel = () => {
    setModelSwitchDialogOpen(false);
    setPendingModel(null);
  };

  const handleLogout = () => {
    authApi.logout();
    router.push('/auth/login');
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <>
      <div className="flex flex-row justify-between items-center p-3 border-b dark:border-zinc-700">
        <div className="flex items-center w-auto mr-2">
          <button
            onClick={() => setChatSidebarOpen(!chatSidebarOpen)}
            className="md:hidden p-2 mr-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
          <h2 className="text-lg font-semibold truncate max-w-[200px]">
            {getActiveChatTitle()}
          </h2>
        </div>

        {/* Desktop view - show all buttons */}
        <div className="hidden sm:flex flex-wrap gap-2">
          <button
            onClick={() => setApiKeyDialogOpen(true)}
            className="flex-shrink-0 px-3 py-1.5 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-md"
            aria-label="API Key"
          >
            <span>
              <span className="mr-1">🔑</span>
              <span>API Key</span>
            </span>
          </button>
          <button
            onClick={() => setConfigOpen(!configOpen)}
            className="flex-shrink-0 px-3 py-1.5 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-md"
            aria-label="Settings"
          >
            <span>
              <span className="mr-1">⚙️</span>
              <span>Settings</span>
            </span>
          </button>
          <div>
            <ModelSelector
              models={models}
              selectedModel={actualModel}
              onSelect={handleModelSelect}
            />
          </div>
          <button
            onClick={clearChat}
            className="flex-shrink-0 px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
            aria-label="Clear chat"
          >
            <span>Clear chat</span>
          </button>
          <button
            onClick={handleProfileClick}
            className="flex-shrink-0 px-3 py-1.5 text-sm bg-[#1dcd9f] hover:bg-[#169976] text-white rounded-md"
            aria-label="Profile"
          >
            <span>Profile</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex-shrink-0 px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md"
            aria-label="Logout"
          >
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile view - use MobileMenu component */}
        <div className="sm:hidden">
          <MobileMenu
            onApiKeyClick={() => setApiKeyDialogOpen(true)}
            onSettingsClick={() => setConfigOpen(!configOpen)}
            onClearChatClick={clearChat}
            onProfileClick={handleProfileClick}
            onLogoutClick={handleLogout}
            models={models}
            selectedModel={actualModel}
            onModelSelect={handleModelSelect}
          />
        </div>
      </div>

      <ApiKeyDialog
        isOpen={apiKeyDialogOpen}
        onClose={() => setApiKeyDialogOpen(false)}
      />

      {pendingModel && (
        <ModelSwitchDialog
          isOpen={modelSwitchDialogOpen}
          onClose={() => setModelSwitchDialogOpen(false)}
          currentModel={actualModel}
          newModel={pendingModel}
          onCreateNewChat={handleCreateNewChat}
          onKeepCurrentModel={handleKeepCurrentModel}
        />
      )}
    </>
  );
}
