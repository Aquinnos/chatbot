'use client';

import { useRouter } from 'next/navigation';
import { glhfModels } from '@/lib/models';
import Link from 'next/link';

export default function ModelsPage() {
  const router = useRouter();

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available AI Models</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          Return to chat
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {glhfModels.map((model) => (
          <div
            key={model.id}
            className="border dark:border-zinc-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-gray-50 dark:bg-zinc-800 p-4 border-b dark:border-zinc-700">
              <h2 className="text-xl font-semibold">{model.name}</h2>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                {model.description}
              </p>

              <div className="text-sm grid grid-cols-2 gap-2">
                <div className="bg-gray-100 dark:bg-zinc-900 p-2 rounded">
                  <span className="font-medium">Context:</span>{' '}
                  {model.contextSize
                    ? `${(model.contextSize / 1000).toFixed(0)}K`
                    : 'N/A'}
                </div>
                <div className="bg-gray-100 dark:bg-zinc-900 p-2 rounded">
                  <span className="font-medium">Max Tokens:</span>{' '}
                  {model.maxTokens || 'N/A'}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t dark:border-zinc-700">
                <h3 className="font-medium mb-2">Pricing:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-100 dark:bg-zinc-900 p-2 rounded">
                    <span className="font-medium">Input:</span>{' '}
                    {model.price?.input || 'N/A'}
                  </div>
                  <div className="bg-gray-100 dark:bg-zinc-900 p-2 rounded">
                    <span className="font-medium">Output:</span>{' '}
                    {model.price?.output || 'N/A'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  // Save selected model to localStorage and navigate to chat
                  localStorage.setItem('selectedModel', JSON.stringify(model));
                  router.push('/');
                }}
                className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Use this model
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
