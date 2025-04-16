'use client';

import { useState, useRef, useEffect } from 'react';
import { PlaceholdersAndVanishInput } from './ui/placeholders-and-vanish-input';
import { ModelSelector } from './ui/model-selector';
import { glhfModels, defaultModel, Model } from '@/lib/models';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type MessageType = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

type ChatType = {
  id: string;
  title: string;
  messages: MessageType[];
  model: Model;
  createdAt: Date;
  updatedAt: Date;
};

interface GenerationConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

const defaultConfig: GenerationConfig = {
  temperature: 0.7,
  maxTokens: 100,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

export default function Chatbot() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>(defaultModel);
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState<GenerationConfig>(defaultConfig);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);

  const placeholders = [
    "What's the first rule of Fight Club?",
    'Who is Tyler Durden?',
    'Where is Andrew Laeddis Hiding?',
    'Write a Javascript method to reverse a string',
    'How to assemble your own PC?',
  ];

  useEffect(() => {
    const savedChats = localStorage.getItem('chats');

    if (savedChats) {
      try {
        const parsedChats: ChatType[] = JSON.parse(savedChats);
        const chatsWithDates = parsedChats.map((chat) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setChats(chatsWithDates);

        const lastActiveChat = localStorage.getItem('activeChat');
        if (
          lastActiveChat &&
          chatsWithDates.some((chat) => chat.id === lastActiveChat)
        ) {
          setActiveChat(lastActiveChat);

          const chat = chatsWithDates.find(
            (chat) => chat.id === lastActiveChat
          );
          if (chat) {
            setMessages(chat.messages);
            setSelectedModel(chat.model);
          }
        } else if (chatsWithDates.length > 0) {
          setActiveChat(chatsWithDates[0].id);
          setMessages(chatsWithDates[0].messages);
          setSelectedModel(chatsWithDates[0].model);
        }
      } catch (e) {
        console.error('Error loading chats:', e);
      }
    } else {
      createNewChat();
    }

    const savedConfig = localStorage.getItem('generationConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (e) {
        console.error('Error loading configuration:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (activeChat) {
      localStorage.setItem('activeChat', activeChat);
    }
  }, [activeChat]);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('generationConfig', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (activeChat && messages.length > 0) {
      updateChat(activeChat, {
        messages,
        updatedAt: new Date(),
      });
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewChat = () => {
    const newChat: ChatType = {
      id: Date.now().toString(),
      title: 'New chat',
      messages: [],
      model: selectedModel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setMessages([]);
  };

  const updateChat = (chatId: string, data: Partial<ChatType>) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, ...data } : chat))
    );
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));

    if (activeChat === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setActiveChat(remainingChats[0].id);
        setMessages(remainingChats[0].messages);
        setSelectedModel(remainingChats[0].model);
      } else {
        createNewChat();
      }
    }
  };

  const switchChat = (chatId: string) => {
    const chat = chats.find((chat) => chat.id === chatId);
    if (chat) {
      setActiveChat(chatId);
      setMessages(chat.messages);
      setSelectedModel(chat.model);
    }
  };

  const changeChatTitle = (chatId: string, newTitle: string) => {
    updateChat(chatId, { title: newTitle });
  };

  const generateChatTitle = async (chatId: string, userMessage: string) => {
    const chat = chats.find((chat) => chat.id === chatId);
    if (chat && chat.title !== 'New chat') return;

    const shortenedMessage =
      userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
    updateChat(chatId, { title: shortenedMessage });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: MessageType = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (activeChat && messages.length === 0) {
      generateChatTitle(activeChat, input);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          model: selectedModel.id,
          history: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          config: config,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error communicating with the API');
      }

      const assistantMessage: MessageType = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error:', error);

      const errorMessage: MessageType = {
        role: 'system',
        content:
          error.message ||
          'An error occurred while communicating with the server.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const clearChat = () => {
    if (activeChat) {
      setMessages([]);
      updateChat(activeChat, { messages: [] });
    }
  };

  const updateConfig = (field: keyof GenerationConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const getActiveChatTitle = () => {
    if (!activeChat) return 'Chat';
    const chat = chats.find((chat) => chat.id === activeChat);
    return chat ? chat.title : 'Chat';
  };

  const getChatPreview = (chat: ChatType) => {
    if (chat.messages.length === 0) return 'New chat';
    const firstMessage = chat.messages[0];
    return (
      firstMessage.content.slice(0, 40) +
      (firstMessage.content.length > 40 ? '...' : '')
    );
  };

  return (
    <div className="flex h-[85vh] max-w-screen-xl mx-auto relative">
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

      <div className="flex-1 flex flex-col h-full overflow-hidden border dark:border-zinc-700 rounded-lg">
        <div className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
          <div className="flex items-center">
            <button
              onClick={() => setChatSidebarOpen(!chatSidebarOpen)}
              className="md:hidden p-2 mr-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700"
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
            <h2 className="sm:text-xl font-semibold hidden sm:block">
              {getActiveChatTitle()}
            </h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className="px-3 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-md"
            >
              ⚙️ <span className="sm:block hidden">Settings</span>
            </button>
            <ModelSelector
              models={glhfModels}
              selectedModel={selectedModel}
              onSelect={(model) => {
                setSelectedModel(model);
                if (activeChat) {
                  updateChat(activeChat, { model });
                }
              }}
            />
            <button
              onClick={clearChat}
              className="px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
            >
              Clear chat
            </button>
          </div>
        </div>

        {configOpen && (
          <div className="p-4 border-b dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
            <h3 className="text-sm font-medium mb-3">Generation settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs mb-1">Temperature</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) =>
                      updateConfig('temperature', parseFloat(e.target.value))
                    }
                    className="flex-1 mr-2"
                  />
                  <span className="text-xs">
                    {config.temperature.toFixed(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1">Max Tokens</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={config.maxTokens}
                    onChange={(e) =>
                      updateConfig('maxTokens', parseInt(e.target.value))
                    }
                    className="flex-1 mr-2"
                  />
                  <span className="text-xs">{config.maxTokens}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1">Top P</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.topP}
                    onChange={(e) =>
                      updateConfig('topP', parseFloat(e.target.value))
                    }
                    className="flex-1 mr-2"
                  />
                  <span className="text-xs">{config.topP.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1">Frequency Penalty</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.frequencyPenalty}
                    onChange={(e) =>
                      updateConfig(
                        'frequencyPenalty',
                        parseFloat(e.target.value)
                      )
                    }
                    className="flex-1 mr-2"
                  />
                  <span className="text-xs">
                    {config.frequencyPenalty.toFixed(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1">Presence Penalty</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.presencePenalty}
                    onChange={(e) =>
                      updateConfig(
                        'presencePenalty',
                        parseFloat(e.target.value)
                      )
                    }
                    className="flex-1 mr-2"
                  />
                  <span className="text-xs">
                    {config.presencePenalty.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setConfig(defaultConfig)}
                  className="px-3 py-1 text-xs bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-md"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-700 rounded-lg m-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <div className="text-center mb-4">
                <h3 className="text-xl font-medium mb-2">
                  Start a conversation with {selectedModel.name}
                </h3>
                <p>Choose a prompt or type your own message to begin.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-2xl">
                {placeholders.map((placeholder, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(placeholder);
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="p-3 border dark:border-zinc-700 rounded-lg text-left hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                  >
                    {placeholder}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex max-w-3xl mx-auto',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-lg p-4 max-w-[80%]',
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.role === 'system'
                        ? 'bg-red-500 text-white'
                        : 'bg-white dark:bg-zinc-800 border dark:border-zinc-700'
                    )}
                  >
                    <div className="mb-1 text-xs text-gray-200 dark:text-gray-400 flex justify-between">
                      <span>
                        {message.role === 'user'
                          ? 'You'
                          : message.role === 'system'
                          ? 'System'
                          : selectedModel.name}
                      </span>
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-zinc-700">
          <PlaceholdersAndVanishInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            placeholders={placeholders}
          />
          {isLoading && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              {selectedModel.name} is replying...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
