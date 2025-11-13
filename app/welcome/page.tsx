"use client"


import React, { useEffect, useState } from 'react';

export default function Welcome() {
  const [user, setUser] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
        <p className="mb-2">Name: <span className="font-semibold">{user.name}</span></p>
        <p>Email: <span className="font-semibold">{user.email}</span></p>
      </div>
    </div>
  );
}
