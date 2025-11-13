"use client"

import React, { useState } from 'react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage('Signup failed.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form className="bg-white p-8 rounded shadow-md w-80" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input type="text" className="w-full px-3 py-2 border rounded" placeholder="Your Name" required value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" className="w-full px-3 py-2 border rounded" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Password</label>
          <input type="password" className="w-full px-3 py-2 border rounded" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>{loading ? 'Signing Up...' : 'Sign Up'}</button>
        {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
      </form>
    </div>
  );
}
