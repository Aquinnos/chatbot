import OpenAI from 'openai';

const defaultApiKey = process.env.GLHF_API_KEY || '';

export function createGlhfClient(apiKey: string = defaultApiKey): OpenAI {
  return new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.glhf.chat/v1',
    timeout: 120000,
    maxRetries: 2,
    dangerouslyAllowBrowser: false,
  });
}

export const glhf = createGlhfClient();

export const checkGlhfApiStatus = async (
  apiKey: string = defaultApiKey
): Promise<{ ok: boolean; message: string }> => {
  if (!apiKey || apiKey.trim() === '') {
    return { ok: false, message: 'API key is missing or empty' };
  }

  try {
    const client = createGlhfClient(apiKey);
    await client.models.list();
    return { ok: true, message: 'API connection successful' };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      ok: false,
      message: `API connection failed: ${errorMessage}`,
    };
  }
};
