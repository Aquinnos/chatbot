import { NextResponse } from 'next/server';
import { glhf } from '@/lib/glhf';
import { getOfflineResponse, isApiConfigured } from '@/lib/offline-mode';

interface GenerationConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export async function POST(req: Request) {
  if (!process.env.GLHF_API_KEY) {
    console.warn('No GLHF API key - operating in offline mode');

    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      response: getOfflineResponse(),
      offline: true,
    });
  }

  const { message, model, history, config } = await req.json();

  const defaultConfig = {
    temperature: 0.7,
    maxTokens: 100,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  };

  const generationConfig: GenerationConfig = config || defaultConfig;

  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
  ];

  if (history && Array.isArray(history)) {
    history.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });
  }

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
    console.error('Error communicating with GLHF API:', error);

    const errorMessage =
      error?.message || 'Unknown error while generating response.';
    const statusCode = error?.status || 500;

    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { error: `API Error: ${errorMessage}` },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      {
        error:
          'An error occurred while generating the response. Please try again later.',
      },
      { status: statusCode }
    );
  }
}
