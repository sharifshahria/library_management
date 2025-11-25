"use client"

import React, { useEffect, useState } from 'react';

interface Borrow {
  _id: string;
  bookId: { _id: string; title: string; author: string };
  borrowedAt: string;
  returned: boolean;
}

export default function ReturnPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Get user email from localStorage
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : '' : '';

  const fetchBorrows = async () => {
    setLoading(true);
    const res = await fetch(`/api/borrowedbooks?userEmail=${encodeURIComponent(userEmail)}`);
    const data = await res.json();
    setBorrows(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBorrows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReturn = async (id: string) => {
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/borrowedbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ borrowId: id }),
    });
    const data = await res.json();
    setMessage(data.message);
    fetchBorrows();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Return Borrowed Books</h1>
      {message && <p className="mb-4 text-blue-600 text-center text-sm">{message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {borrows.length === 0 ? (
          <p className="text-center col-span-2">No borrowed books to return.</p>
        ) : (
          borrows.map(borrow => (
            <div key={borrow._id} className="bg-white p-6 rounded shadow mb-4 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">{borrow.bookId.title}</h2>
                <p className="mb-1">by {borrow.bookId.author}</p>
                <p className="mb-1">Borrowed At: {new Date(borrow.borrowedAt).toLocaleString()}</p>
                <button
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
                  onClick={() => handleReturn(borrow._id)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Return Book'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
