'use client';

import { GenerationConfig } from './types';
import { useEffect, useRef } from 'react';

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
  const temperatureRef = useRef<HTMLInputElement>(null);
  const maxTokensRef = useRef<HTMLInputElement>(null);
  const topPRef = useRef<HTMLInputElement>(null);
  const frequencyRef = useRef<HTMLInputElement>(null);
  const presenceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateRangeProgress = (
      input: HTMLInputElement | null,
      value: number,
      min: number,
      max: number
    ) => {
      if (input) {
        const progress = ((value - min) / (max - min)) * 100;
        input.style.setProperty('--range-progress', `${progress}%`);
      }
    };

    updateRangeProgress(temperatureRef.current, config.temperature, 0, 2);
    updateRangeProgress(maxTokensRef.current, config.maxTokens, 50, 1000);
    updateRangeProgress(topPRef.current, config.topP, 0, 1);
    updateRangeProgress(frequencyRef.current, config.frequencyPenalty, 0, 2);
    updateRangeProgress(presenceRef.current, config.presencePenalty, 0, 2);
  }, [config]);

  return (
    <div className="p-4 border-b dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
      <h3 className="text-sm font-medium mb-3">Generation settings</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs mb-1">Temperature</label>
          <div className="flex items-center">
            <input
              ref={temperatureRef}
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateConfig('temperature', value);
                e.currentTarget.style.setProperty(
                  '--range-progress',
                  `${(value / 2) * 100}%`
                );
              }}
              className="flex-1 mr-2"
            />
            <span className="text-xs">{config.temperature.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1">Max Tokens</label>
          <div className="flex items-center">
            <input
              ref={maxTokensRef}
              type="range"
              min="50"
              max="1000"
              step="50"
              value={config.maxTokens}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                updateConfig('maxTokens', value);
                e.currentTarget.style.setProperty(
                  '--range-progress',
                  `${((value - 50) / 950) * 100}%`
                );
              }}
              className="flex-1 mr-2"
            />
            <span className="text-xs">{config.maxTokens}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1">Top P</label>
          <div className="flex items-center">
            <input
              ref={topPRef}
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.topP}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateConfig('topP', value);
                e.currentTarget.style.setProperty(
                  '--range-progress',
                  `${value * 100}%`
                );
              }}
              className="flex-1 mr-2"
            />
            <span className="text-xs">{config.topP.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1">Frequency Penalty</label>
          <div className="flex items-center">
            <input
              ref={frequencyRef}
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.frequencyPenalty}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateConfig('frequencyPenalty', value);
                e.currentTarget.style.setProperty(
                  '--range-progress',
                  `${(value / 2) * 100}%`
                );
              }}
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
              ref={presenceRef}
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.presencePenalty}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateConfig('presencePenalty', value);
                e.currentTarget.style.setProperty(
                  '--range-progress',
                  `${(value / 2) * 100}%`
                );
              }}
              className="flex-1 mr-2"
            />
            <span className="text-xs">{config.presencePenalty.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={resetConfig}
            className="px-3 py-1 text-xs bg-[#1dcd9f] hover:bg-[#169976] text-white rounded-md"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
