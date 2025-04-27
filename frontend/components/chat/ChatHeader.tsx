'use client';

import { useState } from 'react';
import { ModelSelector } from '../ui/model-selector';
import { Model } from '@/lib/models';
import { ApiKeyDialog } from './ApiKeyDialog';
import { ModelSwitchDialog } from './ModelSwitchDialog';

interface ChatHeaderProps {
  chatSidebarOpen: boolean;
  setChatSidebarOpen: (open: boolean) => void;
  getActiveChatTitle: () => string;
  configOpen: boolean;
  setConfigOpen: (open: boolean) => void;
  models: Model[];
  selectedModel: Model;
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
  selectedModel,
  onModelSelect,
  clearChat,
  createNewChat,
  messagesCount,
}: ChatHeaderProps) {
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [modelSwitchDialogOpen, setModelSwitchDialogOpen] = useState(false);
  const [pendingModel, setPendingModel] = useState<Model | null>(null);

  const handleModelSelect = (model: Model) => {
    if (model.id === selectedModel.id) {
      return; // No change if selecting the same model
    }

    // If there are no messages in the current chat, just switch the model
    if (messagesCount === 0) {
      onModelSelect(model);
      return;
    }

    // Otherwise, show the warning dialog
    setPendingModel(model);
    setModelSwitchDialogOpen(true);
  };

  const handleCreateNewChat = () => {
    if (pendingModel) {
      // First set the selected model
      onModelSelect(pendingModel);
      // Then create a new chat (which will use the just-selected model)
      createNewChat();
      setModelSwitchDialogOpen(false);
      setPendingModel(null);
    }
  };

  const handleKeepCurrentModel = () => {
    setModelSwitchDialogOpen(false);
    setPendingModel(null);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border-b dark:border-zinc-700">
        <div className="flex items-center mb-2 sm:mb-0 w-full sm:w-auto">
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
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setApiKeyDialogOpen(true)}
            className="flex-shrink-0 w-full sm:w-auto px-3 py-1.5 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-md"
            aria-label="API Key"
          >
            <span className="">
              <span className="mr-1">🔑</span>
              <span className="sm:inline">API Key</span>
            </span>
          </button>
          <button
            onClick={() => setConfigOpen(!configOpen)}
            className="flex-shrink-0 w-full sm:w-auto px-3 py-1.5 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-md"
            aria-label="Settings"
          >
            <span className="">
              <span className="mr-1">⚙️</span>
              <span className="sm:inline">Settings</span>
            </span>
          </button>
          <div className="w-full sm:w-auto">
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelect={handleModelSelect}
            />
          </div>
          <button
            onClick={clearChat}
            className="flex-shrink-0 w-full sm:w-auto px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
            aria-label="Clear chat"
          >
            <span className="sm:inline">Clear chat</span>
          </button>
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
          currentModel={selectedModel}
          newModel={pendingModel}
          onCreateNewChat={handleCreateNewChat}
          onKeepCurrentModel={handleKeepCurrentModel}
        />
      )}
    </>
  );
}
