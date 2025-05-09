'use client';

import { useRouter } from 'next/navigation';
import { glhfModels } from '@/lib/models';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChatType } from '@/components/chat/types';

export default function ModelsPage() {
  const router = useRouter();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    const chatId = localStorage.getItem('activeChat');
    setActiveChatId(chatId);
  }, []);

  const handleModelSelect = (modelId: string) => {
    localStorage.setItem('selectedModelId', modelId);

    if (activeChatId) {
      try {
        const chatsJson = localStorage.getItem('chats');
        if (chatsJson) {
          const chats = JSON.parse(chatsJson);
          const updatedChats = chats.map((chat: ChatType) => {
            if (chat.id === activeChatId) {
              const selectedModel = glhfModels.find((m) => m.id === modelId);
              if (selectedModel) {
                return { ...chat, model: selectedModel };
              }
            }
            return chat;
          });

          localStorage.setItem('chats', JSON.stringify(updatedChats));
        }
      } catch (error) {
        console.error('Error updating chat model:', error);
      }
    }

    router.push('/chat');
  };

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-[#1DCD9F]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h1 className="text-xl sm:text-2xl font-bold">Available AI Models</h1>
        </div>
        <Link
          href="/chat"
          className="inline-flex items-center px-4 py-2 bg-[#1DCD9F] hover:bg-[#169976] text-white rounded-md text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Return to chat
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {glhfModels.map((model) => (
          <div
            key={model.id}
            className="border dark:border-zinc-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-gray-50 dark:bg-zinc-800 p-4 border-b dark:border-zinc-700">
              <h2 className="text-xl font-semibold">{model.name}</h2>
            </div>
            <div className=" p-4 space-y-3 ">
              <p className="text-gray-700 dark:text-gray-300">
                {model.description}
              </p>

              <div className="text-sm grid grid-cols-2 gap-2">
                <div className="bg-gray-100 dark:bg-zinc-900 p-2 rounded">
                  <span className="font-medium">Context:</span>{' '}
                  {model.contextSize
                    ? `${(model.contextSize / 1000).toFixed(0)}K`
                    : 'N/A'}
                </div>
                <div className="bg-gray-100 dark:bg-zinc-900 p-2 rounded">
                  <span className="font-medium">Max Tokens:</span>{' '}
                  {model.maxTokens || 'N/A'}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t dark:border-zinc-700">
                <h3 className="font-medium mb-2">Pricing:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-100 dark:bg-zinc-900 p-2 rounded">
                    <span className="font-medium">Input:</span>{' '}
                    {model.price?.input || 'N/A'}
                  </div>
                  <div className="bg-gray-100 dark:bg-zinc-900 p-2 rounded">
                    <span className="font-medium">Output:</span>{' '}
                    {model.price?.output || 'N/A'}
                  </div>
                </div>
              </div>

              <button
                className="w-full mt-4 px-4 py-2 bg-[#1DCD9F] hover:bg-[#169976] text-white rounded-md"
                onClick={() => handleModelSelect(model.id)}
              >
                Use this model
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
