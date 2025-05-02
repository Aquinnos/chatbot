/**
 * Type definition for AI models supported by the application
 */
export interface Model {
  id: string; // Unique identifier for the model in API calls
  name: string; // Display name for the model
  provider: string; // Service provider (e.g., glhf)
  maxTokens: number; // Default maximum number of tokens for generation
  description: string; // Human-readable description of the model's capabilities
  contextSize: number; // Maximum context window size in tokens
  price: {
    // Pricing information
    input: string; // Cost per token for input text
    output: string; // Cost per token for generated output
  };
}

/**
 * List of AI models available through the GLHF API
 * This list includes 18 different models with varying capabilities and pricing
 */
export const glhfModels: Model[] = [
  {
    id: 'hf:meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
    name: 'Llama-4-Maverick-17B',
    provider: 'glhf',
    maxTokens: 500,
    description:
      "The largest of Meta's Llama 4 family. Cost-effective and comparable to DeepSeek V3 at coding.",
    contextSize: 524000,
    price: {
      input: '$0.22/mtok',
      output: '$0.88/mtok',
    },
  },
  {
    id: 'hf:meta-llama/Llama-4-Scout-17B-16E-Instruct',
    name: 'Llama-4-Scout-17B',
    provider: 'glhf',
    maxTokens: 300,
    description:
      'Small, fast, cheap variant of Llama 4. Outperforms Gemma 3, Mistral 3.1.',
    contextSize: 328000,
    price: {
      input: '$0.15/mtok',
      output: '$0.60/mtok',
    },
  },
  {
    id: 'hf:meta-llama/Meta-Llama-3.1-405B-Instruct',
    name: 'Meta-Llama-3.1-405B',
    provider: 'glhf',
    maxTokens: 128,
    description:
      "Meta's largest model. Friendly, smart, and a strong creative writer.",
    contextSize: 128000,
    price: {
      input: '$3.00/mtok',
      output: '$3.00/mtok',
    },
  },
  {
    id: 'hf:meta-llama/Meta-Llama-3.1-70B-Instruct',
    name: 'Meta-Llama-3.1-70B',
    provider: 'glhf',
    maxTokens: 128,
    description:
      "The 70b version of Meta's premiere 3.1 series. Friendly, smart, and a strong creative writer.",
    contextSize: 128000,
    price: {
      input: '$0.90/mtok',
      output: '$0.90/mtok',
    },
  },
  {
    id: 'hf:meta-llama/Meta-Llama-3.1-8B-Instruct',
    name: 'Meta-Llama-3.1-8B',
    provider: 'glhf',
    maxTokens: 128,
    description:
      "The 8b version of Meta's premiere 3.1 series. Friendly, smart, and a strong creative writer.",
    contextSize: 128000,
    price: {
      input: '$0.20/mtok',
      output: '$0.20/mtok',
    },
  },
  {
    id: 'hf:meta-llama/Llama-3.2-3B-Instruct',
    name: 'Llama-3.2-3B',
    provider: 'glhf',
    maxTokens: 128,
    description: 'A small, fast, 3B variant of the Llama 3 series.',
    contextSize: 128000,
    price: {
      input: '$0.10/mtok',
      output: '$0.10/mtok',
    },
  },
  {
    id: 'hf:meta-llama/Llama-3.3-70B-Instruct',
    name: 'Llama-3.3-70B',
    provider: 'glhf',
    maxTokens: 128,
    description:
      "Meta's newest model. Faster than Llama 3.1 405b, but benchmarks similarly.",
    contextSize: 128000,
    price: {
      input: '$0.90/mtok',
      output: '$0.90/mtok',
    },
  },
  {
    id: 'hf:nvidia/Llama-3.1-Nemotron-70B-Instruct-HF',
    name: 'Llama-3.1-Nemotron-70B',
    provider: 'glhf',
    maxTokens: 128,
    description: 'Nvidia fine-tuned Llama 3.1 70B to handle harder questions.',
    contextSize: 128000,
    price: {
      input: '$0.90/mtok',
      output: '$0.90/mtok',
    },
  },
  {
    id: 'hf:mistralai/Mixtral-8x22B-Instruct-v0.1',
    name: 'Mixtral-8x22B',
    provider: 'glhf',
    maxTokens: 64,
    description:
      "Mistral's largest fully-open model fine-tuned for instruction following.",
    contextSize: 64000,
    price: {
      input: '$1.20/mtok',
      output: '$1.20/mtok',
    },
  },
  {
    id: 'hf:NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
    name: 'Nous-Hermes-2-Mixtral',
    provider: 'glhf',
    maxTokens: 32,
    description: "Nous Research's finetune of the Mixtral 8×7B model.",
    contextSize: 32000,
    price: {
      input: '$0.60/mtok',
      output: '$0.60/mtok',
    },
  },
  {
    id: 'hf:Qwen/Qwen2.5-7B-Instruct',
    name: 'Qwen2.5-7B',
    provider: 'glhf',
    maxTokens: 32,
    description:
      "The 7B version of Alibaba's Qwen2.5 series. Fast but least powerful.",
    contextSize: 32000,
    price: {
      input: '$0.18/mtok',
      output: '$0.18/mtok',
    },
  },
  {
    id: 'hf:Qwen/Qwen2.5-Coder-32B-Instruct',
    name: 'Qwen2.5-Coder-32B',
    provider: 'glhf',
    maxTokens: 32,
    description: 'One of the current best coding-focused open models.',
    contextSize: 32000,
    price: {
      input: '$0.80/mtok',
      output: '$0.80/mtok',
    },
  },
  {
    id: 'hf:Qwen/Qwen2.5-72B-Instruct',
    name: 'Qwen2.5-72B',
    provider: 'glhf',
    maxTokens: 32,
    description:
      "Alibaba's largest open model. Close to Meta Llama 3 at English tasks.",
    contextSize: 32000,
    price: {
      input: '$0.90/mtok',
      output: '$0.90/mtok',
    },
  },
  {
    id: 'hf:deepseek-ai/DeepSeek-V3',
    name: 'DeepSeek-V3',
    provider: 'glhf',
    maxTokens: 128,
    description:
      'Competitive with Claude and surpassing GPT-4o on coding problems.',
    contextSize: 128000,
    price: {
      input: '$1.25/mtok',
      output: '$1.25/mtok',
    },
  },
  {
    id: 'hf:deepseek-ai/DeepSeek-V3-0324',
    name: 'DeepSeek-V3-0324',
    provider: 'glhf',
    maxTokens: 128,
    description: 'Updated, even stronger coding model than the original V3.',
    contextSize: 128000,
    price: {
      input: '$1.20/mtok',
      output: '$1.20/mtok',
    },
  },
  {
    id: 'hf:deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek-R1',
    provider: 'glhf',
    maxTokens: 128,
    description: "A reasoning model that performs similarly to OpenAI's o1.",
    contextSize: 128000,
    price: {
      input: '$0.55/mtok',
      output: '$2.19/mtok',
    },
  },
  {
    id: 'hf:deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    name: 'DeepSeek-R1-Distill-Llama',
    provider: 'glhf',
    maxTokens: 128,
    description: 'A fast reasoning model that outperforms o1-mini.',
    contextSize: 128000,
    price: {
      input: '$0.90/mtok',
      output: '$0.90/mtok',
    },
  },
  {
    id: 'hf:reissbaker/llama-3.1-70b-abliterated-lora',
    name: 'Llama-3.1-70b-abliterated',
    provider: 'glhf',
    maxTokens: 128,
    description:
      'An uncensored, always-on LoRA version of Llama 3.1 70B Instruct.',
    contextSize: 128000,
    price: {
      input: '$0.90/mtok',
      output: '$0.90/mtok',
    },
  },
];

/**
 * Default model to use if no specific model is selected
 * Currently set to Meta Llama 3.1 70B Instruct, with a fallback to the first available model
 */
export const defaultModel =
  glhfModels.find(
    (model) => model.id === 'hf:meta-llama/Meta-Llama-3.1-70B-Instruct'
  ) || glhfModels[0];
