import { NextResponse } from 'next/server';
import { glhf } from '@/lib/glhf';
import { getOfflineResponse, isApiConfigured } from '@/lib/offline-mode';

// Interface for generation configuration
interface GenerationConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export async function POST(req: Request) {
  // Check if API key is set
  if (!process.env.GLHF_API_KEY) {
    console.warn('No GLHF API key - operating in offline mode');

    // Return offline response after a small delay (response simulation)
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      response: getOfflineResponse(),
      offline: true,
    });
  }

  const { message, model, history, config } = await req.json();

  // Default configuration if none was provided
  const defaultConfig = {
    temperature: 0.7,
    maxTokens: 100,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  };

  // Use provided configuration or default values
  const generationConfig: GenerationConfig = config || defaultConfig;

  // Prepare messages with history
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
  ];

  // Add message history if it exists
  if (history && Array.isArray(history)) {
    history.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });
  }

  // Add the current user message
  messages.push({ role: 'user', content: message });

  try {
    console.log('Sending request to GLHF API with model:', model);

    const completion = await glhf.chat.completions.create({
      model: model || 'hf:meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
      messages,
      max_tokens: generationConfig.maxTokens,
      temperature: generationConfig.temperature,
      top_p: generationConfig.topP,
      n: 1,
      stream: false,
      stop: null,
      presence_penalty: generationConfig.presencePenalty,
      frequency_penalty: generationConfig.frequencyPenalty,
    });

    const reply = completion.choices[0]?.message?.content ?? 'No response';

    return NextResponse.json({ response: reply, offline: false });
  } catch (error: any) {
    // Detailed error log
    console.error('Error communicating with GLHF API:', error);

    // Detailed error message
    const errorMessage =
      error?.message || 'Unknown error while generating response.';
    const statusCode = error?.status || 500;

    // In development environment we return error details
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { error: `API Error: ${errorMessage}` },
        { status: statusCode }
      );
    }

    // In production we return a general message
    return NextResponse.json(
      {
        error:
          'An error occurred while generating the response. Please try again later.',
      },
      { status: statusCode }
    );
  }
}
