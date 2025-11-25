"use client"

import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'borrow'>('catalog');

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-[600px]">
        <h1 className="text-3xl font-bold mb-6 text-center">Library Dashboard</h1>
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded font-semibold transition ${activeTab === 'catalog' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setActiveTab('catalog')}
          >
            Book Catalog
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition ${activeTab === 'borrow' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setActiveTab('borrow')}
          >
            Borrow/Return
          </button>
        </div>
        <div>
          {activeTab === 'catalog' ? <CatalogTab /> : <BorrowTab />}
        </div>
      </div>
    </main>
  );
}

function CatalogTab() {
  const [books, setBooks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author }),
    });
    const data = await res.json();
    if (res.ok) {
      setBooks(prev => [...prev, data]);
      setTitle('');
      setAuthor('');
      setMessage('Book added!');
    } else {
      setMessage(data.message);
    }
  };

  return (
    <>
      <form className="mb-6" onSubmit={handleAddBook}>
        <div className="flex gap-2 mb-2">
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="border px-2 py-1 rounded w-1/2" required />
          <input type="text" placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} className="border px-2 py-1 rounded w-1/2" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">Add Book</button>
        {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
      </form>
      <div className="mb-4">
        <input type="text" placeholder="Search by title or author" value={search} onChange={e => setSearch(e.target.value)} className="border px-2 py-1 rounded w-full" />
      </div>
      <ul>
        {books.length === 0 && (
          <li className="text-center text-gray-500 py-4">No books in catalog.</li>
        )}
        {books
          .filter(book =>
            book.title.toLowerCase().includes(search.toLowerCase()) ||
            book.author.toLowerCase().includes(search.toLowerCase())
          )
          .map(book => (
            <li key={book._id} className="border-b py-2 flex justify-between items-center">
              <span>
                <span className="font-semibold">{book.title}</span> by {book.author}
                {book.available ? (
                  <span className="ml-2 text-green-600">Available</span>
                ) : (
                  <span className="ml-2 text-red-600">Borrowed by {book.borrower}</span>
                )}
              </span>
            </li>
          ))}
      </ul>
    </>
  );
}

function BorrowTab() {
  const [books, setBooks] = useState<any[]>([]);
  const [bookId, setBookId] = useState('');
  const [borrower, setBorrower] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/borrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, borrower }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Book borrowed!');
      setBookId('');
      setBorrower('');
      fetch('/api/books')
        .then(res => res.json())
        .then(data => setBooks(data));
    } else {
      setMessage(data.message);
    }
  };

  const handleReturn = async (id: string) => {
    setMessage('');
    const res = await fetch('/api/borrow', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: id }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Book returned!');
      fetch('/api/books')
        .then(res => res.json())
        .then(data => setBooks(data));
    } else {
      setMessage(data.message);
    }
  };

  return (
    <>
      <form className="mb-6" onSubmit={handleBorrow}>
        <div className="flex gap-2 mb-2">
          <select value={bookId} onChange={e => setBookId(e.target.value)} className="border px-2 py-1 rounded w-1/2" required>
            <option value="">Select Book</option>
            {books.filter(b => b.available).map(book => (
              <option key={book._id} value={book._id}>{book.title} by {book.author}</option>
            ))}
          </select>
          <input type="text" placeholder="Borrower Name" value={borrower} onChange={e => setBorrower(e.target.value)} className="border px-2 py-1 rounded w-1/2" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">Borrow Book</button>
        {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
      </form>
      <h2 className="text-lg font-bold mb-2">Borrowed Books</h2>
      <ul>
        {books.filter(b => !b.available).length === 0 && (
          <li className="text-center text-gray-500 py-4">No borrowed books.</li>
        )}
        {books.filter(b => !b.available).map(book => (
          <li key={book._id} className="border-b py-2 flex justify-between items-center">
            <span>
              <span className="font-semibold">{book.title}</span> by {book.author} - Borrowed by {book.borrower}
            </span>
            <button onClick={() => handleReturn(book._id)} className="bg-gray-200 text-gray-800 px-2 py-1 rounded font-semibold hover:bg-gray-300 transition">Return</button>
          </li>
        ))}
      </ul>
    </>
  );
}
