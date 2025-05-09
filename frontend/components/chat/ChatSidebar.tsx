'use client';

import { ChatType } from './types';

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
    <>
      {/* Mobile overlay when sidebar is open */}
      {chatSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setChatSidebarOpen(false)}
        ></div>
      )}

      <div
        className={`${
          chatSidebarOpen ? 'flex' : 'hidden md:flex'
        } flex-col w-64 h-full border-r dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 transition-all duration-300 z-50 absolute md:relative inset-y-0 left-0`}
        style={{ isolation: 'isolate' }}
      >
        <div className="p-4 border-b dark:border-zinc-700 flex justify-between items-center">
          <h2 className="font-semibold">Your chats</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={createNewChat}
              className="p-2 bg-[#1dcd9f] hover:bg-primary-dark text-white rounded-md"
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
                      ? 'bg-green-100 dark:bg-primary-dark'
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
                      className="p-1 rounded-full dark:hover:text-red-600 text-black "
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
                  <div className="text-xs text-gray-500 dark:text-gray-300 truncate">
                    {formatDate(chat.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative p-3 border-t dark:border-zinc-700 z-[60]">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = '/models';
            }}
            className="block relative z-[90] w-full text-center p-3 bg-[#1DCD9F] hover:bg-[#169976] text-white rounded-md text-sm font-medium transition-colors shadow-md"
            style={{
              isolation: 'isolate',
              transform: 'translateZ(0)',
              pointerEvents: 'auto',
              touchAction: 'manipulation',
              position: 'relative',
            }}
          >
            <span className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ flexShrink: 0 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span className="whitespace-nowrap">View Available Models</span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
