"use client"

import React, { useState, useEffect } from 'react';

export default function BorrowPage() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState('title');
  const [filter, setFilter] = useState('all');

  const fetchBooks = async (searchQuery = '') => {
    setLoading(true);
    setMessage('');
    const res = await fetch(`/api/books?q=${encodeURIComponent(searchQuery)}`);
    let data = await res.json();
    // Filter
    if (filter === 'available') data = data.filter((b: any) => b.available);
    if (filter === 'borrowed') data = data.filter((b: any) => !b.available);
    // Sort
    data = [...data].sort((a: any, b: any) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'author') return a.author.localeCompare(b.author);
      return 0;
    });
    setBooks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sort]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(query);
  };

  const handleBorrow = async () => {
    if (!selectedBook) return;
    setLoading(true);
    setMessage('');
    // For demo, use a static user email. Replace with logged-in user email in real app.
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : '' : '';
    const res = await fetch('/api/borrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, bookId: selectedBook._id }),
    });
    const data = await res.json();
    setMessage(data.message);
    setLoading(false);
    setSelectedBook(null);
    setBooks([]);
    setQuery('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-[500px]">
        <h2 className="text-2xl font-bold mb-6 text-center">Borrow a Book</h2>
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            placeholder="Search by title or author"
            value={query}
            onChange={e => setQuery(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        <div className="mb-4 flex gap-2 justify-between">
          <select value={sort} onChange={e => setSort(e.target.value)} className="px-2 py-1 border rounded">
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
          </select>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-2 py-1 border rounded">
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
          </select>
        </div>
        {books.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {books.map(book => (
              <div key={book._id} className={`border rounded p-4 flex flex-col justify-between shadow ${book.available ? '' : 'bg-gray-200 text-gray-500'}`}>
                <div>
                  <h3 className="font-bold text-lg mb-1">{book.title}</h3>
                  <p className="mb-2">by {book.author}</p>
                  {!book.available && <span className="text-xs text-red-500">(Not available)</span>}
                </div>
                <div className="mt-2">
                  {book.available && (
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded font-semibold hover:bg-green-700 transition"
                      onClick={() => setSelectedBook(book)}
                    >
                      Borrow
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedBook && (
          <div className="mb-4 p-4 border rounded bg-gray-50">
            <p>Borrow <span className="font-semibold">{selectedBook.title}</span> by {selectedBook.author}?</p>
            <button
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
              onClick={handleBorrow}
              disabled={loading}
            >
              {loading ? 'Borrowing...' : 'Confirm Borrow'}
            </button>
            <button
              className="mt-2 ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition"
              onClick={() => setSelectedBook(null)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        )}
        {message && <p className="mt-4 text-center text-sm text-blue-600">{message}</p>}
      </div>
    </div>
  );
}
