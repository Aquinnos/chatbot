'use client';

import { useState } from 'react';
import { Model } from '@/lib/models';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: Model;
  onSelect: (model: Model) => void;
}

export function ModelSelector({
  models,
  selectedModel,
  onSelect,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
      >
        <div className="flex items-center">
          <span className="block truncate">{selectedModel.name}</span>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {selectedModel.provider}
          </span>
        </div>
        <svg
          className={`w-5 h-5 ml-2 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-full overflow-auto max-h-60 rounded-md bg-white dark:bg-zinc-800 py-1 shadow-lg border border-gray-200 dark:border-zinc-700">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onSelect(model);
                setIsOpen(false);
              }}
              className={cn(
                'text-left block w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700',
                selectedModel.id === model.id
                  ? 'bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {model.provider}
                  </span>
                </div>
                {model.description && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {model.description}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
