'use client';

import { useState, useEffect } from 'react';
import { Model } from '@/lib/models';

interface ModelSwitchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: Model;
  newModel: Model;
  onCreateNewChat: () => void;
  onKeepCurrentModel: () => void;
}

export function ModelSwitchDialog({
  isOpen,
  onClose,
  currentModel,
  newModel,
  onCreateNewChat,
  onKeepCurrentModel,
}: ModelSwitchDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => {
        setIsVisible(false);
      }, 200);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full max-w-md mx-4 z-10 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Change AI Model?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You already have messages in this chat from{' '}
            <strong>{currentModel.name}</strong>. Switching to{' '}
            <strong>{newModel.name}</strong> may cause confusion as the new
            model won&apos;t have the same abilities or knowledge as the
            previous model.
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={onCreateNewChat}
              className="bg-[#1DCD9F] hover:bg-[#169976] text-white py-2 px-4 rounded-md transition-colors"
            >
              Start a new chat with {newModel.name}
            </button>
            <button
              onClick={onKeepCurrentModel}
              className="bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md transition-colors"
            >
              Keep using {currentModel.name} in this chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
