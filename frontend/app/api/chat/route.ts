import { checkGlhfApiStatus } from '@/lib/glhf';
import { getOfflineResponse } from '@/lib/offline-mode';
import { glhfModels } from '@/lib/models';
import { createGlhfClient } from '@/lib/glhf';

interface GenerationConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

const FALLBACK_MODELS = [
  'hf:meta-llama/Meta-Llama-3.1-70B-Instruct',
  'hf:Qwen/Qwen2.5-7B-Instruct',
  'hf:mistralai/Mixtral-8x22B-Instruct-v0.1',
];

const DEFAULT_MODEL = 'hf:meta-llama/Meta-Llama-3.1-70B-Instruct';

function isModelValid(modelId: string): boolean {
  return glhfModels.some((model) => model.id === modelId);
}

function selectModel(requestedModel: string | undefined): string {
  if (requestedModel && isModelValid(requestedModel)) {
    return requestedModel;
  }

  for (const fallbackModel of FALLBACK_MODELS) {
    if (isModelValid(fallbackModel)) {
      return fallbackModel;
    }
  }

  return DEFAULT_MODEL;
}

export async function POST(req: Request) {
  let requestBody;
  try {
    requestBody = await req.json();
  } catch (e) {
    console.error('Error parsing request JSON:', e);
    return new Response(
      JSON.stringify({
        error: 'Invalid JSON in request body',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  const { message, model, history, config, userApiKey } = requestBody;

  // Prioritize user-provided API key from the request
  // Then check for user API key from localStorage (sent in the request)
  // Finally, fall back to the environment variable
  const apiKey = userApiKey || process.env.GLHF_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.warn('No GLHF API key - operating in offline mode');

    await new Promise((resolve) => setTimeout(resolve, 500));

    const offlineResponse = getOfflineResponse(message);

    return new Response(
      JSON.stringify({
        response: offlineResponse,
        offline: true,
        message: `Your message: "${message || ''}" (processed in offline mode)`,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Create a GLHF client with the appropriate API key
  const glhf = createGlhfClient(apiKey);

  // Check API status with the selected API key
  const apiStatus = await checkGlhfApiStatus(apiKey);
  if (!apiStatus.ok) {
    console.error(
      'GLHF API connection status check failed:',
      apiStatus.message
    );
    return new Response(
      JSON.stringify({
        error: `API connection error: ${apiStatus.message}`,
        offline: false,
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

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

  const selectedModel = selectModel(model);

  try {
    console.log('Sending request to GLHF API with model:', selectedModel);
    console.log(
      'API Key exists and is not empty:',
      !!apiKey && apiKey.trim() !== ''
    );

    if (!apiKey.startsWith('glhf_')) {
      console.warn(
        'API key does not have the expected format (should start with "glhf_")'
      );
    }

    try {
      const completion = await glhf.chat.completions.create({
        model: selectedModel,
        messages: messages.map((msg) => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
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

      return new Response(
        JSON.stringify({
          response: reply,
          offline: false,
          model: selectedModel,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (apiError: unknown) {
      console.error('GLHF API Error Details:', {
        message: apiError instanceof Error ? apiError.message : 'Unknown error',
        status:
          apiError && typeof apiError === 'object' && 'status' in apiError
            ? apiError.status
            : undefined,
        type:
          apiError && typeof apiError === 'object' && 'type' in apiError
            ? apiError.type
            : undefined,
        stack:
          apiError instanceof Error && apiError.stack
            ? apiError.stack.split('\n').slice(0, 3).join('\n')
            : undefined,
        requestId:
          apiError && typeof apiError === 'object' && 'request_id' in apiError
            ? apiError.request_id
            : undefined,
      });

      throw apiError;
    }
  } catch (error: unknown) {
    console.error('Error communicating with GLHF API:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error while generating response.';
    const statusCode =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number(error.status)
        : 500;

    if (statusCode === 404 && model) {
      console.log('Model not found, trying with fallback model...');

      try {
        const fallbackModel = FALLBACK_MODELS[0];
        console.log('Retrying with fallback model:', fallbackModel);

        const completion = await glhf.chat.completions.create({
          model: fallbackModel,
          messages: messages.map((msg) => ({
            role: msg.role as 'system' | 'user' | 'assistant',
            content: msg.content,
          })),
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

        return new Response(
          JSON.stringify({
            response: reply,
            offline: false,
            model: fallbackModel,
            notice:
              'The requested model was unavailable. Used fallback model instead.',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (fallbackError) {
        console.error('Error with fallback model:', fallbackError);
      }
    }

    return new Response(
      JSON.stringify({
        error:
          process.env.NODE_ENV === 'development'
            ? `API Error: ${errorMessage}`
            : 'An error occurred while generating the response. Please try again later.',
      }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
