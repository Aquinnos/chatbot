'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageType } from './types';
import { Model } from '@/lib/models';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/components/ui/Toast';

/**
 * Props for the MessageList component
 */
interface MessageListProps {
  messages: MessageType[];
  formatTime: (date: Date) => string;
  selectedModel: Model;
}

/**
 * Component that renders a list of chat messages with special handling for:
 * - DeepSeek R1 thinking process (hidden by default)
 * - Code blocks with syntax highlighting
 * - Clickable URLs with truncation for long links
 */
export function MessageList({
  messages,
  formatTime,
  selectedModel,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<string[]>([]);
  const [expandedLinkIds, setExpandedLinkIds] = useState<string[]>([]);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Copy code to clipboard and show confirmation
  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopiedId(id);
        toast({
          message: 'Code copied to clipboard!',
          type: 'success',
          duration: 2000
        });
        // Reset copied status after 2 seconds
        setTimeout(() => setCopiedId(null), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          message: 'Failed to copy code to clipboard',
          type: 'error',
          duration: 3000
        });
      }
    );
  };

  // Toggle thinking process visibility
  const toggleThinking = (messageId: string) => {
    setExpandedThinkingIds((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  // Toggle link expansion
  const toggleLinkExpansion = (linkId: string) => {
    setExpandedLinkIds((prev) =>
      prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId]
    );
  };

  // Check if message is from DeepSeek R1 model
  const isDeepSeekR1Message = (message: MessageType) => {
    return (
      message.role === 'assistant' &&
      (selectedModel.id === 'hf:deepseek-ai/DeepSeek-R1' ||
        selectedModel.id === 'hf:deepseek-ai/DeepSeek-R1-Distill-Llama-70B' ||
        selectedModel.name.includes('DeepSeek-R1'))
    );
  };

  // Process DeepSeek R1 message to separate thinking from answer
  const processDeepSeekR1Message = (content: string, messageId: string) => {
    // Check if content contains thinking process in <think> tags
    if (content.includes('<think>') && content.includes('</think>')) {
      // Extract thinking and answer parts using regex
      const regex = /<think>([\s\S]*?)<\/think>([\\s\S]*)/;
      const match = content.match(regex);

      if (match) {
        const thinking = match[1].trim();
        const answer = match[2].trim();

        const isExpanded = expandedThinkingIds.includes(messageId);

        return (
          <div>
            {isExpanded && (
              <div className="mb-4 p-3 bg-gray-100 dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                  Thinking process:
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  {renderMessageContent(thinking)}
                </div>
              </div>
            )}
            <div>{renderMessageContent(answer)}</div>
            <button
              onClick={() => toggleThinking(messageId)}
              className="mt-3 text-xs flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {isExpanded ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                  Hide thinking process
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                  Show thinking process
                </>
              )}
            </button>
          </div>
        );
      }
    }

    // If no thinking tags are detected, render as usual
    return renderMessageContent(content);
  };

  // Process text to make links clickable and handle overflow
  const processLinks = (text: string) => {
    // Regular expression to find URLs
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;

    // Split by URLs
    const parts = text.split(urlRegex);

    // Find URLs
    const urls = text.match(urlRegex) || [];

    // Compile the resulting elements
    const result: React.ReactNode[] = [];

    parts.forEach((part, idx) => {
      // Add the text part
      if (part !== '') {
        result.push(part);
      }

      // Add the URL if there is one at this position
      if (idx < urls.length) {
        const url = urls[idx];
        const linkId = `link-${idx}-${Date.now()}`;
        const isLinkExpanded = expandedLinkIds.includes(linkId);
        const displayUrl = isLinkExpanded
          ? url
          : url.length > 40
          ? `${url.substring(0, 37)}...`
          : url;

        result.push(
          <span key={linkId} className="inline-flex items-center group">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 break-all underline"
            >
              {displayUrl}
            </a>
            {url.length > 40 && (
              <button
                onClick={() => toggleLinkExpansion(linkId)}
                className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isLinkExpanded ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </button>
            )}
          </span>
        );
      }
    });

    return <div className="whitespace-pre-wrap break-words">{result}</div>;
  };

  // Parse code blocks from message content
  const renderMessageContent = (content: string) => {
    // If using plain text rendering
    if (!content.includes('```')) {
      return processLinks(content);
    }

    // Using markdown renderer for code blocks
    return (
      <ReactMarkdown
        components={{
          // Override paragraph to prevent nesting issues with pre and div
          p: ({ children }) => (
            <div className="mb-4 break-words">{children}</div>
          ),
          a: ({ href, children }) => {
            if (!href) return <>{children}</>;

            const linkId = `md-link-${href?.substring(0, 10)}-${Date.now()}`;
            const isLinkExpanded = expandedLinkIds.includes(linkId);
            const displayUrl =
              isLinkExpanded || String(children).length <= 40
                ? children
                : `${String(children).substring(0, 37)}...`;

            return (
              <span className="inline-flex items-center group">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 break-all underline"
                >
                  {displayUrl}
                </a>
                {String(children).length > 40 && (
                  <button
                    onClick={() => toggleLinkExpansion(linkId)}
                    className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isLinkExpanded ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m18 15-6-6-6 6" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    )}
                  </button>
                )}
              </span>
            );
          },
          code: ({ className, children, ...props }) => {
            // Check if this is inline code or a code block
            const match = /language-(\w+)/.exec(className || '');
            // If there's no language match, it's likely inline code
            const isInline = !match;

            if (isInline) {
              return (
                <code
                  className="bg-gray-100 dark:bg-zinc-700 px-1 py-0.5 rounded"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // For code blocks
            const language = match ? match[1] : '';
            const codeId = `code-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`;
            const codeContent = String(children).replace(/\n$/, '');

            return (
              <div className="relative mt-3 mb-5 rounded-md overflow-hidden border border-gray-300 dark:border-zinc-600">
                {language && (
                  <div className="flex justify-between items-center px-4 py-1.5 bg-gray-200 dark:bg-zinc-700 text-xs font-mono border-b border-gray-300 dark:border-zinc-600">
                    <span className="text-gray-700 dark:text-gray-300">
                      {language}
                    </span>
                  </div>
                )}
                <div className="relative">
                  <pre className="p-4 bg-gray-100 dark:bg-zinc-900 overflow-x-auto">
                    <code
                      className={cn('text-sm font-mono', className)}
                      {...props}
                    >
                      {codeContent}
                    </code>
                  </pre>
                  <button
                    className="absolute top-2 right-2 p-1.5 bg-gray-200 dark:bg-zinc-700 rounded hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors text-gray-700 dark:text-gray-300 shadow-sm"
                    onClick={() => copyToClipboard(codeContent, codeId)}
                    aria-label="Copy code"
                    title="Copy to clipboard"
                  >
                    {copiedId === codeId ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="space-y-4">
      {messages.map((message, idx) => (
        <div
          key={idx}
          className={cn(
            'flex max-w-3xl mx-auto',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={cn(
              'rounded-lg p-4 max-w-[80%]',
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : message.role === 'system'
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-zinc-800 border dark:border-zinc-700'
            )}
          >
            <div className="mb-1 text-xs text-gray-200 dark:text-gray-400 flex justify-between">
              <span>
                {message.role === 'user'
                  ? 'You'
                  : message.role === 'system'
                  ? 'System'
                  : selectedModel.name}
              </span>
              <span>{formatTime(message.timestamp)}</span>
            </div>
            {isDeepSeekR1Message(message)
              ? processDeepSeekR1Message(message.content, `msg-${idx}`)
              : renderMessageContent(message.content)}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
