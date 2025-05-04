'use client';

import { useState } from 'react';
import { Model } from '@/lib/models';
import { cn } from '@/lib/utils';
import { defaultModel } from '@/lib/models';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: Model | undefined;
  onSelect: (model: Model) => void;
}

export function ModelSelector({
  models,
  selectedModel = defaultModel,
  onSelect,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actualModel = selectedModel || defaultModel;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left bg-[#222222] rounded-lg shadow-sm border border-[#000000] hover:bg-[#000000] text-white"
      >
        <div className="flex items-center">
          <span className="block truncate">{actualModel.name}</span>
          <span className="ml-2 text-xs text-[#1DCD9F]">
            {actualModel.provider}
          </span>
        </div>
        <svg
          className={`w-5 h-5 ml-2 transition-transform text-[#1DCD9F] ${
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
        <div className="absolute right-0 z-10 mt-1 w-full overflow-auto max-h-60 rounded-md bg-[#222222] py-1 shadow-lg border border-[#000000]">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onSelect(model);
                setIsOpen(false);
              }}
              className={cn(
                'text-left block w-full px-4 py-2 text-sm hover:bg-[#000000]',
                actualModel.id === model.id
                  ? 'bg-[#000000] text-[#1DCD9F]'
                  : 'text-white'
              )}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-[#169976]">
                    {model.provider}
                  </span>
                </div>
                {model.description && (
                  <span className="text-xs text-gray-400 mt-1">
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
