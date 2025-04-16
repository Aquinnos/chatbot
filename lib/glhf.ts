import OpenAI from 'openai';

export const glhf = new OpenAI({
  apiKey: process.env.GLHF_API_KEY,
  baseURL: 'https://api.glhf.chat/v1',
});
