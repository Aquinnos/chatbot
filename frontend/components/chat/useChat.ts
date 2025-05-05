'use client';

import { useState, useEffect, useRef } from 'react';
import { Model, defaultModel, glhfModels } from '@/lib/models';
import {
  ChatType,
  MessageType,
  GenerationConfig,
  defaultConfig,
} from './types';
import { chatService } from '@/services/chatService';
import { authApi } from '@/services/api';

/**
 * Custom hook that manages the entire chat state and functionality
 * Handles message history, API communication, and chat management
 */
export function useChat() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>(defaultModel);
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState<GenerationConfig>(defaultConfig);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Chat management state
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

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
    const token = authApi.getToken();

    // Check model preferences
    const savedModelId = localStorage.getItem('selectedModelId');
    if (savedModelId) {
      const newModel = glhfModels.find((model) => model.id === savedModelId);
      if (newModel) {
        setSelectedModel(newModel);
        localStorage.removeItem('selectedModelId');
      }
    }

    // Load configuration from localStorage
    const savedConfig = localStorage.getItem('generationConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (e) {
        console.error('Error loading configuration:', e);
      }
    }

    // Load chats from backend if user is authenticated
    if (token) {
      loadUserChats(token);
    } else {
      // Fall back to localStorage chats if not authenticated
      loadLocalChats();
    }
  }, []);

  // Load chats from backend
  const loadUserChats = async (token: string) => {
    setIsLoadingChats(true);
    try {
      const backendChats = await chatService.getAllChats(token);

      if (backendChats.length > 0) {
        setChats(backendChats);

        // Check for active chat in localStorage
        const lastActiveChat = localStorage.getItem('activeChat');
        if (
          lastActiveChat &&
          backendChats.some((chat) => chat.id === lastActiveChat)
        ) {
          setActiveChat(lastActiveChat);
          const chat = backendChats.find((chat) => chat.id === lastActiveChat);
          if (chat) {
            setMessages(chat.messages);
            if (chat.model) setSelectedModel(chat.model);
          }
        } else {
          // If no active chat in localStorage or it doesn't exist anymore, use the first chat
          setActiveChat(backendChats[0].id);
          setMessages(backendChats[0].messages);
          if (backendChats[0].model) setSelectedModel(backendChats[0].model);
        }
      } else {
        // If no chats on backend, create a new one
        createNewChat();
      }
    } catch (error) {
      console.error('Error loading chats from backend:', error);
      // Fall back to localStorage if backend fails
      loadLocalChats();
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Load chats from localStorage as fallback
  const loadLocalChats = () => {
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
        } else {
          createNewChat();
        }
      } catch (e) {
        console.error('Error loading chats from localStorage:', e);
        createNewChat();
      }
    } else {
      createNewChat();
    }
  };

  // Save active chat ID to localStorage when it changes
  useEffect(() => {
    if (activeChat) {
      localStorage.setItem('activeChat', activeChat);
    }
  }, [activeChat]);

  // Save all chats to localStorage when they change (as fallback)
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
  const createNewChat = async () => {
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

    // If user is authenticated, create chat on backend
    const token = authApi.getToken();
    if (token) {
      try {
        const createdChat = await chatService.createChat(token, 'New chat');
        // Replace the temporary chat with the one from the backend
        setChats((prev) => [
          createdChat,
          ...prev.filter((chat) => chat.id !== newChat.id),
        ]);
        setActiveChat(createdChat.id);
      } catch (error) {
        console.error('Error creating chat on backend:', error);
      }
    }
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
  const deleteChat = async (chatId: string) => {
    // If user is authenticated, delete chat on backend
    const token = authApi.getToken();
    if (token) {
      try {
        await chatService.deleteChat(token, chatId);
      } catch (error) {
        console.error('Error deleting chat on backend:', error);
      }
    }

    // Update local state
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
      setSelectedModel(chat.model || defaultModel);
    }
  };

  /**
   * Automatically generates a title for a chat based on the first message
   */
  const generateChatTitle = async (chatId: string, userMessage: string) => {
    const chat = chats.find((chat) => chat.id === chatId);
    if (chat && chat.title === 'New chat') {
      const shortenedMessage =
        userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
      updateChat(chatId, { title: shortenedMessage });
    }
  };

  /**
   * Stops the current model response generation
   */
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('user_requested_stop');
      abortControllerRef.current = null;
      setIsLoading(false);
    }
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

    // Save the user message to backend if authenticated
    const token = authApi.getToken();
    if (token && activeChat) {
      try {
        await chatService.addMessageToChat(token, activeChat, userMessage);
      } catch (error) {
        console.error('Error saving message to backend:', error);
      }
    }

    // Create an aborted flag to track if the request was manually stopped
    let wasManuallyAborted = false;

    try {
      // Cancel any ongoing requests before starting a new one
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();

      // Set up a handler to track manual aborts
      const currentController = abortControllerRef.current;

      // Listen for abort events to detect manual stops
      currentController.signal.addEventListener('abort', () => {
        // If the abort came from stopGeneration(), we'll mark it as manual
        if (abortControllerRef.current === currentController) {
          wasManuallyAborted = true;
        }
      });

      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current === currentController) {
          abortControllerRef.current.abort('timeout');
          abortControllerRef.current = null;
        }
      }, 120000);

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
          userApiKey: userApiKey,
        }),
        signal: abortControllerRef.current.signal,
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

      // Save the assistant message to backend if authenticated
      if (token && activeChat) {
        try {
          await chatService.addMessageToChat(
            token,
            activeChat,
            assistantMessage
          );
        } catch (error) {
          console.error('Error saving assistant message to backend:', error);
        }
      }
    } catch (error: unknown) {
      console.error('Error during fetch:', error);

      let errorContent =
        'An error occurred while communicating with the server.';

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorContent =
          'Network error: Failed to connect to the server. Please check your internet connection.';
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        // Check if this was manually aborted by user clicking "Stop"
        if (wasManuallyAborted) {
          errorContent = 'Generation stopped by user.';
          // Don't show error message for manual interruptions
          console.log('Response generation stopped by user');
          // Return early without adding error message to chat
          return;
        } else {
          errorContent =
            'Request timed out. The server took too long to respond.';
        }
      } else if (error instanceof Error) {
        errorContent = `Error: ${error.message}`;
      }

      // Only add error message if we're still loading
      if (isLoading) {
        const errorMessage: MessageType = {
          role: 'system',
          content: errorContent,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  /**
   * Clears the current chat's messages
   */
  const clearChat = async () => {
    if (activeChat) {
      setMessages([]);
      updateChat(activeChat, { messages: [] });

      // If user is authenticated, create a new chat on backend since we can't clear messages
      const token = authApi.getToken();
      if (token) {
        try {
          const createdChat = await chatService.createChat(token, 'New chat');
          // Add the new chat and set it as active
          setChats((prev) => [
            createdChat,
            ...prev.filter((chat) => chat.id !== activeChat),
          ]);
          setActiveChat(createdChat.id);
        } catch (error) {
          console.error('Error creating new chat after clear:', error);
        }
      }
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
    isLoadingChats,
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
  };
}
