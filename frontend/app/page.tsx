'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authApi } from '@/services/api';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authApi.isAuthenticated();
      setIsAuthenticated(isAuth);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Navigation */}
        <header className="absolute inset-x-0 top-0 z-50">
          <nav
            className="flex items-center justify-between p-6 lg:px-8"
            aria-label="Global"
          >
            <div className="flex lg:flex-1">
              <Link href="/" className="text-2xl font-bold text-[#1dcd9f]">
                GLHF Chatbot
              </Link>
            </div>
            <div className="flex gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/chat"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#1dcd9f] hover:bg-[#169976] rounded-md transition-colors"
                  >
                    Go to Chat
                  </Link>
                  <Link
                    href="/profile"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white hover:text-[#1dcd9f] transition-colors"
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#1dcd9f] hover:bg-[#169976] rounded-md transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white hover:text-[#1dcd9f] transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>

        <div className="relative pt-14">
          <div className="mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                Powerful AI Conversations with{' '}
                <span className="text-[#1dcd9f]">GLHF API</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Interact with advanced AI models to enhance your productivity,
                creative process, and decision-making. Our chatbot provides
                intelligent responses to your queries using state-of-the-art
                language models.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                {isAuthenticated ? (
                  <Link
                    href="/chat"
                    className="rounded-md bg-[#1dcd9f] px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-[#169976] transition-colors"
                  >
                    Start Chatting Now
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="rounded-md bg-[#1dcd9f] px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-[#169976] transition-colors"
                  >
                    Get Started
                  </Link>
                )}
                <Link
                  href="/models"
                  className="text-lg font-semibold leading-6 text-gray-900 dark:text-white hover:text-[#1dcd9f] transition-colors"
                >
                  View Models <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Advanced AI Features
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Our chatbot leverages cutting-edge language models to provide
              intelligent, context-aware conversations.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1dcd9f]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                      />
                    </svg>
                  </div>
                  Smart Conversations
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">
                    Engage in natural, flowing conversations with our AI that
                    remembers context and provides meaningful responses.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1dcd9f]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                      />
                    </svg>
                  </div>
                  Customizable Settings
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">
                    Fine-tune your AI interactions with adjustable parameters
                    for temperature, tokens, and response style.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1dcd9f]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                      />
                    </svg>
                  </div>
                  Multiple Models
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">
                    Choose from a variety of AI models, each with unique
                    strengths for different types of tasks and conversations.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Ready to experience the future of AI?
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Get started today and see how our chatbot can enhance your
            productivity and creativity.
          </p>
          <div className="mt-10">
            {isAuthenticated ? (
              <Link
                href="/chat"
                className="rounded-md bg-[#1dcd9f] px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-[#169976] transition-colors"
              >
                Go to Chat
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-md bg-[#1dcd9f] px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-[#169976] transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} GLHF Chatbot. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
