import { Model } from '@/lib/models';

export type MessageType = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  thinking?: string;
};

export type ChatType = {
  id: string;
  title: string;
  messages: MessageType[];
  model: Model;
  createdAt: Date;
  updatedAt: Date;
};

export interface GenerationConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export const defaultConfig: GenerationConfig = {
  temperature: 0.7,
  maxTokens: 100,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};
