'use client';

import { GenerationConfig } from './types';

interface ChatConfigPanelProps {
  config: GenerationConfig;
  updateConfig: (field: keyof GenerationConfig, value: number) => void;
  resetConfig: () => void;
}

export function ChatConfigPanel({
  config,
  updateConfig,
  resetConfig,
}: ChatConfigPanelProps) {
  return (
    <div className="p-4 border-b dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
      <h3 className="text-sm font-medium mb-3">Generation settings</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs mb-1">Temperature</label>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) =>
                updateConfig('temperature', parseFloat(e.target.value))
              }
              className="flex-1 mr-2"
            />
            <span className="text-xs">{config.temperature.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1">Max Tokens</label>
          <div className="flex items-center">
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={config.maxTokens}
              onChange={(e) =>
                updateConfig('maxTokens', parseInt(e.target.value))
              }
              className="flex-1 mr-2"
            />
            <span className="text-xs">{config.maxTokens}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1">Top P</label>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.topP}
              onChange={(e) => updateConfig('topP', parseFloat(e.target.value))}
              className="flex-1 mr-2"
            />
            <span className="text-xs">{config.topP.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1">Frequency Penalty</label>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.frequencyPenalty}
              onChange={(e) =>
                updateConfig('frequencyPenalty', parseFloat(e.target.value))
              }
              className="flex-1 mr-2"
            />
            <span className="text-xs">
              {config.frequencyPenalty.toFixed(1)}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1">Presence Penalty</label>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.presencePenalty}
              onChange={(e) =>
                updateConfig('presencePenalty', parseFloat(e.target.value))
              }
              className="flex-1 mr-2"
            />
            <span className="text-xs">{config.presencePenalty.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={resetConfig}
            className="px-3 py-1 text-xs bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-md"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
