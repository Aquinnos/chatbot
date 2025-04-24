import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    // Basic validation
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Validate format
    if (!apiKey.startsWith('glhf_')) {
      return NextResponse.json(
        {
          error:
            'Invalid API key format. GLHF API keys should start with "glhf_"',
        },
        { status: 400 }
      );
    }

    // Try to use the API key
    const testClient = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.glhf.chat/v1',
      timeout: 10000,
    });

    try {
      // Try to list models - this will fail if the API key is invalid
      await testClient.models.list();

      // Success - the API key is valid
      return NextResponse.json({ valid: true });
    } catch (apiError) {
      // Extract useful error information
      const errorMessage =
        apiError instanceof Error ? apiError.message : 'Unknown error';

      if (
        errorMessage.includes('401') ||
        errorMessage.includes('unauthorized')
      ) {
        return NextResponse.json(
          {
            error: 'Invalid API key. Please check your API key and try again.',
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `API error: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in verify-key route:', error);
    return NextResponse.json(
      { error: 'Server error processing the API key' },
      { status: 500 }
    );
  }
}
