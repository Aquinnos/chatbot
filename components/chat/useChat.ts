'use client';

import { useState, useEffect } from 'react';
import { Model, defaultModel, glhfModels } from '@/lib/models';
import {
  ChatType,
  MessageType,
  GenerationConfig,
  defaultConfig,
} from './types';

/**
 * Custom hook that manages the entire chat state and functionality
 * Handles message history, API communication, and chat management
 */
export function useChat() {
  // Core chat state
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>(defaultModel);
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState<GenerationConfig>(defaultConfig);

  // Chat management state
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);

  // Sample prompts to display in the empty chat
  const placeholders = [
    "What's the first rule of Fight Club?",
    'Who is Tyler Durden?',
    'Where is Andrew Laeddis Hiding?',
    'Write a Javascript method to reverse a string',
    'How to assemble your own PC?',
  ];

  // Load saved chats and settings from localStorage on initial load
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');

    const savedModelId = localStorage.getItem('selectedModelId');
    if (savedModelId) {
      const newModel = glhfModels.find((model) => model.id === savedModelId);
      if (newModel) {
        setSelectedModel(newModel);
        localStorage.removeItem('selectedModelId');
      }
    }

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

  // Save active chat ID to localStorage when it changes
  useEffect(() => {
    if (activeChat) {
      localStorage.setItem('activeChat', activeChat);
    }
  }, [activeChat]);

  // Save all chats to localStorage when they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Save generation config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('generationConfig', JSON.stringify(config));
  }, [config]);

  // Update the chat in the chats list when messages change
  useEffect(() => {
    if (activeChat && messages.length > 0) {
      updateChat(activeChat, {
        messages,
        updatedAt: new Date(),
      });
    }
  }, [messages, activeChat]);

  /**
   * Creates a new chat with default settings
   */
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

  /**
   * Updates a chat with new data
   */
  const updateChat = (chatId: string, data: Partial<ChatType>) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, ...data } : chat))
    );
  };

  /**
   * Deletes a chat and handles switching to another chat
   */
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

  /**
   * Switches to a different chat
   */
  const switchChat = (chatId: string) => {
    const chat = chats.find((chat) => chat.id === chatId);
    if (chat) {
      setActiveChat(chatId);
      setMessages(chat.messages);
      setSelectedModel(chat.model);
    }
  };

  /**
   * Automatically generates a title for a chat based on the first message
   */
  const generateChatTitle = async (chatId: string, userMessage: string) => {
    const chat = chats.find((chat) => chat.id === chatId);
    if (chat && chat.title !== 'New chat') return;

    const shortenedMessage =
      userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
    updateChat(chatId, { title: shortenedMessage });
  };

  /**
   * Handles sending a message to the API and processing the response
   */
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      // Get the user-provided API key from localStorage
      const userApiKey = localStorage.getItem('user_glhf_api_key') || '';

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
          userApiKey: userApiKey, // Include the user's API key
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Received non-JSON response:', await res.text());
        throw new Error('Server responded with non-JSON content');
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: MessageType = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: unknown) {
      console.error('Error during fetch:', error);

      let errorContent =
        'An error occurred while communicating with the server.';

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorContent =
          'Network error: Failed to connect to the server. Please check your internet connection.';
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        errorContent =
          'Request timed out. The server took too long to respond.';
      } else if (error instanceof Error) {
        errorContent = `Error: ${error.message}`;
      }

      const errorMessage: MessageType = {
        role: 'system',
        content: errorContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears the current chat's messages
   */
  const clearChat = () => {
    if (activeChat) {
      setMessages([]);
      updateChat(activeChat, { messages: [] });
    }
  };

  /**
   * Updates a specific generation configuration parameter
   */
  const updateConfig = (field: keyof GenerationConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Gets the title of the active chat
   */
  const getActiveChatTitle = () => {
    if (!activeChat) return 'Chat';
    const chat = chats.find((chat) => chat.id === activeChat);
    return chat ? chat.title : 'Chat';
  };

  /**
   * Formats a timestamp into hours and minutes
   */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * Formats a date as Today, Yesterday, or the date
   */
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

  return {
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
    createNewChat,
    updateChat,
    deleteChat,
    switchChat,
    clearChat,
    updateConfig,
    getActiveChatTitle,
    formatTime,
    formatDate,
  };
}
