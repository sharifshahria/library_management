"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
interface Book {
  _id: string;
  title: string;
  author: string;
  available: boolean;
}

const sorters: Record<string, (a: Book, b: Book) => number> = {
  title: (a, b) => a.title.localeCompare(b.title),
  author: (a, b) => a.author.localeCompare(b.author),
};

export default function BorrowPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<keyof typeof sorters>('title');
  const [filter, setFilter] = useState<'all' | 'available' | 'borrowed'>('all');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const minDueDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const fetchBooks = async (searchQuery = '') => {
    setLoading(true);
    setMessage('');
    setError('');
    const res = await fetch(`/api/books?q=${encodeURIComponent(searchQuery)}`);
    let data: Book[] = await res.json();
    if (filter === 'available') data = data.filter(b => b.available);
    if (filter === 'borrowed') data = data.filter(b => !b.available);
    data = [...data].sort(sorters[sort]);
    setBooks(data);
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserEmail(parsed.email || '');
        } catch {
          setUserEmail('');
        }
      }
    }
  }, []);

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(query);
  };

  const handleBorrow = async () => {
    if (!selectedBook) return;
    if (!dueDate) {
      setError('Please choose when you plan to return the book.');
      return;
    }
    if (!userEmail) {
      setError('No borrower email found. Please log in again.');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    const res = await fetch('/api/borrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, bookId: selectedBook._id, dueDate }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message || 'Borrow request completed.');
      setSelectedBook(null);
      setDueDate('');
      fetchBooks(query);
    } else {
      setError(data.message || 'Could not borrow this title.');
    }
    setLoading(false);
  };

  const stats = useMemo(() => {
    const total = books.length;
    const availableCount = books.filter(b => b.available).length;
    const borrowedCount = total - availableCount;
    return { total, availableCount, borrowedCount };
  }, [books]);

  const highlightBook = (book: Book) =>
    selectedBook && selectedBook._id === book._id ? 'ring-2 ring-indigo-500' : '';

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex justify-end">
          <button
            className="text-sm font-semibold text-rose-600 hover:text-rose-500"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        <header className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-wide text-slate-500">Catalog</p>
          <h1 className="text-3xl font-bold text-slate-900">Borrow from the library</h1>
          <p className="text-slate-600">
            Browse the live catalog, pick a title, and tell us when you plan to return it.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total titles</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Available now</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">{stats.availableCount}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Currently borrowed</p>
            <p className="mt-2 text-2xl font-semibold text-amber-600">{stats.borrowedCount}</p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="Search by title or author"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                onClick={() => {
                  setQuery('');
                  fetchBooks('');
                }}
              >
                Reset
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              <select
                value={sort}
                onChange={e => setSort(e.target.value as keyof typeof sorters)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="title">Sort by title</option>
                <option value="author">Sort by author</option>
              </select>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as 'all' | 'available' | 'borrowed')}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All titles</option>
                <option value="available">Available only</option>
                <option value="borrowed">Checked out</option>
              </select>
            </div>
            <p className="text-sm text-slate-500">
              {loading ? 'Updating catalog...' : `${books.length} books in view`}
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books.map(book => (
              <article
                key={book._id}
                className={`rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-indigo-200 hover:bg-white ${highlightBook(
                  book
                )}`}
              >
                <p className="text-xs uppercase tracking-wide text-slate-500">#{book._id.slice(-4)}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{book.title}</h3>
                <p className="text-sm text-slate-600">by {book.author}</p>
                <p className="mt-3 inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold">
                  {book.available ? (
                    <span className="bg-emerald-50 text-emerald-700">Available</span>
                  ) : (
                    <span className="bg-amber-50 text-amber-700">Borrowed</span>
                  )}
                </p>
                <button
                  className="mt-4 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                  onClick={() => setSelectedBook(book)}
                  disabled={!book.available}
                >
                  {book.available ? 'Select to borrow' : 'Unavailable'}
                </button>
              </article>
            ))}
            {!loading && books.length === 0 && (
              <p className="col-span-full text-center text-sm text-slate-500">
                No books match that search. Try another title or clear the filters.
              </p>
            )}
          </div>
        </section>

        {selectedBook && (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Confirm loan</p>
                <h3 className="text-xl font-semibold text-slate-900">{selectedBook.title}</h3>
                <p className="text-slate-600">by {selectedBook.author}</p>
              </div>
              <button
                className="self-start rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                onClick={() => {
                  setSelectedBook(null);
                  setDueDate('');
                }}
              >
                Change selection
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Planned return date</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  value={dueDate}
                  min={minDueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Select any date from tomorrow onward so staff know when to expect the book back.
                </p>
              </div>
              <div className="self-end text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Loan summary</p>
                <ul className="mt-2 space-y-1">
                  <li>Borrower: {userEmail || 'Unknown user'}</li>
                  <li>Book ID: {selectedBook._id}</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="rounded-md bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                onClick={handleBorrow}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Confirm borrow'}
              </button>
              <button
                className="rounded-md border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                onClick={() => {
                  setSelectedBook(null);
                  setDueDate('');
                }}
              >
                Cancel
              </button>
            </div>

            {(error || message) && (
              <p className={`mt-4 text-sm ${error ? 'text-red-600' : 'text-emerald-600'}`}>
                {error || message}
              </p>
            )}
          </section>
        )}

        {!selectedBook && (error || message) && (
          <p className={`text-center text-sm ${error ? 'text-red-600' : 'text-emerald-600'}`}>
            {error || message}
          </p>
        )}
      </div>
    </div>
  );
}
