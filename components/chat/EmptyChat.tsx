'use client';

import { Model } from '@/lib/models';

interface EmptyChatProps {
  placeholders: string[];
  selectedModel: Model;
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyChat({
  placeholders,
  selectedModel,
  onSelectPrompt,
}: EmptyChatProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
      <div className="text-center mb-4">
        <h3 className="text-xl font-medium mb-2">
          Start a conversation with {selectedModel.name}
        </h3>
        <p>Choose a prompt or type your own message to begin.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full max-w-2xl">
        {placeholders.map((placeholder, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(placeholder)}
            className="p-3 border dark:border-zinc-700 rounded-lg text-left hover:bg-white dark:hover:bg-zinc-800 transition-colors"
          >
            {placeholder}
          </button>
        ))}
      </div>
    </div>
  );
}
