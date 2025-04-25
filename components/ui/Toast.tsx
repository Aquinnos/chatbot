'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);

  const toast = useCallback(
    ({ message, type, duration = 3000 }: ToastProps) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-0 left-0 flex flex-col items-center justify-center z-50 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'mb-2 px-4 py-2 rounded shadow-md text-white transform transition-all duration-300 opacity-90 pointer-events-auto',
              {
                'bg-green-500': t.type === 'success',
                'bg-red-500': t.type === 'error',
                'bg-blue-500': t.type === 'info',
              }
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const Toast: React.FC<ToastProps> = ({ message, type, duration }) => {
  return (
    <div
      className={cn('px-4 py-2 rounded shadow-md text-white', {
        'bg-green-500': type === 'success',
        'bg-red-500': type === 'error',
        'bg-blue-500': type === 'info',
      })}
    >
      {message}
    </div>
  );
};
