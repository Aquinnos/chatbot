import { ChatType, MessageType } from '@/components/chat/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface BackendMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  media?: BackendMedia[];
}

export interface BackendMedia {
  _id: string;
  type: 'image' | 'audio' | 'video' | 'file';
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface BackendChat {
  _id: string;
  title: string;
  userId: string;
  messages: BackendMessage[];
  createdAt: string;
  updatedAt: string;
}

// Helper function to convert backend chat format to frontend chat format
const convertBackendToFrontendChat = (backendChat: BackendChat): ChatType => {
  return {
    id: backendChat._id,
    title: backendChat.title,
    messages: backendChat.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      media: msg.media?.map((m) => ({
        id: m._id,
        type: m.type,
        url: `${API_URL}${m.url}`,
        filename: m.filename,
        mimetype: m.mimetype,
        size: m.size,
      })),
    })),
    model: undefined, // TODO: Add model to backend chat schema if needed
    createdAt: new Date(backendChat.createdAt),
    updatedAt: new Date(backendChat.updatedAt),
  };
};

// Helper function to convert frontend message format to backend message format
const convertFrontendToBackendMessage = (message: MessageType) => {
  return {
    role: message.role,
    content: message.content,
    timestamp: message.timestamp.toISOString(),
  };
};

export const chatService = {
  // Fetch all chats for the current user
  async getAllChats(token: string): Promise<ChatType[]> {
    const response = await fetch(`${API_URL}/chats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }

    const backendChats: BackendChat[] = await response.json();
    return backendChats.map(convertBackendToFrontendChat);
  },

  // Fetch a specific chat by ID
  async getChatById(token: string, chatId: string): Promise<ChatType> {
    const response = await fetch(`${API_URL}/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat');
    }

    const backendChat: BackendChat = await response.json();
    return convertBackendToFrontendChat(backendChat);
  },

  // Create a new chat
  async createChat(
    token: string,
    title: string = 'New Chat'
  ): Promise<ChatType> {
    const response = await fetch(`${API_URL}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat');
    }

    const backendChat: BackendChat = await response.json();
    return convertBackendToFrontendChat(backendChat);
  },

  // Add a message to an existing chat
  async addMessageToChat(
    token: string,
    chatId: string,
    message: MessageType
  ): Promise<ChatType> {
    const backendMessage = convertFrontendToBackendMessage(message);

    const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: backendMessage.role,
        content: backendMessage.content,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add message to chat');
    }

    const backendChat: BackendChat = await response.json();
    return convertBackendToFrontendChat(backendChat);
  },

  // Delete a chat
  async deleteChat(token: string, chatId: string): Promise<void> {
    const response = await fetch(`${API_URL}/chats/${chatId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat');
    }
  },

  // Upload media to an existing message
  async uploadMedia(
    token: string,
    chatId: string,
    messageId: string,
    file: File
  ): Promise<BackendMedia> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(
      `${API_URL}/chats/${chatId}/messages/${messageId}/media`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    if (!response.ok) {
      throw new Error('Failed to upload media');
    }
    const data = await response.json();
    return data.media as BackendMedia;
  },

  // Delete media from a message
  async deleteMedia(
    token: string,
    chatId: string,
    messageId: string,
    mediaId: string
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/chats/${chatId}/messages/${messageId}/media/${mediaId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to delete media');
    }
  },
};
