'use client';

import { ChatType } from './types';
import Link from 'next/link';

interface ChatSidebarProps {
  chats: ChatType[];
  activeChat: string | null;
  chatSidebarOpen: boolean;
  setChatSidebarOpen: (open: boolean) => void;
  createNewChat: () => void;
  switchChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  formatDate: (date: Date) => string;
}

export function ChatSidebar({
  chats,
  activeChat,
  chatSidebarOpen,
  setChatSidebarOpen,
  createNewChat,
  switchChat,
  deleteChat,
  formatDate,
}: ChatSidebarProps) {
  return (
    <div
      className={`${
        chatSidebarOpen ? 'flex' : 'hidden md:flex'
      } flex-col w-64 h-full border-r dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 transition-all duration-300 z-10 absolute md:relative inset-y-0 left-0`}
    >
      <div className="p-4 border-b dark:border-zinc-700 flex justify-between items-center">
        <h2 className="font-semibold">Your chats</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={createNewChat}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            title="New chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <button
            onClick={() => setChatSidebarOpen(false)}
            className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700"
            title="Close sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No chats. Create a new chat.
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-2 rounded-md cursor-pointer transition-colors ${
                  activeChat === chat.id
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
                onClick={() => switchChat(chat.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium text-sm truncate">
                    {chat.title}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                    title="Delete chat"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {formatDate(chat.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t dark:border-zinc-700">
        <Link
          href="/models"
          className="flex items-center justify-center p-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded-md text-sm transition-colors"
        >
          <span>See the list of models</span>
        </Link>
      </div>
    </div>
  );
}
