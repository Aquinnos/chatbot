'use client';

import { PlaceholdersAndVanishInput } from './ui/placeholders-and-vanish-input';
import { glhfModels } from '@/lib/models';

import { ChatSidebar } from './chat/ChatSidebar';
import { ChatHeader } from './chat/ChatHeader';
import { ChatConfigPanel } from './chat/ChatConfigPanel';
import { MessageList } from './chat/MessageList';
import { EmptyChat } from './chat/EmptyChat';
import { useChat } from './chat/useChat';
import { defaultConfig } from './chat/types';

/**
 * Main Chatbot component that integrates all chat functionality
 * This serves as the primary container for the chat interface
 */
export default function Chatbot() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    selectedModel,
    setSelectedModel,
    configOpen,
    setConfigOpen,
    config,
    chats,
    activeChat,
    chatSidebarOpen,
    setChatSidebarOpen,
    placeholders,
    handleSend,
    stopGeneration,
    createNewChat,
    updateChat,
    deleteChat,
    switchChat,
    clearChat,
    updateConfig,
    getActiveChatTitle,
    formatTime,
    formatDate,
  } = useChat();

  // Reset configuration to default values
  const resetConfig = () =>
    updateConfig('temperature', defaultConfig.temperature);

  return (
    <div className="flex h-[85vh] max-w-screen-xl mx-auto relative">
      {/* Sidebar showing all available chats */}
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        chatSidebarOpen={chatSidebarOpen}
        setChatSidebarOpen={setChatSidebarOpen}
        createNewChat={createNewChat}
        switchChat={switchChat}
        deleteChat={deleteChat}
        formatDate={formatDate}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden border border-[#222222] rounded-lg">
        {/* Header with model selector and controls */}
        <ChatHeader
          chatSidebarOpen={chatSidebarOpen}
          setChatSidebarOpen={setChatSidebarOpen}
          getActiveChatTitle={getActiveChatTitle}
          configOpen={configOpen}
          setConfigOpen={setConfigOpen}
          models={glhfModels}
          selectedModel={selectedModel}
          onModelSelect={(model) => {
            setSelectedModel(model);
            if (activeChat) {
              updateChat(activeChat, { model });
            }
          }}
          clearChat={clearChat}
          createNewChat={createNewChat}
          messagesCount={messages.length}
        />

        {/* Optional configuration panel for adjusting generation parameters */}
        {configOpen && (
          <ChatConfigPanel
            config={config}
            updateConfig={updateConfig}
            resetConfig={resetConfig}
          />
        )}

        {/* Main chat messages area */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto p-4 bg-white dark:bg-zinc-800 border border-[#222222] rounded-lg m-1">
            {messages.length === 0 ? (
              <EmptyChat
                placeholders={placeholders}
                selectedModel={selectedModel}
                onSelectPrompt={(prompt) => {
                  setInput(prompt);
                  setTimeout(() => handleSend(), 100);
                }}
              />
            ) : (
              <MessageList
                messages={messages}
                formatTime={formatTime}
                selectedModel={selectedModel}
              />
            )}
          </div>
        </div>

        {/* Input area for sending messages */}
        <div className="p-4 border-t border-[#222222]">
          <PlaceholdersAndVanishInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            placeholders={placeholders}
          />
          <div className="text-sm text-gray-300 mt-2 text-center flex justify-center items-center">
            {isLoading && (
              <>
                <span className="mr-2">
                  {selectedModel.name} is replying...
                </span>
                <button
                  onClick={stopGeneration}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-md px-3 py-1 text-xs font-medium flex items-center transition-colors"
                  aria-label="Stop generation"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <rect x="6" y="6" width="12" height="12"></rect>
                  </svg>
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
