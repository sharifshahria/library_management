"use client"


import React, { useState } from 'react';
import Link from 'next/link';


export default function Welcome() {
  const [user] = useState<{ name?: string; email?: string }>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored && stored !== 'undefined') {
        try {
          return JSON.parse(stored);
        } catch {
          return {};
        }
      }
    }
    return {};
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-gray-600">Glad to have you in the library portal.</p>
        </div>

        <div className="bg-gray-50 rounded-md p-4 text-left text-sm">
          <p className="text-gray-500 uppercase tracking-wide text-xs mb-2">
            Your profile
          </p>
          <p className="mb-1">
            Name:{' '}
            <span className="font-semibold text-gray-900">
              {user.name || 'Unknown user'}
            </span>
          </p>
          <p>
            Email:{' '}
            <span className="font-semibold text-gray-900">
              {user.email || 'Not provided'}
            </span>
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-left text-sm font-medium text-gray-700">
            Quick actions
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/borrow"
              className="rounded-md bg-indigo-600 py-3 px-4 text-white font-semibold hover:bg-indigo-500 transition text-center"
            >
              Borrow Books
            </Link>
            <Link
              href="/return"
              className="rounded-md bg-emerald-600 py-3 px-4 text-white font-semibold hover:bg-emerald-500 transition text-center"
            >
              Return Books
            </Link>
            <Link
              href="/catalog"
              className="rounded-md border border-gray-300 py-3 px-4 font-semibold hover:border-gray-400 transition text-center"
            >
              Browse Catalog
            </Link>
            <Link
              href="/history"
              className="rounded-md border border-gray-300 py-3 px-4 font-semibold hover:border-gray-400 transition text-center"
            >
              View History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
