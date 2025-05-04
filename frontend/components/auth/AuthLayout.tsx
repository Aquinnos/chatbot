import React from 'react';
import Link from 'next/link';

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  alternateLink: string;
  alternateLinkText: string;
};

export default function AuthLayout({
  children,
  title,
  subtitle,
  alternateLink,
  alternateLinkText,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#222222] p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>

        {children}

        <div className="text-center text-sm">
          <Link
            href={alternateLink}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {alternateLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
}
