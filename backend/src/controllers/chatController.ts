import { Request, Response } from 'express';
import Chat from '../models/chat';
import User from '../models/user';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Create a new chat
export const createChat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;

    const { title = 'New Chat' } = req.body;

    const newChat = new Chat({
      title,
      userId,
      messages: [],
    });

    await newChat.save();

    await User.findByIdAndUpdate(userId, {
      $push: { chats: newChat._id },
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Error creating chat' });
  }
};

// Get all chats for a user
export const getUserChats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Error fetching user chats' });
  }
};

// Get a single chat by ID
export const getChatById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    const chatId = req.params.id;

    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Error fetching chat' });
  }
};

// Add a message to a chat
export const addMessageToChat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    const chatId = req.params.id;
    const { role, content } = req.body;

    if (!['user', 'assistant'].includes(role)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    chat.messages.push({
      role: role as 'user' | 'assistant',
      content,
      timestamp: new Date(),
    } as any);

    if (chat.messages.length === 1 && role === 'user') {
      chat.title =
        content.substring(0, 30) + (content.length > 30 ? '...' : '');
    }

    await chat.save();
    res.status(200).json(chat);
  } catch (error) {
    console.error('Error adding message to chat:', error);
    res.status(500).json({ message: 'Error adding message to chat' });
  }
};

// Delete a chat
export const deleteChat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    const chatId = req.params.id;

    const chat = await Chat.findOneAndDelete({ _id: chatId, userId });

    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { chats: chatId },
    });

    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Error deleting chat' });
  }
};
